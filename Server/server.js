const Hero = require("./Game/Hero");
const Battle = require("./Game/Battle");
const uniqueID = require("uniqid");
const EventEmitter = require("events");
const io = require("socket.io")(8080, {
  allowEIO3: true,
});

const log = console.log;

const mainLobby = []; //socket.id -> socket
const playerQueue = []; //socket.id -> hero
const battles = []; //battle.id -> battle

const localEventEmitter = new EventEmitter();

io.on("connection", (socket) => {
  //define and init battleID property
  Object.defineProperty(socket, "battleID", {
    value: null,
    writable: true,
  });

  //new connection
  log(`=====New client connected: ${socket.conn.remoteAddress}=====`);

  moveSocketToMainLobby(socket);

  socket.on("disconnect", () => {
    onDisconnect(socket);
  });

  //handshake every so often to make sure client is there, disconnects them if no response arrives.
  // setTimeout(() => {
  //   createCheckConnectionInterval(socket);
  // }, 5000);
});

localEventEmitter.on("battleStarted", (battle) => {
  battle.gameController.once("battleEnded", () => {
    if (battle.player1.socket != null) battle.player1.socket.battleID = null;
    if (battle.player2.socket != null) battle.player2.socket.battleID = null;
    battle.gameController.removeAllListeners();
    delete battles[battle.id];
    log("Battle ended!");
  });
});

localEventEmitter.on("queueAppended", () => {
  if (Object.keys(playerQueue).length >= 2) {
    let ids = [];
    let i = 0;
    for (const [key, value] of Object.entries(playerQueue)) {
      if (i == 2) break;
      ids[i] = key;
      i++;
    }
    createBattle(playerQueue[ids[0]], playerQueue[ids[1]]);
    delete playerQueue[ids[0]];
    delete playerQueue[ids[1]];

    //DEBUG
    logCounts();
  }
});

var createBattle = (p1, p2) => {

  var b = new Battle(p1, p2);
  Object.defineProperty(b, "id", {
    value: uniqueID(),
    writable: false,
  });

  //adding the battle ID to both players.
  p1.socket.battleID = b.id;
  p2.socket.battleID = b.id;

  log();
  log("=====New battle started!=====");
  log("Player 1 battle ID:" + p1.socket.battleID);
  log("Player 2 battle ID:" + p2.socket.battleID);
  log("Battle ID:" + b.id);
  log();

  battles[b.id] = b;
  localEventEmitter.emit("battleStarted", b);
  p1.socket.emit("startBattle", "");
  p2.socket.emit("startBattle", "");
};

var moveSocketToMainLobby = (socket) => {
  mainLobby[socket.id] = socket;
  addQueueListeners(socket);
  log(`Moving socket ${socket.id} to lobby. BattleID: ${socket.battleID}.`);
  log();
  //DEBUG
  setTimeout(logCounts, 100);
};

var addQueueListeners = (socket) => {
  socket.once("queuedIn", (classID) => {
    playerQueue[socket.id] = new Hero(classID, socket);
    delete mainLobby[socket.id];
    //DEBUG
    logCounts();
    socket.once("queuedOut", () => {
      moveSocketToMainLobby(socket);
      delete playerQueue[socket.id];
    });
    localEventEmitter.emit("queueAppended", "");
  });
};

var onDisconnect = (socket) => {
  if (socket.battleID != null && !battles[socket.battleID].battleEnded) {
    log(
      "Client disconnected while in non-determined battle... " +
      socket.conn.remoteAddress
    );
    let battle = battles[socket.battleID];
    battle.gameController.emit("disconnect", socket);
    disconnectedClients[socket.conn.remoteAddress] = {
      location: "battle",
      time: Date.now(),
      battle: battle,
      remoteAddress: Object.assign(socket.conn.remoteAddress),
      playerNumber: 0,
    };

    if (battle.player1.socket != null) {
      if (
        socket.conn.remoteAddress == battle.player1.socket.conn.remoteAddress
      ) {
        disconnectedClients[socket.conn.remoteAddress].playerNumber = 1;
        battle.player1.socket = null;
      } else {
        disconnectedClients[socket.conn.remoteAddress].playerNumber = 2;
        battle.player2.socket = null;
      }
    } else {
      disconnectedClients[socket.conn.remoteAddress].playerNumber = 2;
      battle.player2.socket = null;
    }
  } else {
    if (
      socket.battleID != undefined &&
      socket.battleID != null &&
      battles[socket.battleID].battleEnded
    ) {
      log("Client disconnected after match ended");
    } else if (mainLobby[socket.id] != undefined) {
      log("Client disconnected in mainLobby");
      delete mainLobby[socket.id];
    } else if (playerQueue[socket.id] != undefined) {
      log("Client disconnected in queue");
      delete playerQueue[socket.id];
    } else {
      log("Unknown error");
    }
  }
  socket.removeAllListeners();
  socket.disconnect();
  delete socket;
  logCounts();
};

var createCheckConnectionInterval = (socket) => {
  let interval = setInterval(() => {
    if (socket.connected) {
      let responded = false;
      socket.once("checkConnection", () => {
        //log(socket.conn.remoteAddress + " is here!");
        responded = true;
      });
      socket.emit("checkConnection", "");
      //log("Checking connection on " + socket.conn.remoteAddress);
      setTimeout(() => {
        if (!responded) {
          log(socket.conn.remoteAddress + " is not responding. Disconnecting now.");
          onDisconnect(socket);
          clearInterval(interval);
        }
      }, 999);
    } else {
      log(socket.conn.remoteAddress + " is not connected. Disconnecting now.");
      onDisconnect(socket);
      clearInterval(interval);
      logCounts();
    }
  }, 1000);
};

var logCounts = () => {
  log("=====Server Status=====");
  log(
    "Number of players in main lobby: " +
    Object.keys(mainLobby).length +
    "      key: " +
    Object.keys(mainLobby)
  );
  log(
    "Number of players in queue: " +
    Object.keys(playerQueue).length +
    "           key: " +
    Object.keys(playerQueue)
  );
  log(
    "Number of running battles: " +
    Object.keys(battles).length +
    "            key: " +
    Object.keys(battles)
  );
  if (Object.keys(battles).length > 0)
    Object.keys(battles).forEach((key) => {
      log();
      log(`Battle ${key}: `);
      if (battles[key].player1.socket != undefined) {
        log("Player 1 id: " + battles[key].player1.socket.id);
      }
      if (battles[key].player2.socket != undefined) {
        log("Player 2 id: " + battles[key].player2.socket.id);
      }
    });
  log();
};

// setInterval(() => {
//   logCounts();
// }, 15000);

log("Now listening on 8080...");
