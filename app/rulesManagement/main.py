
from alarm.management import createAlarm, clearAlarm, getAlarmDetails
from notifications.telegram import sendMessage
from datetime import datetime

def temperatureDeviceHandler(db, msg, metadata) -> None:
    try:
        print(f"[DEBUG] Temperature handler")
        if msg['temperature'] >= 40:
            print(f"[DEBUG] High Temperature Alert")
            alarmText = f"High Temperature alert {msg['temperature']}°C"
            print(f"[DEBUG] Device: {metadata['deviceName']}, msg: {alarmText}")
            ret = createAlarm(db, deviceId=metadata['deviceId'], alarmSeverity='critical', alarmStatus='active unacknowledged', alarmType='TEMPERATURE ALARM', msg=alarmText)
            if ret['status']:
                print(f"[DEBUG] Temperature Alarm Created")
                if ret['_id']:
                    ret = getAlarmDetails(db, alarmId=ret['_id'])
                    print(ret)
                    createdTime = datetime.fromtimestamp(ret['createdTime']).strftime("%d/%m/%Y, %H:%M:%S")
                    notifyText: str = f"Dear User, \n Alert! {ret['type']} \n Alarm: {ret['msg']} \n Severity: {ret['severity']} \n Status: {ret['status']} \n Building: {ret['buildingName']} \n Floor: {ret['floorName']} \n Device: {ret['deviceName']} \n Created at: {createdTime}"
                    print(notifyText)
                    sendMessage(chatId=743718652, msg=notifyText)

        if msg['humidity'] >= 65:
            print(f"[DEBUG] High Humidity Alert")
            # print(f"[DEBUG] Device: {metadata['deviceName']}, humidity: {msg['humidity']}")
            alarmText = f"High Humidity alert {msg['humidity']}%"
            print(f"[DEBUG] Device: {metadata['deviceName']}, msg: {alarmText}")
            ret = createAlarm(db, deviceId=metadata['deviceId'], alarmSeverity='warning', alarmStatus='active unacknowledged', alarmType='HUMIDITY ALARM', msg=alarmText)
            if ret['status']:
                print(f"[DEBUG] Humidity Alarm Created")
                if ret['_id']:
                    ret = getAlarmDetails(db, alarmId=ret['_id'])
                    print(ret)
                    createdTime = datetime.fromtimestamp(ret['createdTime']).strftime("%d/%m/%Y, %H:%M:%S")
                    notifyText: str = f"Dear User, \n Alert! {ret['type']} \n Alarm: {ret['msg']} \n Severity: {ret['severity']} \n Status: {ret['status']} \n Building: {ret['buildingName']} \n Floor: {ret['floorName']} \n Device: {ret['deviceName']} \n Created at: {createdTime}"
                    print(notifyText)
                    sendMessage(chatId=743718652, msg=notifyText)
        else:
            alarmText = f"Humidity alert cleared at {msg['humidity']}%"
            ret = clearAlarm(db, deviceId=metadata['deviceId'], alarmSeverity='warning', alarmType='HUMIDITY ALARM', msg=alarmText)
            if ret:
                print(f"[DEBUG] Humidity Alarm Cleared")

    except Exception as error:
        print(f"[ERROR] temperatureHandler: {error}")



""""
Description : Control Center Data Handler
"""
def dataHandler(db, payload: dict) -> None:
    try:
        print(f"[DEBUG] Rule Management")
        if payload['metadata']:
            if payload['metadata']['deviceType'].lower() == "temperature":
                return temperatureDeviceHandler(db, msg=payload['msg'], metadata=payload['metadata'])

    except Exception as error:
        print(f"[ERROR] dataHandler: {error}")