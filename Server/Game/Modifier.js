class Modifier {
    name;
    type;
    values = [];
    description;
    duration;
    startTurn;
    constructor(name, type, values, startTurn, duration, description) {
        this.name = name;
        this.type = type;
        this.values = values;
        this.description = description;
        this.startTurn = startTurn;
        this.duration = duration;
    }
}

module.exports = Modifier;