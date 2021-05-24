import paho.mqtt.client as mqtt
import time
# import sys
# sys.path.append("..")
from dbUtils import dbConnector
from rulesManagement.main import dataHandler
import json

isConnected: bool = False
db = None

def on_connect(client, userdata, flags, rc):
    global isConnected
    if rc == 0:
        isConnected = True
        print(f"[INFO] MQTT Connetion Successfull ...[OK]")
        client.subscribe(topic="api/v1/bms/controlcenter/msg", qos=1)
        print(f"[DEBUG] Subscribed to rule chain messages")
    else:
        print("Connected with result code " + str(rc))


def on_message(client, userdata, msg):
    # print(msg.topic+" "+str(msg.payload))
    print(f"[DEBUG] Received MQTT Message")
    if msg.topic.lower() == 'api/v1/bms/controlcenter/msg':
        deviceData: dict = json.loads(msg.payload)
        # print(f"Msg Payload")
        dataHandler(db, deviceData)

if __name__ == "__main__":
    try:
        client = mqtt.Client()
        client.on_connect = on_connect
        client.on_message = on_message

        client.username_pw_set(username='dev', password='GQgk4OX8')

        client.connect("localhost", 1883, 60)

        while isConnected:
            print(f"[DEBUG] Please wait ...")
            time.sleep(1)

        db = dbConnector(name='elegante-app')
        ret = db.connect()
        print(f"[DEBUG] dbConnect: {ret}")
        client.loop_forever()
    except Exception as error:
        print(f"[ERROR] main: {error}")