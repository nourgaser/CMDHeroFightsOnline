const Warrior = require('./Warrior');
const Mage = require('./Mage');
const Rogue = require('./Rogue');
const Psychic= require('./Psychic');
const Tank = require('./Tank');

const classes = [];
classes["warrior"] = Warrior;
classes["mage"] = Mage;
classes["rogue"] = Rogue;
classes["psychic"] = Psychic;
classes["tank"] = Tank;

module.exports = {
    classes: classes
};