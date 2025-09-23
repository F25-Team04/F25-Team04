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

# ==== response builder =================================================================
def _resp(status: int, payload):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
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

# ==== POST =============================================================================
def post_query(query):
    # returns result of query and commits changes
    with conn.cursor() as cur:
        cur.execute(query)
        result = cur.fetchall()
        conn.commit()
    return result

def post_login(body):
    # parse login details, find user, verify pw hash, and return success/failure with message
    body = json.loads(body)
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
            return {
                "success": True,
                
                "message": f"Welcome {user.get('usr_firstname')} {user.get('usr_lastname')}!"
            }
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

            return {
                "success": False, 
                "message": "Password does not match!"
            }

    else:
        # return failure, dne
        return {
            "success": False, 
            "message": "User does not exist."
        }

def post_change_password(body):
    body = json.loads(body)
    email = body.get("email")
    answer = body.get("answer")
    new_password = body.get("new_password")

    if email is None or answer is None or new_password is None:
        raise Exception("Missing required field(s): email, answer, new_password")

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

            return {
                "success": True, 
                "message": "Password successfully updated."
            }

        else:
            return {
                "success": False, 
                "message": "Incorrect answer to security question."
            }

    return {
        "success": False, 
        "message": "User does not exist"
    }
    
def post_application(body):
    # parse login details, find user, verify pw hash, and return success/failure with message
    body = json.loads(body)
    email = body.get("email")
    password = body.get("password")
    fName = body.get("fname")
    lName = body.get("lname")
    dln = body.get("dln")
    empID = body.get("empID")
    org = body.get("searchable")
    ans = body.get("security")
    phone = body.get("phone")
    address = body.get("address")
    
    # check for and report any missing fields
    required_fields = {
        "email": email,
        "password": password,
        "fname": fName,
        "lname": lName,
        "dln": dln,
        "empID": empID,
        "org": org,
        "ans": ans,
        "phone": phone,
        "address": address
    }
    missing = [name for name, value in required_fields.items() if value is None]
    if missing:
        raise Exception(f"Missing required field(s): {', '.join(missing)}")

    with conn.cursor() as cur:
        cur.execute("""
            SELECT * 
            FROM Users
            WHERE usr_email = %s
            AND usr_isdeleted = 0
        """, email)
        user = cur.fetchone()

    if user:
        # return failure, account already exists
        return {
            "success": False, 
            "message": "Email already associated with an account"
        }
    else:
        # adds the account to the database
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO Users (
                usr_email, usr_passwordhash, usr_role, usr_organization, 
                usr_loginattempts, usr_securityquestion, usr_securityanswer, 
                usr_status, usr_firstname, usr_lastname, 
                usr_employeeid, usr_phone, usr_license, usr_pointbalance, usr_isdeleted, usr_address
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
            email, 
            hash_secret(password),
            "driver",
            org,
            0,
            "What is your favorite color",
            ans,
            "active", # currently adds active accounts, change to pending once sponsor panel is set up
            fName,
            lName,
            empID,
            phone,
            dln,
            0,      # usr_pointbalance
            0,       # usr_isdeleted
            address
            ))
        conn.commit() 
        return {
            "success": True, 
            "message": "Account Created"
        }

# ==== GET ==============================================================================
def get_about():
    # returns most recent about data by abt_releasedate
    with conn.cursor() as cur:
        cur.execute("""
            SELECT * 
            FROM About
            ORDER BY abt_releasedate DESC LIMIT 1
        """)
        recent = cur.fetchone()
        return recent

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
        print("DEBUG - Organizations result:", result) 
        org_names = [item["org_name"] for item in result]
        return org_names

# ==== handler (main) ===================================================================
# overall handler for requests
def lambda_handler(event, context):
    
    method = event.get("httpMethod")
    path = event.get("path")

    try:
        # logging
        print("event:", event)
        print("context:", context)

        # OPTIONS
        if (method == "OPTIONS"):
            return _resp(200, {})
        # GET
        elif (method == "GET" and path == "/about"):
            response_data = get_about()
        elif (method == "GET" and path == "/organizations"):
            response_data = get_organizations()
        # POST
        elif (method == "POST" and path == "/login"):
            response_data = post_login(event.get("body"))
        elif (method == "POST" and path == "/application"):
            response_data = post_application(event.get("body"))
        elif (method == "POST" and path == "/change_password"):
            response_data = post_change_password(event.get("body"))
        elif (method == "POST" and path == "/query"):
            response_data = post_query(event.get("body"))

        else:
            return _resp(404, "Resource not found.")

    # handle exceptions at any point
    except Exception as e:
        print(f"ERROR: {e}")
        return _resp(400, str(e))
    
    # success
    print(f"SUCCESS: {response_data}")
    return _resp(200, response_data)