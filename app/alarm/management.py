from bson.objectid import ObjectId
import time

def createAlarmDocument(db) -> bool:
    try:
        validationExpr: dict = {
            '$jsonSchema': {
                'bsonType': 'object',
                'required': ["userId", "originator", "severity", "status", "createdTime", "type", "msg",  "ts", "active"],
                'properties': {
                    'userId': {
                      'bsonType': 'objectId'
                    },
                    'originator': {
                        'bsonType': 'objectId'
                    },
                    'floorId': {
                        'bsonType': 'objectId'
                    },
                    'buildingId': {
                        'bsonType': 'objectId'
                    },
                    'severity': {
                        'enum': ['critical', 'warning', 'major', 'minor', 'intermediate']
                    },
                    'status': {
                        'enum': ['active acknowledged', 'active unacknowledged', 'cleared acknowledged', 'cleared unacknowledged']
                    },
                    'createdTime': {
                        'bsonType': 'int'
                    },
                    'clearedTime': {
                        'bsonType': 'int'
                    },
                    'type': {
                        'bsonType': 'string'
                    },
                    'msg': {
                        'bsonType': 'string'
                    },
                    'details': {
                        'bsonType': 'object'
                    },
                    'logs': {
                        'bsonType': 'array'
                    },
                    'ts': {
                        'bsonType': 'int'
                    },
                    "active": {
                        'bsonType': 'bool'
                    }
                }
            }
        }
        ret = db.createCollection(name='alarms', valRequired=True, valExpr=validationExpr)
        print(f"[INFO] create collection : {ret}")
        if ret:
            return True
        else:
            return False
    except Exception as error:
        print(f"[ERROR] createAlarmDocument: {error}")


def createAlarm(db, deviceId: str, alarmSeverity: str, alarmStatus: str, alarmType: str, msg: str) -> bool:
    try:
        collection = db.selectCollection(name='alarms')
        # print(f"[INFO] collection : {collection}")
        query = collection.find_one({ 'active': True, 'originator': ObjectId(deviceId), 'type': alarmType, 'status': 'active unacknowledged' })
        # Update existing alarm 
        if query:
            print(f"[DEBUG] Clearing Alarm ...")
            ret = collection.update_one({ "_id": ObjectId(query["_id"]) }, 
                { 
                    "$set": {
                        "ts": int(time.time())
                    },

                    "$push" : { 
                        "logs": { 
                            "ts":  int(time.time()),
                            "msg": msg
                        }
                    } 
                })
            print('Alarm Updated')
        else:
            # create a new alarm
            collection = db.selectCollection(name='devices')
            deviceDetails = collection.find_one({ '_id': ObjectId(deviceId) }, { 'userId': 1, 'buildingId': 1, 'floorId': 1 })
            # print(deviceDetails)
            collection = db.selectCollection(name='alarms')
            ret = collection.insert_one({
                "userId": deviceDetails["userId"],
                "originator": ObjectId(deviceId),
                "buildingId": deviceDetails["buildingId"],
                "floorId": deviceDetails["floorId"],
                "severity": alarmSeverity,
                "status": alarmStatus,
                "createdTime": int(time.time()),
                "type": alarmType,
                "msg": msg,
                "logs": [{
                    "ts": int(time.time()),
                    "msg": msg
                }],
                "ts": int(time.time()),
                "active": True
            })
            print(f'{alarmType} Alarm Created')
        # print(f"[DEBUG] insert: {ret}")
        if ret:
            return {
                'status': True,
                '_id': str(ret.inserted_id)
            }
        else:
            return {
                'status': False
            }
    except Exception as error:
        print(f"[ERROR] createAlarm: {error}")




def clearAlarm(db, deviceId: str, alarmSeverity: str, alarmType: str, msg: str) -> bool:
    try:
        collection = db.selectCollection(name='alarms')
        query = collection.find_one({ 'originator': ObjectId(deviceId), 'type': alarmType, 'severity': alarmSeverity, 'active': True })
        print('[DEBUG] clearAlarm')
        print(query)
        if query:
            ret = collection.update_one({ "_id": ObjectId(query["_id"]) }, 
                { 
                    "$set": {
                        "ts": int(time.time()),
                        "status": 'cleared unacknowledged',
                        "active": False,
                        "msg": msg
                    },

                    "$push" : { 
                        "logs": { 
                            "ts":  int(time.time()),
                            "msg": msg
                        }
                    } 
                })
            print(f'{alarmType} Alarm Cleared')
            return True
        else:
            return False
    except Exception as error:
        print(f"[ERROR] createAlarm: {error}")



def getAlarmDetails(db, alarmId) -> dict:
    try:
        collection = db.selectCollection(name='alarms')
        query = collection.find_one({ '_id': ObjectId(alarmId) })
        if query:
            pipeline = [
                { "$match": { "_id": ObjectId(alarmId) } },
                { "$lookup": {
                        "from": 'buildings',
                        "localField": 'buildingId',
                        "foreignField": '_id',
                        "as": 'building'
                    } 
                },
                { "$lookup": {
                        "from": 'floors',
                        "localField": 'floorId',
                        "foreignField": '_id',
                        "as": 'floor'
                    } 
                },
                { "$lookup": {
                        "from": 'devices',
                        "localField": 'originator',
                        "foreignField": '_id',
                        "as": 'device'
                    } 
                },
                { "$unwind": { "path": '$building' } },
                { "$unwind": { "path": '$floor' } },
                { "$unwind": { "path": '$device' } },
                { "$addFields": {
                    "buildingName": '$building.name',
                    "floorName": '$floor.name',
                    "deviceName": '$device.deviceName'
                    } 
                },
                { "$project": {
                    "ts": 1,
                    "deviceName": 1,
                    "floorName": 1,
                    "buildingName": 1,
                    "createdTime": 1,
                    "type": 1,
                    "severity": 1,
                    "msg": 1,
                    "status": 1
                    } 
                }
            ]
            ret = collection.aggregate(pipeline)
            if ret:
                print('Found OK')
                alarms = list(ret)
                return alarms[0]

    except Exception as error:
        print(f"[ERROR] createAlarm: {error}")
