const Action = require("../Action");
const Modifier = require("../Modifier");
const {applyChance, applyStandardDamage} = require('../../modules/calculation-tools');
const initStatsModule = require('../../modules/init-stats');

var initStats = statsArr => {
    initStatsModule(statsArr, defaultStats, uniqueStats);
}

var initModifiers = (hero, battle, turnToStart) => {

}

var initActions = (actionsArr) => {
    actionsArr["daggerStab"] = new Action("daggerStab", 3, (attacker, defender, battle) => {
        let damageResult = applyStandardDamage(attacker, defender, constants["daggerStabMax"], constants["daggerStabMin"], "armor", constants["daggerStabADScaling"], 0);
        let damageDealt = damageResult.damageDealt;

        if (damageResult.crit === 1) {
            return {
                attackerRes: "Stabbed for " + damageDealt + " damage!",
                defenderRes: "You just got stabbed for " + damageDealt + " damage!"
            }
        }

        //crit => apply/reapply poison
        else if (damageResult.dodge != 0) {
            if (defender.stats["hp"].modifiers["poison"] === undefined) {
                let values = [];
                values["damage"] = 10;
                defender.stats["hp"].modifiers["poison"] = new Modifier("is-Poisoned", "trueDOT", values, battle.turnCounter, 5, "Poisoned for 10 damage/turn");

                var poison = () => {
                    let startTurn = defender.stats["hp"].modifiers["poison"].startTurn;
                    let duration = defender.stats["hp"].modifiers["poison"].duration;

                    if (battle.turnCounter % 2 !== startTurn % 2) {
                        defender.stats["hp"].value -= defender.stats["hp"].modifiers["poison"].values["damage"];
                    }
                    if (battle.turnCounter == startTurn + duration) {
                        battle.gameController.removeListener('advanceTurnStartModifiers', poison);
                        delete defender.stats["hp"].modifiers["poison"];
                    }
                }
                battle.gameController.on('advanceTurnStartModifiers', poison);
            }
            else {
                defender.stats["hp"].modifiers["poison"].values["damage"] += 10;
                defender.stats["hp"].modifiers["poison"].startTurn = battle.turnCounter;
            }

            return {
                attackerRes: "Stabbed for " + damageDealt + " damage -- critical! And applied posison for " +
                    defender.stats["hp"].modifiers["poison"].values["damage"] + "/turn for 3 turns.",
                defenderRes: "You got stabbed for " + damageDealt + " damage -- critical! You are poisoned! (" +
                    defender.stats["hp"].modifiers["poison"].values["damage"] + "/turn for 3 turns)."
            }

        }
        else {
            return {
                attackerRes: "Dodge!",
                defenderRes: "Dodge!"
            }
        }
    }, (attacker, defender) => {
        return true;
    });

    actionsArr["excute"] = new Action("excute", 7, (attacker, defender, battle) => {

        var damageDealt = constants["excuteDamage"];
        defender.stats["hp"].value -= damageDealt;
        delete actionsArr["excuse"];
        return {
            attackerRes: "Excuted your opponent! (" + constants["excuteDamage"] + " true damage)",
            defenderRes: "You just got excuted from poison! (" + constants["excuteDamage"] + " true damage)"
        }

    }, (attacker, defender) => {
        if (defender.stats["hp"].modifiers["poison"] === undefined) return false;
        else {
            return defender.stats["hp"].modifiers["poison"].values["damage"] >= 30 ? true : false;
        }
    });

};

const constants = [];
//ABILITY CONSTANTS
constants["daggerStabMax"] = 30;
constants["daggerStabMin"] = 7;
constants["daggerStabADScaling"] = 0.4;


constants["excuteDamage"] = 80;

//STATS CONSTANTS
const defaultStats = [];
//default
defaultStats["hp"] = 180;
defaultStats["armor"] = 10;
defaultStats["magicResist"] = 5;
defaultStats["physicalDamage"] = 50;
defaultStats["magicDamage"] = 0;
defaultStats["dodgeChance"] = 0.15;
defaultStats["critChance"] = 0.6;

//unique
const uniqueStats = [];

module.exports = {
    initStats: initStats,
    initActions: initActions,
    initModifiers: initModifiers,
    constants: constants
};
