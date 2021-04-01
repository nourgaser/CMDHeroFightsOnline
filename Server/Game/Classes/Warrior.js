const Stat = require('../Stat');
const Action = require('../Action');

const stats = [];
//Default stat values
stats["class"] = new Stat("class", "Warrior");
stats["hp"] = new Stat("hp", 310);
stats["armor"] = new Stat("armor", 30);
stats["magicResist"] = new Stat("magicResist", 35);
stats["physicalDamage"] = new Stat("physicalDamage", 35);
stats["magicDamage"] = new Stat("magicDamage", 0);
stats["dodgeChance"] = new Stat("dodgeChance", 0.25);
stats["critChance"] = new Stat("critChance", 0.10);

const actions = [];
//All Actions
actions["swingSword"] = new Action("swingSword", 3, (attacker, defender) => {
    var dodge = (Action.applyChance(attacker.stats["dodgeChance"].value)) ? 0 : 1;
    var crit = (Action.applyChance(attacker.stats["critChance"].value)) ? attacker.stats["critDamage"].value : 1;

    var damageDealt = Math.floor(dodge * ((((Math.floor(Math.random() * (constants["swingSwordMax"] - constants["swingSwordMin"] + 1)) + constants["swingSwordMin"])
        + attacker.stats["physicalDamage"].value * constants["swingSwordADScaling"]) * crit) - defender.stats["armor"].value));

    defender.stats["hp"].value -= damageDealt;
    return {
        attackerRes: "Sword swung for " + damageDealt + " damage!",
        defenderRes: "You just got hit for " + damageDealt + " damage!"
    }
}, (attacker) => {
    return true;
});
actions["usePotion"] = new Action("usePotion", 3, (attacker, defender) => {
    attacker.stats["hp"].value += 50;
    return {
        attackerRes: "Healed for " + 50,
        defenderRes: "Enemy healed for " + 50
    }
}, (attacker) => {
    return true;
});
actions["ironSkin"] = new Action("ironSkin", 4, (attacker, defender) => {
    attacker.stats["armor"].value += 20;
    return {
        attackerRes: "Armor increased by 20",
        defenderRes: ""
    }
}, (attacker) => {
    return true;
});

const constants = [];
//ABILITY CONSTANTS
constants["swingSwordMin"] = 5;
constants["swingSwordMax"] = 40;
constants["swingSwordADScaling"] = 1;

constants["ironSkinValue"] = 20;

constants["usePotionValue"] = 20;

module.exports = {
    stats: stats,
    actions: actions,
    constants: constants
};






