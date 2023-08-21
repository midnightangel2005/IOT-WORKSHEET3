import serial.tools.list_ports as port_list

# List of all available serial ports
ports = list(port_list.comports())

# Display all of the information of the ports
for p in ports:
    print(p)
