import requests
import json
import spidev
import time
import socket
import Adafruit_DHT
import RPi.GPIO as GPIO
import threading
import datetime

HOST = '0.0.0.0'
PORT = 60002

LED = 18
TRIG = 13
ECHO = 6
BUZZER = 26

sensor = Adafruit_DHT.DHT22
sensorpin = 21
motorpin = 4
fanpin = 19

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(18, GPIO.OUT)
GPIO.setup(motorpin, GPIO.OUT)
GPIO.setup(fanpin, GPIO.OUT)
GPIO.setup(TRIG, GPIO.OUT)
GPIO.setup(ECHO, GPIO.IN)
GPIO.setup(BUZZER, GPIO.OUT)

pwm = GPIO.PWM(BUZZER, 262)

global p
p = GPIO.PWM(motorpin, 50)
p.start(0)

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.bind((HOST, PORT))
server_socket.listen(1)
print('Server is running...')
delay = 1

pot_channel = 0
spi = spidev.SpiDev()
spi.open(0, 0)

spi.max_speed_hz = 100000
lighturl = "http://210.102.178.98:60002/sensor/lightValue"
windowurl = "http://210.102.178.98:60002/sensor/humi"
fanurl = "http://210.102.178.98:60002/sensor/temp"
alerturl = "http://210.102.178.98:60002/sensor/alert"
headers = {
    "Content-Type": "application/json"
}
data = ""
light_start = None
light_stop = None
fan_start = None
fan_stop = None
window_start = None
window_stop = None
alert_start = None
alert_stop = None
userdistance = 0
user_distance =0
usertemp = 0
user_temp = 0
userhumi = 0
user_humi = 0
userid = 0
user_id = 0

def readadc(adcnum):
    if adcnum < 0 or adcnum > 7:
        return -1
    r = spi.xfer2([1, 8+adcnum << 4, 0])
    data = ((r[1] & 3) << 8) + r[2]
    return data

def lightfunction():
    global data, light_start, light_stop
    while True:
        if data == 'Auto Off':
            print("전등을 끕니다")
            GPIO.output(18, GPIO.LOW)
            light_stop = time.strftime('%Y.%m.%d - %H:%M:%S')
            break
        light_value = {
            "userid": user_id,
            "light_value": readadc(pot_channel),
            "on_time": str(light_start),
            "off_time": str(light_stop)
        }
        value = json.dumps(light_value)
        pot_value = readadc(pot_channel)
        response = requests.post(lighturl, headers=headers, data=value)
        if pot_value > 100:
            if not light_start:
                light_start = time.strftime('%Y.%m.%d - %H:%M:%S')
            GPIO.output(18, GPIO.HIGH)
            print("---------------------------")
            print("POT value: %d" % pot_value)
            print("Turned on at:", light_start)
            time.sleep(delay)
        else:
            if light_start:
                light_stop = time.strftime('%Y.%m.%d - %H:%M:%S')
                light_start = None
            GPIO.output(18, GPIO.LOW)
            print("----------------------------")
            print("POT value: %d" % pot_value)
            print("Turned off at:", light_stop)
            time.sleep(delay)

def fanfunction():
    global data, fan_start, fan_stop, user_temp
    while True:
        if data == "airconAuto Off":
            print("전원을 끕니다")
            GPIO.output(fanpin, GPIO.LOW)
            fan_stop = time.strftime('%Y.%m.%d - %H:%M:%S')
            break
        h, t = Adafruit_DHT.read_retry(sensor, sensorpin)
        if h is not None and t is not None:
            print("Temperature = {0:0.1f}*C Humidity = {1:0.1f}%".format(t, h))
        if (t > user_temp):
            if not fan_start:
                fan_start = time.strftime('%Y.%m.%d - %H:%M:%S')
            GPIO.output(fanpin, GPIO.HIGH)
        else:
            if fan_start:
                fan_stop = time.strftime('%Y.%m.%d - %H:%M:%S')
                fan_start = None
            GPIO.output(fanpin, GPIO.LOW)
        temp = {
            "userid": user_id,
            "temp": round(t,1),
            "on_time": str(fan_start),
            "off_time": str(fan_stop)
        }
        value = json.dumps(temp)
        response = requests.post(fanurl, headers=headers, data=value)

def windowfunction():
    global data, window_start, window_stop
    while True:
        if data == "windowAuto Off":
            print("전원을 끕니다")
            p.ChangeDutyCycle(2.5)
            window_stop = time.strftime('%Y.%m.%d - %H:%M:%S')
            break
        h, t = Adafruit_DHT.read_retry(sensor, sensorpin)
        if h is not None and t is not None:
            print("Temperature = {0:0.1f}*C Humidity = {1:0.1f}%".format(t, h))
        if h > user_humi:
            if not window_start:
                window_start = time.strftime('%Y.%m.%d - %H:%M:%S')
            p.ChangeDutyCycle(6)
            time.sleep(1.0)
        else:
            if window_start:
                window_stop = time.strftime('%Y.%m.%d - %H:%M:%S')
                window_start = None
            p.ChangeDutyCycle(2.5)
            time.sleep(1.0)
        humi = {
            "userid": user_id,
            "humidity": round(h,1),  # humidity 변수 값을 사용하도록 수정
            "open_time": str(window_start),
            "close_time": str(window_stop)
        }
        value = json.dumps(humi)
        response = requests.post(windowurl, headers=headers, data=value)

def alertfunction():
    global data, alert_start, alert_stop, user_distance
    while True:
        if data == "Alert Off":
            print("거리 측정 완료")
            pwm.stop()
            GPIO.output(BUZZER, GPIO.LOW)
            alert_stop = time.strftime('%Y.%m.%d - %H:%M:%S')
            break

        GPIO.output(TRIG, True)
        time.sleep(1)
        GPIO.output(TRIG, False)

        while GPIO.input(ECHO) == 0:
            start = time.time()

        while GPIO.input(ECHO) == 1:
            stop = time.time()

        check_time = stop - start
        distance = check_time * 34300 / 2
        print("Distance : %.1f cm" % distance)
        time.sleep(1)

        dis = {
            "userid": user_id,
            "distance": round(distance,1),
            "on_time": str(alert_start),
            "off_time": str(alert_stop)
        }
        value = json.dumps(dis)
        response = requests.post(alerturl, headers=headers, data=value)

        if (distance <= user_distance):
            if not alert_start:
                alert_start = time.strftime('%Y.%m.%d - %H:%M:%S')
            pwm.start(50.0)
            time.sleep(1)
        else:
            if alert_start:
                alert_stop = time.strftime('%Y.%m.%d - %H:%M:%S')
                alert_start = None
            pwm.stop()
            GPIO.output(BUZZER, GPIO.LOW)   

def listen_for_all():
    global data, userdistance, user_distance,usertemp, user_temp, user_humi,userhumi,userid,user_id

    while True:
        client_socket, addr = server_socket.accept()
        print('Client connected:', addr)
        data = client_socket.recv(1024).decode().strip()
        print('Received message:', data)

        if data == "Auto On":
            threading.Thread(target=readadc).start()
            threading.Thread(target=lightfunction).start()         
        elif data == "Auto Off":
            data = "Auto Off"  # function 함수에게 전달
        elif data == "Led Off":
            GPIO.output(18, GPIO.LOW)
        elif data == "Led On":
            GPIO.output(18, GPIO.HIGH)
            time.sleep(2)

        if data == "airconAuto On":
         threading.Thread(target=fanfunction).start()
        elif data.startswith("usertemp:"):
            value = data.split(":")[1].strip()
            if value:
               user_temp = float(value)
            else:
              print("Invalid format for usertemp")

        elif data == "airconAuto Off":
            data = "airconAuto Off"  # fuction 함수에게 전달 

        elif data == "aircondition On":
         GPIO.output(fanpin, GPIO.HIGH)

        elif data == "aircondition Off":
         GPIO.output(fanpin, GPIO.LOW)

        if data == "windowAuto On":
            threading.Thread(target=windowfunction).start()
        elif data.startswith("userhumi:"):
            value = data.split(":")[1].strip()
            if value:
               user_humi = float(value)
            else:
              print("Invalid format for userhumi")

        elif data == "windowAuto Off":
            data = "windowAuto Off"  # function 함수에게 전달

        elif data == "window On":
            p.ChangeDutyCycle(6)

        elif data == "window Off":
            p.ChangeDutyCycle(2.5)

        if data == "Alert On":
            threading.Thread(target=alertfunction).start()
        elif data.startswith("userdistance:"):
            value = data.split(":")[1].strip()
            if value:
               user_distance = float(value)
            else:
              print("Invalid format for userdistance")

        elif data == "Alert Off":
           data = "Alert Off"
           time.sleep(2)
        elif data.startswith("userid:"):
            value = data.split(":")[1].strip()
            if value:
               user_id = value
            else:
              print("Invalid format for userdistance")
        else:
            time.sleep(2)



threading.Thread(target=listen_for_all).start()

