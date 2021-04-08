const Stat = require('../Stat');
const Action = require('../Action');
const Modifier = require("../Modifier");

var initStats = statsArr => {
    statsArr["class"] = new Stat("class", "Mage");
    statsArr["hp"] = new Stat("hp", 240);
    statsArr["mana"] = new Stat("mana ", 50);
    statsArr["armor"] = new Stat("armor", 3);
    statsArr["magicResist"] = new Stat("magicResist", 10);
    statsArr["physicalDamage"] = new Stat("physicalDamage", 0);
    statsArr["magicDamage"] = new Stat("magicDamage", 65);
    statsArr["dodgeChance"] = new Stat("dodgeChance", 0.1);
    statsArr["critChance"] = new Stat("critChance", 0.1);
}

var initModifiers = (hero, battle, turnToStart) => {
    let values = [];
    values["value"] = 50;
    hero.stats["mana"].modifiers["manaPerTurn"] = new Modifier("Mana/Turn", "permanent-mana-incrementation", values, turnToStart, 99, "Mana gained per turn.");

    var gainMana = () => {
        if (battle.turnCounter % 2 === turnToStart % 2) {
            hero.stats["mana"].value += 50;
            battle.emitAllStats();
            //emit result
        }
    }
    battle.gameController.on("advanceTurnStartModifiers", gainMana);
    battle.gameController.once("endBattle", () => {
        battle.gameController.removeListener("advanceTurnStartModifiers", gainMana);
    });
}

var initActions = actionsArr => {

    actionsArr["shootEnergy"] = new Action("shootEnergy", 3, (attacker, defender, battle) => {

        attacker.stats["mana"].value -= constants["shootEnergyManaCost"];

        let attackerLuck = attacker.stats["luck"].value;
        let defenderLuck = defender.stats["luck"].value;
        
        var dodge = (Action.applyChance(defender.stats["dodgeChance"].value - attackerLuck + defenderLuck)) ? 0 : 1;
        var crit = (Action.applyChance(attacker.stats["critChance"].value + attackerLuck)) ? attacker.stats["critDamage"].value : 1;

        var damageDealt = Math.floor(dodge * ((((Math.floor(Math.random() * (constants["shootEnergyMax"] - constants["shootEnergyMin"] + 1)) + constants["shootEnergyMin"])
            + attacker.stats["magicDamage"].value * constants["shootEnergyAPScaling"]) * crit) - defender.stats["magicResist"].value) * (attackerLuck + 1));

        defender.stats["hp"].value -= damageDealt;
        return {
            attackerRes: "mage used shootEnergy: " + damageDealt,
            defenderRes: "You just got hit for " + damageDealt + " damage!"
        }
    }, (attacker, defender) => {
        if (attacker.stats["mana"].value >= constants["shootEnergyManaCost"]) return true;
        return false;
    });

    /*
    actionsArr["shootFireball"] = new Action("shootFireball", 5, (attacker, defender, battle) => {

        attacker.stats["mana"].value -= constants["shootFireballManaCost"];

        let values = [];
        values["damage"] = 30;
        defender.stats["hp"].modifiers["burn"] = new Modifier("Set-Aflame", "trueDOT", values, battle.turnCounter, 3, "Burning for 30 damage/turn.");

        var burn = () => {
            let startTurn = defender.stats["hp"].modifiers["burn"].startTurn;
            let duration = defender.stats["hp"].modifiers["burn"].duration;

            if (battle.turnCounter % 2 !== startTurn % 2) {
                defender.stats["hp"].value -= 30;

                //emit to client DOT message.
                battle.emitAllStats();
            }

            if (battle.turnCounter == startTurn + duration) {
                battle.gameController.removeListener('advanceTurnStartModifiers', burn);
                delete defender.stats["hp"].modifiers["burn"];
                //emit to clients that dot ended.
            }
        };

        battle.gameController.on('advanceTurnStartModifiers', burn);


        defender.stats["hp"].value -= constants["shootFireballDamage"];
        return {
            attackerRes: "Used shootFireball: " + constants["shootFireballDamage"] + " and applied true damage burn for 2 turns",
            defenderRes: "You just got hit for " + constants["shootFireballDamage"] + " damage! You're burning for 2 turns."
        }
    }, (attacker, defender) => {
        if (attacker.stats["mana"].value >= constants["shootFireballManaCost"]) return true;
        return false;
    });

    actionsArr["powerUp"] = new Action("powerUp", 6, (attacker, defender, battle) => {

        attacker.stats["mana"].value -= constants["powerUpManaCost"];

        attacker.stats["magicResist"].value += 10;
        attacker.stats["magicDamage"].value += 20;
        return {
            attackerRes: "Increased stats!!!",
            defenderRes: ""
        }
    }, (attacker, defender) => {
        if (attacker.stats["mana"].value >= constants["powerUpManaCost"]) return true;
        return false;
    });
    */

    actionsArr["unleashEnergy"] = new Action("unleashEnergy", 7, (attacker, defender, battle) => {

        attacker.stats["mana"].value -= constants["unleashEnergyManaCost"];
        let damageDealt = constants["unleashEnergyDamage"] - defender.stats["magicResist"].value;
        defender.stats["hp"].value -= damageDealt;
        defender.stats["magicResist"].value = 0;

        return {
            attackerRes: "Unleashed all their energy and dealt " + damageDealt + " damage!!! Also destroyed all magic resistance.",
            defenderRes: "Unleashed all their energy and dealt " + damageDealt + " damage!!! Also destroyed all magic resistance."
        }

    }, (attacker, defender) => {
        if (attacker.stats["mana"].value >= constants["unleashEnergyManaCost"]) return true;
        return false;
    });

    actionsArr["buildEnergy"] = new Action("buildEnergy", 3, (attacker, defender, battle) => {

        attacker.stats["mana"].value += constants["buildEnergyManaGain"];

        let res = {
            attackerRes: "You gathered " + constants["buildEnergyManaGain"] + " mana from surroundings.",
            defenderRes: "Your opponent gathered " + constants["buildEnergyManaGain"] + " mana from surroundings."
        }

        if (attacker.stats["hp"].modifiers["shield"] === undefined) {
            let values = [];
            values["shield"] = constants["buildEnergyShield"];
            values["initialHP"] = attacker.stats["hp"].value;
            attacker.stats["hp"].modifiers["shield"] = new Modifier("Shielded!", "shield", values, battle.turnCounter, 99, "Shielded after gathering mana.");
            attacker.stats["hp"].value += values["shield"];
            battle.emitAllStats();
            var shieldDestroyed = () => {
                if (attacker.stats["hp"].value <= attacker.stats["hp"].modifiers["shield"].values["initialHP"]) {
                    delete attacker.stats["hp"].modifiers["shield"];
                    battle.gameController.removeListener("advanceTurnStartedModifiers", shieldDestroyed);
                    battle.gameController.removeListener("advancePostActionModifiers", shieldDestroyed);
                    battle.emitAllStats();
                }
                else {
                    attacker.stats["hp"].modifiers["shield"].values["shield"] = attacker.stats["hp"].value - attacker.stats["hp"].modifiers["shield"].values["initialHP"];
                }
            }

            battle.gameController.on("advanceTurnStartedModifiers", shieldDestroyed);
            battle.gameController.on("advancePostActionModifiers", shieldDestroyed);
            res.attackerRes += " Also a " + constants["buildEnergyShield"] + " damage shield."
            res.defenderRes += " Also a " + constants["buildEnergyShield"] + " damage shield."
        }

        return res;

    }, (attacker, defender) => {
        return true;
    });


}


const constants = [];
//ABILITY CONSTANTS
constants["shootEnergyMin"] = 5;
constants["shootEnergyMax"] = 35;
constants["shootEnergyManaCost"] = 100;
constants["shootEnergyAPScaling"] = 1;

constants["shootFireballManaCost"] = 150;
constants["shootFireballDamage"] = 60;

constants["powerUpManaCost"] = 100;

constants["unleashEnergyManaCost"] = 500;
constants["unleashEnergyDamage"] = 180;


constants["buildEnergyManaGain"] = 50;
constants["buildEnergyShield"] = 35;

module.exports = {
    initStats: initStats,
    initActions: initActions,
    initModifiers: initModifiers,
    constants: constants
};
