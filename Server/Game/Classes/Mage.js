const Stat = require('../Stat');
const Action = require('../Action');
const Modifier = require("../Modifier");
const { applyChance, applyStandardDamage } = require('../../modules/calculation-tools');
const initStatsModule = require('../../modules/init-stats');

var initStats = statsArr => {
    initStatsModule(statsArr, defaultStats, uniqueStats);
}

//battle-start modifiers here
var initModifiers = (hero, battle, turnParity) => {
    let values = [];
    values["value"] = 50;
    hero.stats["mana"].modifiers["manaPerTurn"] = new Modifier("Mana/Turn", "permanent-mana-incrementation", values, turnParity, 99, "Mana gained per turn.");
    
    var gainMana = () => {
        if (battle.turnCounter % 2 === turnParity % 2) {
            hero.stats["mana"].value += 50;
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
        let damageResult = applyStandardDamage(attacker, defender, constants["shootEnergyMax"], constants["shootEnergyMin"], "magicResist", 0, constants["shootEnergyAPScaling"]);
        let damageDealt = damageResult.damageDealt;
        
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
       
       delete actionsArr["unleashEnergy"];
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
            var shieldDestroyed = () => {
                if (attacker.stats["hp"].value <= attacker.stats["hp"].modifiers["shield"].values["initialHP"]) {
                    delete attacker.stats["hp"].modifiers["shield"];
                    battle.gameController.removeListener("advanceTurnStartedModifiers", shieldDestroyed);
                    battle.gameController.removeListener("advancePostActionModifiers", shieldDestroyed);
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

//default stats
const defaultStats = [];
defaultStats["hp"] = 240;
defaultStats["armor"] = 3;
defaultStats["magicResist"] = 10;
defaultStats["physicalDamage"] = 0;
defaultStats["magicDamage"] = 65;
defaultStats["dodgeChance"] = 0.1;
defaultStats["critChance"] = 0.1;

//unique stats
const uniqueStats = [];
uniqueStats['mana'] = 50;


module.exports = {
    initStats: initStats,
    initActions: initActions,
    initModifiers: initModifiers,
    constants: constants
};
