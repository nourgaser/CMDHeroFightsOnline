const Stat = require('../Stat');
const Action = require('../Action');

const stats = [];
//Default stat values
stats["class"] = new Stat("class", "Warrior");
stats["hp"] = new Stat("hp", 600);
stats["armor"] = new Stat("armor", 30);
stats["magicResist"] = new Stat("magicResist", 35);
stats["physicalDamage"] = new Stat("physicalDamage", 50);
stats["magicDamage"] = new Stat("magicDamage", 0);
stats["dodgeChance"] = new Stat("dodgeChance", 0.25);
stats["critChance"] = new Stat("critChance", 0.10);

const actions = [];
//All Actions
actions["swingSword"] = new Action("swingSword", 3, false, (attacker, defender) => {
    defender.stats["hp"].value -= attacker.stats["physicalDamage"].value;
    console.log("attacked!");
}, (attacker) => {
    return true;
});
actions["usePotion"] = new Action("usePotion", 3, false, (attacker, defender) => {
    attacker.stats["hp"].value += 50;
    console.log("healed!");
}, (attacker) => {
    return true;
});
actions["ironSkin"] = new Action("ironSkin", 4, false, (attacker, defender) => {
    attacker.stats["armor"].value += 20;
    console.log("armor increased!");
}, (attacker) => {
    return true;
});


module.exports = {
    stats: stats,
    actions: actions
};