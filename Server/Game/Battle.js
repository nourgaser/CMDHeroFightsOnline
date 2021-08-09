const { debug } = require('console');
const EventEmitter = require('events');
const AllClasses = require('./Classes/All');
const Hero = require('./Hero');

const TURN_TIME = 60;

class Battle {
    attacker;
    defender;
    gameController = new EventEmitter();
    turn = 1;
    moves = 3;
    turnCounter = 0;

    turnTimerSeconds = TURN_TIME;
    turnTimerLastChecked = 0;
    battleEnded = false;

    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.startBattle();
    }

    /*battle setup: initialization and adding gameController listeners, 
    then signaling for first turn to start the turn loop*/
    startBattle() {
        this.player1.socket.on("statsRequested", () => {
            this.player1.emitStats();
            this.player2.emitOpponentStats(this.player1);
        });
        this.player2.socket.on("statsRequested", () => {
            this.player2.emitStats();
            this.player1.emitOpponentStats(this.player2);

        });
        this.player1.socket.on("availableActionsRequested", () => {
            this.player1.emitAvailableActions(this.player2);

        });
        this.player2.socket.on("availableActionsRequested", () => {
            this.player2.emitAvailableActions(this.player1);

        });

        this.attacker = this.player1;
        this.defender = this.player2;
        this.attacker.isTurn = true;
        this.defender.isTurn = false;

        AllClasses.classes[this.attacker.classID].initModifiers(this.attacker, this, this.turnCounter);
        AllClasses.classes[this.defender.classID].initModifiers(this.defender, this, this.turnCounter + 1);

        this.gameController.on('advanceTurn', () => {
            console.log("GameController: Advancing turn...");
            this.attacker.socket.removeAllListeners('action');
            this.attacker.socket.emit('turnEnded', "");


            this.gameController.emit('advanceTurnEndedModifiers', "");

            this.attacker = (this.attacker === this.player1) ? this.player2 : this.player1;
            this.defender = (this.defender === this.player1) ? this.player2 : this.player1;
            this.attacker.isTurn = true;
            this.defender.isTurn = false;

            this.turnTimerSeconds = TURN_TIME;
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

            clearInterval(this.turnTimer);
            this.attacker.socket.removeAllListeners('turnEnded');

            this.gameController.emit('battleEnded', "");
        });
        this.gameController.on('actionTaken', () => {
            if (this.attacker.stats["moves"].value > 0) {
                this.takeAction();
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
                this.takeAction();
            }
            else {
                this.defender = player;
                console.log("battle says: player reconnected as defender");
            }
        });
        this.takeTurn();
    }

    //setup turn and take first action to start the action-move loop
    takeTurn() {
        this.attacker.stats["moves"].value = this.moves;
        this.attacker.addDefaultTurnActions();
        this.gameController.emit('defaultActionsAdded', "");
        this.defender.socket.emit('turnStarted', "");

        this.attacker.socket.emit('turnStarted', "1");
        this.attacker.socket.once('turnEnded', () => {
            clearInterval(this.turnTimer);
            this.gameController.emit('advanceTurn');
        });
        this.takeAction();

        this.startTurnTimer();

    }

    //emit the available actions to the attacker client and listen for their action and invoke it
    takeAction() {
        if (this.attacker.socket.listenerCount('action') != 0) {
            this.attacker.socket.removeAllListeners('action');
        }
        this.attacker.socket.once('action', (e) => {

            this.gameController.emit("advancePreActionModifiers", "");

            this.attacker.stats["moves"].value -= this.attacker.actions[e].moveCost;
            var actionRes = this.attacker.actions[e].invoke(this.attacker, this.defender, this);
            if (this.attacker.socket != null) this.attacker.socket.emit("actionTaken", actionRes.attackerRes);
            if (this.defender.socket != null) this.defender.socket.emit("actionTaken", actionRes.defenderRes);

            this.gameController.emit("advancePostActionModifiers", "");

            if (this.defender.stats["hp"].value <= 0) {
                this.defender.stats["hp"].value = 0;
                this.gameController.emit('endBattle', this.attacker, this.defender);
            }
            if (this.checkMatchEnded());
            else {
                this.gameController.emit('actionTaken');
            }
        });
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
        this.battleEnded = ended;
        return ended;
    }

    turnTimer;

    startTurnTimer = () => {

        this.turnTimer = setInterval(() => {
            if (this.turnTimerSeconds > 0 && this.turnTimerSeconds < 1) {
                if (this.attacker.socket != null) {
                    this.attacker.socket.removeAllListeners('turnEnded');
                    //emit that they missed their turn
                }
                console.log("Player missed their turn...");
            }
            else if (this.turnTimerSeconds <= 0) {
                clearInterval(this.turnTimer);
                this.gameController.emit('advanceTurn', "");
            }
            if (this.turnTimerSeconds != TURN_TIME) {
                this.turnTimerSeconds -= (Math.round(((Date.now() - this.turnTimerLastChecked) / 1000) * 1000) / 1000).toFixed(3);
            }
            else {
                this.turnTimerSeconds--;
            }
            this.turnTimerLastChecked = Date.now();

        }, 1000);
    }

}

module.exports = Battle;






