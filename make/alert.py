import RPi.GPIO as GPIO
import time
import Adafruit_DHT
import requests
import json
import socket

HOST = '0.0.0.0'
PORT = 60002

sensor = Adafruit_DHT.DHT22
sensorpin = 21
motorpin = 4

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.bind((HOST, PORT))
server_socket.listen(1)
print('Server is running...')

url = "http://210.102.178.98:60002/sensor/alert"
headers = {
    "Content-Type": "application/json"
}

GPIO.setmode(GPIO.BCM)
GPIO.setup(motorpin, GPIO.OUT)
p = GPIO.PWM(motorpin, 50)
p.start(3.0)

while True:
    client_socket, addr = server_socket.accept()
    print('Client connected:', addr)
    data = client_socket.recv(1024).decode().strip()
    print('Received message:', data)

    if data == "windowAuto On":
        while True:
            h, t = Adafruit_DHT.read_retry(sensor, sensorpin)
            if h is not None and t is not None:
                print("Temperature = {0:0.1f}*C Humidity = {1:0.1f}%".format(t, h))
                if h > 70:
                    p.ChangeDutyCycle(3.0)
                    time.sleep(1.0)
                else:
                    p.ChangeDutyCycle(6.0)
                    time.sleep(1.0)

    elif data == "windowAuto Off":
        p.stop()

    elif data == "window On":
        p.start(3.0)

    elif data == "window Off":
        p.stop()
