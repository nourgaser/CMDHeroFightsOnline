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
    static standardDamageCalculation = (attacker, defender, maxDamage, minDamage, resistType, adScaling, apScaling) => {
        let attackerLuck = attacker.stats["luck"].value;
        let defenderLuck = defender.stats["luck"].value;

        let res = {
            damageDealt: 0,
            crit: 1,
            dodge: (this.applyChance(defender.stats["dodgeChance"].value - attackerLuck + defenderLuck)) ? 0 : 1
        }

        if (res.dodge != 0) {
            res.crit = (this.applyChance(attacker.stats["critChance"].value + attackerLuck)) ? attacker.stats["critDamage"].value : 1;

            let damageBeforeLuck = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
            let damageWithLuckApplied;
            if (attackerLuck >= 0) damageWithLuckApplied = damageBeforeLuck + ((maxDamage - damageBeforeLuck) * attackerLuck);
            else damageWithLuckApplied = damageBeforeLuck - ((damageBeforeLuck - minDamage) * (attackerLuck * -1));
            damageWithLuckApplied = Math.round(damageWithLuckApplied);

            res.damageDealt = Math.round(((damageWithLuckApplied + attacker.stats["physicalDamage"].value * adScaling + attacker.stats["magicDamage"].value * apScaling) * res.crit)
                - defender.stats[resistType].value);

            if (res.damageDealt < 0) res.damageDealt = 0;
        }
        return res;
    }
}
module.exports = Action;