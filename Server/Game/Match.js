const Hero = require("./Hero");
const EventEmitter = require('events');

class Match {
    attacker;
    defender;
    gameController = new EventEmitter();
    turn;
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
            this.attacker = (this.attacker === this.player1) ? this.player2 : this.player1;
            this.defender = (this.defender === this.player1) ? this.player2 : this.player1;
            this.turn++;
            //this.moves++;
            this.takeTurn();
        });

        
        this.gameController.on('actionTaken', () => {
            if (this.attacker.stats["moves"].value > 0) {
                this.takeAction();
            }
            else {
                this.gameController.emit('advanceTurn');
                console.log("Advancing turn...");
            }
        });
        
        this.takeTurn();
    }
    
    takeTurn() {
        this.attacker.stats["moves"].value = this.moves;
        this.takeAction();
    }

    takeAction() {
        this.attacker.emitAvailableActions();
        console.log("Actions sent to attacker");
        this.attacker.stats["socket"].value.once('action', (e) => {
            //do action
            this.attacker.stats["moves"].value -= 1;
            console.log(e);
            this.gameController.emit('actionTaken');
        });
    }


}

module.exports = Match;






