var socket = require('socket.io-client')('http://localhost:3000');

const SerialPort = require('serialport');
const port = new SerialPort('/dev/cu.usbmodem1431401', {
  // /dev/ttyACM0
  // /dev/cu.usbmodem1431401

  //parser: SerialPort.parsers.readline("\n"),
  baudRate: 9600
});

socket.on('connect', function(){
  socket.emit('iamboard', "MLAB");
});
socket.on('event', function(data){
  console.log(data);
  if(data.query == "LEDCTL"){
    write("LEDCTL " + data.r + " " + data.g + " " + data.b + " " + data.row + " " + data.col);
  }
});

var data = {
  query: "LEDCTL",
  r:0,
  g:0,
  b:0,
  row: -1,
  col: -1
}

var data2 = {
  query: "LEDCLRCOL",
  col: -1
}

socket.on('disconnect', function(){
  console.log("Disconnected");
});

port.on('open', function () {
  console.log('Serial open.');
});


port.on('data', function (data) {
  console.log('Data: ' + data);
});

function write(data) {
    console.log('Write: ' + data);
    port.write(new Buffer(data), function(err, results) {
      if(err) {
        console.log('Err: ' + err);
        console.log('Results: ' + results);
      }
  });
}