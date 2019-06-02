#!/usr/bin/env python3
# NeoPixel library strandtest example
# Author: Tony DiCola (tony@tonydicola.com)
#
# Direct port of the Arduino NeoPixel library strandtest example.  Showcases
# various animations on a strip of NeoPixels.

import sys
import time
from neopixel import *
import argparse
import socket
from datetime import datetime


# LED strip configuration:
LED_COUNT      = 35      # Number of LED pixels.
LED_PIN        = 12      # GPIO pin connected to the pixels (18 uses PWM!).
#LED_PIN        = 10      # GPIO pin connected to the pixels (10 uses SPI /dev/spidev0.0).
LED_FREQ_HZ    = 800000  # LED signal frequency in hertz (usually 800khz)
LED_DMA        = 10      # DMA channel to use for generating signal (try 10)
LED_BRIGHTNESS = 64     # Set to 0 for darkest and 255 for brightest
LED_INVERT     = False   # True to invert the signal (when using NPN transistor level shift)
LED_CHANNEL    = 0       # set to '1' for GPIOs 13, 19, 41, 45 or 53

ROW = 7
COL = 5


# Define functions which animate LEDs in various ways.
def colorWipe(strip, color, wait_ms=50):
    """Wipe color across display a pixel at a time."""
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, color)
        strip.show()
        time.sleep(wait_ms/1000.0)

def colorShow(strip, color, index):
    strip.setPixelColor(index, color)
    strip.show()

def colorAll(strip, color):
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, color)
    strip.show()

def strToInt(str_,default_):
    res = default_
    try:
        res = int(str_)
    except ValueError as verr:
        res = default_
    except Exception as ex:
        res = default_
    return res

def getMatrixIndex(col_,row_):
    i = 0
    if col_ % 2 == 0:
        i = ROW - row_ - 1 + col_ * ROW
    else :
        i = ROW * col_ + row_
    return i

def execCmd(cmdStr):
    arr_ctl = cmdStr.split(" ")
    cmd = arr_ctl[0]
    print(cmd)
    if cmd == "LEDCTL_AUTOFF_OTHER" and len(arr_ctl) == 6:
        cmd_ledctl_autoff_other(arr_ctl)
    # if cmd == "LEDOFF_COL" and len(arr_ctl) == 2:
    #     cmd_ledOffByCol(arr_ctl)

# def cmd_ledOffByCol(arr_ctl):
#     board_c = strToInt(arr_ctl[1],-1)
#     if board_c != -1:
#         for r in range(ROW):
#             board_i = getMatrixIndex(board_c,r)
#             colorShow(strip, Color(0, 0, 0),board_i)

def cmd_ledctl_autoff_other(arr_ctl):
    int_r = strToInt(arr_ctl[1],0)
    int_g = strToInt(arr_ctl[2],0)
    int_b = strToInt(arr_ctl[3],0)
    board_r = strToInt(arr_ctl[4],-1)
    board_c = strToInt(arr_ctl[5],-1)
    if board_c != -1 and board_r != -1:
        for r in range(ROW):
            board_i = getMatrixIndex(board_c,r)
            colorShow(strip, Color(0, 0, 0),board_i)
        board_i = getMatrixIndex(board_c,board_r)
        colorShow(strip, Color(int_g, int_r, int_b),board_i)


# Main program logic follows:
if __name__ == '__main__':
    # Process arguments
    # parser = argparse.ArgumentParser()
    # parser.add_argument('-c', '--clear', action='store_true', help='clear the display on exit')
    # args = parser.parse_args()

    # Create NeoPixel object with appropriate configuration.
    strip = Adafruit_NeoPixel(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)
    # Intialize the library (must be called once before other functions).
    strip.begin()
    colorAll(strip, Color(0,0,0))
    try:

        s = socket.socket()
        port = 5000
        s.bind(('', port))
        while True:
            print('listening')
            s.listen(5)
            c, addr = s.accept()
            print('receiving')
            received_text = c.recv(4096)
            execCmd(received_text)
            print(received_text)
            print('sending')
            now = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
            try:
                c.send(now)
            except:
                print("err")
            c.close()
        s.close()


        # execCmd("LEDCTL 255 0 100 1 1")
        # execCmd("LEDCTL 255 300 0 1 2")
        
        # if(data.query == "LEDCTL"){
        #     write("LEDCTL " + data.r + " " + data.g + " " + data.b + " " + data.row + " " + data.col);
        # }

    except KeyboardInterrupt:
        colorAll(strip, Color(255,255,255))
        c.close()
        s.close()