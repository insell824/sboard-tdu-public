const socket = require('socket.io');



function SocketManager(){

  this.id = 0;

  this.init = (server) =>{
    var io = socket(server);
    io.on('connection',function(socket){
      console.log('connected');
      socket.on('general',function(data){
        console.log('general',data);
        io.emit('general',{
          text:data.text
        });
      });

      socket.on('changereq', function (data){
        io.emit('event', data);
      });
      socket.on('iamboard',function(data){
        if(data == "MLAB"){
          this.id =  socket.id;
        }
        console.log(this.id);
      });
    });
  }
}

var socketManager = new SocketManager();
module.exports = socketManager;