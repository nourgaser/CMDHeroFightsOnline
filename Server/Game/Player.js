var shortID = require('shortid');

module.exports = class Player {
    constructor(name = "unknown") {
        this.id = shortID.generate();
        this.name = name;
    }
}