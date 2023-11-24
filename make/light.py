import requests
import json
import spidev
import time
import asyncio
import socket
import RPi.GPIO as GPIO

HOST = '0.0.0.0'
PORT = 60002

GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.OUT)

delay = 1

pot_channel = 0
spi = spidev.SpiDev()
spi.open(0, 0)

spi.max_speed_hz = 100000
url = "http://210.102.178.98:60002/sensor/lightValue"

def readadc(adcnum):
    if adcnum < 0 or adcnum > 7:
        return -1
    r = spi.xfer2([1, 8+adcnum << 4, 0])
    data = ((r[1] & 3) << 8) + r[2]
    return data

headers = {
    "Content-Type": "application/json"
}

async def handle_client(reader, writer):
    client_address = writer.get_extra_info('peername')
    print('Client connected:', client_address)

    while True:
        data = await reader.read(1024)
        if not data:
            break

        message = data.decode().strip()
        print('Received message:', message)

        if message == "Auto On":
            while True:
                pot_value = readadc(pot_channel)
                if pot_value > 100:
                    start = time.strftime('%c')
                    stop = "Not OFF"
                    GPIO.output(18, GPIO.HIGH)
                    print("---------------------------")
                    print("POT value: %d" % pot_value)
                    await asyncio.sleep(delay)
                else:
                    stop = time.strftime('%c')
                    start = "Not ON"
                    GPIO.output(18, GPIO.LOW)
                    print("---------------------------")
                    print("POT value: %d" % pot_value)
                    await asyncio.sleep(delay)
                    temp = {
                        "userid" : "rirakang",
                        "light_value": readadc(pot_channel),
                        "on_time" : start,
                        "off_time" : stop
                    }
                    value = json.dumps(temp)
                    response = requests.post(url, headers=headers, data=value)

        elif message == "Auto Off":
            response_message = "Auto Off"
            GPIO.output(18, GPIO.LOW)
            

        elif message == "Led Off":
            GPIO.output(18, GPIO.LOW)
            response_message = "LED turned off"
            
        elif message == "Led On":
            GPIO.output(18, GPIO.HIGH)
            response_message = "LED turned on"
        else:
            response_message = "Invalid command"

        writer.write(response_message.encode())
        await writer.drain()

    print('Client disconnected:', client_address)
    writer.close()

async def main():
    server = await asyncio.start_server(handle_client, HOST, PORT)
    print('Server is running...')
    async with server:
        await server.serve_forever()

asyncio.run(main())
