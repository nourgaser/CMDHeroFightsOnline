var io = require('socket.io')(8080, {
  allowEIO3: true
});

io.on('connection', socket => {
  console.log("Client connected!");

  setInterval(() => {socket.emit('message', "Hi from node")}, 2000);

  socket.on('message', (e) => {
    console.log(e);
  })

});

io.on('disconnect', socket => {
  console.log("Client disconnected!");
});io.on('disconnected', socket => {
  console.log("Client disconnected!");
});io.on('disconnection', socket => {
  console.log("Client disconnected!");
});

console.log("Now listeing on 8080...");