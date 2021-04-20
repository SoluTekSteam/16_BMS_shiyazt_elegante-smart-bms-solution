import time


def createUserDocument(db) -> bool:
    try:
        validationExpr: dict = {
            '$jsonSchema': {
                'bsonType': 'object',
                'required': ["firstName", "lastName", "email", "role", "ts"],
                'properties': {
                    'firstName': {
                        'bsonType': 'string'
                    },
                    'lastName': {
                        'bsonType': 'string'
                    },
                    'email': {
                        'bsonType': 'string'
                    },
                    'role': {
                        'bsonType': 'string',
                        'enum': ['admin', 'user', 'customer']
                    },
                    'ts': {
                        'bsonType': 'int'
                    },
                    'logs': {
                        'bsonType': 'array'
                    }
                }
            }
        }
        ret = db.createCollection(name='users', valRequired=True, valExpr=validationExpr)
        print(f"[INFO] create collection : {ret}")
        if ret:
            return True
        else:
            return False
    except Exception as error:
        print(f"[ERROR] createUserDocument: {error}")

def createUser(db, firstName: str, lastName: str, email: str, role: str) -> bool:
    try:
        collection = db.selectCollection(name='users')
        print(f"[INFO] collection : {collection}")
        ret = collection.insert_one({
            "firstName": firstName,
            "lastName": lastName,
            "email": email,
            "role": role,
            "ts": int(time.time()),
            "logs": [{
                "ts": int(time.time()),
                "msg": "User Created"
            }]
        })

        print(f"[DEBUG] insert: {ret}")
        if ret:
            return True
        else:
            return False
    except Exception as error:
        print(f"[ERROR] createUser: {error}")


def deleteUser(db) -> bool:
    try:
        print(f"[DEBUG] Deleting ....")
        db.dropCollection(name='users')
    except Exception as error:
        print(f"[ERROR] deleteUser: {error}")

def listUsers(collection):
    try:
        cursors = collection.find()
        for item in cursors:
            print(item)
    except Exception as error:
        print(f"[ERROR] listUsers: {error}")
