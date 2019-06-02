'use strict';

// シリアルポートに定期的に書き込んではデータを受け取る
// パーストークンは \n
// 1秒おき送信

const SerialPort = require('serialport');
const port = new SerialPort('/dev/ttyACM0', {
  //parser: SerialPort.parsers.readline("\n"),
  baudRate: 9600
});

var flag = true;

port.on('open', function () {
  console.log('Serial open.');
  setInterval(write, 500);
});


port.on('data', function (data) {
  console.log('Data: ' + data);
});

function write(data) {
  data  = flag?"a":"b";
    console.log('Write: ' + data,flag);
    
    port.write(new Buffer(data), function(err, results) {
      flag = !flag;
      if(err) {
        console.log('Err: ' + err);
        console.log('Results: ' + results);
      }
  });
}