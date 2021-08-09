const Stat = require('../Game/Stat');

const initStats = (statsArr, defaultStats, uniqueStats) => {
    for (const [key, value] of Object.entries(defaultStats)) {
        statsArr[key] = new Stat(key, value);
    }
    for (const [key, value] of Object.entries(uniqueStats)) {
        statsArr[key] = new Stat(key, value);
    }
}

module.exports = initStats;