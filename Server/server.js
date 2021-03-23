var io = require('socket.io')(process.env.PORT || 52300);
var Player = require('./Game/Player.js');

console.log("The server has started...");

var players = [];
var sockets = [];

io.on('connection', (socket) => {
    console.log("Connection made!");

    var player = new Player();
    players[player.id] = player;
    sockets[player.id] = socket;

    socket.emit('register', { id: player.id });
    socket.emit('spawn', player);
    socket.broadcast.emit('spawn', player);

    for (var playerID in players) {
        if (playerID != player.id) {
            socket.emit('spawn', players[playerID]);
        }
    }

    socket.on('disconnect', (E) => {
        console.log("Disconnected...");
        delete sockets[player.id];
        delete players[player.id];
        socket.broadcast.emit('disconnected', { id: player.id });
    })
});

