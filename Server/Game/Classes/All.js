const Warrior = require('./Warrior');
const Mage = require('./Mage');

const classes = [];
classes["warrior"] = Warrior;
classes["mage"] = Mage;

module.exports = {
    classes: classes
};