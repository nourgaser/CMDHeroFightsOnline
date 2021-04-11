const Stat = require("../Stat");
const Action = require("../Action");
const Modifier = require("../Modifier");

var initStats = (statsArr) => {
    statsArr["class"] = new Stat("class", "Rogue");
    statsArr["hp"] = new Stat("hp", 180);
    statsArr["armor"] = new Stat("armor", 10);
    statsArr["magicResist"] = new Stat("magicResist", 5);
    statsArr["physicalDamage"] = new Stat("physicalDamage", 50);
    statsArr["magicDamage"] = new Stat("magicDamage", 0);
    statsArr["dodgeChance"] = new Stat("dodgeChance", 0.15);
    statsArr["critChance"] = new Stat("critChance", 0.6);
}

var initModifiers = (hero, battle, turnToStart) => {

}

var initActions = (actionsArr) => {
    actionsArr["daggerStab"] = new Action("daggerStab", 3, (attacker, defender, battle) => {
        let damageResult = Action.standardDamageCalculation(attacker, defender, constants["daggerStabMax"], constants["daggerStabMin"], "armor", constants["daggerStabADScaling"], 0);
        let damageDealt = damageResult.damageDealt;

        defender.stats["hp"].value -= damageDealt;

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
                        battle.emitAllStats();
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
constants["daggerStabADScaling"] = 0.45;


constants["excuteDamage"] = 80;


module.exports = {
    initStats: initStats,
    initActions: initActions,
    initModifiers: initModifiers,
    constants: constants
};
