import RPi.GPIO as GPIO
import time
import Adafruit_DHT
import json
import requests

sensor = Adafruit_DHT.DHT22

sensorpin = 21
fanpin = 19

url = "http://210.102.178.98:60002/sensor/temp" # 주소
headers = {
    "Content-Type": "application/json"
}

GPIO.setmode(GPIO.BCM)
GPIO.setup(fanpin, GPIO.OUT)

try:
    while True:
        h, t = Adafruit_DHT.read_retry(sensor, sensorpin)

        if h is not None and t is not None:
            print("Temperature = {0:0.1f}*C Humidity = {1:0.1f}%".format(t, h))
            t = round(t, 2)
            temp = {
                "temp": t
            }
            value = json.dumps(temp)
            response = requests.post(url, headers=headers, data=value)

            if t > 30:
                GPIO.output(fanpin, GPIO.HIGH)
                time.sleep(0.5)
            else:
                GPIO.output(fanpin, GPIO.LOW)
                time.sleep(0.5)
        else:
            print('Read error')
            time.sleep(100)

except KeyboardInterrupt:
    GPIO.cleanup()
    print("Terminated by Keyboard")
