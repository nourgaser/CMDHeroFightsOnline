const TANK_REFLECT_AP_SCALING = 1;

class Action {
    constructor(name, moveCost, invoke, conditionMet) {
        this.name = name;
        this.moveCost = moveCost;
        this.invoke = invoke;
        this.conditionMet = conditionMet;
    }
    static applyChance = (chance) => {
        return ((Math.round(Math.random() * 100) + 1) <= (chance * 100));
    }
    static applyStandardDamage = (attacker, defender, maxDamage, minDamage, resistType, adScaling, apScaling) => {
        let attackerLuck = attacker.stats["luck"].value;
        let defenderLuck = defender.stats["luck"].value;
        //damage range > luck > scaling > crit > resistance
        let damageBeforeLuck, damageBeforeScaling, damageBeforeCrit, damageBeforeResistance;
        let res = {
            damageDealt: 0,
            crit: 1,
            dodge: (this.applyChance(defender.stats["dodgeChance"].value - attackerLuck + defenderLuck)) ? 0 : 1,
            tank : {
                amountOfResistanceBroken: 0
            }
        }

        if (res.dodge != 0) {
            res.crit = (this.applyChance(attacker.stats["critChance"].value + attackerLuck)) ? attacker.stats["critDamage"].value : 1;
            damageBeforeLuck = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
            if (attackerLuck >= 0) damageBeforeScaling = damageBeforeLuck + ((maxDamage - damageBeforeLuck) * attackerLuck);
            else damageBeforeScaling = damageBeforeLuck - ((damageBeforeLuck - minDamage) * (attackerLuck * -1));
            damageBeforeCrit = damageBeforeScaling + attacker.stats["physicalDamage"].value * adScaling + attacker.stats["magicDamage"].value * apScaling;
            damageBeforeResistance = damageBeforeCrit * res.crit;
        }

        if (defender.classID === "tank" && defender.stats[resistType].value > 0) {
            if (res.dodge != 0) {
                res.damageDealt = Math.round(damageBeforeResistance + defender.stats["magicDamage"].value * TANK_REFLECT_AP_SCALING);

                defender.stats[resistType].value -= Math.round(damageBeforeResistance);
                attacker.stats["hp"].value -= res.damageDealt;
                res.tank.amountOfResistanceBroken = Math.round(damageBeforeResistance);
                if (defender.stats[resistType].value < 0) defender.stats[resistType].value = 0;
                if (res.damageDealt < 0) res.damageDealt = 0;
            }
        }

        //default damage application
        else {
            if (res.dodge != 0) {
                res.damageDealt = Math.round(damageBeforeResistance) - defender.stats[resistType].value;
                if (res.damageDealt < 0) res.damageDealt = 0;
            }
            defender.stats["hp"].value -= res.damageDealt;
        }
        return res;
    }
}
module.exports = Action;