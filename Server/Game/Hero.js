const AllClasses = require('./Classes/All');
const Stat = require('./Stat');

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
        this.classID = classID;
    }
    showStats(){
        console.log();
        for(var statID in this.stats){
            console.log(this.stats[statID].name + ": " + this.stats[statID].value);
        }
        console.log();
    }
    emitAvailableActions(){
        var clientActions = new Array();
        for (var actionID in this.actions) {
            var clientAction = {
                name: this.actions[actionID].name,
                moveCost: this.actions[actionID].moveCost,
                isRepeatable: this.actions[actionID].isRepeatable,
            }
            clientActions.push(clientAction);
        }
        this.stats["socket"].value.emit("actions", clientActions);
        console.log(clientActions);
    }
};
module.exports = Hero;