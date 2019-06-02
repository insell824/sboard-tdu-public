var net = require('net');

var client = new net.Socket();
client.connect(5000, '192.168.13.51', function() {
	console.log('Connected');
	client.write('LEDCTL 255 255 255 1 0');
});

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