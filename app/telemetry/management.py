from bson.objectid import ObjectId

def createTelemetryDocument(db) -> bool:
    try:
        validationExpr: dict = {
            '$jsonSchema': {
                'bsonType': 'object',
                'required': ["userId", "deviceId", "telemetry", "ts"],
                'properties': {
                    'userId': {
                      'bsonType': 'objectid'
                    },
                    'deviceId': {
                        'bsonType': 'objectid'
                    },
                    'telemetry': {
                        'bsonType': 'object'
                    },
                    'ts': {
                        'bsonType': 'int'
                    },
                }
            }
        }
        ret = db.createCollection(name='telemetry', valRequired=True, valExpr=validationExpr)
        print(f"[INFO] create collection : {ret}")
        if ret:
            return True
        else:
            return False
    except Exception as error:
        print(f"[ERROR] createTelemetryDocument: {error}")


def createTelemetry(db, userId: str, deviceId: str, telemetry: dict, ts: int) -> bool:
    try:
        collection = db.selectCollection(name='telemetry')
        print(f"[INFO] collection : {collection}")
        ret = collection.insert_one({
            "userId": ObjectId(userId),
            "deviceId": ObjectId(deviceId),
            "telemetry": telemetry,
            "ts": ts
        })
        print(f"[DEBUG] insert: {ret}")
        if ret:
            return True
        else:
            return False
    except Exception as error:
        print(f"[ERROR] createDevice: {error}")
