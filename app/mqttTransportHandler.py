import paho.mqtt.client as mqtt
import time
from dbUtils import dbConnector
from device.management import entityHandler

isConnected: bool = False
db = None

def on_connect(client, userdata, flags, rc):
    global isConnected
    if rc == 0:
        isConnected = True
        print(f"[INFO] MQTT Connetion Successfull ...[OK]")
        client.subscribe(topic="api/v1/bms/+/telemetry", qos=1)
    else:
        print("Connected with result code " + str(rc))


def on_message(client, userdata, msg):
    print(msg.topic+" "+str(msg.payload))
    ret = msg.topic.split("/")
    entityToken: str = ret[-2]
    msgType: str = ret[-1]
    entityHandler(db, entityToken, msgType, payload=msg.payload)


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