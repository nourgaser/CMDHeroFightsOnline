const Hero = require("./Hero");
const EventEmitter = require('events');

class Battle {
    attacker;
    defender;
    gameController = new EventEmitter();
    turn = 1;
    moves = 3;
    turnCounter = 0;
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;

        this.startBattle();
    }

    /*battle setup: initialization and adding gameController listeners, 
    then signaling for first turn to start the turn loop*/
    startBattle() {
        this.attacker = this.player1;
        this.defender = this.player2;

        // sockets.array.forEach(socket => {
        //     //all battle-long listeners for both sockets 
        // });

        this.gameController.on('advanceTurn', () => {
            this.attacker.stats["socket"].value.removeAllListeners('action');
            this.attacker.stats["socket"].value.emit('turnEnded', "");

            this.attacker = (this.attacker === this.player1) ? this.player2 : this.player1;
            this.defender = (this.defender === this.player1) ? this.player2 : this.player1;
            this.turnCounter++;
            if (this.turnCounter % 2 == 0) {
                this.turn++;
                if (this.turnCounter < 16) this.moves++;
            }
            console.log(`turn : ${this.turn}`);
            this.takeTurn();
        });

        this.gameController.on('endBattle', (winner, loser) => {
            console.log("ending match");
            winner.stats["socket"].value.emit('battleWon', "You win!");
            loser.stats["socket"].value.emit('battleLost', "You lose :(");
            this.attacker.stats["socket"].value.removeAllListeners('turnEnded');
            this.gameController.emit('battleEnded', "");
        });
        this.gameController.on('actionTaken', () => {
            if (this.attacker.stats["moves"].value > 0) {
                this.takeAction();
            }
            else {
                this.attacker.emitAvailableActions();
            }
        });

        this.defender.emitAvailableActions();
        this.takeTurn();
    }

    //setup turn and take first action to start the action-move loop
    takeTurn() {
        this.attacker.stats["moves"].value = this.moves;
        this.attacker.stats["socket"].value.emit('turnStarted', "");
        this.attacker.stats["socket"].value.once('turnEnded', () => {
            this.gameController.emit('advanceTurn');
        });
        this.emitAllStats();
        this.takeAction();
    }

    //emit the available actions to the attacker client and listen for their action and invoke it
    takeAction() {
        this.attacker.emitAvailableActions();
        this.attacker.stats["socket"].value.once('action', (e) => {
            var actionRes = this.attacker.actions[e].invoke(this.attacker, this.defender);
            this.attacker.stats["moves"].value -= this.attacker.actions[e].moveCost;
            this.attacker.stats["socket"].value.emit("actionTaken", actionRes.attackerRes);
            this.defender.stats["socket"].value.emit("actionTaken", actionRes.defenderRes);

            if (this.defender.stats["hp"].value <= 0) {
                this.defender.stats["hp"].value = 0;
                this.emitAllStats();
                this.gameController.emit('endBattle', this.attacker, this.defender);
            }
            else {
                this.emitAllStats();
                this.gameController.emit('actionTaken');
            }
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

module.exports = Battle;






