

from dbUtils import dbConnector
import random
import copy
import time
from device.management import createDevice, createDeviceDocument
from telemetry.management import createTelemetryDocument
from bson.objectid import ObjectId

if __name__ == "__main__":

    db = dbConnector(name='elegante-app')
    ret = db.connect()
    print(f"[INFO] connect: {ret}")
    # ret = db.collSelect(name='users')
    # print(f"[INFO] collection select: {ret}")

    # collection = db.selectCollection(name='users')

    # listUsers(collection)


    # collection = db.selectCollection(name='devices')

    # createDeviceDocument(db)

    # createDevice(db=db, deviceName='B1/S1/BASIC/TEMP/003', deviceLabel='Space 1 Temperature 03', deviceType='temperature', metadata={}, telemetry={})
    # createDevice(db=db, deviceName='TEMP_HUM-002', deviceType='temperature', metadata={}, telemetry={})

    # collection = db.selectCollection(name='devices')
    # item = collection.find_one({ 'key' : "u2WiTYLqFIbCUE1c5ht9" }, {'telemetry': 1, 'metadata': 1})
    # telbuffer: dict = copy.deepcopy(item['telemetry'])
    # telbuffer['temperature'] = random.randint(23, 29)
    # telbuffer['humidity'] = random.randint(50, 60)
    # metabuffer: dict = copy.deepcopy(item['metadata'])
    # metabuffer['last_updated'] = int(time.time())

    # ret = collection.update_one({'key': "u2WiTYLqFIbCUE1c5ht9"}, {"$set": {'telemetry': telbuffer, 'metadata': metabuffer}})
    # print(ret)

    # createTelemetryDocument(db)

    collection = db.selectCollection(name='telemetry')
    # ret = collection.insert_one({
    #     'userId': "606ff35931df8abadd48e0de",
    #     'deviceId': "rdfdsfwdsaad",
    #     'telemetry': {
    #         'temperature':  324
    #     },
    #     'ts': int(time.time())
    # })
    # print(ret)

    cursors = collection.find({ 'userId': ObjectId('606ff35931df8abadd48e0de') })
    for item in cursors:
        print(item)
