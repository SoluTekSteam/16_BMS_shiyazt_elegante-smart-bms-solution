from telemetry.management import saveTelemetry
from alarm.management import createAlarm, clearAlarm, getAlarmDetails
import time

def ppl_counter_rule(db, msg, metadata) -> None:
    try:
        # CONSTANTS
        PERSON_AREA: int = 10

        if msg['peopleCount']:
            occupancyRate: float = (msg['peopleCount'] * PERSON_AREA) / msg['scanArea'] * 100
            print(f"[DEBUG] People Count: {msg['peopleCount']}")
            print(f"[DEBUG] Sensor Scanning Area: {msg['scanArea']}")
            print(f"[DEBUG] Occupancy rate: {occupancyRate}")
            ret = saveTelemetry(db, deviceId=metadata['deviceId'], payload={
                'occupancyRate': round(occupancyRate, 3)
            }, ts=int(time.time()))
            if ret['status'] != True:
                raise Exception('Failed to save telemetry')
            
            if occupancyRate > 50:
                print(f"[DEBUG] High Occupancy Alert")
                alarmText = f"High Occupancy alert {occupancyRate}%"
                print(f"[DEBUG] Device: {metadata['deviceName']}, msg: {alarmText}")
                ret = createAlarm(db, deviceId=metadata['deviceId'], alarmSeverity='critical', alarmStatus='active unacknowledged', alarmType='OCCUPANCY ALARM', msg=alarmText)
            else:
                alarmText = f"Occupancy alert cleared at {occupancyRate}%"
                ret = clearAlarm(db, deviceId=metadata['deviceId'], alarmSeverity='critical', alarmType='OCCUPANCY ALARM', msg=alarmText)
                if ret == True:
                    print(f"[DEBUG] Occupancy Alarm Cleared")

    except Exception as error:
        print(f"[ERROR] ppl_counter_rule: {error}") 



def sample_rule_template(db, msg, metadata) -> None:
    try:
        # CONSTANTS
        
        # RULES
        print(f"[DEBUG] sample_rule_template: {msg}")
        
    except Exception as error:
        print(f"[ERROR] sample_rule_template: {error}") 