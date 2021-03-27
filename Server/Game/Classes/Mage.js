const Stat = require('../Stat');
const Action = require('../Action');

const stats = [];
//Default stat values
stats["class"] = new Stat("class", "Mage");
stats["hp"] = new Stat("hp", 400);
stats["armor"] = new Stat("armor", 10);
stats["magicResist"] = new Stat("magicResist", 20);
stats["physicalDamage"] = new Stat("physicalDamage", 0);
stats["magicDamage"] = new Stat("magicDamage", 50);
stats["dodgeChance"] = new Stat("dodgeChance", 0.25);
stats["critChance"] = new Stat("critChance", 0.20);

const actions = [];
//All Actions
actions["shootEnergy"] = new Action("shootEnergy", 3, false, (attacker, defender) => {
    defender.stats["hp"].value -= attacker.stats["magicDamage"].value;
    console.log("mage used shootEnergy!");
}, (attacker) => {
    return true;
});
actions["shootFireball"] = new Action("shootFireball", 5, false, (attacker, defender) => {
    defender.stats["hp"].value -= 100;
    console.log("mage used shootFireball!");
}, (attacker) => {
    return true;
});
actions["powerUp"] = new Action("powerUp", 6, false, (attacker, defender) => {
    attacker.stats["magicResist"].value += 10;
    attacker.stats["magicDamage"].value += 20;
}, (attacker) => {
    return true;
});


module.exports = {
    stats: stats,
    actions: actions
};