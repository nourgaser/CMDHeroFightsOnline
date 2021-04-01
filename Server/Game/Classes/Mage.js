const Stat = require('../Stat');
const Action = require('../Action');
const Modifier = require("../Modifier");

var initStats = statsArr => {
    statsArr["class"] = new Stat("class", "Mage");
    statsArr["hp"] = new Stat("hp", 200);
    statsArr["armor"] = new Stat("armor", 10);
    statsArr["magicResist"] = new Stat("magicResist", 20);
    statsArr["physicalDamage"] = new Stat("physicalDamage", 0);
    statsArr["magicDamage"] = new Stat("magicDamage", 65);
    statsArr["dodgeChance"] = new Stat("dodgeChance", 0.25);
    statsArr["critChance"] = new Stat("critChance", 0.20);
}

var initActions = actionsArr => {
    actionsArr["shootEnergy"] = new Action("shootEnergy", 3, (attacker, defender, battle) => {
        var dodge = (Action.applyChance(defender.stats["dodgeChance"].value)) ? 0 : 1;
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
    actionsArr["shootFireball"] = new Action("shootFireball", 5, (attacker, defender, battle) => {
        let values = [];
        values["damage"] = 30;
        defender.stats["hp"].modifiers["burn"] = new Modifier("Set-Aflame", "trueDamageDOT", values, battle.turnCounter, 3, "Burning for 30 damage/turn.");
    
        var burn = () => {
            let startTurn = defender.stats["hp"].modifiers["burn"].startTurn;
            let duration = defender.stats["hp"].modifiers["burn"].duration;

            if (battle.turnCounter % 2 !== startTurn % 2) {
                defender.stats["hp"].value -= 30;

                //emit to client DOT message.
                battle.emitAllStats();
            }

            if (battle.turnCounter == startTurn + duration) {
                battle.gameController.removeListener('advanceModifiers', burn);
                //emit to clients that dot ended.
            }
        };

        battle.gameController.on('advanceModifiers', burn);
    
    
        defender.stats["hp"].value -= constants["shootFireballValue"];
        return {
            attackerRes: "Used shootFireball: " + constants["shootFireballValue"] + " and applied true damage burn for 2 turns",
            defenderRes: "You just got hit for " + constants["shootFireballValue"] + " damage! You're burning for 2 turns."
        }
    }, (attacker) => {
        return true;
    });
    actionsArr["powerUp"] = new Action("powerUp", 6, (attacker, defender, battle) => {
        attacker.stats["magicResist"].value += 10;
        attacker.stats["magicDamage"].value += 20;
        return {
            attackerRes: "Increased stats!!!",
            defenderRes: ""
        }
    }, (attacker) => {
        return true;
    });
}

const constants = [];
//ABILITY CONSTANTS
constants["shootEnergyMin"] = 5;
constants["shootEnergyMax"] = 35;
constants["shootEnergyAPScaling"] = 1;


constants["shootFireballValue"] = 60;

module.exports = {
    initStats: initStats,
    initActions: initActions,
    constants: constants
};
