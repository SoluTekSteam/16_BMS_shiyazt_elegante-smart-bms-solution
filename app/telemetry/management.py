from bson.objectid import ObjectId
import copy

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
        # print(f"[INFO] collection : {collection}")
        ret = collection.insert_one({
            "userId": ObjectId(userId),
            "deviceId": ObjectId(deviceId),
            "telemetry": telemetry,
            "ts": ts
        })
        # print(f"[DEBUG] insert: {ret}")
        if ret:
            return True
        else:
            return False
    except Exception as error:
        print(f"[ERROR] createDevice: {error}")



def saveTelemetry(db, deviceId: str, payload: dict, ts: int) -> bool:
    try:
        collection = db.selectCollection(name='devices')
        query = collection.find_one({'_id': ObjectId(deviceId)}, { 'userId' : 1, 'telemetry': 1, 'metadata': 1, 'deviceType': 1, 'deviceName': 1 })
        search_1 = "telemetry"
        search_2 = "metadata"
        if search_1 in query and search_2 in query:
            telbuffer: dict = copy.deepcopy(query['telemetry'])
            for item in payload.keys():
                telbuffer[item] = [ts, payload[item]]
            metabuffer: dict = copy.deepcopy(query['metadata'])
            metabuffer['last_updated'] = ts
            ret = collection.update_one({'_id': ObjectId(query['_id'])},
                                        {"$set": {'telemetry': telbuffer, 'metadata': metabuffer}})
        else:
            telbuffer = {}
            for item in payload.keys():
                telbuffer[item] = payload[item]
            metabuffer: dict = {}
            metabuffer['last_updated'] = ts
            ret = collection.update_one({'_id': ObjectId(query['_id'])},
                                        {"$set": {'telemetry': telbuffer, 'metadata': metabuffer}})
        if ret:
            print(f"[DEBUG] Latest Telemetry Updated ...[OK]")
        
        ret = createTelemetry(db, userId=query['userId'], deviceId=query['_id'], telemetry=payload, ts=ts)
        if ret == True:
            print(f"[DEBUG] Telemetry Saved ...[OK]")
            return {
                'status': True,
                'deviceName': query['deviceName'],
                'deviceType': query['deviceType'],
                'deviceId': str(query['_id'])
            }
        else:
            raise Exception('create telemetry failed')
    except Exception as error:
        print(f"[ERROR] saveTelemetry: {error}")
        return {
            'status': False,
            'msg': str(error)
        }