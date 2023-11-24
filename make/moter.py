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
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # 주소 재사용 설정
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
            else:
                break  # 측정 실패 시 루프 종료

    elif data == "windowAuto Off":
        p.stop()
        print("Window Auto mode turned off")
        continue  # 다음 클라이언트 메시지를 기다리기 위해 continue 문 추가

    elif data == "window On":
        p.start(50.0)  # 듀티 사이클 값 50.0으로 설정
        print("Window opened")

    elif data == "window Off":
        p.stop()
        print("Window closed")
