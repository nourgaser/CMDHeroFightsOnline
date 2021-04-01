const Stat = require('../Stat');
const Action = require('../Action');

const stats = [];
//Default stat values
stats["class"] = new Stat("class", "Mage");
stats["hp"] = new Stat("hp", 200);
stats["armor"] = new Stat("armor", 10);
stats["magicResist"] = new Stat("magicResist", 20);
stats["physicalDamage"] = new Stat("physicalDamage", 0);
stats["magicDamage"] = new Stat("magicDamage", 65);
stats["dodgeChance"] = new Stat("dodgeChance", 0.25);
stats["critChance"] = new Stat("critChance", 0.20);

const actions = [];
//All Actions
actions["shootEnergy"] = new Action("shootEnergy", 3, (attacker, defender) => {
    var dodge = (Action.applyChance(attacker.stats["dodgeChance"].value)) ? 0 : 1;
    var crit = (Action.applyChance(attacker.stats["critChance"].value)) ? attacker.stats["critDamage"].value : 1;

    var damageDealt = Math.floor(dodge * ((((Math.floor(Math.random() * (constants["shootEnergyMax"] - constants["shootEnergyMin"] + 1)) + constants["shootEnergyMin"])
        + attacker.stats["magicDamage"].value * constants["shootEnergyAPScaling"]) * crit) - defender.stats["magicResist"].value));

    defender.stats["hp"].value -= damageDealt;
    return {
        attackerRes: "mage used shootEnergy: " + damageDealt,
        defenderRes: "You just got hit for " + damageDealt + " damage!"
    }
}, (attacker) => {
    return true;
});
actions["shootFireball"] = new Action("shootFireball", 5, (attacker, defender) => {
    defender.stats["hp"].value -= constants["shootFireballValue"];
    return {
        attackerRes: "Used shootFireball: " + constants["shootFireballValue"],
        defenderRes: "You just got hit for " + constants["shootFireballValue"] + " damage!"
    }
}, (attacker) => {
    return true;
});
actions["powerUp"] = new Action("powerUp", 6, (attacker, defender) => {
    attacker.stats["magicResist"].value += 10;
    attacker.stats["magicDamage"].value += 20;
    return {
        attackerRes: "Increased stats!!!",
        defenderRes: ""
    }
}, (attacker) => {
    return true;
});

const constants = [];
//ABILITY CONSTANTS
constants["shootEnergyMin"] = 5;
constants["shootEnergyMax"] = 35;
constants["shootEnergyAPScaling"] = 1;


constants["shootFireballValue"] = 100;

module.exports = {
    stats: stats,
    actions: actions,
    constants: constants
};
