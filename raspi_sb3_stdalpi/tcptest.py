import socket
from datetime import datetime
import time

s = socket.socket()

port = 5001
s.bind(('', port))

while True:
    print('listening')
    s.listen(5)
    c, addr = s.accept()
    print('receiving')
    received_text = c.recv(4096)
    print(received_text)
    print('sending')
    now = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
    try:
        c.send(now)
    except:
        print("err")
    c.close()
s.close()