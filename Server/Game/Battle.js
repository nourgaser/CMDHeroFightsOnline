const { debug } = require('console');
const EventEmitter = require('events');
const AllClasses = require('./Classes/All');
const Hero = require('./Hero');

class Battle {
    attacker;
    defender;
    gameController = new EventEmitter();
    turn = 1;
    moves = 3;
    turnCounter = 0;
    battleEnded = false;

    disconnectedPlayer;

    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;

        this.startBattle();
        //this.test();
    }

    /*battle setup: initialization and adding gameController listeners, 
    then signaling for first turn to start the turn loop*/
    startBattle() {
        this.attacker = this.player1;
        this.defender = this.player2;
        this.attacker.isTurn = true;
        this.defender.isTurn = false;

        AllClasses.classes[this.attacker.classID].initModifiers(this.attacker, this, this.turnCounter);
        AllClasses.classes[this.defender.classID].initModifiers(this.defender, this, this.turnCounter + 1);

        this.gameController.on('advanceTurn', () => {
            this.attacker.socket.removeAllListeners('action');
            this.attacker.socket.emit('turnEnded', "");

            this.gameController.emit('advanceTurnEndedModifiers', "");

            this.attacker = (this.attacker === this.player1) ? this.player2 : this.player1;
            this.defender = (this.defender === this.player1) ? this.player2 : this.player1;
            this.attacker.isTurn = true;
            this.defender.isTurn = false;
            
            this.turnCounter++;
            if (this.turnCounter % 2 == 0) {
                this.turn++;
                if (this.turnCounter < 16) this.moves++;
            }

            this.gameController.emit('advanceTurnStartModifiers', "");

            if (this.checkMatchEnded());
            else {
                this.takeTurn();
            }
        });

        this.gameController.on('endBattle', (winner, loser) => {
            this.battleEnded = true;
            winner.socket.emit('battleWon', "You win!");
            loser.socket.emit('battleLost', "You lose :(");
            this.attacker.socket.removeAllListeners('turnEnded');
            this.gameController.emit('battleEnded', "");
        });
        this.gameController.on('actionTaken', () => {
            if (this.attacker.stats["moves"].value > 0) {
                this.takeAction();
            }
            else {
                this.attacker.emitAvailableActions(this.defender);
            }
        });

        this.gameController.on('disconnect', (socket) => {
        });
        this.gameController.on('reconnect', player => {
            if (player.isTurn) {
                this.attacker = player;
                console.log("battle says: player reconnected as attacker");
                this.attacker.socket.emit('turnStarted', "");
                this.attacker.socket.once('turnEnded', () => {
                    this.gameController.emit('advanceTurn');
                });
                this.emitAllStats();
                this.takeAction();
            }
            else {
                this.defender = player;
                console.log("battle says: player reconnected as defender");
                this.emitAllStats();
            }
        });
        this.defender.emitAvailableActions(this.attacker);
        this.takeTurn();
    }

    //setup turn and take first action to start the action-move loop
    takeTurn() {
        this.attacker.stats["moves"].value = this.moves;
        this.attacker.addDefaultTurnActions();

        if (this.attacker.socket != null) {
            this.attacker.socket.emit('turnStarted', "");
            this.attacker.socket.once('turnEnded', () => {
                this.gameController.emit('advanceTurn');
            });
            this.emitAllStats();
            this.takeAction();
        }
    }

    //emit the available actions to the attacker client and listen for their action and invoke it
    takeAction() {
        this.attacker.emitAvailableActions(this.defender);
        if (this.attacker.socket.listenerCount('action') != 0) {
            this.attacker.socket.removeAllListeners('action');
        }
        this.attacker.socket.once('action', (e) => {

            this.gameController.emit("advancePreActionModifiers", "");

            this.attacker.stats["moves"].value -= this.attacker.actions[e].moveCost;
            var actionRes = this.attacker.actions[e].invoke(this.attacker, this.defender, this);
            this.attacker.socket.emit("actionTaken", actionRes.attackerRes);
            if (this.defender.socket != null) this.defender.socket.emit("actionTaken", actionRes.defenderRes);

            this.gameController.emit("advancePostActionModifiers", "");

            if (this.defender.stats["hp"].value <= 0) {
                this.defender.stats["hp"].value = 0;
                this.emitAllStats();
                this.gameController.emit('endBattle', this.attacker, this.defender);
            }
            if (this.checkMatchEnded());
            else {
                this.emitAllStats();
                this.gameController.emit('actionTaken');
            }
        });
    }

    //sends all stats to both players
    emitAllStats() {
        if (this.attacker.socket != null) {
            this.attacker.emitStats();
            this.defender.emitOpponentStats(this.attacker);
        }
        if (this.defender.socket != null) {
            this.attacker.emitOpponentStats(this.defender);
            this.defender.emitStats();
        }
    }
    checkMatchEnded() {
        let ended = false;
        if (this.defender.stats["hp"].value <= 0) {
            this.defender.stats["hp"].value = 0;
            this.gameController.emit('endBattle', this.attacker, this.defender);
            ended = true;
        }
        else if (this.attacker.stats["hp"].value <= 0) {
            this.attacker.stats["hp"].value = 0;
            this.gameController.emit('endBattle', this.defender, this.attacker);
            ended = true
        }
        this.emitAllStats();
        this.battleEnded = ended;
        return ended;
    }

    test() {
        setInterval(() => {
            console.log("Player 1 socket: " + this.player1.socket);
        }, 5000);
    }
}

module.exports = Battle;






