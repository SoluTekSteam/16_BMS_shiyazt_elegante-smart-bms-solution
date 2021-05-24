import paho.mqtt.client as mqtt
import sys
import time
import json
import Adafruit_DHT

# DHT11
sensor=Adafruit_DHT.DHT11
gpio=17

INTERVAL = 20
next_reading = time.time()

payload = {
	"temperature" : 0,
	"humidity" : 0
}

def on_connect(client, userdata, flags, rc):
	# print("Connected with result code "+str(rc))
	if rc == 0:
		print('Connection Successful')
	elif rc == 1:
		print('Connection Refused : incorrect protocol version')
	elif rc == 2:
		print('Connection Refused – invalid client identifier')
	elif rc == 3:
		print('Connection Refused – server unavailable')
	elif rc == 4:
		print('Connection Refused – bad username or password')
	elif rc == 5:
		print('Connection Refused – not authorised')
	else:
		print('Currently unused')



def on_message(client, userdata, msg):
    print(msg.topic+" "+str(msg.payload))


def populateValue():
	try:
		payload["humidity"], payload["temperature"] = Adafruit_DHT.read_retry(sensor, gpio)
		print('[DEBUG] Device Payload : {}' .format(payload))
	except Exception as error:
		print('[ERROR] {}' .format(error))

		

if __name__ == "__main__":
		try:
			MQTT_UNAME: str = 'dev'
			MQTT_PASSWORD: str = 'GQgk4OX8'
			HOST: str = 'shiyaz3470'
			PORT: int = 8883
			DEVICE_APITOKEN: str = 'wPuB32D8j8uB'

			client = mqtt.Client()
			client.on_connect = on_connect
			client.on_message = on_message

			client.tls_set(ca_certs="ca.crt", certfile="client.crt", keyfile="client.key")
			client.username_pw_set(MQTT_UNAME, MQTT_PASSWORD)
			client.connect(HOST, PORT, 60)
			client.loop_start()

			print("""
				==================================================
							MQTTS Communication 
				==================================================\n""")
			print(f"Host: {HOST}\n\n")

			while True:
				try:
					populateValue()
					client.publish(f'api/v1/bms/{DEVICE_APITOKEN}/telemetry', json.dumps(payload), 1)
					print('[INFO] Published Data to server ...[OK]')
					next_reading += INTERVAL
					sleep_time = next_reading-time.time()
					if sleep_time >0:
						time.sleep(sleep_time)
				except Exception as error:
					print(error)

		except KeyboardInterrupt:
			print('Exiting ...')
			sys.exit(0)