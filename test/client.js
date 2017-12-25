const Bupipa = require('../index');

const address = 'http://localhost:3000';
const io = require('socket.io-client')(address);


io.on('connect', function () {
    console.log('connected');

    // configure communication environment
    let pr = Bupipa.createRequester();
    pr.setSender(outData => io.emit('from-client', outData) );
    io.on('from-server', pr.getReceiver());

    //using
    let bupipa = Bupipa.create(pr);

    (async function () {
        //let answer = await bupipa.api.test();
        console.log(await bupipa.updateApi());
        console.log(await bupipa.mount.__base.__getApi());
        console.log(await bupipa.mount.asyncApiMethod('myName', 3));
    })()

});