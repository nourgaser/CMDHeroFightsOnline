const AllClasses = require('./Classes/All');
const Stat = require('./Stat');
const Action = require('./Action');
const Modifier = require('./Modifier');

class Hero {
    stats = [];
    actions = [];
    classID;
    isTurn;
    socket;
    constructor(classID, socket) {
        AllClasses.classes[classID].initStats(this.stats);
        AllClasses.classes[classID].initActions(this.actions);
        this.initGeneralStatsAndActions();

        this.socket = socket;
        this.classID = classID;
    }

    //send this hero's stats to theirself
    emitStats() {
        var clientStats = new Array();
        for (var statID in this.stats) {
            if (this.stats[statID].name === "socket") continue;
            var clientStat = {
                name: this.stats[statID].name,
                value: this.stats[statID].value
            }
            clientStats.push(clientStat);
        }
        this.socket.emit("yourStats", clientStats);
    }

    //send this hero's stats to their opponent
    emitOpponentStats(opponentHero) {
        if (opponentHero.socket != null) {
            var clientStats = new Array();
            for (var statID in this.stats) {
                if (this.stats[statID].name === "hp" || this.stats[statID].name === "luck" || this.stats[statID].name === "class" /*|| other stats to be sent here*/) {
                    let clientStat = {
                        name: this.stats[statID].name,
                        value: this.stats[statID].value
                    }
                    clientStats.push(clientStat);
                }
                else
                    continue;
            }
            opponentHero.socket.emit("opponentStats", clientStats);
        }
    }

    emitAvailableActions(opponentHero) {
        //TODO: test this
        // var clientActions = JSON.stringify(this.actions, ['name', 'moveCost', 'isRepeatable']);
        // this.socket.emit("actions", clientActions);

        var clientActions = new Array();
        for (var actionID in this.actions) {
            if (this.stats["moves"].value >= this.actions[actionID].moveCost && this.actions[actionID].conditionMet(this, opponentHero)) {
                var clientAction = {
                    name: this.actions[actionID].name,
                    moveCost: this.actions[actionID].moveCost,
                    isRepeatable: this.actions[actionID].isRepeatable,
                }
                clientActions.push(clientAction);
            }
            else continue;
        }
        this.socket.emit("actions", clientActions);
    }

    //add class independant actions and stats (defaults)
    initGeneralStatsAndActions() {
        this.stats["moves"] = new Stat("moves", 3);
        this.stats["critDamage"] = new Stat("critDamage", 1.5);
        this.stats["luck"] = new Stat("luck", 0);
        this.stats["_zero"] = new Stat("_zero", 0);
    }

    addDefaultTurnActions() {
        this.actions["luckUp"] = new Action("luckUp", 2, (attacker, defender, battle) => {

            attacker.stats["luck"].value += 0.05;

            let res = {
                attackerRes: "Increased luck by 10%!",
                defenderRes: "Opponent increased luck by 10%!"
            }
            delete this.actions["luckUp"];
            return res;

        }, (attacker, defender) => {
            return true;
        });

        this.actions["luckDown"] = new Action("luckDown", 2, (attacker, defender, battle) => {

            defender.stats["luck"].value -= 0.05;

            let res = {
                attackerRes: "Decreased your opponent's luck by 5%!",
                defenderRes: "Your luck got decreased by 5%!"
            }

            delete this.actions["luckDown"];
            return res;
        }, (attacker, defender) => {
            return true;
        });

        this.actions["hunkerDown"] = new Action("hunkerDown", 3, (attacker, defender, battle) => {
            attacker.stats["dodgeChance"].modifiers["dodge"] = new Modifier("Hunkered-Down", "dodgeChance", [{ key: "chance", value: 0.25 }], battle.turnCounter, 2, "Dodge Chance increased until next turn");
            attacker.stats["dodgeChance"].value += 0.25;
            var dodge = () => {
                let startTurn = attacker.stats["dodgeChance"].modifiers["dodge"].startTurn;
                let duration = attacker.stats["dodgeChance"].modifiers["dodge"].duration;
                if (battle.turnCounter == startTurn + duration) {
                    attacker.stats["dodgeChance"].value -= 0.25;
                    battle.gameController.removeListener('advanceTurnStartModifiers', dodge);
                    delete attacker.stats["dodgeChance"].modifiers["dodge"];
                }

            }
            battle.gameController.on('advanceTurnStartModifiers', dodge);

            delete this.actions["hunkerDown"];
            return {
                attackerRes: "Hunkered down!",
                defenderRes: ""
            }
        }, (attacker, defender) => {
            return true;
        });
    }
};
module.exports = Hero;