const Warrior = require('./Warrior');
const Mage = require('./Mage');
const Rogue = require('./Rogue');
const Psychic= require('./Psychic');

const classes = [];
classes["warrior"] = Warrior;
classes["mage"] = Mage;
classes["rogue"] = Rogue;
classes["psychic"] = Psychic;

module.exports = {
    classes: classes
};