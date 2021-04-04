const Hero = require("./Game/Hero");
const Battle = require("./Game/Battle");
const uniqueID = require('uniqid');
const EventEmitter = require('events');
const io = require('socket.io')(8080, {
  allowEIO3: true
});

const log = console.log;

const allPlayers = [];
const playerQueue = [];
const battles = [];

const localEventEmitter = new EventEmitter();

io.on('connection', socket => {
  log("Client connected!");
  socket.emit('message', "You connected successfully!");
  Object.defineProperty(socket, 'id', {
    value: uniqueID(),
    writable: false
  });
  playerEnterMainLobby(socket);

  socket.on('backToMainLobby', () => {
    playerEnterMainLobby(socket);
    socket.emit('backToMainLobby',"");
  });

  socket.on('queuedIn', () => {
    playerQueue[socket.id] = allPlayers[socket.id];
    delete allPlayers[socket.id];
    //DEBUG
    logCounts();
    localEventEmitter.emit('queueAppended', "");
  });

  socket.on('queuedOut', () => {
    allPlayers[socket.id] = playerQueue[socket.id];
    delete playerQueue[socket.id];
  });

  socket.on('disconnect', () => {
    log("Client disconnected!");
    //DEBUG
    logCounts();
  });
});

localEventEmitter.on('battleStarted', battle => {
  battle.gameController.once('battleEnded', () => {
    battle.gameController.removeAllListeners();
    delete battles[battle.id];
  });
});

localEventEmitter.on('queueAppended', () => {
  log("appendning the queue!!\n");
  if (Object.keys(playerQueue).length >= 2) {
    log("attempting to start battle");
    let ids = [];
    let i = 0;
    for (const [key, value] of Object.entries(playerQueue)) {
      if (i == 2) break;
      ids[i] = key;
      i++;
    }
    playerQueue[ids[1]] = new Hero("mage", playerQueue[ids[1]].stats["socket"].value);
    createBattle(playerQueue[ids[0]], playerQueue[ids[1]]);
    delete playerQueue[ids[0]];
    delete playerQueue[ids[1]];

    //DEBUG
    logCounts();
  }
});

var createBattle = (p1, p2) => {
  p1.stats["socket"].value.emit("startBattle", "");
  p2.stats["socket"].value.emit("startBattle", "");

  var b = new Battle(p1, p2);
  Object.defineProperty(b, 'id', {
    value: uniqueID(),
    writable: false
  });
  battles[b.id] = b;

  localEventEmitter.emit('battleStarted', b);
}

var playerEnterMainLobby = socket => {
  allPlayers[socket.id] = new Hero("rogue", socket);
  //DEBUG
  logCounts();
}

var logCounts = () => {
  log("Number of players in main lobby: " + Object.keys(allPlayers).length + "      key: " + Object.keys(allPlayers));
  log("Number of players in queue: " + Object.keys(playerQueue).length + "           key: " + Object.keys(playerQueue));
  log("Number of running battles: " + Object.keys(battles).length + "            key: " + Object.keys(battles));
  log();
}
log("Now listening on 8080...");