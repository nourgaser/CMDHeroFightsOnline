const Hero = require("./Game/Hero");
var Match = require("./Game/Match");
var io = require('socket.io')(8080, {
  allowEIO3: true
});

var players = new Array();

io.on('connection', socket => {
  console.log("Client connected!");
  socket.emit('message', "You connected successfully!");
  players.push(new Hero("warrior", socket));
  console.log("Clients connected: " + players.length);
  
  if (players.length == 2) {
    players[1] = new Hero("mage", socket);
    createGame(players[0], players[1]);
  }

  socket.on('disconnect', () => {
    console.log("Client disconnected!");
    console.log("Clients connected: " + players.length);
    players.forEach(player => {
      if (player.stats["socket"].value === socket) {
        players.pop(player);
      }
    })

  });

});


var createGame = (p1, p2) => {
  var match = new Match(p1, p2);
  console.log("Match created.");
}

// setInterval(() => {
//   console.log("Number of clients: " + players.length);
// }, 10000);

console.log("Now listening on 8080...");