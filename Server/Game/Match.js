const Hero = require("./Hero");
const EventEmitter = require('events');

class Match {
    attacker;
    defender;
    gameController = new EventEmitter();
    turn = 1;
    moves = 3;
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;

        this.startMatch();
    }

    startMatch() {
        this.attacker = this.player1;
        this.defender = this.player2;

        // sockets.array.forEach(socket => {
        //     //all match-long listeners for both sockets 
        // });

        this.gameController.on('advanceTurn', () => {
            this.attacker.stats["socket"].value.removeAllListeners('action');
            this.attacker.stats["socket"].value.emit("turnEnded", "");

            this.attacker = (this.attacker === this.player1) ? this.player2 : this.player1;
            this.defender = (this.defender === this.player1) ? this.player2 : this.player1;
            this.turn++;
            this.moves++;
            console.log(`turn : ${this.turn}`);
            this.takeTurn();
        });


        this.gameController.on('actionTaken', () => {
            if (this.attacker.stats["moves"].value > 0) {
                this.takeAction();
            }
            else {
                this.attacker.emitAvailableActions();
            }
        });

        this.takeTurn();
    }

    takeTurn() {
        this.attacker.stats["moves"].value = this.moves;
        this.attacker.stats["socket"].value.emit('turnStarted', "");
        this.attacker.stats["socket"].value.once('turnEnded', () => {
            this.gameController.emit('advanceTurn');
        });
        this.emitAllStats();
        this.takeAction();
    }

    takeAction() {
        this.attacker.emitAvailableActions();
        this.attacker.stats["socket"].value.once('action', (e) => {
            this.attacker.actions[e].invoke(this.attacker, this.defender);
            this.attacker.stats["moves"].value -= this.attacker.actions[e].moveCost;
            this.emitAllStats();
            this.gameController.emit('actionTaken');
        });
    }

    //sends all stats to both players
    emitAllStats() {
        this.attacker.emitStats();
        this.defender.emitOpponentStats(this.attacker);
        this.defender.emitStats();
        this.attacker.emitOpponentStats(this.defender);
    }
}

module.exports = Match;






