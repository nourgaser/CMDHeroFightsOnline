class Action {
    constructor(name, moveCost, isRepeatable, invoke) {
        this.name = name;
        this.moveCost = moveCost;
        this.isRepeatable = isRepeatable;
        this.invoke = invoke;
    }
}

module.exports = Action;