class Action {
    constructor(name, moveCost, invoke, conditionMet) {
        this.name = name;
        this.moveCost = moveCost;
        this.invoke = invoke;
        this.conditionMet = conditionMet;
    }
    static applyChance = (chance) => {
        return ((Math.floor(Math.random() * 100) + 1) <= (chance * 100));
    }
}
module.exports = Action;