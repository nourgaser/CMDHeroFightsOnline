const warrior = require('./warrior');
const mage = require('./mage');
const rogue = require('./rogue');
const psychic= require('./psychic');
const tank = require('./tank');

const classes = [];
classes["warrior"] = warrior;
classes["mage"] = mage;
classes["rogue"] = rogue;
classes["psychic"] = psychic;
classes["tank"] = tank;

module.exports = {
    classes
};