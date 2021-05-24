import sys

from pymongo import cursor
sys.path.append("..")
from dbUtils import dbConnector
from alarm.management import createAlarmDocument, createAlarm, getAlarmDetails
from notifications.telegram import sendMessage

from datetime import datetime

if __name__ == "__main__":
    
    db = dbConnector(name='elegante-app')
    ret = db.connect()
    print(f"[INFO] connect: {ret}")

    # ret = createAlarmDocument(db)
    # print(ret)

    # collection = db.selectCollection(name='alarms')
    # print(f"[INFO] collection : {collection}")

    # ret = createAlarm(db, userId='607fcdc6c24a3f686263ec20', deviceId='608143ae5219f08a0ffef39b', alarmSeverity='critical', alarmStatus='active unacknowledged', alarmType='TEST ALARM', msg='Testing alarm')


    ret = getAlarmDetails(db, alarmId='60a64a267f3d7fdf23d4c442')
    print(ret)
    createdTime = datetime.fromtimestamp(ret['createdTime']).strftime("%d/%m/%Y, %H:%M:%S")
    notifyText: str = f"Dear User, \n Alert! {ret['type']} \n Alarm: {ret['msg']} \n Severity: {ret['severity']} \n Status: {ret['status']} \n Building: {ret['buildingName']} \n Floor: {ret['floorName']} \n Device: {ret['deviceName']} \n Created at: {createdTime}"
    print(notifyText)
    sendMessage(chatId=743718652, msg=notifyText)