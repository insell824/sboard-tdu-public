import socket
from contextlib import closing
import sys

s = socket.socket()

host = sys.argv[1]
port = 5001

#with closing(s):
s.connect((host, port))
s.send("hi")
print host, s.recv(4096)