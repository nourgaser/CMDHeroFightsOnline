const Stat = require('../Stat');
const Action = require('../Action');

var initStats = (statsArr) => {
    statsArr["class"] = new Stat("class", "Warrior");
    statsArr["hp"] = new Stat("hp", 310);
    statsArr["armor"] = new Stat("armor", 20);
    statsArr["magicResist"] = new Stat("magicResist", 15);
    statsArr["physicalDamage"] = new Stat("physicalDamage", 35);
    statsArr["magicDamage"] = new Stat("magicDamage", 0);
    statsArr["dodgeChance"] = new Stat("dodgeChance", 0.2);
    statsArr["critChance"] = new Stat("critChance", 0.1);
}

var initModifiers = (hero, battle, turnToStart) => {

}

const initActions = actionsArr => {
    actionsArr["swingSword"] = new Action("swingSword", 3, (attacker, defender, battle) => {
        var dodge = (Action.applyChance(defender.stats["dodgeChance"].value)) ? 0 : 1;
        var crit = (Action.applyChance(attacker.stats["critChance"].value)) ? attacker.stats["critDamage"].value : 1;
    
        var damageDealt = Math.floor(dodge * ((((Math.floor(Math.random() * (constants["swingSwordMax"] - constants["swingSwordMin"] + 1)) + constants["swingSwordMin"])
            + attacker.stats["physicalDamage"].value * constants["swingSwordADScaling"]) * crit) - defender.stats["armor"].value));
    
        defender.stats["hp"].value -= damageDealt;
        return {
            attackerRes: "Sword swung for " + damageDealt + " damage!",
            defenderRes: "You just got hit for " + damageDealt + " damage!"
        }
    }, (attacker, defender) => {
        return true;
    });
    actionsArr["usePotion"] = new Action("usePotion", 3, (attacker, defender, battle) => {
        attacker.stats["hp"].value += 50;
        return {
            attackerRes: "Healed for " + 50,
            defenderRes: "Enemy healed for " + 50
        }
    }, (attacker, defender) => {
        return true;
    });
    actionsArr["ironSkin"] = new Action("ironSkin", 4, (attacker, defender, battle) => {
        attacker.stats["armor"].value += 20;
        return {
            attackerRes: "Armor increased by 20",
            defenderRes: ""
        }
    }, (attacker, defender) => {
        return true;
    });
}

const constants = [];
//ABILITY CONSTANTS
constants["swingSwordMin"] = 5;
constants["swingSwordMax"] = 40;
constants["swingSwordADScaling"] = 1;

constants["ironSkinValue"] = 20;

constants["usePotionValue"] = 20;

module.exports = {
    initStats: initStats,
    initActions: initActions,
    initModifiers: initModifiers,
    constants: constants
};






