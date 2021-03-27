class Action {
    constructor(name, moveCost, isRepeatable, invoke, conditionMet) {
        this.name = name;
        this.moveCost = moveCost;
        this.isRepeatable = isRepeatable;
        this.invoke = invoke;
        this.conditionMet = conditionMet;
    }
}

module.exports = Action;