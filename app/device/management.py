import time
from appUtils import genUniqueIdentifier
import copy
import json
from bson.objectid import ObjectId
from telemetry.management import createTelemetry

def createDeviceDocument(db) -> bool:
    try:
        validationExpr: dict = {
            '$jsonSchema': {
                'bsonType': 'object',
                'required': ["deviceName", "deviceType", "key", "token", "ts", "metadata", "telemetry", "logs"],
                'properties': {
                    'userId': {
                        'bsonType': 'objectid'
                    },
                    'deviceName': {
                        'bsonType': 'string'
                    },
                    'deviceLabel': {
                        'bsonType': 'string'
                    },
                    'deviceType': {
                        'bsonType': 'string'
                    },
                    'key': {
                        'bsonType': 'string'
                    },
                    'token': {
                        'bsonType': 'string'
                    },
                    'ts': {
                        'bsonType': 'int'
                    },
                    'metadata': {
                        'bsonType': 'object'
                    },
                    'telemetry': {
                        'bsonType': 'object'
                    },
                    "spaceId": {
                        'bsonType': 'string'
                    },
                    'logs': {
                        'bsonType': 'array'
                    }
                }
            }
        }
        ret = db.createCollection(name='devices', valRequired=True, valExpr=validationExpr)
        print(f"[INFO] create collection : {ret}")
        if ret:
            return True
        else:
            return False
    except Exception as error:
        print(f"[ERROR] createDeviceDocument: {error}")


def createDevice(db, userId: str, deviceName: str, deviceLabel: str, deviceType: str, metadata: dict, telemetry: dict) -> bool:
    try:
        collection = db.selectCollection(name='devices')
        print(f"[INFO] collection : {collection}")
        ret = collection.insert_one({
            "userId": ObjectId(userId),
            "deviceName": deviceName,
            "deviceLabel": deviceLabel,
            "deviceType": deviceType,
            "key": genUniqueIdentifier(length=20),
            "token": genUniqueIdentifier(length=12),
            "metadata": metadata,
            "telemetry": telemetry,
            "ts": int(time.time()),
            "logs": [{
                "ts": int(time.time()),
                "msg": "Device Created"
            }]
        })

        print(f"[DEBUG] insert: {ret}")
        if ret:
            return True
        else:
            return False
    except Exception as error:
        print(f"[ERROR] createDevice: {error}")


def deleteDevice(db) -> bool:
    try:
        print(f"[DEBUG] Deleting ....")
        db.dropCollection(name='devices')
    except Exception as error:
        print(f"[ERROR] deleteDevice: {error}")

def listDevices(collection):
    try:
        cursors = collection.find()
        for item in cursors:
            print(item)
    except Exception as error:
        print(f"[ERROR] listDevices: {error}")


def saveDeviceTelemetry(db, deviceToken, payload: dict, ts: int) -> bool:
    try:
        collection = db.selectCollection(name='devices')
        query = collection.find_one({'token': deviceToken}, { 'telemetry': 1, 'metadata': 1 })
        telbuffer: dict = copy.deepcopy(query['telemetry'])
        for item in payload.keys():
            telbuffer[item] = payload[item]
        metabuffer: dict = copy.deepcopy(query['metadata'])
        metabuffer['last_updated'] = ts
        ret = collection.update_one({'_id': ObjectId(query['_id'])},
                                    {"$set": {'telemetry': telbuffer, 'metadata': metabuffer}})
        if ret:
            print(f"[DEBUG] Latest Telemetry Updated ...[OK]")

        ret = createTelemetry(db, userId="606ff35931df8abadd48e0de", deviceId=query['_id'], telemetry=payload, ts=ts)
        if ret == True:
            print(f"[DEBUG] Telemetry Saved ...[OK]")


    except Exception as error:
        print(f"[ERROR] saveDeviceTelemetry: {error}")


def saveDeviceMetadata(collection, deviceToken, payload: dict) -> bool:
    try:
        print('Metadata handler')
    except Exception as error:
        print(f"[ERROR] saveDeviceTelemetry: {error}")


def deviceHandler(db, entityToken, msgType, payload: dict):
    try:
        if msgType == "telemetry" and isinstance(payload, dict):
            saveDeviceTelemetry(db, entityToken, payload, ts=int(time.time()))
            return True
        elif msgType == "metadata" and isinstance(payload, dict):
            saveDeviceMetadata()
            return True
        else:
            raise Exception('Unknown msgType')
    except Exception as error:
        print(f"[ERROR] deviceHandler: {error}")
        return False

def entityHandler(db, entityToken, msgType, payload):
    try:
        collection = db.selectCollection(name='devices')
        query = collection.find_one({'token': entityToken}, {'isGateway': 1, 'telemetry': 1, 'metadata': 1})
        if query['isGateway']:
            print(f'[INFO] Gateway Handler Type: {msgType}')
        else:
            print(f'Device Handler Type: {msgType}')
            deviceHandler(db, entityToken, msgType, json.loads(payload))
    except Exception as error:
        print(f"[ERROR] entityHandler: {error}")