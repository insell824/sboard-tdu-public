var socket = require('socket.io-client')('https://sboard-tdu.herokuapp.com/');

var net = require('net');
var client = new net.Socket();
client.on('data', function(data) {
	console.log('Received: ' + data);
	client.destroy(); // kill client after server's response
});
client.on('close', function() {
	console.log('Connection closed');
});
client.on('error', function(error) {
  console.log(error);
});

socket.on('connect', function(){
  socket.emit('iamboard', "MLAB");
});
socket.on('event', function(data){
  console.log(data);
  if(data.query == "LEDCTL"){
    //write("LEDCTL " + data.r + " " + data.g + " " + data.b + " " + data.row + " " + data.col);
    client.connect(5000, '127.0.0.1', async function() {
      console.log('Connected');
      //client.write('LEDCTL 255 255 255 1 0');
      await client.write("LEDCTL_AUTOFF_OTHER " + data.r + " " + data.g + " " + data.b + " " + data.row + " " + data.col);
    });
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


// function write(data) {
//     console.log('Write: ' + data);
//     port.write(new Buffer(data), function(err, results) {
//       if(err) {
//         console.log('Err: ' + err);
//         console.log('Results: ' + results);
//       }
//   });
// }