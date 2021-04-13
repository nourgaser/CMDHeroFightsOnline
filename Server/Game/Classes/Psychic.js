const Stat = require('../Stat');
const Action = require('../Action');

var initStats = (statsArr) => {
    //default
    statsArr["class"] = new Stat("class", "psychic");
    statsArr["hp"] = new Stat("hp", statsDefaults["hp"]);
    statsArr["armor"] = new Stat("armor", statsDefaults["armor"]);
    statsArr["magicResist"] = new Stat("magicResist", statsDefaults["magicResist"]);
    statsArr["physicalDamage"] = new Stat("physicalDamage", statsDefaults["physicalDamage"]);
    statsArr["magicDamage"] = new Stat("magicDamage", statsDefaults["magicDamage"]);
    statsArr["dodgeChance"] = new Stat("dodgeChance", statsDefaults["dodgeChance"]);
    statsArr["critChance"] = new Stat("critChance", statsDefaults["critChance"]);
    //unique
    statsArr["pistolAmmo"] = new Stat("pistolAmmo", statsDefaults["pistolAmmo"]);
    initOpponentStats(statsArr);
}

var initOpponentStats = statsArr => {
    statsArr["opponentStats"] = new Stat("opponentStats", []);
    statsArr["opponentStats"].value["armor"] = -1;
    statsArr["opponentStats"].value["magicResist"] = -1;
    statsArr["opponentStats"].value["physicalDamage"] = -1;
    statsArr["opponentStats"].value["magicDamage"] = -1;
    statsArr["opponentStats"].value["dodgeChance"] = -1;
    statsArr["opponentStats"].value["critChance"] = -1;
}

//battle-start modifiers here
var initModifiers = (hero, battle, turnToStart) => {
}

const initActions = actionsArr => {
    actionsArr["mindInvasion"] = new Action("mindInvasion", 3, (attacker, defender, battle) => {

        let damageResult = Action.standardDamageCalculation(attacker, defender, constants["mindInvasionMax"], constants["mindInvasionMin"], "magicResist", 0, constants["mindInvasionAPScaling"]);

        let damageDealt = damageResult.damageDealt;
        
        defender.stats["hp"].value -= damageDealt;
        return {
            attackerRes: "Invaded opponent's mind and dealt " + damageDealt + " damage!",
            defenderRes: "Your mind got invaded and damaged for " + damageDealt + " damage!"
        }
    }, (attacker, defender) => {
        return true;
    });
    actionsArr["firePistol"] = new Action("firePistol", 3, (attacker, defender, battle) => {

        attacker.stats["pistolAmmo"].value--;

        let damageResult = Action.standardDamageCalculation(attacker, defender, constants["firePistolMax"], constants["firePistolMin"], "armor", constants["firePistolADScaling"], 0);

        let damageDealt = damageResult.damageDealt;

        defender.stats["hp"].value -= damageDealt;

        return {
            attackerRes: "Fired pistol and dealt " + damageDealt + " damage!",
            defenderRes: "You got shot by a pistol for " + damageDealt + " damage!"
        }
    }, (attacker, defender) => {
        return attacker.stats["pistolAmmo"].value > 0 ? true : false;
    });

    //update the opponent's stats container (armor, magicRes, dodge/critChance, physicalDamage, magicDamage)
    actionsArr["revealStats"] = new Action("revealStats", 1, (attacker, defender, battle) => {

        let attackerRes = "Opponent's ";
        let temp = Math.floor(Math.random() * 6);

        switch (temp) {
            case 0:
                attacker.stats["opponentStats"].value["armor"] = defender.stats["armor"].value;
                attackerRes += " armor: " + defender.stats["armor"].value;
                break;
            case 1:
                attacker.stats["opponentStats"].value["magicResist"] = defender.stats["magicResist"].value;
                attackerRes += " magic resist: " + defender.stats["magicResist"].value;
                break;
            case 2:
                attacker.stats["opponentStats"].value["critChance"] = defender.stats["critChance"].value;
                attackerRes += " crit chance: " + defender.stats["critChance"].value * 100 + "%";
                break;
            case 3:
                attacker.stats["opponentStats"].value["dodgeChance"] = defender.stats["dodgeChance"].value;
                attackerRes += " dodgeChance: " + defender.stats["dodgeChance"].value * 100 + "%";
                break;
            case 4:
                attacker.stats["opponentStats"].value["physicalDamage"] = defender.stats["physicalDamage"].value;
                attackerRes += " physical damage: " + defender.stats["physicalDamage"].value;
                break;
            case 5:
                attacker.stats["opponentStats"].value["magicDamage"] = defender.stats["magicDamage"].value;
                attackerRes += " magic damage: " + defender.stats["magicDamage"].value;
                break;
        }

        console.log("Opponent stats:");
        console.log(attacker.stats["opponentStats"].value);

        return {
            attackerRes: attackerRes,
            defenderRes: ""
        }
    }, (attacker, defender) => {
        return true;
    });
    actionsArr["terminateMind"] = new Action("terminateMind", 10, (attacker, defender, battle) => {
        let attackerRes, defenderRes;

        let terminated = true;
        for (const [key, value] of Object.entries(attacker.stats["opponentStats"].value)) {
            if (defender.stats[key].value != value) {
                terminated = false;
                attackerRes = "You attempt to terminate your opponent's mind but you fail; incorrect data...";
                defenderRes = "Your opponent attempted to terminate your mind but failed. ";
                break;
            }
        }

        if (terminated) {
            defender.stats["hp"].value = 0;
            attackerRes = "You invade your opponent's mind and terminate it using the accurate data you collected.";
            defenderRes = "Your opponent has invaded your mind and completely terminated it";
        }

        return {
            attackerRes: attackerRes,
            defenderRes: defenderRes
        }
    }, (attacker, defender) => {
        return true;
    });
}

const constants = [];
//ABILITY CONSTANTS
constants["mindInvasionMin"] = 5;
constants["mindInvasionMax"] = 15;
constants["mindInvasionAPScaling"] = 1;

constants["firePistolMin"] = 10;
constants["firePistolMax"] = 25;
constants["firePistolADScaling"] = 1.9;

//STATS CONSTANTS
const statsDefaults = [];
//default
statsDefaults["hp"] = 260;
statsDefaults["armor"] = 10;
statsDefaults["magicResist"] = 10;
statsDefaults["physicalDamage"] = 8;
statsDefaults["magicDamage"] = 10;
statsDefaults["dodgeChance"] = 0.1;
statsDefaults["critChance"] = 0.2;

//unique
statsDefaults["pistolAmmo"] = 3;


module.exports = {
    initStats: initStats,
    initActions: initActions,
    initModifiers: initModifiers,
    constants: constants,
    statsDefaults: statsDefaults
};






