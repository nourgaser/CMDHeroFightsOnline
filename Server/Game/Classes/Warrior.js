const Action = require('../Action');
const initStatsModule = require('../../modules/init-stats');

const initStats = statsArr => {
    initStatsModule(statsArr, defaultStats, uniqueStats);
}

const initModifiers = (hero, battle, turnToStart) => {
}

const initActions = actionsArr => {
    actionsArr["swingSword"] = new Action("swingSword", 3, (attacker, defender, battle) => {

        let damageResult = applyStandardDamage(attacker, defender, constants["swingSwordMax"], constants["swingSwordMin"], "armor", constants["swingSwordADScaling"], 0);

        let damageDealt = damageResult.damageDealt;

        return {
            attackerRes: "Sword swung for " + damageDealt + " damage!",
            defenderRes: "You just got hit for " + damageDealt + " damage!"
        }
    }, (attacker, defender) => {
        return true;
    });
    actionsArr["usePotion"] = new Action("usePotion", 3, (attacker, defender, battle) => {
        attacker.stats["hp"].value += 50;
        
        delete actionsArr["usePotion"];
        return {
            attackerRes: "Healed for " + 50,
            defenderRes: "Enemy healed for " + 50
        }
    }, (attacker, defender) => {
        return true;
    });
    // actionsArr["ironSkin"] = new Action("ironSkin", 4, (attacker, defender, battle) => {
    //     attacker.stats["armor"].value += 20;
    //     return {
    //         attackerRes: "Armor increased by 20",
    //         defenderRes: ""
    //     }
    // }, (attacker, defender) => {
    //     return true;
    // });
    actionsArr["chaaaarge!"] = new Action("chaaaarge!", 7, (attacker, defender, battle) => {

        let damageResult = applyStandardDamage(attacker, defender, constants["chargeDamage"], constants["chargeDamage"], "armor", constants["chargeADScaling"], 0);
        let damageDealt = damageResult.damageDealt;

        let res = {
            attackerRes: "",
            defenderRes: ""
        }

        if (damageResult.dodge != 0) {
            res.attackerRes = `You chaaarged angrily and dealt ${damageDealt} damage! You also forcefully take an additional turn.`;
            res.defenderRes = `Your opponent chaaarged angrily and dealt ${damageDealt} damage! They also forcefully take an additional turn.`
        }
        else {
            res.attackerRes = `You missed and fell to the ground! You also forcefully take an additional turn.`;
            res.defenderRes = `Your opponent missed and fell to the ground! They also forcefully take an additional turn.`
        }

        battle.gameController.once('advanceTurnEndedModifiers', () => {
            battle.attacker = (battle.attacker === battle.player1) ? battle.player2 : battle.player1;
            battle.defender = (battle.defender === battle.player1) ? battle.player2 : battle.player1;
            battle.turnCounter++;
            delete actionsArr["chaaaarge!"];
        });

        return res;

    }, (attacker, defender) => {
        if (attacker.stats["hp"].value <= defaultStats["hp"] * 0.25) return true;
        return false;
    })
}

const constants = [];
//ABILITY CONSTANTS
constants["swingSwordMin"] = 5;
constants["swingSwordMax"] = 20;
constants["swingSwordADScaling"] = 1;

constants["ironSkinValue"] = 20;

constants["usePotionValue"] = 20;

constants["chargeDamage"] = 60;
constants["chargeADScaling"] = 1;

//STATS CONSTANTS

//default
const defaultStats = [];
defaultStats["hp"] = 310;
defaultStats["armor"] = 14;
defaultStats["magicResist"] = 15;
defaultStats["physicalDamage"] = 15;
defaultStats["magicDamage"] = 0;
defaultStats["dodgeChance"] = 0.2;
defaultStats["critChance"] = 0.1;

//unique
const uniqueStats = [];

module.exports = {
    initStats: initStats,
    initActions: initActions,
    initModifiers: initModifiers,
    constants: constants,
    statsDefaults: defaultStats
};






