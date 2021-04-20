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
        client = mqtt.Client()
        client.on_connect = on_connect
        client.on_message = on_message
        client.username_pw_set(username='dev', password='GQgk4OX8')
        client.connect("localhost", 1883, 60)

        while isConnected:
            print(f"[DEBUG] Please wait ...")
            time.sleep(1)

        client.loop_start()

        INTERVAL: int = 10

        while True:
            try:
                next_ts = time.time() + INTERVAL
                payload: dict = {
                    'temperature': random.randint(20, 30),
                    'humidity': random.randint(50, 60),
                    'pressure': random.randint(23, 34)
                }
                client.publish(topic='api/v1/bms/4Ceh3UxZ7DlX/telemetry', payload=json.dumps(payload))
                print(f"[INFO] Send Payload ...[OK]")
                sleep_time = next_ts - time.time()
                if sleep_time > 0:
                    time.sleep(sleep_time)
            except Exception as error:
                print(f"[INFO] Stopping ....")
    except Exception as error:
        print(f"[ERROR] main: {error}")