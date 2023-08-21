import serial
from time import time, sleep
from requests import post as http_post
import json
import logging

# Logging
logging.basicConfig(filename='serial.log', level=logging.DEBUG)

serial_port = 'COM4'
# Serial port
ser = serial.Serial(serial_port, 115200, timeout=1)


def read_serial():
    line = ser.readline()
    if line:
        # Read data from CSV format
        accel_x, accel_y, accel_z, temp, light_level = line.decode().split(",")
        
        logging.info(line)

        # Submit data to the webserver
        response = http_post('http://localhost:3000/api/report', json={
            'accel_x': int(accel_x),
            'accel_y': int(accel_y),
            'accel_z': int(accel_z),
            'temp': int(temp),
            'light_level': int(light_level),
        })

        print(response.status_code)

        print(line)
        return line

# Main Loop
while True:
    read_serial()
    sleep(1)