# ==== imports ==========================================================================
import json
import pymysql
import boto3
from botocore.exceptions import ClientError
import hashlib
import hmac
import base64
import secrets
import unicodedata
import requests

# ==== response builder =================================================================
def build_response(status: int, payload):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        "body": json.dumps(payload, default=str) if not isinstance(payload, str) else payload,
    }

# ==== connect to DB ====================================================================
def get_db_credentials():
    secret_name = "Team04_DB_user"
    region_name = "us-east-2"

    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        # For a list of exceptions thrown, see
        # https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        raise e

    secret = get_secret_value_response['SecretString']
    return json.loads(secret)

# connect to Team04_DB as Team04 user
credentials = get_db_credentials()
conn = pymysql.connect(
    host=credentials.get("host"),
    user=credentials.get("username"),
    password=credentials.get("password"),
    database=credentials.get("dbname"),
    cursorclass=pymysql.cursors.DictCursor
)

# ==== create/verify secret hash ========================================================
DEFAULT_ITERATIONS = 260_000
SALT_BYTES = 16
DKLEN = 32  # 32 bytes = 256 bits derived key

def _normalize(text: str) -> bytes:
    # Normalize to NFKC and convert to UTF-8 bytes.
    if text is None:
        raise ValueError("text must not be None")
    normalized = unicodedata.normalize("NFKC", text)
    return normalized.encode("utf-8")

def hash_secret(secret: str, iterations: int = DEFAULT_ITERATIONS) -> str:
    # Hash a secret (password or answer) and return a single string suitable for storage.
    secret_bytes = _normalize(secret)
    salt = secrets.token_bytes(SALT_BYTES)
    dk = hashlib.pbkdf2_hmac("sha256", secret_bytes, salt, iterations, dklen=DKLEN)

    salt_b64 = base64.b64encode(salt).decode("ascii")
    dk_b64 = base64.b64encode(dk).decode("ascii")

    return f"pbkdf2_sha256${iterations}${salt_b64}${dk_b64}"

def verify_secret(secret: str, stored: str) -> bool:
    # Verify a secret (password / answer) against a stored hash string.
    # Returns True if match, False otherwise.
    try:
        algo, iter_str, salt_b64, hash_b64 = stored.split("$", 3)
        if algo != "pbkdf2_sha256":
            # Unknown format - fail safe.
            return False
        iterations = int(iter_str)
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(hash_b64)
    except Exception:
        return False

    secret_bytes = _normalize(secret)
    dk = hashlib.pbkdf2_hmac("sha256", secret_bytes, salt, iterations, dklen=len(expected))
    # constant-time compare
    return hmac.compare_digest(dk, expected)

# ==== HELPERS ==========================================================================

def _get_catalog_rules(org):
    # internal use function
    # returns active catalog rules for the specified organization
    with conn.cursor() as cur:
        cur.execute("""
            SELECT 
                cat_id AS "Catalog Rule ID",
                cat_type AS "Rule Type",
                cat_value AS "Rule Value"
            FROM Catalog_Rules
            WHERE cat_org = %s
            AND cat_isdeleted = 0
            ORDER BY cat_id ASC
        """, org)
        rules = cur.fetchall()
        
    return rules



# ==== POST =============================================================================

def post_query(query):
    # returns result of query and commits changes
    with conn.cursor() as cur:
        cur.execute(query)
        result = cur.fetchall()
        conn.commit()
    return build_response(200, result)

def post_login(body):
    # parse login details, find user, verify pw hash, and return success/failure with message
    body = json.loads(body) or {}
    email = body.get("email")
    password = body.get("password")

    if email is None or password is None:
        raise Exception("Missing required field(s): email, password")

    with conn.cursor() as cur:
        cur.execute("""
            SELECT * 
            FROM Users
            WHERE usr_email = %s
            AND usr_isdeleted = 0
        """, email)
        user = cur.fetchone()

    if user:
        # check password against stored hash
        if verify_secret(password, user.get("usr_passwordhash")):

            # update failed login attempts
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE Users
                    SET usr_lastlogin = NOW(), 
                        usr_loginattempts = 0
                    WHERE usr_email = %s
                    AND usr_isdeleted = 0
                """, email)
                conn.commit() 

            # return success, login
            return build_response(200, {
                "success": True,
                "message": user.get('usr_id')
            })
        else:
            # update failed login attempts
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE Users
                    SET usr_loginattempts = usr_loginattempts + 1
                    WHERE usr_email = %s
                    AND usr_isdeleted = 0
                """, email)
                conn.commit() 

            return build_response(200, {
                "success": False, 
                "message": "Password does not match!"
            })

    else:
        # return failure, dne
        return build_response(200, {
            "success": False, 
            "message": "User does not exist."
        })

def post_change_password(body):
    body = json.loads(body) or {}
    email = body.get("email")
    answer = body.get("answer")
    new_password = body.get("new_password")

    if email is None or answer is None or new_password is None:
        raise Exception("Missing required field(s): email, security question, answer, new_password")

    with conn.cursor() as cur:
        cur.execute("""
            SELECT * 
            FROM Users
            WHERE usr_email = %s
            AND usr_isdeleted = 0
        """, email)
        user = cur.fetchone()

    if user:
        if answer == user.get("usr_securityanswer"):
            # update password with hash of new password
            passwordhash = hash_secret(new_password)
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE Users 
                    SET usr_passwordhash = %s
                    WHERE usr_email = %s
                    AND usr_isdeleted = 0
                """, (passwordhash, email))
                conn.commit()

            return build_response(200, {
                "success": True, 
                "message": "Password successfully updated."
            })

        else:
            return build_response(200, {
                "success": False, 
                "message": "Incorrect answer to security question."
            })

    return build_response(200, {
        "success": False, 
        "message": "User does not exist"
    })

def post_user_update(body):
    data = json.loads(body) or {}
    usr_id = data.get("id")
    if not usr_id:
        raise Exception("Missing required field: id")

    # accept either top-level fields or an 'updates' object
    updates_src = data.get("updates") or data

    # map accepted keys to DB columns (support both your UI names and canonical ones)
    key_map = {
        "phone": "usr_phone",
        "firstName": "usr_firstname", "fname": "usr_firstname",
        "lastName": "usr_lastname",   "lname": "usr_lastname",
        "driverLicenseNumber": "usr_license", "dln": "usr_license",
        "address": "usr_address",
    }

    set_parts = []
    values = []
    for k, v in updates_src.items():
        col = key_map.get(k)
        if not col:
            continue
        if v is None or str(v).strip() == "":
            continue
        set_parts.append(f"{col} = %s")
        values.append(v)

    if not set_parts:
        raise Exception("No valid fields provided to update.")

    values.append(usr_id)
    with conn.cursor() as cur:
        cur.execute(f"""
            UPDATE Users
            SET {", ".join(set_parts)}
            WHERE usr_id = %s
            AND usr_isdeleted = 0
        """, values)
        affected = cur.rowcount
        conn.commit()

    if affected:
        return build_response(200, {"success": True, "message": "User updated", "affected": affected})
    return build_response(404, f"No active user found with id={usr_id}")

def post_signup(body):
    # Parse and validate input
    body = json.loads(body or "{}")
    email = body.get("email")
    password = body.get("password")
    fName = body.get("fname")
    lName = body.get("lname")
    dln = body.get("dln")
    empID = body.get("empID")
    ques = body.get("security")
    ans = body.get("answer")
    phone = body.get("phone")
    address = body.get("address")

    # Required fields for account creation
    required_fields = {
        "email": email,
        "password": password,
        "fname": fName,
        "lname": lName,
        "dln": dln,
        "empID": empID,
        "security": ques,
        "answer": ans,
        "phone": phone,
        "address": address,
    }

    missing = [name for name, value in required_fields.items() if value is None]
    if missing:
        raise Exception(f"Missing required field(s): {', '.join(missing)}")

    with conn.cursor() as cur:
        # Check for existing account
        cur.execute("""
            SELECT usr_id
            FROM Users
            WHERE usr_email = %s
                AND usr_isdeleted = 0
        """, (email,))
        if cur.fetchone():
            return build_response(400, "Email already associated with an existing account")    

        try:
            conn.begin()

            # Insert the new user
            cur.execute("""
                INSERT INTO Users (
                    usr_email,
                    usr_passwordhash,
                    usr_role,
                    usr_loginattempts,
                    usr_securityquestion,
                    usr_securityanswer,
                    usr_firstname,
                    usr_lastname,
                    usr_employeeid,
                    usr_phone,
                    usr_license,
                    usr_address
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                email,
                hash_secret(password), # password hash
                "driver",        # Default role
                0,               # login attempts
                ques,
                ans,
                fName,
                lName,
                empID,
                phone,
                dln,
                address
            ))

            driver_id = cur.lastrowid
            if not driver_id:
                raise Exception("Failed to create user account")

            conn.commit()

        except Exception as e:
            conn.rollback()
            raise e

    return build_response(200, {
        "message": "Account created successfully. You can now sign in and apply to sponsors.",
        "usr_id": driver_id
    })

def post_application(body):
    # Parse and validate input
    body = json.loads(body or "{}")
    user_id = body.get("user")
    org_id = body.get("org")

    if user_id is None or org_id is None:
        raise Exception("Missing required field(s): user, org")

    with conn.cursor() as cur:
        # Verify user exists and not deleted
        cur.execute("""
            SELECT usr_id
            FROM Users
            WHERE usr_id = %s
                AND usr_isdeleted = 0
        """, (user_id,))
        if not cur.fetchone():
            return build_response(404, "User not found")

        # Verify organization exists and not deleted
        cur.execute("""
            SELECT org_id
            FROM Organizations
            WHERE org_id = %s
                AND org_isdeleted = 0
        """, (org_id,))
        if not cur.fetchone():
            return build_response(404, "Organization not found")

        # Block if already a member (active Sponsorship exists)
        cur.execute("""
            SELECT 1
            FROM Sponsorships
            WHERE spo_user = %s
                AND spo_org = %s
                AND spo_isdeleted = 0
            LIMIT 1
        """, (user_id, org_id))
        if cur.fetchone():
            return build_response(400, "User is already a member of this organization")

        # Block duplicate pending application
        cur.execute("""
            SELECT app_id
            FROM Applications
            WHERE app_driver = %s
                AND app_org = %s
                AND app_status = 'pending'
                AND app_isdeleted = 0
            LIMIT 1
        """, (user_id, org_id))
        if cur.fetchone():
            return build_response(400, "There is already a pending application for this organization")

        try:
            conn.begin()

            # Insert new pending application
            cur.execute("""
                INSERT INTO Applications (
                    app_driver,
                    app_org,
                    app_status,
                    app_note,
                    app_datecreated
                ) VALUES (%s, %s, %s, %s, NOW())
            """, (user_id, org_id, "pending", ""))

            application_id = cur.lastrowid
            if not application_id:
                raise Exception("Failed to create application")

            conn.commit()

        except Exception as e:
            conn.rollback()
            raise e

    return build_response(200, {
        "message": "Application submitted"
    })

def post_leave_organization(body):
    body = json.loads(body) or {}
    driver_id = body.get("driver_id")
    org_id = body.get("org_id")

    if driver_id is None or org_id is None:
        raise Exception("Missing required field(s): driver_id, org_id")

    with conn.cursor() as cur:
        cur.execute("""
            UPDATE Sponsorships
            SET spo_isdeleted = 1
            WHERE spo_user = %s
                AND spo_org = %s
                AND spo_isdeleted = 0
        """, (driver_id, org_id))
        affected = cur.rowcount
        conn.commit()

    if affected:
        return build_response(200, {
            "message": f"Driver {driver_id} has left organization {org_id}."
        })
    else:
        return build_response(404, f"No active sponsorship found for driver {driver_id} in organization {org_id}.")

def post_point_rule(body):
    body = json.loads(body) or {}
    org = body.get("org")
    rule = body.get("rule")
    points = body.get("points")

    # check for and report any missing fields
    required_fields = {
        "org": org,
        "rule": rule,
        "points": points
    }
    missing = [name for name, value in required_fields.items() if value is None]
    if missing:
        raise Exception(f"Missing required field(s): {', '.join(missing)}")

    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO Point_Rules (
                rul_organization, rul_reason, rul_pointdelta
            ) VALUES (%s, %s, %s)
        """, (org, rule, points))
        conn.commit() 

    return build_response(200, {
        "success": True,
        "message": f"Point rule '{rule}' added for organization: {org}"
    })

def post_decision(body):
    # Parse and validate input
    body = json.loads(body or "{}")
    application_id = body.get("application_id")
    sponsor_user_id = body.get("sponsor")
    accepted = body.get("accepted")
    note = body.get("note", "")

    if application_id is None or sponsor_user_id is None or accepted is None:
        raise Exception("Missing required field(s): application_id, sponsor, accepted")
    if accepted not in (True, False):
        raise Exception("Invalid 'accepted' value: must be boolean True or False")

    new_status = "approved" if accepted else "denied"

    with conn.cursor() as cur:
        try:
            conn.begin()

            # 1) Lock and load the application
            cur.execute("""
                SELECT app_id, app_driver, app_org, app_status
                FROM Applications
                WHERE app_id = %s
                    AND app_isdeleted = 0
                FOR UPDATE
            """, (application_id,))
            app = cur.fetchone()
            if not app:
                conn.rollback()
                return build_response(404, "Application not found")


            # 1) Lock and load the application
            cur.execute("""
                SELECT app_id, app_driver, app_org, app_status
                FROM Applications
                WHERE app_id = %s
                    AND app_isdeleted = 0
                FOR UPDATE
            """, (application_id,))
            app = cur.fetchone()
            if not app:
                conn.rollback()
                return build_response(404, "Application not found")

            if app["app_status"] != "pending":
                conn.rollback()
                return build_response(400, f"Application is not pending (current status: {app['app_status']})")

            driver_id = app["app_driver"]
            app_org_id = app["app_org"]

            # derive org_id from sponsor user's Sponsorships
            cur.execute("""
                SELECT spo_org
                FROM Sponsorships
                WHERE spo_user = %s
                    AND spo_isdeleted = 0
            """, (sponsor_user_id,))
            sponsor_org_rows = cur.fetchall()

            if not sponsor_org_rows:
                conn.rollback()
                return build_response(404, f"No active organization found for sponsor user {sponsor_user_id}.")
            if len(sponsor_org_rows) > 1:
                conn.rollback()
                return build_response(
                    409,
                    "Sponsor user is associated with multiple organizations; provide 'org' in the request body."
                )
            org_id = sponsor_org_rows[0]["spo_org"]

            # 3) Guard: the application must be for that org
            if app_org_id != org_id:
                conn.rollback()
                return build_response(
                    400,
                    f"Application {application_id} targets org {app_org_id}, which does not match sponsor org {org_id}."
                )

            # 4) Update application status and note
            cur.execute("""
                UPDATE Applications
                SET app_status  = %s,
                    app_note    = %s,
                    app_dateupdated = NOW()
                WHERE app_id = %s
            """, (new_status, note, application_id))

            # 5) On approve: ensure Sponsorship exists (create if absent)
            if new_status == "approved":
                cur.execute("""
                    SELECT 1
                    FROM Sponsorships
                    WHERE spo_user = %s
                        AND spo_org  = %s
                        AND spo_isdeleted = 0
                    LIMIT 1
                """, (driver_id, org_id))
                if not cur.fetchone():
                    cur.execute("""
                        INSERT INTO Sponsorships (spo_user, spo_org, spo_pointbalance, spo_isdeleted)
                        VALUES (%s, %s, %s, 0)
                    """, (driver_id, org_id, 0))

            conn.commit()

            return build_response(200, {
                "message": f"Application {new_status}.",
                "application_id": application_id,
                "driver": driver_id,
                "org": org_id
            })

        except Exception as e:
            conn.rollback()
            raise


def post_point_adjustment(body):
    # Parse and validate input
    body = json.loads(body) or {}
    driver = body.get("driver_id")
    sponsor_user = body.get("sponsor_id")
    reason = body.get("reason", "")
    delta = body.get("delta")

    # Validate
    missing = [k for k, v in {
        "driver_id": driver,
        "sponsor_id": sponsor_user,
        "delta":     delta,
        "reason":    reason
    }.items() if v is None]
    if missing:
        raise Exception(f"Missing required field(s): {', '.join(missing)}")

    try:
        delta = int(delta)
    except (TypeError, ValueError):
        return build_response(400, "Field 'delta' must be an integer")

    with conn.cursor() as cur:
        try:
            conn.begin()
            
            # derive org from sponsor user's active sponsorships
            cur.execute("""
                SELECT spo_org
                FROM Sponsorships
                WHERE spo_user = %s
                    AND spo_isdeleted = 0
            """, (sponsor_user,))
            sponsor_org_rows = cur.fetchall()
            if not sponsor_org_rows:
                conn.rollback()
                return build_response(404, f"No active organization found for sponsor user {sponsor_user}.")
            if len(sponsor_org_rows) > 1:
                conn.rollback()
                return build_response(
                    409,
                    "Sponsor user is associated with multiple organizations; provide 'org' in the request body."
                )
            org_id = sponsor_org_rows[0]["spo_org"]

            # Lock the driver's sponsorship row for that org and update balance
            cur.execute("""
                SELECT s.spo_pointbalance AS balance
                FROM Sponsorships s
                WHERE s.spo_user = %s
                    AND s.spo_org  = %s
                    AND s.spo_isdeleted = 0
                FOR UPDATE
            """, (driver, org_id))
            row = cur.fetchone()
            if not row:
                conn.rollback()
                return build_response(
                    404,
                    f"Sponsorship not found for user {driver} and org {org_id} (derived from sponsor user {sponsor_user})."
                )

            old_balance = int(row["balance"] or 0)
            new_balance = max(old_balance + delta, 0)

            cur.execute("""
                UPDATE Sponsorships
                SET spo_pointbalance = %s
                WHERE spo_user = %s
                    AND spo_org  = %s
                    AND spo_isdeleted = 0
            """, (new_balance, driver, org_id))

            # Log transaction (ptr_sponsorid here represents ORG context)
            cur.execute("""
                INSERT INTO Point_Transactions
                    (ptr_driverid, ptr_pointdelta, ptr_newbalance, ptr_reason, ptr_sponsorid, ptr_org, ptr_date)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
            """, (driver, delta, new_balance, reason, sponsor_user, org_id))

            conn.commit()
            return build_response(200, {
                "message": (
                    f"Sponsorship (org {org_id}) balance adjusted by {delta} for user {driver}: "
                    f"{old_balance} → {new_balance} (derived from sponsor user {sponsor_user})."
                ),
                "driver_id": driver,
                "sponsor_user_id": sponsor_user,
                "org_id": org_id,
                "delta": delta,
                "old_balance": old_balance,
                "new_balance": new_balance
            })
        except Exception as e:
            conn.rollback()
            raise e
        
def post_catalog_rules(body):
    body = json.loads(body) or {}
    org = body.get("org")
    rule_type = body.get("type")
    rule_value = body.get("value")

    # check for and report any missing fields
    required_fields = {
        "org": org,
        "type": rule_type,
        "value": rule_value
    }
    missing = [name for name, value in required_fields.items() if value is None]
    if missing:
        raise Exception(f"Missing required field(s): {', '.join(missing)}")

    if rule_type not in ["category", "max_price", "min_price"]:
        raise Exception(f"Invalid rule type: {rule_type}")
    
    if rule_type in ["max_price", "min_price"]:
        try:
            float(rule_value)
        except ValueError:
            raise Exception(f"Invalid rule value for type {rule_type}: must be a number")

    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO Catalog_Rules (cat_org, cat_type, cat_value)
            VALUES (%s, %s, %s)
        """, (org, rule_type, rule_value))
        conn.commit()

    return build_response(200, {
        "success": True,
        "message": f"Catalog rules updated for organization: {org}"
    })

# ==== GET ==============================================================================
def get_driver_transactions(queryParams):
    driverID = queryParams.get("id")
    # internal use function
    # returns active catalog rules for the specified organization
    with conn.cursor() as cur:
        cur.execute("""
            SELECT 
                ptr_pointdelta AS "Amount",
                ptr_reason AS "Reason",
                ptr_sponsorid AS "Giver",
                ptr_date as "Date"
            FROM Point_Transactions
            WHERE ptr_driverid = %s
            AND ptr_isdeleted = 0
        """, driverID)
        transactions = cur.fetchall()
        
    return build_response(200, transactions)

def get_about():
    # returns most recent about data by abt_releasedate
    with conn.cursor() as cur:
        cur.execute("""
            SELECT 
                abt_teamnumber AS "Team Number", 
                abt_version AS "Version",
                abt_releasedate AS "Release Date",
                abt_productname AS "Product Name",
                abt_productdesc AS "Product Description"
            FROM About
            ORDER BY abt_releasedate DESC LIMIT 1
        """)
        recent = cur.fetchone()
        return build_response(200, recent)

def get_organizations():
    # returns list of organization names
    with conn.cursor() as cur:
        cur.execute("""
            SELECT org_name 
            FROM Organizations
            WHERE org_isdeleted = 0
            ORDER BY org_name
        """)
        result = cur.fetchall()
        
        org_names = [item["org_name"] for item in result]
        return build_response(200, org_names)

def get_user(queryParams):
    queryParams = queryParams or {}
    conditions = ["u.usr_isdeleted = 0"]
    values = []

    usr_id = queryParams.get("id")
    if usr_id is not None:
        conditions.append("u.usr_id = %s")
        values.append(usr_id)

    org = queryParams.get("org")
    if org is not None:
        conditions.append("""
            EXISTS (
                SELECT 1
                FROM Sponsorships s2
                WHERE s2.spo_user = u.usr_id
                    AND s2.spo_org = %s
                    AND s2.spo_isdeleted = 0
            )   
        """)
        values.append(org)

    role = queryParams.get("role")
    if role is not None:
        conditions.append("u.usr_role = %s")
        values.append(role)

    if not (usr_id is not None or org is not None or role is not None):
        raise Exception("Missing required query parameter: must provide at least one of id, org, role")

    sql = f"""
        SELECT
            u.usr_id         AS "User ID",
            u.usr_email      AS "Email",
            u.usr_role       AS "Role",
            u.usr_firstname  AS "First Name",
            u.usr_lastname   AS "Last Name",
            u.usr_employeeid AS "Employee ID",
            u.usr_license    AS "License",
            u.usr_phone      AS "Phone",
            u.usr_address    AS "Address",
            u.usr_securityquestion AS "Security Question",
            COALESCE((
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'org_id',        o.org_id,
                        'org_name',      o.org_name,
                        'spo_pointbalance', s.spo_pointbalance
                    )
                )
                FROM Sponsorships s
                JOIN Organizations o ON o.org_id = s.spo_org
                WHERE s.spo_user = u.usr_id
                    AND s.spo_isdeleted = 0
            ), JSON_ARRAY()) AS "Organizations"
        FROM Users u
        WHERE {" AND ".join(conditions)}
    """

    with conn.cursor() as cur:
        cur.execute(sql, tuple(values))
        users = cur.fetchall()
        
        # turn organizations list from JSON string to list
        for user in users:
            orgs_json = user.get("Organizations")
            user["Organizations"] = json.loads(orgs_json) if orgs_json else []

    if users:
        return build_response(200, users)
    else:
        return build_response(404, "No users match the given parameters.")

def get_point_rules(queryParams):
    # returns point rules for the specified organization
    queryParams = queryParams or {}
    org = queryParams.get("org")
    if org is None:
        raise Exception(f"Missing required query parameter: org")

    with conn.cursor() as cur:
        cur.execute("""
            SELECT 
                rul_id AS "Rule ID",
                rul_reason AS "Rule", 
                rul_pointdelta AS "Points"
            FROM Point_Rules
            WHERE rul_organization = %s
            AND rul_isdeleted = 0
        """, org)
        rules = cur.fetchall()
        
    if rules:
        return build_response(200, rules)
    else:
        return build_response(404, f"No point rules found for organization: {org}")

def get_application(queryParams):
    queryParams = queryParams or {}
    conditions = ["app_isdeleted = 0"]
    values = []

    usr_id = queryParams.get("id")
    if usr_id is not None:
        conditions.append("usr_id = %s")
        values.append(usr_id)

    org = queryParams.get("org")
    if org is not None:
        conditions.append("app_org = %s")        
        values.append(org)

    status = queryParams.get("status")
    if status is not None:
        conditions.append("app_status = %s")
        values.append(status)

    if not (usr_id is not None or org is not None):
        raise Exception("Missing required query parameter: must provide at least one of id, org")

    sql = f"""
        SELECT
            app_id          AS "Application ID",
            app_status      AS "Status",
            app_datecreated AS "Date Created",
            app_dateupdated AS "Date Updated",
            app_note        AS "Note",
            
            app_driver      AS "User ID",
            usr_firstname   AS "First Name",
            usr_lastname    AS "Last Name",
            usr_employeeid  AS "Employee ID",
            usr_license     AS "License",
            usr_email       AS "Email",
            usr_phone       AS "Phone",
            usr_address     AS "Address",
            
            app_org         AS "Organization ID",
            org_name        AS "Organization Name"
        FROM Applications
            JOIN Users ON Users.usr_id = Applications.app_driver
            JOIN Organizations ON Organizations.org_id = Applications.app_org
        WHERE {" AND ".join(conditions)}
    """

    with conn.cursor() as cur:
        cur.execute(sql, tuple(values))
        applications = cur.fetchall()

    if applications:
        return build_response(200, applications)
    else:
        return build_response(404, "No applications match the given parameters.")

def get_driver_transactions(queryParams):
    driverID = queryParams.get("id")
    # internal use function
    # returns active catalog rules for the specified organization
    with conn.cursor() as cur:
        cur.execute("""
            SELECT 
                ptr_pointdelta AS "Amount",
                ptr_reason AS "Reason",
                ptr_sponsorid AS "Giver",
                ptr_date as "Date"
            FROM Point_Transactions
            WHERE ptr_driverid = %s
            AND ptr_isdeleted = 0
        """, driverID)
        transactions = cur.fetchall()
        
    return build_response(200, transactions)

def get_security_questions():
    # returns list of security questions
    with conn.cursor() as cur:
        cur.execute("""
            SELECT sqs_question AS "Question"
            FROM Security_Questions
        """)
        result = cur.fetchall()
        print("DEBUG - Security Questions result:", result) 
        questions = [item["Question"] for item in result]
        return build_response(200, questions)

def get_products(queryParams):
    # returns list of products from FakeStoreAPI 
    # filters using the catalog rules for the specified organization
    queryParams = queryParams or {}
    org = queryParams.get("org")
    """
    if org is None:
        raise Exception(f"Missing required query parameter: org")
    """

    try:
        # Call the FakeStoreAPI to get the products
        url = "https://fakestoreapi.com/products"
        headers = {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9",
            "Connection": "close",
        }
        response = requests.get(url, headers=headers, timeout=5)
        print("DEBUG - Products API response:\n", json.dumps(response.json(), indent=2))
    except requests.RequestException as e:
        return build_response(500, f"Failed to retrieve products from FakeStoreAPI: {e}")
    
    if response.status_code == 200:
        products = response.json()
        
        # if no org specified, return all products
        if org is None:
            return build_response(200, products)
        
        # otherwise, get catalog rules for org
        rules = _get_catalog_rules(org)
        print(f"DEBUG - Catalog Rules for org {org}:\n", json.dumps(rules, indent=2))
        
        # initialize filter criteria
        allowed_categories = []
        max_price = float('inf')
        min_price = float(0)
        
        # build filters from rules
        for rule in rules:
            rule_type = rule.get("Rule Type")
            rule_value = rule.get("Rule Value")

            if rule_type == "category":
                allowed_categories.append(rule_value)
            elif rule_type == "max_price":
                max_price = min(max_price, float(rule_value))
            elif rule_type == "min_price":
                min_price = max(min_price, float(rule_value))
            # add more rule types as needed
        
        print(f"DEBUG - Applying filters: categories={allowed_categories}, max_price={max_price}, min_price={min_price}")
        # apply filters
        products = [prod for prod in products if prod.get("category") in allowed_categories]
        products = [prod for prod in products if float(prod.get("price", 0)) <= max_price]
        products = [prod for prod in products if float(prod.get("price", 0)) >= min_price]

        return build_response(200, products)
    else:
        return build_response(500, f"Failed to retrieve products from FakeStoreAPI: Status code {response.status_code}")

def get_catalog_rules(queryParams):
    # returns catalog rules for the specified organization
    queryParams = queryParams or {}
    org = queryParams.get("org")
    if org is None:
        raise Exception(f"Missing required query parameter: org")

    rules = _get_catalog_rules(org)
        
    if rules:
        return build_response(200, rules)
    else:
        return build_response(404, f"No catalog rules found for organization: {org}")

# ==== DELETE ===========================================================================
def delete_user(queryParams):
    # marks user as deleted in the database
    queryParams = queryParams or {}
    usr_id = queryParams.get("id")
    if usr_id is None:
        raise Exception(f"Missing required query parameter: id")
    
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE Users
            SET usr_isdeleted = 1
            WHERE usr_id = %s
            AND usr_isdeleted = 0
        """, usr_id)
        result = cur.fetchall()
        affected = cur.rowcount
        conn.commit()
    if affected:
        return build_response(200, {
            "success": True,
            "message": f"User {usr_id} deleted"
        })
    
    return build_response(404, f"No user found with id={usr_id}")

# ==== handler (main) ===================================================================
# overall handler for requests
def lambda_handler(event, context):
    
    method = event.get("httpMethod")
    path = event.get("path")
    body = event.get("body")
    queryParams = event.get("queryStringParameters")
    multiQueryParams = event.get("multiValueQueryStringParameters")

    try:
        # logging
        print("event:", event)
        print("context:", context)

        # OPTIONS
        if (method == "OPTIONS"):
            return build_response(200, {})
        
        # GET
        elif (method == "GET" and path == "/about"):
            response = get_about()
        elif (method == "GET" and path == "/organizations"):
            response = get_organizations()
        elif (method == "GET" and path == "/user"):
            response = get_user(queryParams)
        elif (method == "GET" and path == "/point_rules"):
            response = get_point_rules(queryParams)
        elif (method == "GET" and path == "/security_questions"):
            response = get_security_questions()
        elif (method == "GET" and path == "/products"):
            response = get_products(queryParams)
        elif (method == "GET" and path == "/catalog_rules"):
            response = get_catalog_rules(queryParams)
        elif (method == "GET" and path == "/application"):
            response = get_application(queryParams)
        elif (method == "GET" and path == "/driver_transactions"):
            response = get_driver_transactions(queryParams)

        # DELETE
        elif (method == "DELETE" and path == "/user"):
            response = delete_user(queryParams)
        
        # POST
        elif (method == "POST" and path == "/signup"):
            response = post_signup(body)
        elif (method == "POST" and path == "/login"):
            response = post_login(body)
        elif (method == "POST" and path == "/application"):
            response = post_application(body)
        elif (method == "POST" and path == "/change_password"):
            response = post_change_password(body)
        elif (method == "POST" and path == "/user_update"):
            response = post_user_update(body)
        elif (method == "POST" and path == "/query"):
            response = post_query(body)
        elif (method == "POST" and path == "/point_rules"):
            response = post_point_rule(body)
        elif (method == "POST" and path == "/decision"):
            response = post_decision(body)
        elif (method == "POST" and path == "/point_adjustment"):
            response = post_point_adjustment(body)
        elif (method == "POST" and path == "/catalog_rules"):
            response = post_catalog_rules(body)
        elif (method == "POST" and path == "/leave_organization"):
            response = post_leave_organization(body)

        else:
            return build_response(status=404, payload=f"Resource {path} not found for method {method}.")

    # handle exceptions at any point
    except Exception as e:
        print(f"ERROR: {e}")
        return build_response(status=400, payload=str(e))
    
    # success
    print(f"SUCCESS: {response}")
    return response