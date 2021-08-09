const TANK_REFLECT_AP_SCALING = 1;

class Action {
    constructor(name, moveCost, invoke, conditionMet) {
        this.name = name;
        this.moveCost = moveCost;
        this.invoke = invoke;
        this.conditionMet = conditionMet;
    }
}
module.exports = Action;