/**
 * Created by joni8 on 03.11.2017.
 */
const PromiseRequester = require('promise-requester');

class Bupipa {
    constructor() {
        this.requester = Bupipa.createRequester();
    }

    static createRequester() {
        return new PromiseRequester()
    }

    setRequester(requester) {
        this.requester = requester;
    }
}
class BupipaServer extends Bupipa {
    constructor() {
        super();
    }
}
class BupipaClient extends Bupipa {
    constructor() {
        super();
    }

}

module.exports = {
    BupipaClient,
    BupipaServer
};
