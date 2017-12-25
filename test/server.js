const Bupipa = require('../index');

async function asyncApiMethod(name, num) {
    let i = num || 0;
    let start = +new Date();
    while (i--) {
        await new Promise(res => setTimeout(res, 200));
    }
    console.log(name + ' ' + (+new Date() - start));
    return name + ' ' + (+new Date() - start);
}


let io = require('socket.io')();
io.on('connection', function (client) {
    console.log('client connected');

    // configure communication environment
    let pr = Bupipa.createRequester();
    pr.setSender(outData => client.emit('from-server', outData));
    client.on('from-client', pr.getReceiver());

    // shared api to client
    let bupipa = Bupipa.create(pr);
    bupipa.share(['asyncApiMethod'], asyncApiMethod);
    // bupipa.umount('name');
});
io.listen(3000);