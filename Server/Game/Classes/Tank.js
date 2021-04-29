const Stat = require('../Stat');
const Action = require('../Action');
const Modifier = require('../Modifier');

var initStats = (statsArr) => {
    statsArr["class"] = new Stat("class", "tank");
    statsArr["hp"] = new Stat("hp", statsDefaults["hp"]);
    statsArr["armor"] = new Stat("armor", statsDefaults["armor"]);
    statsArr["magicResist"] = new Stat("magicResist", statsDefaults["magicResist"]);
    statsArr["physicalDamage"] = new Stat("physicalDamage", statsDefaults["physicalDamage"]);
    statsArr["magicDamage"] = new Stat("magicDamage", statsDefaults["magicDamage"]);
    statsArr["dodgeChance"] = new Stat("dodgeChance", statsDefaults["dodgeChance"]);
    statsArr["critChance"] = new Stat("critChance", statsDefaults["critChance"]);
}

var initModifiers = (hero, battle, turnParity) => {
    var removeHunkerDown = () => {
        if (battle.turnCounter % 2 === turnParity % 2) {
            delete hero.actions["hunkerDown"];
        }
    }
    battle.gameController.on("defaultActionsAdded", removeHunkerDown);
    battle.gameController.once("endBattle", () => {
        battle.gameController.removeListener("advanceTurnStartModifiers", removeHunkerDown);
    });
}

const initActions = actionsArr => {
    actionsArr["breakArmor"] = new Action("breakArmor", 2, (attacker, defender, battle) => {
        attacker.stats["armor"].value = 0;
        attacker.stats["hp"].value += 15;

        attacker.stats["armor"].modifiers["destroyedThisTurn"] = new Modifier("destroyedThisTurn", null, null, null, null, "Armor destroyed this turn.");
        battle.gameController.once('advanceTurnEndedModifiers', () => {
            delete attacker.stats["armor"].modifiers["destroyedThisTurn"];
        });

        return {
            attackerRes: "You removed all your armor and gained 25 HP!",
            defenderRes: ""
        }
    }, (attacker, defender) => {
        return (attacker.stats["armor"].value > 0 && attacker.stats["magicResist"].modifiers["destroyedThisTurn"] === undefined) ? true : false;
    });

    actionsArr["breakMagicResist"] = new Action("breakMagicResist", 2, (attacker, defender, battle) => {
        attacker.stats["magicResist"].value = 0;
        attacker.stats["hp"].value += 15;

        attacker.stats["magicResist"].modifiers["destroyedThisTurn"] = new Modifier("destroyedThisTurn", null, null, null, null, "Magic resist destroyed this turn.");
        battle.gameController.once('advanceTurnEndedModifiers', () => {
            delete attacker.stats["magicResist"].modifiers["destroyedThisTurn"];
        });

        return {
            attackerRes: "You removed all your magicr resist and gained 25 HP!",
            defenderRes: ""
        }
    }, (attacker, defender) => {
        return (attacker.stats["magicResist"].value > 0 && attacker.stats["armor"].modifiers["destroyedThisTurn"] === undefined) ? true : false;
    });

    actionsArr["bodySlam"] = new Action("bodySlam", 3, (attacker, defender, battle) => {

        let damageResult = Action.applyStandardDamage(attacker, defender, constants["bodySlamMax"], constants["bodySlamMin"], "armor", constants["bodySlamADScaling"], 0);
        if (damageResult.dodge === 0) {
            return {
                attackerRes: `You tried to slam into your opponent but missed!`,
                defenderRes: `Your opponent tried to slam into you but missed!`
            }
        }
        else {
            let damageDealt = damageResult.damageDealt;
            return {
                attackerRes: `You slammed into your opponent for ${damageDealt} damage!`,
                defenderRes: `Your opponent slammed into you for ${damageDealt} damage!`
            }
        }
    }, (attacker, defender) => {
        return (attacker.stats["armor"].value == 0) ? true : false;
    });

    actionsArr["throwRock"] = new Action("throwRock", 4, (attacker, defender, battle) => {

        let attackerLuck = attacker.stats["luck"].value;
        let defenderLuck = defender.stats["luck"].value;
        let dodge = Action.applyChance(defender.stats["dodgeChance"].value - attackerLuck + defenderLuck);
        attacker.stats["hp"].value -= constants["throwRockHPCost"];

        if (dodge) {
            return {
                attackerRes: `You threw a rock off your body (-50 hp) but it missed...!`,
                defenderRes: `Your opponent threw a rock off their body (-50 hp) but missed!`
            }
        }
        else {
            defender.stats["hp"].value -= constants["throwRockDamage"];
            return {
                attackerRes: `You threw a rock off your body (-50 hp) and it landed for ${constants["throwRockDamage"]} damage!`,
                defenderRes: `Your opponent threw a rock off their body (-50 hp) and it landed for ${constants["throwRockDamage"]} damage!`
            }
        }
    }, (attacker, defender) => {
        return (attacker.stats["armor"].value == 0 && attacker.stats["magicResist"].value == 0 && attacker.stats["hp"].value > constants["throwRockHPCost"]) ? true : false;
    });
    actionsArr["regenerateResist"] = new Action("regenerateResist", 6, (attacker, defender, battle) => {

        attacker.stats["armor"].value = Math.ceil(statsDefaults["armor"] * constants["regenerateResistPercentage"] );
        attacker.stats["magicResist"].value = Math.ceil(statsDefaults["magicResist"]  * constants["regenerateResistPercentage"]);

        delete attacker.actions["regenerateResist"];
        return {
            attackerRes: `You regenerated ${constants["regenerateResistPercentage"] * 100}% of your resistances!`,
            defenderRes: ""
        }
    }, (attacker, defender) => {
        return (attacker.stats["armor"].value == 0 && attacker.stats["magicResist"].value == 0) ? true : false;
    });
}

const constants = [];
//ABILITY CONSTANTS
constants["bodySlamMax"] = 20;
constants["bodySlamMin"] = 5;
constants["bodySlamADScaling"] = 0.5;

constants["throwRockHPCost"] = 50;
constants["throwRockDamage"] = 50;

constants["regenerateResistPercentage"] = 0.5;

const statsDefaults = [];
statsDefaults["hp"] = 380;
statsDefaults["armor"] = 50;
statsDefaults["magicResist"] = 50;
statsDefaults["physicalDamage"] = 20;
statsDefaults["magicDamage"] = 5;
statsDefaults["dodgeChance"] = 0;
statsDefaults["critChance"] = 0.1;



module.exports = {
    initStats: initStats,
    initActions: initActions,
    initModifiers: initModifiers,
    constants: constants,
    statsDefaults: statsDefaults
};
