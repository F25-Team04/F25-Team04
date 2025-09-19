import json
import pymysql

# hardcode for demo (not secure at all)
DB_HOST = "cpsc4910-f25.cobd8enwsupz.us-east-1.rds.amazonaws.com"
DB_USER = "Team04"
DB_PASSWORD = "Team Kenny"
DB_NAME = "Team04_DB"

# connect to Team04_DB as Team04 user
conn = pymysql.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME,
    cursorclass=pymysql.cursors.DictCursor
)

def post_query(query):
    # returns result of query and commits changes
    with conn.cursor() as cur:
        cur.execute(query)
        result = cur.fetchall()
        conn.commit()
        return result

def post_login(body):
    body = json.loads(body)
    email = body.get("email")
    password = body.get("password")

    with conn.cursor() as cur:
        cur.execute(f"""
            SELECT * 
            FROM Users
            WHERE usr_email = '{email}'
            AND usr_isdeleted = 0
        """)
    
    user = cur.fetchone()




    if user:
        # update last login timestamp
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE Users
                SET usr_lastlogin = NOW()
                WHERE usr_email = %s
            """, (email,))
            conn.commit() 

        return {
            "success": True, 
            "message": f"Welcome {user.get('usr_firstname')} {user.get('usr_lastname')}!"
        }
    else:
        return {
            "success": False, 
            "message": "User does not exist"
        }

def post_change_password(body):
    pass

def post_application(body):
    pass

def get_about():
    # returns most recent about data by abt_releasedate
    with conn.cursor() as cur:
        cur.execute(f"""
            SELECT * 
            FROM About
            ORDER BY abt_releasedate DESC LIMIT 1
        """)
        recent = cur.fetchone()
        return recent

def get_organizations():
    # returns list of organization names
    with conn.cursor() as cur:
        cur.execute(f"""
            SELECT org_name 
            FROM Organizations
            WHERE org_isdeleted <> 1
            ORDER BY org_name
        """)
        result = cur.fetchall()
        org_names = [item["org_name"] for item in result]
        return org_names

# overall handler for requests
def lambda_handler(event, context):
    
    method = event.get("httpMethod")
    path = event.get("path")

    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            "body": json.dumps({})
        }

    try:
        # connect to Team04_DB as Team04 user
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor
        )

        print("event:", event)
        print("context:", context)

        if (method == "GET" and path == "/about"):
            response_data = get_about()
        elif (method == "GET" and path == "/organizations"):
            response_data = get_organizations()

        elif (method == "POST" and path == "/login"):
            response_data = post_login(event.get("body"))
        elif (method == "POST" and path == "/application"):
            response_data = post_application(event.get("body"))
        elif (method == "POST" and path == "/change_password"):
            response_data = post_change_password(event.get("body"))
        elif (method == "POST" and path == "/query"):
            response_data = post_query(event.get("body"))
            
        else:
            return {
                "statusCode": 404,
                "body": "Resource not found."
            }

    # handle exceptions at any point
    except Exception as e:
        print(f"ERROR: {e}")
        return {
            "statusCode": 400,
            "body": str(e)
        }

    # close connection no matter what
    finally:
        if conn:
            conn.close()
    
    print(f"SUCCESS: {response_data}")
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            "Access-Control-Allow-Headers": "Content-Type,Authorization"
        },
        "body": json.dumps(response_data, default=str)
    }
