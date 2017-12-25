/**
 * Created by joni8 on 03.11.2017.
 */
const PromiseRequester = require('promise-requester');

const MOUNT_TYPE = {
    FUNC: 'FUNC',
    CONTAINER: 'CONTAINER'
};

class Bupipa {
    constructor(requester = Bupipa.createRequester()) {
        this.initTransport(requester);
        this.initMount();
    }
    static create(...arg) {
        return new Bupipa(...arg);
    }



    //region Mounting
    static get MOUNT_TYPE() {
        return MOUNT_TYPE;
    }
    initMount() {
        let type = Bupipa.MOUNT_TYPE;
        this.mount = {
            __base: {
                __getApi: async () => {
                    return this._send({
                        flatPath: '__base/__getApi'
                    })
                }
            }
        };
        this.sharedFlat = {
            '__base/__getApi': async () => {
                return this.__getApi()
            }
        };

        //todo: add node version
        this.shared = {
            type: type.CONTAINER,
            in: {
                __base:{
                    type: type.CONTAINER,
                    in:{
                        __getApi: {
                            type: type.FUNC
                        },
                    }
                }
            }
        };
    }

    __parseSharedApi(_node, path = []) {
        let type = Bupipa.MOUNT_TYPE;
        let node = {
            type: _node.type
        };
        switch (node.type) {
            case type.CONTAINER:
                node.in = {};
                for (let i = 0, keys = Object.keys(_node.in); i < keys.length; i++) {
                    let key = keys[i];
                    node.in[key] = this.__parseSharedApi(_node.in[key], [...path, key]);
                }
                break;
            case type.FUNC:
                node.flatPath = path.join('/');
                break;
        }
        return node;
    }

    __getApi() {
        return this.__parseSharedApi(this.shared);
    }
    async updateApi() {
        this.__updateApi(await this.mount.__base.__getApi());
    }

    __updateApi(_node) {
        let type = Bupipa.MOUNT_TYPE;
        switch (_node.type) {
            case type.CONTAINER:
                for (let i = 0, keys = Object.keys(_node.in); i < keys.length; i++) {
                    let key = keys[i];
                    this.__updateApi(_node.in[key]);
                }
                break;
            case type.FUNC:
                let {flatPath} = _node;
                let path = flatPath.split('/');
                let funcName  = path.pop();
                let mountPoint = path.reduce((old, next)=>{
                    old[next] = old[next] || {};
                    return old[next];
                }, this.mount);
                mountPoint[funcName] = async (...arg) => {
                    return this._send({
                        flatPath,
                        arg
                    })
                };
                break;
        }
    }

    share(_path, func) {
        let path = _path.map(e => e);
        let type = Bupipa.MOUNT_TYPE;
        this.sharedFlat[path.join('/')] = func;
        let funcName = path.pop();
        let mountPoint = path.reduce((old, next)=>{
            old[next] = old[next] || {
                type: type.CONTAINER,
                in:{}
            };
            return old[next].in
        }, this.shared.in);
        mountPoint[funcName] = {
            type: type.FUNC
        };
    }
    //endregion

    //region Transport setting
    initTransport(requester) {
        this._setRequester(requester);
        this.requester.setHandler(this._handler.bind(this));
    }

    async _send(...arg) {
        return this.requester.send(...arg);
    }

    async _handler(_data, callback) {
        let {flatPath, arg=[]} = _data;
        //todo: use callback
        return this.sharedFlat[flatPath] && this.sharedFlat[flatPath](...arg)
    }

    static createRequester() {
        return new PromiseRequester()
    }

    _setRequester(requester) {
        this.requester = requester;
    }
    //endregion




}
module.exports = Bupipa;
