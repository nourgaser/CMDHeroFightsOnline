const AllClasses = require('./Classes/All');
const Stat = require('./Stat');
const Action = require('./Action');

class Hero {
    stats = [];
    actions = [];
    classID;
    constructor(classID, socket) {
        for (var statID in AllClasses.classes[classID].stats) {
            this.stats[statID] = AllClasses.classes[classID].stats[statID];
        }
        for (var actionID in AllClasses.classes[classID].actions) {
            this.actions[actionID] = AllClasses.classes[classID].actions[actionID];
        }
        this.stats["moves"] = new Stat("moves", 3);
        this.stats["socket"] = new Stat("socket", socket);
        this.actions["hunkerDown"] = new Action("hunkerDown", 3, false, (attacker, defender) => {
            attacker.stats["dodgeChance"].value += 0.3;
        }, (attacker) => {
            return true;
        });
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
        this.stats["socket"].value.emit("yourStats", clientStats);
    }

    //send this hero's stats to their opponent
    emitOpponentStats(opponentHero) {
        var clientStats = new Array();
        for (var statID in this.stats) {
            if (this.stats[statID].name === "socket" /*|| other stats ignored here*/) continue;
            var clientStat = {
                name: this.stats[statID].name,
                value: this.stats[statID].value
            }
            clientStats.push(clientStat);
        }
        opponentHero.stats["socket"].value.emit("opponentStats", clientStats);
    }

    emitAvailableActions() {
        //TODO: test this
        // var clientActions = JSON.stringify(this.actions, ['name', 'moveCost', 'isRepeatable']);
        // this.stats["socket"].value.emit("actions", clientActions);

        var clientActions = new Array();
        for (var actionID in this.actions) {
            if (this.stats["moves"].value >= this.actions[actionID].moveCost && this.actions[actionID].conditionMet(this)) {
                var clientAction = {
                    name: this.actions[actionID].name,
                    moveCost: this.actions[actionID].moveCost,
                    isRepeatable: this.actions[actionID].isRepeatable,
                }
                clientActions.push(clientAction);
            }
            else continue;
        }
        this.stats["socket"].value.emit("actions", clientActions);
        console.log("Actions sent to attacker!");
    }
};
module.exports = Hero;