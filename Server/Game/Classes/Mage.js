const Stat = require('../Stat');
const Action = require('../Action');


const stats = [];
//Default stat values
stats["class"] = new Stat("class", "Mage");
stats["hp"] = new Stat("hp", 180);
stats["armor"] = new Stat("armor", 20);
stats["magicResist"] = new Stat("magicResist", 15);
stats["physicalDamage"] = new Stat("physicalDamage", 0);
stats["magicDamage"] = new Stat("magicDamage", 70);
stats["dodgeChance"] = new Stat("dodgeChance", 0.25);
stats["critChance"] = new Stat("critChance", 0.20);
stats["canFireball"] = new Stat("canFireball", true);
const actions = [];
//All Actions

module.exports = {
    stats: stats,
    actions: actions
};