# // Some example procedures showing how to display to the pixels:
# // colorWipe(strip.Color(0, 0, 0), DELAY_TIME); // Black
# // lightControl(r, g, b, m, n, line, column));
# void lightControl(int r, int g, int b, int row_, int column_) {
#   uint32_t c = strip.Color(r, g, b);
#   int i = 0;
#   if (column_ % 2 == 0) {
#     i = ROW - row_ - 1 + column_ * ROW;
#   } else {
#     i = ROW * column_ + row_;
#   }
#   strip.setPixelColor(i, c);
#   strip.show();
# }

ROW = 7
COL = 5

r = 1
c = 2

i = 0
if c % 2 == 0:
  i = ROW - r - 1 + c * ROW
else :
  i = ROW * c + r

print i