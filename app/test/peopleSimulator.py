import paho.mqtt.client as mqtt
import time
import random
import json

isConnected: bool = False


def on_connect(client, userdata, flags, rc):
    global isConnected
    if rc == 0:
        isConnected = True
        print(f"[INFO] MQTT Connetion Successfull ...[OK]")
    else:
        print("Connected with result code " + str(rc))


def on_message(client, userdata, msg):
    print(msg.topic+" "+str(msg.payload))


if __name__ == "__main__":
    try:
        # CONFIG
        HOST: str = '165.232.177.248'
        PORT: int = 1883
        username: str = 'dev'
        pwd: str = 'GQgk4OX8'
        TOKEN: str = 'CsaPBgt1ndKlPqJN'
        TEL_TOPIC: str = f'api/v1/bms/{TOKEN}/telemetry'



        client = mqtt.Client()
        client.on_connect = on_connect
        client.on_message = on_message
        client.username_pw_set(username=username, password=pwd)
        client.connect(HOST, PORT, 60)

        while isConnected:
            print(f"[DEBUG] Please wait ...")
            time.sleep(1)

        client.loop_start()

        INTERVAL: int = 30

        while True:
            try:
                next_ts = time.time() + INTERVAL
                payload: dict = {
                    'peopleCount': int(random.uniform(2, 20)),
                    'scanArea': 200
                }
                client.publish(topic=TEL_TOPIC, payload=json.dumps(payload))
                print(f"[INFO] Send Payload ...[OK]")
                sleep_time = next_ts - time.time()
                if sleep_time > 0:
                    time.sleep(sleep_time)
            except Exception as error:
                print(f"[INFO] Stopping ....")
    except Exception as error:
        print(f"[ERROR] main: {error}")