/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 875:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 782:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require2_) => {

"use strict";
__nccwpck_require2_.r(__webpack_exports__);
/* harmony export */ __nccwpck_require2_.d(__webpack_exports__, {
/* harmony export */   "controlMessages": () => (/* binding */ controlMessages),
/* harmony export */   "clientProtocols": () => (/* binding */ clientProtocols),
/* harmony export */   "constants": () => (/* binding */ constants),
/* harmony export */   "writeAsync": () => (/* binding */ writeAsync),
/* harmony export */   "writevAsync": () => (/* binding */ writevAsync),
/* harmony export */   "readAsync": () => (/* binding */ readAsync),
/* harmony export */   "invokeCallback": () => (/* binding */ invokeCallback),
/* harmony export */   "errHandler": () => (/* binding */ errHandler)
/* harmony export */ });
const fs = __nccwpck_require2_(147);

const controlMessages = {
    peerChangeset: "peer_changeset"
}
Object.freeze(controlMessages);

const clientProtocols = {
    json: "json",
    bson: "bson"
}
Object.freeze(clientProtocols);

const constants = {
    MAX_SEQ_PACKET_SIZE: 128 * 1024,
    PATCH_CONFIG_PATH: "../patch.cfg",
    POST_EXEC_SCRIPT_NAME: "post_exec.sh"
}
Object.freeze(constants);

function writeAsync(fd, buf) {
    return new Promise(resolve => fs.write(fd, buf, resolve));
}
function writevAsync(fd, bufList) {
    return new Promise(resolve => fs.writev(fd, bufList, resolve));
}
function readAsync(fd, buf, offset, size) {
    return new Promise(resolve => fs.read(fd, buf, 0, size, offset, resolve));
}

async function invokeCallback(callback, ...args) {
    if (!callback)
        return;

    if (callback.constructor.name === 'AsyncFunction') {
        await callback(...args).catch(errHandler);
    }
    else {
        callback(...args);
    }
}

function errHandler(err) {
    console.log(err);
}

/***/ }),

/***/ 244:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require2_) => {

"use strict";
// ESM COMPAT FLAG
__nccwpck_require2_.r(__webpack_exports__);

// EXPORTS
__nccwpck_require2_.d(__webpack_exports__, {
  "HotPocketContract": () => (/* binding */ HotPocketContract)
});

// EXTERNAL MODULE: ./src/common.js
var common = __nccwpck_require2_(782);
;// CONCATENATED MODULE: ./src/patch-config.js


const fs = __nccwpck_require2_(147);

// Handles patch config manipulation.
class PatchConfig {

    // Loads the config value if there's a patch config file. Otherwise throw error.
    getConfig() {
        if (!fs.existsSync(common.constants.PATCH_CONFIG_PATH))
            throw "Patch config file does not exist.";

        return new Promise((resolve, reject) => {
            fs.readFile(common.constants.PATCH_CONFIG_PATH, 'utf8', function (err, data) {
                if (err) reject(err);
                else resolve(JSON.parse(data));
            });
        });
    }

    updateConfig(config) {

        this.validateConfig(config);

        return new Promise((resolve, reject) => {
            // Format json to match with the patch.cfg json format created by HP at the startup.
            fs.writeFile(common.constants.PATCH_CONFIG_PATH, JSON.stringify(config, null, 4), (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    validateConfig(config) {
        // Validate all config fields.
        if (!config.version)
            throw "Contract version is not specified.";
        if (!config.unl || !config.unl.length)
            throw "UNL list cannot be empty.";
        for (let publicKey of config.unl) {
            // Public keys are validated against length, ed prefix and hex characters.
            if (!publicKey.length)
                throw "UNL public key not specified.";
            else if (!(/^(e|E)(d|D)[0-9a-fA-F]{64}$/g.test(publicKey)))
                throw "Invalid UNL public key specified.";
        }
        if (!config.bin_path || !config.bin_path.length)
            throw "Binary path cannot be empty.";
        if (config.consensus.mode != "public" && config.consensus.mode != "private")
            throw "Invalid consensus mode configured in patch file. Valid values: public|private";
        if (config.consensus.roundtime < 1 && config.consensus.roundtime > 3600000)
            throw "Round time must be between 1 and 3600000ms inclusive.";
        if (config.consensus.stage_slice < 1 || config.consensus.stage_slice > 33)
            throw "Stage slice must be between 1 and 33 percent inclusive.";
        if (config.consensus.threshold < 1 || config.consensus.threshold > 100)
            throw "Consensus threshold must be between 1 and 100 percent inclusive.";
        if (config.npl.mode != "public" && config.npl.mode != "private")
            throw "Invalid npl mode configured in patch file. Valid values: public|private";
        if (config.round_limits.user_input_bytes < 0 || config.round_limits.user_output_bytes < 0 || config.round_limits.npl_output_bytes < 0 ||
            config.round_limits.proc_cpu_seconds < 0 || config.round_limits.proc_mem_bytes < 0 || config.round_limits.proc_ofd_count < 0)
            throw "Invalid round limits.";
        if (config.max_input_ledger_offset < 0)
            throw "Invalid max input ledger offset";
    }
}
;// CONCATENATED MODULE: ./src/contract-context.js



// HotPocket contract context which is passed into every smart contract invocation.

class ContractContext {

    #patchConfig = null;
    #controlChannel = null;

    constructor(hpargs, users, unl, controlChannel) {
        this.#patchConfig = new PatchConfig();
        this.#controlChannel = controlChannel;
        this.contractId = hpargs.contract_id;
        this.publicKey = hpargs.public_key;
        this.privateKey = hpargs.private_key;
        this.readonly = hpargs.readonly;
        this.timestamp = hpargs.timestamp;
        this.users = users;
        this.unl = unl; // Not available in readonly mode.
        this.lclSeqNo = hpargs.lcl_seq_no; // Not available in readonly mode.
        this.lclHash = hpargs.lcl_hash; // Not available in readonly mode.
    }

    // Returns the config values in patch config.
    getConfig() {
        return this.#patchConfig.getConfig();
    }

    // Updates the config with given config object and save the patch config.
    updateConfig(config) {
        return this.#patchConfig.updateConfig(config);
    }

    // Updates the known-peers this node must attempt connections to.
    // toAdd: Array of strings containing peers to be added. Each string must be in the format of "<ip>:<port>".
    updatePeers(toAdd, toRemove) {
        return this.#controlChannel.send({
            type: common.controlMessages.peerChangeset,
            add: toAdd || [],
            remove: toRemove || []
        });
    }
}
;// CONCATENATED MODULE: ./src/control.js
const control_fs = __nccwpck_require2_(147);


class ControlChannel {

    #fd = null;
    #readStream = null;

    constructor(fd) {
        this.#fd = fd;
    }

    consume(onMessage) {

        if (this.#readStream)
            throw "Control channel already consumed.";

        this.#readStream = control_fs.createReadStream(null, { fd: this.#fd, highWaterMark: common.constants.MAX_SEQ_PACKET_SIZE });
        this.#readStream.on("data", onMessage);
        this.#readStream.on("error", (err) => { });
    }

    send(obj) {
        const buf = Buffer.from(JSON.stringify(obj));
        if (buf.length > common.constants.MAX_SEQ_PACKET_SIZE)
            throw ("Control message exceeds max size " + common.constants.MAX_SEQ_PACKET_SIZE);
        return (0,common.writeAsync)(this.#fd, buf);
    }

    close() {
        this.#readStream && this.#readStream.close();
    }
}
;// CONCATENATED MODULE: ./src/npl.js


const npl_fs = __nccwpck_require2_(147);

// Represents the node-party-line that can be used to communicate with unl nodes.
class NplChannel {

    #fd = null;
    #readStream = null;

    constructor(fd) {
        this.#fd = fd;
    }

    consume(onMessage) {

        if (this.#readStream)
            throw "NPL channel already consumed.";

        this.#readStream = npl_fs.createReadStream(null, { fd: this.#fd, highWaterMark: common.constants.MAX_SEQ_PACKET_SIZE });

        // When hotpocket is sending the npl messages, first it sends the public key of the particular node
        // and then the message, First data buffer is taken as public key and the second one as message,
        // then npl message object is constructed and the event is emmited.
        let publicKey = null;

        this.#readStream.on("data", (data) => {
            if (!publicKey) {
                publicKey = data.toString();
            }
            else {
                onMessage(publicKey, data);
                publicKey = null;
            }
        });

        this.#readStream.on("error", (err) => { });
    }

    send(msg) {
        const buf = Buffer.from(msg);
        if (buf.length > common.constants.MAX_SEQ_PACKET_SIZE)
            throw ("NPL message exceeds max size " + common.constants.MAX_SEQ_PACKET_SIZE);
        return (0,common.writeAsync)(this.#fd, buf);
    }

    close() {
        this.#readStream && this.#readStream.close();
    }
}

;// CONCATENATED MODULE: ./src/unl.js


class UnlCollection {

    #readonly = null;
    #pendingTasks = null;
    #channel = null;

    constructor(readonly, unl, channel, pendingTasks) {
        this.nodes = {};
        this.#readonly = readonly;
        this.#pendingTasks = pendingTasks;

        if (!readonly) {
            for (const [publicKey, stat] of Object.entries(unl)) {
                this.nodes[publicKey] = new UnlNode(publicKey, stat.active_on);
            }

            this.#channel = channel;
        }
    }

    // Returns the unl node for the specified public key. Returns null if not found.
    find(publicKey) {
        return this.nodes[publicKey];
    }

    // Returns all the unl nodes.
    list() {
        return Object.values(this.nodes);
    }

    count() {
        return Object.keys(this.nodes).length;
    }

    // Registers for NPL messages.
    onMessage(callback) {

        if (this.#readonly)
            throw "NPL messages not available in readonly mode.";

        this.#channel.consume((publicKey, msg) => {
            this.#pendingTasks.push((0,common.invokeCallback)(callback, this.nodes[publicKey], msg));
        });
    }

    // Broadcasts a message to all unl nodes (including self if self is part of unl).
    async send(msg) {
        if (this.#readonly)
            throw "NPL messages not available in readonly mode.";

        await this.#channel.send(msg);
    }
}

// Represents a node that's part of unl.
class UnlNode {

    constructor(publicKey, activeOn) {
        this.publicKey = publicKey;
        this.activeOn = activeOn;
    }
}
;// CONCATENATED MODULE: ./src/user.js


class UsersCollection {

    #users = {};
    #infd = null;

    constructor(userInputsFd, usersObj, clientProtocol) {
        this.#infd = userInputsFd;

        Object.entries(usersObj).forEach(([publicKey, arr]) => {

            const outfd = arr[0]; // First array element is the output fd.
            arr.splice(0, 1); // Remove first element (output fd). The rest are pairs of msg offset/length tuples.

            const channel = new UserChannel(outfd, clientProtocol);
            this.#users[publicKey] = new User(publicKey, channel, arr);
        });
    }

    // Returns the User for the specified public key. Returns null if not found.
    find(publicKey) {
        return this.#users[publicKey]
    }

    // Returns all the currently connected users.
    list() {
        return Object.values(this.#users);
    }

    count() {
        return Object.keys(this.#users).length;
    }

    async read(input) {
        const [offset, size] = input;
        const buf = Buffer.alloc(size);
        await (0,common.readAsync)(this.#infd, buf, offset, size);
        return buf;
    }
}

class User {

    #channel = null;

    constructor(publicKey, channel, inputs) {
        this.publicKey = publicKey;
        this.inputs = inputs;
        this.#channel = channel;
    }

    async send(msg) {
        await this.#channel.send(msg);
    }
}

class UserChannel {

    #outfd = null;
    #clientProtocol = null;

    constructor(outfd, clientProtocol) {
        this.#outfd = outfd;
        this.#clientProtocol = clientProtocol;
    }

    send(msg) {
        const messageBuf = this.serialize(msg);
        let headerBuf = Buffer.alloc(4);
        // Writing message length in big endian format.
        headerBuf.writeUInt32BE(messageBuf.byteLength)
        return (0,common.writevAsync)(this.#outfd, [headerBuf, messageBuf]);
    }

    serialize(msg) {

        if (!msg)
            throw "Cannot serialize null content.";

        if (Buffer.isBuffer(msg))
            return msg;
        else if (this.#clientProtocol == common.clientProtocols.bson)
            return Buffer.from(msg);
        else // json
            return Buffer.from(JSON.stringify(msg));
    }
}
;// CONCATENATED MODULE: ./src/hotpocket-contract.js







const hotpocket_contract_fs = __nccwpck_require2_(147);
const tty = __nccwpck_require2_(224);

class HotPocketContract {

    #controlChannel = null;
    #clientProtocol = null;
    #forceTerminate = false;

    init(contractFunc, clientProtocol = common.clientProtocols.json, forceTerminate = false) {

        return new Promise(resolve => {
            if (this.#controlChannel) { // Already initialized.
                resolve(false);
                return;
            }

            this.#clientProtocol = clientProtocol;

            // Check whether we are running on a console and provide error.
            if (tty.isatty(process.stdin.fd)) {
                console.error("Error: HotPocket smart contracts must be executed via HotPocket.");
                resolve(false);
                return;
            }

            this.#forceTerminate = forceTerminate;

            // Parse HotPocket args.
            hotpocket_contract_fs.readFile(process.stdin.fd, 'utf8', (err, argsJson) => {
                const hpargs = JSON.parse(argsJson);
                this.#controlChannel = new ControlChannel(hpargs.control_fd);
                this.#executeContract(hpargs, contractFunc);
                resolve(true);
            });
        });
    }

    #executeContract(hpargs, contractFunc) {
        // Keeps track of all the tasks (promises) that must be awaited before the termination.
        const pendingTasks = [];
        const nplChannel = new NplChannel(hpargs.npl_fd);

        const users = new UsersCollection(hpargs.user_in_fd, hpargs.users, this.#clientProtocol);
        const unl = new UnlCollection(hpargs.readonly, hpargs.unl, nplChannel, pendingTasks);
        const executionContext = new ContractContext(hpargs, users, unl, this.#controlChannel);

        (0,common.invokeCallback)(contractFunc, executionContext).catch(common.errHandler).finally(() => {
            // Wait for any pending tasks added during execution.
            Promise.all(pendingTasks).catch(common.errHandler).finally(() => {
                nplChannel.close();
                this.#terminate();
            });
        });
    }

    #terminate() {
        this.#controlChannel.close();
        if (this.#forceTerminate)
            process.kill(process.pid, 'SIGINT');
    }
}

/***/ }),

/***/ 53:
/***/ ((module, __unused_webpack_exports, __nccwpck_require2_) => {

const { clientProtocols, constants } = __nccwpck_require2_(782);
const { HotPocketContract } = __nccwpck_require2_(244);

module.exports = {
    Contract: HotPocketContract,
    clientProtocols,
    POST_EXEC_SCRIPT_NAME: constants.POST_EXEC_SCRIPT_NAME,
}

/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = __nccwpck_require__(147);

/***/ }),

/***/ 224:
/***/ ((module) => {

"use strict";
module.exports = __nccwpck_require__(224);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require2_(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require2_);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require2_.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require2_.o(definition, key) && !__nccwpck_require2_.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require2_.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require2_.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require2_ !== 'undefined') __nccwpck_require2_.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require2_(53);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;

/***/ }),

/***/ 729:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = require(__nccwpck_require__.ab + "build/Release/node_sqlite3.node");


/***/ }),

/***/ 946:
/***/ ((module, exports, __nccwpck_require__) => {

const path = __nccwpck_require__(17);
const sqlite3 = __nccwpck_require__(729);
const EventEmitter = (__nccwpck_require__(361).EventEmitter);
module.exports = exports = sqlite3;

function normalizeMethod (fn) {
    return function (sql) {
        let errBack;
        const args = Array.prototype.slice.call(arguments, 1);

        if (typeof args[args.length - 1] === 'function') {
            const callback = args[args.length - 1];
            errBack = function(err) {
                if (err) {
                    callback(err);
                }
            };
        }
        const statement = new Statement(this, sql, errBack);
        return fn.call(this, statement, args);
    };
}

function inherits(target, source) {
    for (const k in source.prototype)
        target.prototype[k] = source.prototype[k];
}

sqlite3.cached = {
    Database: function(file, a, b) {
        if (file === '' || file === ':memory:') {
            // Don't cache special databases.
            return new Database(file, a, b);
        }

        let db;
        file = path.resolve(file);

        if (!sqlite3.cached.objects[file]) {
            db = sqlite3.cached.objects[file] = new Database(file, a, b);
        }
        else {
            // Make sure the callback is called.
            db = sqlite3.cached.objects[file];
            const callback = (typeof a === 'number') ? b : a;
            if (typeof callback === 'function') {
                function cb() { callback.call(db, null); }
                if (db.open) process.nextTick(cb);
                else db.once('open', cb);
            }
        }

        return db;
    },
    objects: {}
};


const Database = sqlite3.Database;
const Statement = sqlite3.Statement;
const Backup = sqlite3.Backup;

inherits(Database, EventEmitter);
inherits(Statement, EventEmitter);
inherits(Backup, EventEmitter);

// Database#prepare(sql, [bind1, bind2, ...], [callback])
Database.prototype.prepare = normalizeMethod(function(statement, params) {
    return params.length
        ? statement.bind.apply(statement, params)
        : statement;
});

// Database#run(sql, [bind1, bind2, ...], [callback])
Database.prototype.run = normalizeMethod(function(statement, params) {
    statement.run.apply(statement, params).finalize();
    return this;
});

// Database#get(sql, [bind1, bind2, ...], [callback])
Database.prototype.get = normalizeMethod(function(statement, params) {
    statement.get.apply(statement, params).finalize();
    return this;
});

// Database#all(sql, [bind1, bind2, ...], [callback])
Database.prototype.all = normalizeMethod(function(statement, params) {
    statement.all.apply(statement, params).finalize();
    return this;
});

// Database#each(sql, [bind1, bind2, ...], [callback], [complete])
Database.prototype.each = normalizeMethod(function(statement, params) {
    statement.each.apply(statement, params).finalize();
    return this;
});

Database.prototype.map = normalizeMethod(function(statement, params) {
    statement.map.apply(statement, params).finalize();
    return this;
});

// Database#backup(filename, [callback])
// Database#backup(filename, destName, sourceName, filenameIsDest, [callback])
Database.prototype.backup = function() {
    let backup;
    if (arguments.length <= 2) {
        // By default, we write the main database out to the main database of the named file.
        // This is the most likely use of the backup api.
        backup = new Backup(this, arguments[0], 'main', 'main', true, arguments[1]);
    } else {
        // Otherwise, give the user full control over the sqlite3_backup_init arguments.
        backup = new Backup(this, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
    }
    // Per the sqlite docs, exclude the following errors as non-fatal by default.
    backup.retryErrors = [sqlite3.BUSY, sqlite3.LOCKED];
    return backup;
};

Statement.prototype.map = function() {
    const params = Array.prototype.slice.call(arguments);
    const callback = params.pop();
    params.push(function(err, rows) {
        if (err) return callback(err);
        const result = {};
        if (rows.length) {
            const keys = Object.keys(rows[0]);
            const key = keys[0];
            if (keys.length > 2) {
                // Value is an object
                for (let i = 0; i < rows.length; i++) {
                    result[rows[i][key]] = rows[i];
                }
            } else {
                const value = keys[1];
                // Value is a plain value
                for (let i = 0; i < rows.length; i++) {
                    result[rows[i][key]] = rows[i][value];
                }
            }
        }
        callback(err, result);
    });
    return this.all.apply(this, params);
};

let isVerbose = false;

const supportedEvents = [ 'trace', 'profile', 'change' ];

Database.prototype.addListener = Database.prototype.on = function(type) {
    const val = EventEmitter.prototype.addListener.apply(this, arguments);
    if (supportedEvents.indexOf(type) >= 0) {
        this.configure(type, true);
    }
    return val;
};

Database.prototype.removeListener = function(type) {
    const val = EventEmitter.prototype.removeListener.apply(this, arguments);
    if (supportedEvents.indexOf(type) >= 0 && !this._events[type]) {
        this.configure(type, false);
    }
    return val;
};

Database.prototype.removeAllListeners = function(type) {
    const val = EventEmitter.prototype.removeAllListeners.apply(this, arguments);
    if (supportedEvents.indexOf(type) >= 0) {
        this.configure(type, false);
    }
    return val;
};

// Save the stack trace over EIO callbacks.
sqlite3.verbose = function() {
    if (!isVerbose) {
        const trace = __nccwpck_require__(209);
        [
            'prepare',
            'get',
            'run',
            'all',
            'each',
            'map',
            'close',
            'exec'
        ].forEach(function (name) {
            trace.extendTrace(Database.prototype, name);
        });
        [
            'bind',
            'get',
            'run',
            'all',
            'each',
            'map',
            'reset',
            'finalize',
        ].forEach(function (name) {
            trace.extendTrace(Statement.prototype, name);
        });
        isVerbose = true;
    }

    return sqlite3;
};


/***/ }),

/***/ 209:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

// Inspired by https://github.com/tlrobinson/long-stack-traces
const util = __nccwpck_require__(837);

function extendTrace(object, property, pos) {
    const old = object[property];
    object[property] = function() {
        const error = new Error();
        const name = object.constructor.name + '#' + property + '(' +
            Array.prototype.slice.call(arguments).map(function(el) {
                return util.inspect(el, false, 0);
            }).join(', ') + ')';

        if (typeof pos === 'undefined') pos = -1;
        if (pos < 0) pos += arguments.length;
        const cb = arguments[pos];
        if (typeof arguments[pos] === 'function') {
            arguments[pos] = function replacement() {
                const err = arguments[0];
                if (err && err.stack && !err.__augmented) {
                    err.stack = filter(err).join('\n');
                    err.stack += '\n--> in ' + name;
                    err.stack += '\n' + filter(error).slice(1).join('\n');
                    err.__augmented = true;
                }
                return cb.apply(this, arguments);
            };
        }
        return old.apply(this, arguments);
    };
}
exports.extendTrace = extendTrace;


function filter(error) {
    return error.stack.split('\n').filter(function(line) {
        return line.indexOf(__filename) < 0;
    });
}


/***/ }),

/***/ 488:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
__nccwpck_require__.r(__webpack_exports__);
/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   "EventTypes": () => (/* binding */ EventTypes)
/* harmony export */ });
const EventTypes = {
	HTTP_RESPONSE: "HTTP_RESPONSE",
	BOOKING_CREATED: "BOOKING_CREATED",
	BOOKING_UPDATED: "BOOKING_UPDATED",
	BOOKING_DELETED: "BOOKING_DELETED",
	COURT_ADDED: "COURT_ADDED",
	COURT_UPDATED: "COURT_UPDATED",
};


/***/ }),

/***/ 302:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   "w": () => (/* binding */ Tables)
/* harmony export */ });
const Tables = {
	USER: "User",
	COURT: "Court",
	COURT_BOOKING: "CourtBooking",
	BOOKING_REQUEST: "BookingRequest",
};

/***/ }),

/***/ 616:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
__nccwpck_require__.r(__webpack_exports__);
/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   "DBInitializer": () => (/* binding */ DBInitializer)
/* harmony export */ });
/* harmony import */ var _Constants_Tables__WEBPACK_IMPORTED_MODULE_0__ = __nccwpck_require__(302);


const fs = __nccwpck_require__(147);
const sqlite3 = (__nccwpck_require__(946).verbose)();
const path = __nccwpck_require__(17);
const settings = (__nccwpck_require__(419)/* .settings */ .X);

class DBInitializer {
    static #db = null;

    static async init() {
        // Initialize the database connection
        this.#db = new sqlite3.Database(settings.dbPath);

        // Create table User
        await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${_Constants_Tables__WEBPACK_IMPORTED_MODULE_0__/* .Tables.USER */ .w.USER} (
            Id INTEGER,
            XrplAddress TEXT NOT NULL UNIQUE,
            Email TEXT NOT NULL,
            Name TEXT NOT NULL,
            UserRole TEXT NOT NULL,
            Description TEXT,
            Lat REAL,
            Lng REAL,
            PRIMARY KEY("Id" AUTOINCREMENT)
        )`);

        // Create table Court
        await this.#runQuery(`
            CREATE TABLE IF NOT EXISTS ${_Constants_Tables__WEBPACK_IMPORTED_MODULE_0__/* .Tables.COURT */ .w.COURT} (
                Id INTEGER,
                Name TEXT NOT NULL,
                Location TEXT NOT NULL,
                Type TEXT NOT NULL,
                PricePerHour REAL NOT NULL,
                Email TEXT NOT NULL ,
                description TEXT,
                Availability TEXT NOT NULL,
                Image TEXT,  
                PRIMARY KEY("Id" AUTOINCREMENT)
            )
        `);

        // const userList = await this.#runSelectQuery(`SELECT COUNT(*) as count FROM ${Tables.USER}`);
        // if (userList[0].count === 0) {
        //     // Insert dummy data for Users
        //     await this.#runQuery(`INSERT INTO ${Tables.USER} (XrplAddress, Email, Name, UserRole, Description, Lat, Lng) VALUES 
        //         ('rCourtOwner1', 'owner1@example.com', 'Sports Complex A', 'CourtOwner', 'Owner of multiple courts', 34.0522, -118.2437),
        //         ('rCourtUser1', 'user1@example.com', 'John Doe', 'User', 'Public user who books courts', 40.7128, -74.0060)
        //     `);
        // }

        // const courtList = await this.#runSelectQuery(`SELECT COUNT(*) as count FROM ${Tables.COURT}`);
        // if (courtList[0].count === 0) {
        //     // Insert dummy data for Courts
        //     await this.#runQuery(`INSERT INTO ${Tables.COURT} (Name, Location, Type, PricePerHour, OwnerID, Availability) VALUES 
        //         ('Badminton Court A', 'Downtown Sports Arena', 'Badminton', 10.00, 1, 'Available'),
        //         ('Tennis Court B', 'Uptown Club', 'Tennis', 15.00, 1, 'Booked'),
        //         ('Futsal Court C', 'City Park', 'Futsal', 20.00, 1, 'Available')
        //     `);
        // }

        // Close the database connection after all queries are executed
        this.#db.close();
    }

    static #runQuery(query, params = null) {
        return new Promise((resolve, reject) => {
            this.#db.run(query, params ? params : [], function (err) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve({ lastId: this.lastID, changes: this.changes });
            });
        });
    }

    static #runSelectQuery(query, params = null) {
        return new Promise((resolve, reject) => {
            this.#db.all(query, params ? params : [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }
}

/***/ }),

/***/ 981:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
__nccwpck_require__.r(__webpack_exports__);
/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   "SharedService": () => (/* binding */ SharedService)
/* harmony export */ });
const EventEmitter = __nccwpck_require__(361);

class SharedService {
	static context = null;
	static nplEventEmitter = new EventEmitter();

	constructor(context) {
		this.context = context;
	}

	static extractAndGenerateRandomNumber(text) {
		// Extract all the numbers from the text using a regular expression
		const numbersArray = text.match(/\d+/g);

		const intArray = numbersArray.map(number => parseInt(number, 10));

		// Combine the extracted numbers into a single number
		const total = intArray.reduce(
			(accumulator, currentValue) => accumulator + currentValue,
			0
		);
		const totalLength = total.toString().length;

		// Generate a random number with a length between 4 to 7 digits
		const minDigits = 4;
		const maxDigits = 7;
		const randomLength =
			Math.floor(Math.random() * (maxDigits - minDigits + 1)) + minDigits;

		const randomNumberLength =
			totalLength > randomLength ? randomLength : totalLength;

		let randomNumber = "";
		for (let i = 0; i < randomNumberLength; i++) {
			const digit = Math.floor(Math.random() * 10); // Generate a random digit (0-9)
			randomNumber += digit.toString();
		}
		return parseInt(randomNumber, 10);
	}

	/**
	 *
	 * @param seed
	 * @param min
	 * @param max
	 * @returns a number
	 */
	static generateSeededRandom(seed, min, max) {
		seed = ((seed % 1e10) + 1e10) % 1e10;
		let num = Math.sin(seed) * 10000;
		num -= Math.floor(num);
		let random = Math.floor(num * (max - min + 1)) + min;

		return random;
	}

	/**
	 * Convert unix timestamps to ISO8601 format. (eg: '2023-10-04T05:59:42.384Z' )
	 * @param milliseconds Number
	 * @returns {string} Timestamp string
	 */
	static getUtcISOStringFromUnixTimestamp(milliseconds) {
		const date = new Date(milliseconds);

		// Formatting the date in standard UTC format (2023-10-04T05:59:42.384Z')
		const utcDateString = date.toISOString();
		return utcDateString;
	}

	/**
	 * Current context timestamp in ISO format. ( eg: '2023-10-04T05:59:42.384Z' )
	 * @returns {string}
	 */
	static getCurrentTimestamp() {
		return this.getUtcISOStringFromUnixTimestamp(this.context.timestamp);
	}

	static generateConcurrencyKey() {
		const timestamp = this.getCurrentTimestamp();
		const extractedTimestamp = timestamp.replace(/\D/g, ""); // Extract numeric characters

		// Convert extracted timestamp to hexadecimal and pad to 14 characters
		const timestampHex = Number(extractedTimestamp)
			.toString(16)
			.toUpperCase()
			.padStart(14, "0");

		// Calculate the checksum based on the length of the hexadecimal string
		const checksum = 16 - timestampHex.length;

		// Add checksum to the beginning of the hexadecimal string and prefix with "0x"
		const concurrencyKey = `0x${"0".repeat(checksum)}${timestampHex}`;

		return concurrencyKey;
	}

	/**
	 * Paginates Data.
	 * @param data Array
	 * @param page Number
	 * @param perPage Number
	 * @returns {Object}
	 */
	static paginate(data, page, perPage) {
		const startIndex = (page - 1) * perPage;
		const endIndex = startIndex + perPage;
		const paginatedData = data.slice(startIndex, endIndex);
		return {
			data: paginatedData,
			page,
			totalPages: Math.ceil(data.length / perPage),
		};
	}

	static objectArraySort = (arrayObj, fieldName) => {
		if (arrayObj.length > 0) {
			return arrayObj.sort((ob1, ob2) => {
				const text1 = ob1[fieldName].toLowerCase();
				const text2 = ob2[fieldName].toLowerCase();

				if (text1 < text2) {
					return -1;
				}
				if (text1 > text2) {
					return 1;
				}
				return 0;
			});
		}
		return arrayObj;
	};
}


/***/ }),

/***/ 72:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
/* harmony export */ __nccwpck_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _SharedService__WEBPACK_IMPORTED_MODULE_0__ = __nccwpck_require__(981);


const sqlite3 = (__nccwpck_require__(946).verbose)();

const DataTypes = {
	TEXT: "TEXT",
	INTEGER: "INTEGER",
	NULL: "NULL",
};

class SqliteDatabase {
	constructor(dbFile) {
		this.dbFile = dbFile;
		this.openConnections = 0;
	}

	open() {
		// Make sure only one connection is open at a time.
		// If a connection is already open increase the connection count.
		// This guarantees only one connection is open even if open() is called before closing the previous connections.
		if (this.openConnections <= 0) {
			this.db = new sqlite3.Database(this.dbFile);
			this.openConnections = 1;
		} else this.openConnections++;
	}

	close() {
		// Only close the connection for the last open connection.
		// Otherwise keep decreasing until connection count is 1.
		// This prevents closing the connection even if close() is called while db is used by another open session.
		if (this.openConnections <= 1) {
			this.db.close();
			this.db = null;
			this.openConnections = 0;
		} else this.openConnections--;
	}

	async createTableIfNotExists(tableName, columnInfo) {
		if (!this.db) throw "Database connection is not open.";

		const columns = columnInfo
			.map(c => {
				let info = `${c.name} ${c.type}`;
				if (c.default) info += ` DEFAULT ${c.default}`;
				if (c.unique) info += " UNIQUE";
				if (c.primary) info += " PRIMARY KEY";
				if (c.notNull) info += " NOT NULL";
				return info;
			})
			.join(", ");

		const query = `CREATE TABLE IF NOT EXISTS ${tableName}(${columns})`;
		await this.runQuery(query);
	}

	isTableExists(tableName) {
		const query = `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`;
		return new Promise((resolve, reject) => {
			this.db.all(query, [], function (err, rows) {
				if (err) {
					reject(err);
					return;
				}

				resolve(!!(rows.length && rows.length > 0));
			});
		});
	}

	/**
	 *
	 * @param tableName
	 * @param filter An object
	 * @param op defaults to '=' . Or 'IN'
	 * @returns {Promise<unknown>} An array of objects || Empty array if no record found
	 */
	getValues(tableName, filter = null, op = "=") {
		if (!this.db) throw "Database connection is not open.";

		let values = [];
		// let filterStr = "1 AND ";
		let filterStr = "";
		if (filter) {
			// console.log(filter);
			const columnNames = Object.keys(filter);

			if (op === "IN") {
				for (const columnName of columnNames) {
					if (filter[columnName].length > 0) {
						filterStr += `${columnName} ${op} ( `;

						const valArray = filter[columnName];
						for (const v of valArray) {
							filterStr += `?, `;
							values.push(v);
						}

						filterStr = filterStr.slice(0, -2);
						filterStr += `) AND `;
					}
				}
			} else {
				for (const columnName of columnNames) {
					filterStr += `${columnName} ${op} ? AND `;
					values.push(filter[columnName] ? filter[columnName] : "NULL");
				}
			}
		}
		filterStr = filterStr.slice(0, -5);

		const query =
			`SELECT * FROM ${tableName}` + (filterStr ? ` WHERE ${filterStr};` : ";");
		console.log("Query: " + query);
		return new Promise((resolve, reject) => {
			let rows = [];
			this.db.each(
				query,
				values,
				function (err, row) {
					if (err) {
						console.log(err);
						reject(err);
						return;
					}

					rows.push(row);
				},
				function (err, count) {
					if (err) {
						reject(err);
						return;
					}
					resolve(rows);
				}
			);
		});
	}

	/**
	 *
	 * @param query String with ? marks for the places where params need to bound
	 * @param params An array of params
	 * @returns {Promise<Array>}   If no records, empty array will be returned.
	 */
	async runSelectQuery(query, params = []) {
		return new Promise((resolve, reject) => {
			this.db.all(query, params, (err, rows) => {
				if (err) {
					console.error("Error running query:", err.message);
					reject(err);
				} else {
					resolve(rows);
				}
			});
		});
	}

	async getLastRecord(tableName) {
		const query = `SELECT * FROM ${tableName} ORDER BY rowid DESC LIMIT 1`;
		// Execute the query and return the result
		return new Promise((resolve, reject) => {
			this.db.get(query, (err, row) => {
				if (err) {
					console.error(err.message);
					reject(err.message);
				} else {
					resolve(row);
				}
			});
		});
	}

	async insertValue(tableName, value) {
		return await this.insertValues(tableName, [value]);
	}

	async updateValue(tableName, value, filter = null) {
		if (!this.db) throw "Database connection is not open.";

		let columnNames = Object.keys(value);

		let valueStr = "";
		let values = [];
		for (const columnName of columnNames) {
			valueStr += `${columnName} = ?,`;
			values.push(value[columnName] ? value[columnName] : "NULL");
		}
		valueStr = valueStr.slice(0, -1);

		let filterStr = "1 AND ";
		if (filter) {
			columnNames = Object.keys(filter);
			for (const columnName of columnNames) {
				filterStr += `${columnName} = ? AND `;
				values.push(filter[columnName] ? filter[columnName] : "NULL");
			}
		}
		filterStr = filterStr.slice(0, -5);

		const query = `UPDATE ${tableName} SET ${valueStr} WHERE ${filterStr};`;
		return await this.runQuery(query, values);
	}

	async insertValues(tableName, values) {
		if (!this.db) throw "Database connection is not open.";
		if (values.length) {
			const columnNames = Object.keys(values[0]);

			let rowValueStr = "";
			let rowValues = [];
			for (const val of values) {
				rowValueStr += "(";
				for (const columnName of columnNames) {
					rowValueStr += "?,";
					rowValues.push(val[columnName] ?? "NULL");
				}
				rowValueStr = rowValueStr.slice(0, -1) + "),";
			}
			rowValueStr = rowValueStr.slice(0, -1);

			const query = `INSERT INTO ${tableName}(${columnNames.join(
				", "
			)}) VALUES ${rowValueStr}`;
			console.log("====================================================>");
			console.log("Query: ", query);
			console.log("rowValues: ", rowValues);
			console.log("====================================================>");
			return await this.runQuery(query, rowValues);
		}
	}

	/**
	 *  Returns a number indicating the number of rows deleted otherwise 0.
	 * @param tableName
	 * @param filter
	 * @returns {Promise<{lastId: number, changes: number}>}  Changes represent the no of records deleted.
	 */
	async deleteValues(tableName, filter = null) {
		if (!this.db) throw "Database connection is not open.";

		let values = [];
		let filterStr = "1 AND ";
		if (filter) {
			const columnNames = Object.keys(filter);
			for (const columnName of columnNames) {
				filterStr += `${columnName} = ? AND `;
				values.push(filter[columnName] ? filter[columnName] : "NULL");
			}
		}
		filterStr = filterStr.slice(0, -5);

		const query = `DELETE FROM ${tableName} WHERE ${filterStr};`;
		return await this.runQuery(query, values);
	}

	/**
	 * Ret
	 * @param query
	 * @param params An array of params
	 * @returns {Promise<{lastId, changes}>}
	 */
	runQuery(query, params = null) {
		return new Promise((resolve, reject) => {
			this.db.run(query, params ? params : [], function (err) {
				if (err) {
					reject(err);
				}
				resolve({ lastId: this.lastID, changes: this.changes });
			});
		});
	}

	/**
	 *
	 * @param table
	 * @param id Record Id
	 * @param newData  An object with fields that have updates
	 * @param expectedConcurrencyKey
	 * @returns {Promise<string>} 'Success' or Error Object
	 */
	updateWithConcurrencyCheck(table, id, newData, expectedConcurrencyKey) {
		if (!this.db) {
			throw new Error("Database connection is not open.");
		}

		return new Promise((resolve, reject) => {
			this.db.get(
				`SELECT ConcurrencyKey FROM ${table} WHERE Id = ?`,
				[id],
				(err, row) => {
					if (err) {
						reject(new Error("Database error: " + err.message));
					} else if (!row) {
						reject(new Error("Database error: Record not found"));
					} else if (row.ConcurrencyKey !== expectedConcurrencyKey) {
						reject(new Error("Concurrency conflicts"));
					} else {
						const newConcurrencyKey = _SharedService__WEBPACK_IMPORTED_MODULE_0__.SharedService.generateConcurrencyKey();

						const setClauses = Object.keys(newData)
							.map(key => `${key} = ?`)
							.join(", ");

						const updateQuery = `UPDATE ${table}
                                 SET ${setClauses}, ConcurrencyKey = ?
                                 WHERE Id = ?`;
						const updateValues = [
							...Object.values(newData),
							newConcurrencyKey,
							id,
						];

						this.db.run(updateQuery, updateValues, err => {
							if (err) {
								reject(new Error("Database error: " + err.message));
							}
							resolve("Success");
						});
					}
				}
			);
		});
	}

	/**
	 * Returns a record object found by Id. If no record found, undefined will be returned.
	 * @param tableName
	 * @param id
	 * @returns {Promise<object | undefined>}
	 */
	async findById(tableName, id) {
		if (!this.db) throw "Database connection is not open.";

		const query = `SELECT * FROM ${tableName} WHERE Id = ${id}`;

		// Execute the query and return the result
		return new Promise((resolve, reject) => {
			this.db.get(query, (err, row) => {
				if (err) {
					console.error(err.message);
					reject(err.message);
				} else {
					resolve(row);
				}
			});
		});
	}

	// Function to insert rows into a SQLite table
	async insertRowsIntoTable(tableName, rowDataArray) {
		// Prepare the SQL statement for inserting rows
		const insertStatement = `INSERT INTO ${tableName} VALUES (${rowDataArray
			.map(() => "?")
			.join(", ")})`;

		// Begin a transaction
		this.db.serialize(() => {
			// Prepare the statement
			const stmt = db.prepare(insertStatement);

			// Insert each row
			rowDataArray.forEach(rowData => {
				stmt.run(rowData, err => {
					if (err) {
						console.error("Error inserting row:", err.message);
					}
				});
			});

			// Finalize the statement
			stmt.finalize(err => {
				if (err) {
					console.error("Error finalizing statement:", err.message);
				}
			});
		});
	}
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
	SqliteDatabase,
	DataTypes,
});


/***/ }),

/***/ 656:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
// ESM COMPAT FLAG
__nccwpck_require__.r(__webpack_exports__);

// EXPORTS
__nccwpck_require__.d(__webpack_exports__, {
  "Controller": () => (/* binding */ Controller)
});

;// CONCATENATED MODULE: ./src/Constants/ServiceTypes.js
// filepath: /Users/user/cbs-contract/court-booking-system-contract/src/Constants/ServiceTypes.js
const ServiceTypes = {
    User: "User",
    Court: "Court", // Ensure this matches the incoming request's type
};

// EXTERNAL MODULE: ./src/Constants/Tables.js
var Tables = __nccwpck_require__(302);
;// CONCATENATED MODULE: ./src/Services/Domain.Services/UserService.js
const settings = (__nccwpck_require__(419)/* .settings */ .X);
const { SqliteDatabase } = (__nccwpck_require__(72)/* ["default"] */ .Z);


class UserService {
	#message = null;
	#dbPath = settings.dbPath;
	#dbContext = null;

	constructor(message) {
		this.#message = message;
		this.#dbContext = new SqliteDatabase(this.#dbPath);
	}

	async registerUser() {
		let resObj = {};
		resObj.reqId = this.#message.reqId;

		try {
			this.#dbContext.open();
			const data = this.#message.data;

			const userEntity = {
				xrplAddress: data.xrplAddress,
				email: data.email,
				name: data.name,
				userRole: data.userRole,
				description: data.description,
				lat: data.lat,
				lng: data.lng,
			};

			const rowId = await this.#dbContext.insertValue(Tables/* Tables.USER */.w.USER, userEntity);
			resObj.success = { message:"Registered user successfully", rowId: rowId };
			return resObj;
		} catch (error) {
		} finally {
			this.#dbContext.close();
		}
	}

	async getUserList() {
		let resObj = {};
		try {
			await this.#dbContext.open();

			let query = `SELECT * FROM USER`;

			let userRows = await this.#dbContext.runSelectQuery(query);

			console.log(userRows);

			if (!(userRows && userRows.length > 0)) {
				resObj.success = null;
				return resObj;
			}
			resObj.success = userRows;
			return resObj;
		} catch (error) {
			console.log("Error in listing users: ", error);
		} finally {
			this.#dbContext.close();
		}
	}

	async checkIfUserExists(){
		let resObj = {};
		const email = this.#message.data?.email;
		console.log("checkIfUserExists user email: ",email );

		try {
			await this.#dbContext.open();

			let query = `SELECT * FROM USER WHERE Email = '${email}'`;

			let userRows = await this.#dbContext.runSelectQuery(query);
			console.log("userRows: ",userRows );
			if (!(userRows && userRows.length > 0)) {
				resObj.success = null;
				return resObj;
			}
			resObj.success = userRows;
			return resObj;
		} catch (error) {
			console.log("Error in checking user: ", error);
		} finally {
			this.#dbContext.close();
		}
	}

	async getFoodRecipientList(){
		let resObj = {};

		try {
			await this.#dbContext.open();

			let query = `SELECT * FROM USER WHERE UserRole = 'FoodRecipient'`;

			let userRows = await this.#dbContext.runSelectQuery(query);

			if (!(userRows && userRows.length > 0)) {
				resObj.success = null;
				return resObj;
			}
			resObj.success = userRows;
			return resObj;
		} catch (error) {
			console.log("Error in listing food recipients: ", error);
		} finally {
			this.#dbContext.close();
		}
	}
}

;// CONCATENATED MODULE: ./src/Controllers/User.Controller.js


class UserController {
	#message = null;
	#service = null;

	constructor(message) {
		this.#message = message;
		this.#service = new UserService(message);
	}

	async handleRequest() {
		try {
			switch (this.#message.subType) {
				case "checkIfUserExists":
					return await this.#service.checkIfUserExists();
				case "getUserList":
					return await this.#service.getUserList();
				case "registerUser":
					return await this.#service.registerUser();
				case "getFoodRecipientList":
					return await this.#service.getFoodRecipientList();
				default:
					return { error: "Invalid request subType.", request: this.#message };
			}
		} catch (error) {
			return { error: error };
		}
	}
}
;// CONCATENATED MODULE: ./src/Services/Domain.Services/CourtService.js
const CourtService_settings = (__nccwpck_require__(419)/* .settings */ .X);
const { SqliteDatabase: CourtService_SqliteDatabase } = (__nccwpck_require__(72)/* ["default"] */ .Z);


class CourtService {
    #message = null;
    #dbPath = CourtService_settings.dbPath;
    #dbContext = null;

    constructor(message) {
        this.#message = message;
        this.#dbContext = new CourtService_SqliteDatabase(this.#dbPath);
    }

    async addCourt(data) {
        let resObj = {};
        resObj.reqId = this.#message.reqId;

        try {
            // Validate input data
            if (
                !data.Name ||
                !data.Location ||
                !data.Type ||
                !data.PricePerHour ||
                !data.Email ||
                !data.Availability
            ) {
                throw new Error(
                    "Missing required fields: Name, Location, Type, PricePerHour, Email, or Availability."
                );
            }

            await this.#dbContext.open();

            // Populate courtEntity with the provided data
            const courtEntity = {
                Name: data.Name,
                Location: data.Location,
                Type: data.Type,
                PricePerHour: data.PricePerHour,
                Email: data.Email,
                description: data.description || null,
                Availability: data.Availability,
                Image: data.Image || null,
            };

            // Insert the courtEntity into the database
            const rowId = await this.#dbContext.insertValue(Tables/* Tables.COURT */.w.COURT, courtEntity);

            resObj.success = { message: "Court added successfully", rowId: rowId };
            return resObj;
        } catch (error) {
            console.log("Error in adding court: ", error);
            resObj.error = `Error in adding court: ${error.message}`;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }

    async editCourt(courtId, updatedData) {
        let resObj = {};
        resObj.reqId = this.#message.reqId;

        try {
            await this.#dbContext.open();

            let fields = [];
            let values = [];

            for (let key in updatedData) {
                fields.push(`${key} = ?`);
                values.push(updatedData[key]);
            }
            values.push(courtId);

            const updateQuery = `UPDATE ${Tables/* Tables.COURT */.w.COURT} SET ${fields.join(", ")} WHERE Id = ?`;
            const updateResult = await this.#dbContext.runQuery(updateQuery, values);

            resObj.success = updateResult.changes > 0 ? "Court updated successfully." : "No changes made.";
            return resObj;
        } catch (error) {
            console.log("Error in editing court: ", error);
            resObj.error = `Error in editing court: ${error.message}`;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }

    async deleteCourt(courtId) {
        let resObj = {};
        resObj.reqId = this.#message.reqId;

        try {
            await this.#dbContext.open();

            const deleteQuery = `DELETE FROM ${Tables/* Tables.COURT */.w.COURT} WHERE Id = ?`;
            const result = await this.#dbContext.runQuery(deleteQuery, [courtId]);

            resObj.success = result.changes > 0 ? "Court deleted successfully." : "No court found to delete.";
            return resObj;
        } catch (error) {
            console.log("Error in deleting court: ", error);
            resObj.error = `Error in deleting court: ${error.message}`;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }

    async getAllCourts() {
        let resObj = {};
        try {
            await this.#dbContext.open();

            const query = `SELECT * FROM ${Tables/* Tables.COURT */.w.COURT}`;
            const courts = await this.#dbContext.runSelectQuery(query);

            resObj.success = courts.length > 0 ? courts : null;
            return resObj;
        } catch (error) {
            console.log("Error in retrieving courts: ", error);
            resObj.error = `Error in retrieving courts: ${error.message}`;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }

    async getCourtByOwner(ownerEmail) {
        let resObj = {};
        try {
            await this.#dbContext.open();

            const query = `SELECT * FROM ${Tables/* Tables.COURT */.w.COURT} WHERE Email = ?`;
            const courts = await this.#dbContext.runSelectQuery(query, [ownerEmail]);

            resObj.success = courts.length > 0 ? courts : null;
            return resObj;
        } catch (error) {
            console.log("Error in retrieving owner's courts: ", error);
            resObj.error = `Error in retrieving owner's courts: ${error.message}`;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }
}
;// CONCATENATED MODULE: ./src/Controllers/Court.Controller.js


class CourtController {
    #message = null;
    #service = null;

    constructor(message) {
        this.#message = message;
        this.#service = new CourtService(message);
    }

    async handleRequest() {
        try {
            console.log("Handling Court request with subType:", this.#message.subType);

            switch (this.#message.subType) {
                case "addCourt":
                    if (!this.#message.data || Object.keys(this.#message.data).length === 0) {
                        return { error: "Invalid request. Data object is empty or missing.", request: this.#message };
                    }
                    return await this.#service.addCourt(this.#message.data);

                case "editCourt":
                    if (!this.#message.data || !this.#message.data.courtId || !this.#message.data.updatedData) {
                        return { error: "Missing courtId or updatedData in request." };
                    }
                    return await this.#service.editCourt(this.#message.data.courtId, this.#message.data.updatedData);

                case "deleteCourt":
                    if (!this.#message.data || !this.#message.data.courtId) {
                        return { error: "Missing courtId in request." };
                    }
                    return await this.#service.deleteCourt(this.#message.data.courtId);

                case "getAllCourts":
                    return await this.#service.getAllCourts();

                case "getCourtByOwner":
                    if (!this.#message.data || !this.#message.data.email) {
                        return { error: "Missing owner email in request." };
                    }
                    return await this.#service.getCourtByOwner(this.#message.data.email);

                default:
                    console.error("Invalid subType:", this.#message.subType);
                    return { error: "Invalid request subType.", request: this.#message };
            }
        } catch (error) {
            console.error("Error in CourtController:", error);
            return { error: error.message || "An unexpected error occurred.", request: this.#message };
        }
    }
}
;// CONCATENATED MODULE: ./src/controller.js



const controller_settings = (__nccwpck_require__(419)/* .settings */ .X);

class Controller {
    dbPath = controller_settings.dbPath;
    #userController = null;
    #courtController = null;

    async handleRequest(user, message, isReadOnly) {
        this.#userController = new UserController(message);
        this.#courtController = new CourtController(message);

        console.log("Received message type:", message.type); // Log the message type

        let result = {};

        // Route the request based on the message type
        if (message.type === ServiceTypes.User) {
            console.log("Routing to UserController...");
            result = await this.handleUserRequest();
        } else if (message.type === ServiceTypes.Court) {
            console.log("Routing to CourtController...");
            result = await this.handleCourtRequest();
        } else {
            console.error("Invalid request type:", message.type); // Log invalid type
            result = { success: "Invalid request type", message: message, messageType: message.type };
        }

        // Send the response
        if (isReadOnly) {
            await this.sendOutput(user, result);
        } else {
            await this.sendOutput(
                user,
                message.promiseId ? { promiseId: message.promiseId, ...result } : result
            );
        }
    }

    async handleUserRequest() {
        return await this.#userController.handleRequest();
    }

    async handleCourtRequest() {
        return await this.#courtController.handleRequest();
    }

    sendOutput = async (user, response) => {
        console.log("Sending response to user: ", response);
        await user.send(response);
        console.log("Response sent to user");
    };
}


/***/ }),

/***/ 113:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 361:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 17:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 224:
/***/ ((module) => {

"use strict";
module.exports = require("tty");

/***/ }),

/***/ 837:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ 618:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


function isAnyArrayBuffer(value) {
    return ['[object ArrayBuffer]', '[object SharedArrayBuffer]'].includes(Object.prototype.toString.call(value));
}
function isUint8Array(value) {
    return Object.prototype.toString.call(value) === '[object Uint8Array]';
}
function isRegExp(d) {
    return Object.prototype.toString.call(d) === '[object RegExp]';
}
function isMap(d) {
    return Object.prototype.toString.call(d) === '[object Map]';
}
function isDate(d) {
    return Object.prototype.toString.call(d) === '[object Date]';
}

const BSON_MAJOR_VERSION = 5;
const BSON_INT32_MAX = 0x7fffffff;
const BSON_INT32_MIN = -0x80000000;
const BSON_INT64_MAX = Math.pow(2, 63) - 1;
const BSON_INT64_MIN = -Math.pow(2, 63);
const JS_INT_MAX = Math.pow(2, 53);
const JS_INT_MIN = -Math.pow(2, 53);
const BSON_DATA_NUMBER = 1;
const BSON_DATA_STRING = 2;
const BSON_DATA_OBJECT = 3;
const BSON_DATA_ARRAY = 4;
const BSON_DATA_BINARY = 5;
const BSON_DATA_UNDEFINED = 6;
const BSON_DATA_OID = 7;
const BSON_DATA_BOOLEAN = 8;
const BSON_DATA_DATE = 9;
const BSON_DATA_NULL = 10;
const BSON_DATA_REGEXP = 11;
const BSON_DATA_DBPOINTER = 12;
const BSON_DATA_CODE = 13;
const BSON_DATA_SYMBOL = 14;
const BSON_DATA_CODE_W_SCOPE = 15;
const BSON_DATA_INT = 16;
const BSON_DATA_TIMESTAMP = 17;
const BSON_DATA_LONG = 18;
const BSON_DATA_DECIMAL128 = 19;
const BSON_DATA_MIN_KEY = 0xff;
const BSON_DATA_MAX_KEY = 0x7f;
const BSON_BINARY_SUBTYPE_DEFAULT = 0;
const BSON_BINARY_SUBTYPE_UUID_NEW = 4;
const BSONType = Object.freeze({
    double: 1,
    string: 2,
    object: 3,
    array: 4,
    binData: 5,
    undefined: 6,
    objectId: 7,
    bool: 8,
    date: 9,
    null: 10,
    regex: 11,
    dbPointer: 12,
    javascript: 13,
    symbol: 14,
    javascriptWithScope: 15,
    int: 16,
    timestamp: 17,
    long: 18,
    decimal: 19,
    minKey: -1,
    maxKey: 127
});

class BSONError extends Error {
    get bsonError() {
        return true;
    }
    get name() {
        return 'BSONError';
    }
    constructor(message) {
        super(message);
    }
    static isBSONError(value) {
        return (value != null &&
            typeof value === 'object' &&
            'bsonError' in value &&
            value.bsonError === true &&
            'name' in value &&
            'message' in value &&
            'stack' in value);
    }
}
class BSONVersionError extends BSONError {
    get name() {
        return 'BSONVersionError';
    }
    constructor() {
        super(`Unsupported BSON version, bson types must be from bson ${BSON_MAJOR_VERSION}.x.x`);
    }
}
class BSONRuntimeError extends BSONError {
    get name() {
        return 'BSONRuntimeError';
    }
    constructor(message) {
        super(message);
    }
}

function nodejsMathRandomBytes(byteLength) {
    return nodeJsByteUtils.fromNumberArray(Array.from({ length: byteLength }, () => Math.floor(Math.random() * 256)));
}
const nodejsRandomBytes = (() => {
    try {
        return (__nccwpck_require__(113).randomBytes);
    }
    catch {
        return nodejsMathRandomBytes;
    }
})();
const nodeJsByteUtils = {
    toLocalBufferType(potentialBuffer) {
        if (Buffer.isBuffer(potentialBuffer)) {
            return potentialBuffer;
        }
        if (ArrayBuffer.isView(potentialBuffer)) {
            return Buffer.from(potentialBuffer.buffer, potentialBuffer.byteOffset, potentialBuffer.byteLength);
        }
        const stringTag = potentialBuffer?.[Symbol.toStringTag] ?? Object.prototype.toString.call(potentialBuffer);
        if (stringTag === 'ArrayBuffer' ||
            stringTag === 'SharedArrayBuffer' ||
            stringTag === '[object ArrayBuffer]' ||
            stringTag === '[object SharedArrayBuffer]') {
            return Buffer.from(potentialBuffer);
        }
        throw new BSONError(`Cannot create Buffer from ${String(potentialBuffer)}`);
    },
    allocate(size) {
        return Buffer.alloc(size);
    },
    equals(a, b) {
        return nodeJsByteUtils.toLocalBufferType(a).equals(b);
    },
    fromNumberArray(array) {
        return Buffer.from(array);
    },
    fromBase64(base64) {
        return Buffer.from(base64, 'base64');
    },
    toBase64(buffer) {
        return nodeJsByteUtils.toLocalBufferType(buffer).toString('base64');
    },
    fromISO88591(codePoints) {
        return Buffer.from(codePoints, 'binary');
    },
    toISO88591(buffer) {
        return nodeJsByteUtils.toLocalBufferType(buffer).toString('binary');
    },
    fromHex(hex) {
        return Buffer.from(hex, 'hex');
    },
    toHex(buffer) {
        return nodeJsByteUtils.toLocalBufferType(buffer).toString('hex');
    },
    fromUTF8(text) {
        return Buffer.from(text, 'utf8');
    },
    toUTF8(buffer, start, end) {
        return nodeJsByteUtils.toLocalBufferType(buffer).toString('utf8', start, end);
    },
    utf8ByteLength(input) {
        return Buffer.byteLength(input, 'utf8');
    },
    encodeUTF8Into(buffer, source, byteOffset) {
        return nodeJsByteUtils.toLocalBufferType(buffer).write(source, byteOffset, undefined, 'utf8');
    },
    randomBytes: nodejsRandomBytes
};

function isReactNative() {
    const { navigator } = globalThis;
    return typeof navigator === 'object' && navigator.product === 'ReactNative';
}
function webMathRandomBytes(byteLength) {
    if (byteLength < 0) {
        throw new RangeError(`The argument 'byteLength' is invalid. Received ${byteLength}`);
    }
    return webByteUtils.fromNumberArray(Array.from({ length: byteLength }, () => Math.floor(Math.random() * 256)));
}
const webRandomBytes = (() => {
    const { crypto } = globalThis;
    if (crypto != null && typeof crypto.getRandomValues === 'function') {
        return (byteLength) => {
            return crypto.getRandomValues(webByteUtils.allocate(byteLength));
        };
    }
    else {
        if (isReactNative()) {
            const { console } = globalThis;
            console?.warn?.('BSON: For React Native please polyfill crypto.getRandomValues, e.g. using: https://www.npmjs.com/package/react-native-get-random-values.');
        }
        return webMathRandomBytes;
    }
})();
const HEX_DIGIT = /(\d|[a-f])/i;
const webByteUtils = {
    toLocalBufferType(potentialUint8array) {
        const stringTag = potentialUint8array?.[Symbol.toStringTag] ??
            Object.prototype.toString.call(potentialUint8array);
        if (stringTag === 'Uint8Array') {
            return potentialUint8array;
        }
        if (ArrayBuffer.isView(potentialUint8array)) {
            return new Uint8Array(potentialUint8array.buffer.slice(potentialUint8array.byteOffset, potentialUint8array.byteOffset + potentialUint8array.byteLength));
        }
        if (stringTag === 'ArrayBuffer' ||
            stringTag === 'SharedArrayBuffer' ||
            stringTag === '[object ArrayBuffer]' ||
            stringTag === '[object SharedArrayBuffer]') {
            return new Uint8Array(potentialUint8array);
        }
        throw new BSONError(`Cannot make a Uint8Array from ${String(potentialUint8array)}`);
    },
    allocate(size) {
        if (typeof size !== 'number') {
            throw new TypeError(`The "size" argument must be of type number. Received ${String(size)}`);
        }
        return new Uint8Array(size);
    },
    equals(a, b) {
        if (a.byteLength !== b.byteLength) {
            return false;
        }
        for (let i = 0; i < a.byteLength; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    },
    fromNumberArray(array) {
        return Uint8Array.from(array);
    },
    fromBase64(base64) {
        return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    },
    toBase64(uint8array) {
        return btoa(webByteUtils.toISO88591(uint8array));
    },
    fromISO88591(codePoints) {
        return Uint8Array.from(codePoints, c => c.charCodeAt(0) & 0xff);
    },
    toISO88591(uint8array) {
        return Array.from(Uint16Array.from(uint8array), b => String.fromCharCode(b)).join('');
    },
    fromHex(hex) {
        const evenLengthHex = hex.length % 2 === 0 ? hex : hex.slice(0, hex.length - 1);
        const buffer = [];
        for (let i = 0; i < evenLengthHex.length; i += 2) {
            const firstDigit = evenLengthHex[i];
            const secondDigit = evenLengthHex[i + 1];
            if (!HEX_DIGIT.test(firstDigit)) {
                break;
            }
            if (!HEX_DIGIT.test(secondDigit)) {
                break;
            }
            const hexDigit = Number.parseInt(`${firstDigit}${secondDigit}`, 16);
            buffer.push(hexDigit);
        }
        return Uint8Array.from(buffer);
    },
    toHex(uint8array) {
        return Array.from(uint8array, byte => byte.toString(16).padStart(2, '0')).join('');
    },
    fromUTF8(text) {
        return new TextEncoder().encode(text);
    },
    toUTF8(uint8array, start, end) {
        return new TextDecoder('utf8', { fatal: false }).decode(uint8array.slice(start, end));
    },
    utf8ByteLength(input) {
        return webByteUtils.fromUTF8(input).byteLength;
    },
    encodeUTF8Into(buffer, source, byteOffset) {
        const bytes = webByteUtils.fromUTF8(source);
        buffer.set(bytes, byteOffset);
        return bytes.byteLength;
    },
    randomBytes: webRandomBytes
};

const hasGlobalBuffer = typeof Buffer === 'function' && Buffer.prototype?._isBuffer !== true;
const ByteUtils = hasGlobalBuffer ? nodeJsByteUtils : webByteUtils;
class BSONDataView extends DataView {
    static fromUint8Array(input) {
        return new DataView(input.buffer, input.byteOffset, input.byteLength);
    }
}

class BSONValue {
    get [Symbol.for('@@mdb.bson.version')]() {
        return BSON_MAJOR_VERSION;
    }
}

class Binary extends BSONValue {
    get _bsontype() {
        return 'Binary';
    }
    constructor(buffer, subType) {
        super();
        if (!(buffer == null) &&
            !(typeof buffer === 'string') &&
            !ArrayBuffer.isView(buffer) &&
            !(buffer instanceof ArrayBuffer) &&
            !Array.isArray(buffer)) {
            throw new BSONError('Binary can only be constructed from string, Buffer, TypedArray, or Array<number>');
        }
        this.sub_type = subType ?? Binary.BSON_BINARY_SUBTYPE_DEFAULT;
        if (buffer == null) {
            this.buffer = ByteUtils.allocate(Binary.BUFFER_SIZE);
            this.position = 0;
        }
        else {
            if (typeof buffer === 'string') {
                this.buffer = ByteUtils.fromISO88591(buffer);
            }
            else if (Array.isArray(buffer)) {
                this.buffer = ByteUtils.fromNumberArray(buffer);
            }
            else {
                this.buffer = ByteUtils.toLocalBufferType(buffer);
            }
            this.position = this.buffer.byteLength;
        }
    }
    put(byteValue) {
        if (typeof byteValue === 'string' && byteValue.length !== 1) {
            throw new BSONError('only accepts single character String');
        }
        else if (typeof byteValue !== 'number' && byteValue.length !== 1)
            throw new BSONError('only accepts single character Uint8Array or Array');
        let decodedByte;
        if (typeof byteValue === 'string') {
            decodedByte = byteValue.charCodeAt(0);
        }
        else if (typeof byteValue === 'number') {
            decodedByte = byteValue;
        }
        else {
            decodedByte = byteValue[0];
        }
        if (decodedByte < 0 || decodedByte > 255) {
            throw new BSONError('only accepts number in a valid unsigned byte range 0-255');
        }
        if (this.buffer.byteLength > this.position) {
            this.buffer[this.position++] = decodedByte;
        }
        else {
            const newSpace = ByteUtils.allocate(Binary.BUFFER_SIZE + this.buffer.length);
            newSpace.set(this.buffer, 0);
            this.buffer = newSpace;
            this.buffer[this.position++] = decodedByte;
        }
    }
    write(sequence, offset) {
        offset = typeof offset === 'number' ? offset : this.position;
        if (this.buffer.byteLength < offset + sequence.length) {
            const newSpace = ByteUtils.allocate(this.buffer.byteLength + sequence.length);
            newSpace.set(this.buffer, 0);
            this.buffer = newSpace;
        }
        if (ArrayBuffer.isView(sequence)) {
            this.buffer.set(ByteUtils.toLocalBufferType(sequence), offset);
            this.position =
                offset + sequence.byteLength > this.position ? offset + sequence.length : this.position;
        }
        else if (typeof sequence === 'string') {
            const bytes = ByteUtils.fromISO88591(sequence);
            this.buffer.set(bytes, offset);
            this.position =
                offset + sequence.length > this.position ? offset + sequence.length : this.position;
        }
    }
    read(position, length) {
        length = length && length > 0 ? length : this.position;
        return this.buffer.slice(position, position + length);
    }
    value(asRaw) {
        asRaw = !!asRaw;
        if (asRaw && this.buffer.length === this.position) {
            return this.buffer;
        }
        if (asRaw) {
            return this.buffer.slice(0, this.position);
        }
        return ByteUtils.toISO88591(this.buffer.subarray(0, this.position));
    }
    length() {
        return this.position;
    }
    toJSON() {
        return ByteUtils.toBase64(this.buffer);
    }
    toString(encoding) {
        if (encoding === 'hex')
            return ByteUtils.toHex(this.buffer);
        if (encoding === 'base64')
            return ByteUtils.toBase64(this.buffer);
        if (encoding === 'utf8' || encoding === 'utf-8')
            return ByteUtils.toUTF8(this.buffer, 0, this.buffer.byteLength);
        return ByteUtils.toUTF8(this.buffer, 0, this.buffer.byteLength);
    }
    toExtendedJSON(options) {
        options = options || {};
        const base64String = ByteUtils.toBase64(this.buffer);
        const subType = Number(this.sub_type).toString(16);
        if (options.legacy) {
            return {
                $binary: base64String,
                $type: subType.length === 1 ? '0' + subType : subType
            };
        }
        return {
            $binary: {
                base64: base64String,
                subType: subType.length === 1 ? '0' + subType : subType
            }
        };
    }
    toUUID() {
        if (this.sub_type === Binary.SUBTYPE_UUID) {
            return new UUID(this.buffer.slice(0, this.position));
        }
        throw new BSONError(`Binary sub_type "${this.sub_type}" is not supported for converting to UUID. Only "${Binary.SUBTYPE_UUID}" is currently supported.`);
    }
    static createFromHexString(hex, subType) {
        return new Binary(ByteUtils.fromHex(hex), subType);
    }
    static createFromBase64(base64, subType) {
        return new Binary(ByteUtils.fromBase64(base64), subType);
    }
    static fromExtendedJSON(doc, options) {
        options = options || {};
        let data;
        let type;
        if ('$binary' in doc) {
            if (options.legacy && typeof doc.$binary === 'string' && '$type' in doc) {
                type = doc.$type ? parseInt(doc.$type, 16) : 0;
                data = ByteUtils.fromBase64(doc.$binary);
            }
            else {
                if (typeof doc.$binary !== 'string') {
                    type = doc.$binary.subType ? parseInt(doc.$binary.subType, 16) : 0;
                    data = ByteUtils.fromBase64(doc.$binary.base64);
                }
            }
        }
        else if ('$uuid' in doc) {
            type = 4;
            data = UUID.bytesFromString(doc.$uuid);
        }
        if (!data) {
            throw new BSONError(`Unexpected Binary Extended JSON format ${JSON.stringify(doc)}`);
        }
        return type === BSON_BINARY_SUBTYPE_UUID_NEW ? new UUID(data) : new Binary(data, type);
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.inspect();
    }
    inspect() {
        const base64 = ByteUtils.toBase64(this.buffer.subarray(0, this.position));
        return `Binary.createFromBase64("${base64}", ${this.sub_type})`;
    }
}
Binary.BSON_BINARY_SUBTYPE_DEFAULT = 0;
Binary.BUFFER_SIZE = 256;
Binary.SUBTYPE_DEFAULT = 0;
Binary.SUBTYPE_FUNCTION = 1;
Binary.SUBTYPE_BYTE_ARRAY = 2;
Binary.SUBTYPE_UUID_OLD = 3;
Binary.SUBTYPE_UUID = 4;
Binary.SUBTYPE_MD5 = 5;
Binary.SUBTYPE_ENCRYPTED = 6;
Binary.SUBTYPE_COLUMN = 7;
Binary.SUBTYPE_USER_DEFINED = 128;
const UUID_BYTE_LENGTH = 16;
const UUID_WITHOUT_DASHES = /^[0-9A-F]{32}$/i;
const UUID_WITH_DASHES = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;
class UUID extends Binary {
    constructor(input) {
        let bytes;
        if (input == null) {
            bytes = UUID.generate();
        }
        else if (input instanceof UUID) {
            bytes = ByteUtils.toLocalBufferType(new Uint8Array(input.buffer));
        }
        else if (ArrayBuffer.isView(input) && input.byteLength === UUID_BYTE_LENGTH) {
            bytes = ByteUtils.toLocalBufferType(input);
        }
        else if (typeof input === 'string') {
            bytes = UUID.bytesFromString(input);
        }
        else {
            throw new BSONError('Argument passed in UUID constructor must be a UUID, a 16 byte Buffer or a 32/36 character hex string (dashes excluded/included, format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).');
        }
        super(bytes, BSON_BINARY_SUBTYPE_UUID_NEW);
    }
    get id() {
        return this.buffer;
    }
    set id(value) {
        this.buffer = value;
    }
    toHexString(includeDashes = true) {
        if (includeDashes) {
            return [
                ByteUtils.toHex(this.buffer.subarray(0, 4)),
                ByteUtils.toHex(this.buffer.subarray(4, 6)),
                ByteUtils.toHex(this.buffer.subarray(6, 8)),
                ByteUtils.toHex(this.buffer.subarray(8, 10)),
                ByteUtils.toHex(this.buffer.subarray(10, 16))
            ].join('-');
        }
        return ByteUtils.toHex(this.buffer);
    }
    toString(encoding) {
        if (encoding === 'hex')
            return ByteUtils.toHex(this.id);
        if (encoding === 'base64')
            return ByteUtils.toBase64(this.id);
        return this.toHexString();
    }
    toJSON() {
        return this.toHexString();
    }
    equals(otherId) {
        if (!otherId) {
            return false;
        }
        if (otherId instanceof UUID) {
            return ByteUtils.equals(otherId.id, this.id);
        }
        try {
            return ByteUtils.equals(new UUID(otherId).id, this.id);
        }
        catch {
            return false;
        }
    }
    toBinary() {
        return new Binary(this.id, Binary.SUBTYPE_UUID);
    }
    static generate() {
        const bytes = ByteUtils.randomBytes(UUID_BYTE_LENGTH);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        return bytes;
    }
    static isValid(input) {
        if (!input) {
            return false;
        }
        if (typeof input === 'string') {
            return UUID.isValidUUIDString(input);
        }
        if (isUint8Array(input)) {
            return input.byteLength === UUID_BYTE_LENGTH;
        }
        return (input._bsontype === 'Binary' &&
            input.sub_type === this.SUBTYPE_UUID &&
            input.buffer.byteLength === 16);
    }
    static createFromHexString(hexString) {
        const buffer = UUID.bytesFromString(hexString);
        return new UUID(buffer);
    }
    static createFromBase64(base64) {
        return new UUID(ByteUtils.fromBase64(base64));
    }
    static bytesFromString(representation) {
        if (!UUID.isValidUUIDString(representation)) {
            throw new BSONError('UUID string representation must be 32 hex digits or canonical hyphenated representation');
        }
        return ByteUtils.fromHex(representation.replace(/-/g, ''));
    }
    static isValidUUIDString(representation) {
        return UUID_WITHOUT_DASHES.test(representation) || UUID_WITH_DASHES.test(representation);
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.inspect();
    }
    inspect() {
        return `new UUID("${this.toHexString()}")`;
    }
}
UUID.cacheHexString = false;

class Code extends BSONValue {
    get _bsontype() {
        return 'Code';
    }
    constructor(code, scope) {
        super();
        this.code = code.toString();
        this.scope = scope ?? null;
    }
    toJSON() {
        if (this.scope != null) {
            return { code: this.code, scope: this.scope };
        }
        return { code: this.code };
    }
    toExtendedJSON() {
        if (this.scope) {
            return { $code: this.code, $scope: this.scope };
        }
        return { $code: this.code };
    }
    static fromExtendedJSON(doc) {
        return new Code(doc.$code, doc.$scope);
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.inspect();
    }
    inspect() {
        const codeJson = this.toJSON();
        return `new Code("${String(codeJson.code)}"${codeJson.scope != null ? `, ${JSON.stringify(codeJson.scope)}` : ''})`;
    }
}

function isDBRefLike(value) {
    return (value != null &&
        typeof value === 'object' &&
        '$id' in value &&
        value.$id != null &&
        '$ref' in value &&
        typeof value.$ref === 'string' &&
        (!('$db' in value) || ('$db' in value && typeof value.$db === 'string')));
}
class DBRef extends BSONValue {
    get _bsontype() {
        return 'DBRef';
    }
    constructor(collection, oid, db, fields) {
        super();
        const parts = collection.split('.');
        if (parts.length === 2) {
            db = parts.shift();
            collection = parts.shift();
        }
        this.collection = collection;
        this.oid = oid;
        this.db = db;
        this.fields = fields || {};
    }
    get namespace() {
        return this.collection;
    }
    set namespace(value) {
        this.collection = value;
    }
    toJSON() {
        const o = Object.assign({
            $ref: this.collection,
            $id: this.oid
        }, this.fields);
        if (this.db != null)
            o.$db = this.db;
        return o;
    }
    toExtendedJSON(options) {
        options = options || {};
        let o = {
            $ref: this.collection,
            $id: this.oid
        };
        if (options.legacy) {
            return o;
        }
        if (this.db)
            o.$db = this.db;
        o = Object.assign(o, this.fields);
        return o;
    }
    static fromExtendedJSON(doc) {
        const copy = Object.assign({}, doc);
        delete copy.$ref;
        delete copy.$id;
        delete copy.$db;
        return new DBRef(doc.$ref, doc.$id, doc.$db, copy);
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.inspect();
    }
    inspect() {
        const oid = this.oid === undefined || this.oid.toString === undefined ? this.oid : this.oid.toString();
        return `new DBRef("${this.namespace}", new ObjectId("${String(oid)}")${this.db ? `, "${this.db}"` : ''})`;
    }
}

let wasm = undefined;
try {
    wasm = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11])), {}).exports;
}
catch {
}
const TWO_PWR_16_DBL = 1 << 16;
const TWO_PWR_24_DBL = 1 << 24;
const TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
const TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
const TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
const INT_CACHE = {};
const UINT_CACHE = {};
const MAX_INT64_STRING_LENGTH = 20;
const DECIMAL_REG_EX = /^(\+?0|(\+|-)?[1-9][0-9]*)$/;
class Long extends BSONValue {
    get _bsontype() {
        return 'Long';
    }
    get __isLong__() {
        return true;
    }
    constructor(low = 0, high, unsigned) {
        super();
        if (typeof low === 'bigint') {
            Object.assign(this, Long.fromBigInt(low, !!high));
        }
        else if (typeof low === 'string') {
            Object.assign(this, Long.fromString(low, !!high));
        }
        else {
            this.low = low | 0;
            this.high = high | 0;
            this.unsigned = !!unsigned;
        }
    }
    static fromBits(lowBits, highBits, unsigned) {
        return new Long(lowBits, highBits, unsigned);
    }
    static fromInt(value, unsigned) {
        let obj, cachedObj, cache;
        if (unsigned) {
            value >>>= 0;
            if ((cache = 0 <= value && value < 256)) {
                cachedObj = UINT_CACHE[value];
                if (cachedObj)
                    return cachedObj;
            }
            obj = Long.fromBits(value, (value | 0) < 0 ? -1 : 0, true);
            if (cache)
                UINT_CACHE[value] = obj;
            return obj;
        }
        else {
            value |= 0;
            if ((cache = -128 <= value && value < 128)) {
                cachedObj = INT_CACHE[value];
                if (cachedObj)
                    return cachedObj;
            }
            obj = Long.fromBits(value, value < 0 ? -1 : 0, false);
            if (cache)
                INT_CACHE[value] = obj;
            return obj;
        }
    }
    static fromNumber(value, unsigned) {
        if (isNaN(value))
            return unsigned ? Long.UZERO : Long.ZERO;
        if (unsigned) {
            if (value < 0)
                return Long.UZERO;
            if (value >= TWO_PWR_64_DBL)
                return Long.MAX_UNSIGNED_VALUE;
        }
        else {
            if (value <= -TWO_PWR_63_DBL)
                return Long.MIN_VALUE;
            if (value + 1 >= TWO_PWR_63_DBL)
                return Long.MAX_VALUE;
        }
        if (value < 0)
            return Long.fromNumber(-value, unsigned).neg();
        return Long.fromBits(value % TWO_PWR_32_DBL | 0, (value / TWO_PWR_32_DBL) | 0, unsigned);
    }
    static fromBigInt(value, unsigned) {
        return Long.fromString(value.toString(), unsigned);
    }
    static fromString(str, unsigned, radix) {
        if (str.length === 0)
            throw new BSONError('empty string');
        if (str === 'NaN' || str === 'Infinity' || str === '+Infinity' || str === '-Infinity')
            return Long.ZERO;
        if (typeof unsigned === 'number') {
            (radix = unsigned), (unsigned = false);
        }
        else {
            unsigned = !!unsigned;
        }
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
            throw new BSONError('radix');
        let p;
        if ((p = str.indexOf('-')) > 0)
            throw new BSONError('interior hyphen');
        else if (p === 0) {
            return Long.fromString(str.substring(1), unsigned, radix).neg();
        }
        const radixToPower = Long.fromNumber(Math.pow(radix, 8));
        let result = Long.ZERO;
        for (let i = 0; i < str.length; i += 8) {
            const size = Math.min(8, str.length - i), value = parseInt(str.substring(i, i + size), radix);
            if (size < 8) {
                const power = Long.fromNumber(Math.pow(radix, size));
                result = result.mul(power).add(Long.fromNumber(value));
            }
            else {
                result = result.mul(radixToPower);
                result = result.add(Long.fromNumber(value));
            }
        }
        result.unsigned = unsigned;
        return result;
    }
    static fromBytes(bytes, unsigned, le) {
        return le ? Long.fromBytesLE(bytes, unsigned) : Long.fromBytesBE(bytes, unsigned);
    }
    static fromBytesLE(bytes, unsigned) {
        return new Long(bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24), bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24), unsigned);
    }
    static fromBytesBE(bytes, unsigned) {
        return new Long((bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7], (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3], unsigned);
    }
    static isLong(value) {
        return (value != null &&
            typeof value === 'object' &&
            '__isLong__' in value &&
            value.__isLong__ === true);
    }
    static fromValue(val, unsigned) {
        if (typeof val === 'number')
            return Long.fromNumber(val, unsigned);
        if (typeof val === 'string')
            return Long.fromString(val, unsigned);
        return Long.fromBits(val.low, val.high, typeof unsigned === 'boolean' ? unsigned : val.unsigned);
    }
    add(addend) {
        if (!Long.isLong(addend))
            addend = Long.fromValue(addend);
        const a48 = this.high >>> 16;
        const a32 = this.high & 0xffff;
        const a16 = this.low >>> 16;
        const a00 = this.low & 0xffff;
        const b48 = addend.high >>> 16;
        const b32 = addend.high & 0xffff;
        const b16 = addend.low >>> 16;
        const b00 = addend.low & 0xffff;
        let c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 + b00;
        c16 += c00 >>> 16;
        c00 &= 0xffff;
        c16 += a16 + b16;
        c32 += c16 >>> 16;
        c16 &= 0xffff;
        c32 += a32 + b32;
        c48 += c32 >>> 16;
        c32 &= 0xffff;
        c48 += a48 + b48;
        c48 &= 0xffff;
        return Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    }
    and(other) {
        if (!Long.isLong(other))
            other = Long.fromValue(other);
        return Long.fromBits(this.low & other.low, this.high & other.high, this.unsigned);
    }
    compare(other) {
        if (!Long.isLong(other))
            other = Long.fromValue(other);
        if (this.eq(other))
            return 0;
        const thisNeg = this.isNegative(), otherNeg = other.isNegative();
        if (thisNeg && !otherNeg)
            return -1;
        if (!thisNeg && otherNeg)
            return 1;
        if (!this.unsigned)
            return this.sub(other).isNegative() ? -1 : 1;
        return other.high >>> 0 > this.high >>> 0 ||
            (other.high === this.high && other.low >>> 0 > this.low >>> 0)
            ? -1
            : 1;
    }
    comp(other) {
        return this.compare(other);
    }
    divide(divisor) {
        if (!Long.isLong(divisor))
            divisor = Long.fromValue(divisor);
        if (divisor.isZero())
            throw new BSONError('division by zero');
        if (wasm) {
            if (!this.unsigned &&
                this.high === -0x80000000 &&
                divisor.low === -1 &&
                divisor.high === -1) {
                return this;
            }
            const low = (this.unsigned ? wasm.div_u : wasm.div_s)(this.low, this.high, divisor.low, divisor.high);
            return Long.fromBits(low, wasm.get_high(), this.unsigned);
        }
        if (this.isZero())
            return this.unsigned ? Long.UZERO : Long.ZERO;
        let approx, rem, res;
        if (!this.unsigned) {
            if (this.eq(Long.MIN_VALUE)) {
                if (divisor.eq(Long.ONE) || divisor.eq(Long.NEG_ONE))
                    return Long.MIN_VALUE;
                else if (divisor.eq(Long.MIN_VALUE))
                    return Long.ONE;
                else {
                    const halfThis = this.shr(1);
                    approx = halfThis.div(divisor).shl(1);
                    if (approx.eq(Long.ZERO)) {
                        return divisor.isNegative() ? Long.ONE : Long.NEG_ONE;
                    }
                    else {
                        rem = this.sub(divisor.mul(approx));
                        res = approx.add(rem.div(divisor));
                        return res;
                    }
                }
            }
            else if (divisor.eq(Long.MIN_VALUE))
                return this.unsigned ? Long.UZERO : Long.ZERO;
            if (this.isNegative()) {
                if (divisor.isNegative())
                    return this.neg().div(divisor.neg());
                return this.neg().div(divisor).neg();
            }
            else if (divisor.isNegative())
                return this.div(divisor.neg()).neg();
            res = Long.ZERO;
        }
        else {
            if (!divisor.unsigned)
                divisor = divisor.toUnsigned();
            if (divisor.gt(this))
                return Long.UZERO;
            if (divisor.gt(this.shru(1)))
                return Long.UONE;
            res = Long.UZERO;
        }
        rem = this;
        while (rem.gte(divisor)) {
            approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));
            const log2 = Math.ceil(Math.log(approx) / Math.LN2);
            const delta = log2 <= 48 ? 1 : Math.pow(2, log2 - 48);
            let approxRes = Long.fromNumber(approx);
            let approxRem = approxRes.mul(divisor);
            while (approxRem.isNegative() || approxRem.gt(rem)) {
                approx -= delta;
                approxRes = Long.fromNumber(approx, this.unsigned);
                approxRem = approxRes.mul(divisor);
            }
            if (approxRes.isZero())
                approxRes = Long.ONE;
            res = res.add(approxRes);
            rem = rem.sub(approxRem);
        }
        return res;
    }
    div(divisor) {
        return this.divide(divisor);
    }
    equals(other) {
        if (!Long.isLong(other))
            other = Long.fromValue(other);
        if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1)
            return false;
        return this.high === other.high && this.low === other.low;
    }
    eq(other) {
        return this.equals(other);
    }
    getHighBits() {
        return this.high;
    }
    getHighBitsUnsigned() {
        return this.high >>> 0;
    }
    getLowBits() {
        return this.low;
    }
    getLowBitsUnsigned() {
        return this.low >>> 0;
    }
    getNumBitsAbs() {
        if (this.isNegative()) {
            return this.eq(Long.MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
        }
        const val = this.high !== 0 ? this.high : this.low;
        let bit;
        for (bit = 31; bit > 0; bit--)
            if ((val & (1 << bit)) !== 0)
                break;
        return this.high !== 0 ? bit + 33 : bit + 1;
    }
    greaterThan(other) {
        return this.comp(other) > 0;
    }
    gt(other) {
        return this.greaterThan(other);
    }
    greaterThanOrEqual(other) {
        return this.comp(other) >= 0;
    }
    gte(other) {
        return this.greaterThanOrEqual(other);
    }
    ge(other) {
        return this.greaterThanOrEqual(other);
    }
    isEven() {
        return (this.low & 1) === 0;
    }
    isNegative() {
        return !this.unsigned && this.high < 0;
    }
    isOdd() {
        return (this.low & 1) === 1;
    }
    isPositive() {
        return this.unsigned || this.high >= 0;
    }
    isZero() {
        return this.high === 0 && this.low === 0;
    }
    lessThan(other) {
        return this.comp(other) < 0;
    }
    lt(other) {
        return this.lessThan(other);
    }
    lessThanOrEqual(other) {
        return this.comp(other) <= 0;
    }
    lte(other) {
        return this.lessThanOrEqual(other);
    }
    modulo(divisor) {
        if (!Long.isLong(divisor))
            divisor = Long.fromValue(divisor);
        if (wasm) {
            const low = (this.unsigned ? wasm.rem_u : wasm.rem_s)(this.low, this.high, divisor.low, divisor.high);
            return Long.fromBits(low, wasm.get_high(), this.unsigned);
        }
        return this.sub(this.div(divisor).mul(divisor));
    }
    mod(divisor) {
        return this.modulo(divisor);
    }
    rem(divisor) {
        return this.modulo(divisor);
    }
    multiply(multiplier) {
        if (this.isZero())
            return Long.ZERO;
        if (!Long.isLong(multiplier))
            multiplier = Long.fromValue(multiplier);
        if (wasm) {
            const low = wasm.mul(this.low, this.high, multiplier.low, multiplier.high);
            return Long.fromBits(low, wasm.get_high(), this.unsigned);
        }
        if (multiplier.isZero())
            return Long.ZERO;
        if (this.eq(Long.MIN_VALUE))
            return multiplier.isOdd() ? Long.MIN_VALUE : Long.ZERO;
        if (multiplier.eq(Long.MIN_VALUE))
            return this.isOdd() ? Long.MIN_VALUE : Long.ZERO;
        if (this.isNegative()) {
            if (multiplier.isNegative())
                return this.neg().mul(multiplier.neg());
            else
                return this.neg().mul(multiplier).neg();
        }
        else if (multiplier.isNegative())
            return this.mul(multiplier.neg()).neg();
        if (this.lt(Long.TWO_PWR_24) && multiplier.lt(Long.TWO_PWR_24))
            return Long.fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);
        const a48 = this.high >>> 16;
        const a32 = this.high & 0xffff;
        const a16 = this.low >>> 16;
        const a00 = this.low & 0xffff;
        const b48 = multiplier.high >>> 16;
        const b32 = multiplier.high & 0xffff;
        const b16 = multiplier.low >>> 16;
        const b00 = multiplier.low & 0xffff;
        let c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 * b00;
        c16 += c00 >>> 16;
        c00 &= 0xffff;
        c16 += a16 * b00;
        c32 += c16 >>> 16;
        c16 &= 0xffff;
        c16 += a00 * b16;
        c32 += c16 >>> 16;
        c16 &= 0xffff;
        c32 += a32 * b00;
        c48 += c32 >>> 16;
        c32 &= 0xffff;
        c32 += a16 * b16;
        c48 += c32 >>> 16;
        c32 &= 0xffff;
        c32 += a00 * b32;
        c48 += c32 >>> 16;
        c32 &= 0xffff;
        c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
        c48 &= 0xffff;
        return Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    }
    mul(multiplier) {
        return this.multiply(multiplier);
    }
    negate() {
        if (!this.unsigned && this.eq(Long.MIN_VALUE))
            return Long.MIN_VALUE;
        return this.not().add(Long.ONE);
    }
    neg() {
        return this.negate();
    }
    not() {
        return Long.fromBits(~this.low, ~this.high, this.unsigned);
    }
    notEquals(other) {
        return !this.equals(other);
    }
    neq(other) {
        return this.notEquals(other);
    }
    ne(other) {
        return this.notEquals(other);
    }
    or(other) {
        if (!Long.isLong(other))
            other = Long.fromValue(other);
        return Long.fromBits(this.low | other.low, this.high | other.high, this.unsigned);
    }
    shiftLeft(numBits) {
        if (Long.isLong(numBits))
            numBits = numBits.toInt();
        if ((numBits &= 63) === 0)
            return this;
        else if (numBits < 32)
            return Long.fromBits(this.low << numBits, (this.high << numBits) | (this.low >>> (32 - numBits)), this.unsigned);
        else
            return Long.fromBits(0, this.low << (numBits - 32), this.unsigned);
    }
    shl(numBits) {
        return this.shiftLeft(numBits);
    }
    shiftRight(numBits) {
        if (Long.isLong(numBits))
            numBits = numBits.toInt();
        if ((numBits &= 63) === 0)
            return this;
        else if (numBits < 32)
            return Long.fromBits((this.low >>> numBits) | (this.high << (32 - numBits)), this.high >> numBits, this.unsigned);
        else
            return Long.fromBits(this.high >> (numBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
    }
    shr(numBits) {
        return this.shiftRight(numBits);
    }
    shiftRightUnsigned(numBits) {
        if (Long.isLong(numBits))
            numBits = numBits.toInt();
        numBits &= 63;
        if (numBits === 0)
            return this;
        else {
            const high = this.high;
            if (numBits < 32) {
                const low = this.low;
                return Long.fromBits((low >>> numBits) | (high << (32 - numBits)), high >>> numBits, this.unsigned);
            }
            else if (numBits === 32)
                return Long.fromBits(high, 0, this.unsigned);
            else
                return Long.fromBits(high >>> (numBits - 32), 0, this.unsigned);
        }
    }
    shr_u(numBits) {
        return this.shiftRightUnsigned(numBits);
    }
    shru(numBits) {
        return this.shiftRightUnsigned(numBits);
    }
    subtract(subtrahend) {
        if (!Long.isLong(subtrahend))
            subtrahend = Long.fromValue(subtrahend);
        return this.add(subtrahend.neg());
    }
    sub(subtrahend) {
        return this.subtract(subtrahend);
    }
    toInt() {
        return this.unsigned ? this.low >>> 0 : this.low;
    }
    toNumber() {
        if (this.unsigned)
            return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
        return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
    }
    toBigInt() {
        return BigInt(this.toString());
    }
    toBytes(le) {
        return le ? this.toBytesLE() : this.toBytesBE();
    }
    toBytesLE() {
        const hi = this.high, lo = this.low;
        return [
            lo & 0xff,
            (lo >>> 8) & 0xff,
            (lo >>> 16) & 0xff,
            lo >>> 24,
            hi & 0xff,
            (hi >>> 8) & 0xff,
            (hi >>> 16) & 0xff,
            hi >>> 24
        ];
    }
    toBytesBE() {
        const hi = this.high, lo = this.low;
        return [
            hi >>> 24,
            (hi >>> 16) & 0xff,
            (hi >>> 8) & 0xff,
            hi & 0xff,
            lo >>> 24,
            (lo >>> 16) & 0xff,
            (lo >>> 8) & 0xff,
            lo & 0xff
        ];
    }
    toSigned() {
        if (!this.unsigned)
            return this;
        return Long.fromBits(this.low, this.high, false);
    }
    toString(radix) {
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
            throw new BSONError('radix');
        if (this.isZero())
            return '0';
        if (this.isNegative()) {
            if (this.eq(Long.MIN_VALUE)) {
                const radixLong = Long.fromNumber(radix), div = this.div(radixLong), rem1 = div.mul(radixLong).sub(this);
                return div.toString(radix) + rem1.toInt().toString(radix);
            }
            else
                return '-' + this.neg().toString(radix);
        }
        const radixToPower = Long.fromNumber(Math.pow(radix, 6), this.unsigned);
        let rem = this;
        let result = '';
        while (true) {
            const remDiv = rem.div(radixToPower);
            const intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0;
            let digits = intval.toString(radix);
            rem = remDiv;
            if (rem.isZero()) {
                return digits + result;
            }
            else {
                while (digits.length < 6)
                    digits = '0' + digits;
                result = '' + digits + result;
            }
        }
    }
    toUnsigned() {
        if (this.unsigned)
            return this;
        return Long.fromBits(this.low, this.high, true);
    }
    xor(other) {
        if (!Long.isLong(other))
            other = Long.fromValue(other);
        return Long.fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
    }
    eqz() {
        return this.isZero();
    }
    le(other) {
        return this.lessThanOrEqual(other);
    }
    toExtendedJSON(options) {
        if (options && options.relaxed)
            return this.toNumber();
        return { $numberLong: this.toString() };
    }
    static fromExtendedJSON(doc, options) {
        const { useBigInt64 = false, relaxed = true } = { ...options };
        if (doc.$numberLong.length > MAX_INT64_STRING_LENGTH) {
            throw new BSONError('$numberLong string is too long');
        }
        if (!DECIMAL_REG_EX.test(doc.$numberLong)) {
            throw new BSONError(`$numberLong string "${doc.$numberLong}" is in an invalid format`);
        }
        if (useBigInt64) {
            const bigIntResult = BigInt(doc.$numberLong);
            return BigInt.asIntN(64, bigIntResult);
        }
        const longResult = Long.fromString(doc.$numberLong);
        if (relaxed) {
            return longResult.toNumber();
        }
        return longResult;
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.inspect();
    }
    inspect() {
        return `new Long("${this.toString()}"${this.unsigned ? ', true' : ''})`;
    }
}
Long.TWO_PWR_24 = Long.fromInt(TWO_PWR_24_DBL);
Long.MAX_UNSIGNED_VALUE = Long.fromBits(0xffffffff | 0, 0xffffffff | 0, true);
Long.ZERO = Long.fromInt(0);
Long.UZERO = Long.fromInt(0, true);
Long.ONE = Long.fromInt(1);
Long.UONE = Long.fromInt(1, true);
Long.NEG_ONE = Long.fromInt(-1);
Long.MAX_VALUE = Long.fromBits(0xffffffff | 0, 0x7fffffff | 0, false);
Long.MIN_VALUE = Long.fromBits(0, 0x80000000 | 0, false);

const PARSE_STRING_REGEXP = /^(\+|-)?(\d+|(\d*\.\d*))?(E|e)?([-+])?(\d+)?$/;
const PARSE_INF_REGEXP = /^(\+|-)?(Infinity|inf)$/i;
const PARSE_NAN_REGEXP = /^(\+|-)?NaN$/i;
const EXPONENT_MAX = 6111;
const EXPONENT_MIN = -6176;
const EXPONENT_BIAS = 6176;
const MAX_DIGITS = 34;
const NAN_BUFFER = ByteUtils.fromNumberArray([
    0x7c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
].reverse());
const INF_NEGATIVE_BUFFER = ByteUtils.fromNumberArray([
    0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
].reverse());
const INF_POSITIVE_BUFFER = ByteUtils.fromNumberArray([
    0x78, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
].reverse());
const EXPONENT_REGEX = /^([-+])?(\d+)?$/;
const COMBINATION_MASK = 0x1f;
const EXPONENT_MASK = 0x3fff;
const COMBINATION_INFINITY = 30;
const COMBINATION_NAN = 31;
function isDigit(value) {
    return !isNaN(parseInt(value, 10));
}
function divideu128(value) {
    const DIVISOR = Long.fromNumber(1000 * 1000 * 1000);
    let _rem = Long.fromNumber(0);
    if (!value.parts[0] && !value.parts[1] && !value.parts[2] && !value.parts[3]) {
        return { quotient: value, rem: _rem };
    }
    for (let i = 0; i <= 3; i++) {
        _rem = _rem.shiftLeft(32);
        _rem = _rem.add(new Long(value.parts[i], 0));
        value.parts[i] = _rem.div(DIVISOR).low;
        _rem = _rem.modulo(DIVISOR);
    }
    return { quotient: value, rem: _rem };
}
function multiply64x2(left, right) {
    if (!left && !right) {
        return { high: Long.fromNumber(0), low: Long.fromNumber(0) };
    }
    const leftHigh = left.shiftRightUnsigned(32);
    const leftLow = new Long(left.getLowBits(), 0);
    const rightHigh = right.shiftRightUnsigned(32);
    const rightLow = new Long(right.getLowBits(), 0);
    let productHigh = leftHigh.multiply(rightHigh);
    let productMid = leftHigh.multiply(rightLow);
    const productMid2 = leftLow.multiply(rightHigh);
    let productLow = leftLow.multiply(rightLow);
    productHigh = productHigh.add(productMid.shiftRightUnsigned(32));
    productMid = new Long(productMid.getLowBits(), 0)
        .add(productMid2)
        .add(productLow.shiftRightUnsigned(32));
    productHigh = productHigh.add(productMid.shiftRightUnsigned(32));
    productLow = productMid.shiftLeft(32).add(new Long(productLow.getLowBits(), 0));
    return { high: productHigh, low: productLow };
}
function lessThan(left, right) {
    const uhleft = left.high >>> 0;
    const uhright = right.high >>> 0;
    if (uhleft < uhright) {
        return true;
    }
    else if (uhleft === uhright) {
        const ulleft = left.low >>> 0;
        const ulright = right.low >>> 0;
        if (ulleft < ulright)
            return true;
    }
    return false;
}
function invalidErr(string, message) {
    throw new BSONError(`"${string}" is not a valid Decimal128 string - ${message}`);
}
class Decimal128 extends BSONValue {
    get _bsontype() {
        return 'Decimal128';
    }
    constructor(bytes) {
        super();
        if (typeof bytes === 'string') {
            this.bytes = Decimal128.fromString(bytes).bytes;
        }
        else if (isUint8Array(bytes)) {
            if (bytes.byteLength !== 16) {
                throw new BSONError('Decimal128 must take a Buffer of 16 bytes');
            }
            this.bytes = bytes;
        }
        else {
            throw new BSONError('Decimal128 must take a Buffer or string');
        }
    }
    static fromString(representation) {
        return Decimal128._fromString(representation, { allowRounding: false });
    }
    static fromStringWithRounding(representation) {
        return Decimal128._fromString(representation, { allowRounding: true });
    }
    static _fromString(representation, options) {
        let isNegative = false;
        let sawSign = false;
        let sawRadix = false;
        let foundNonZero = false;
        let significantDigits = 0;
        let nDigitsRead = 0;
        let nDigits = 0;
        let radixPosition = 0;
        let firstNonZero = 0;
        const digits = [0];
        let nDigitsStored = 0;
        let digitsInsert = 0;
        let lastDigit = 0;
        let exponent = 0;
        let significandHigh = new Long(0, 0);
        let significandLow = new Long(0, 0);
        let biasedExponent = 0;
        let index = 0;
        if (representation.length >= 7000) {
            throw new BSONError('' + representation + ' not a valid Decimal128 string');
        }
        const stringMatch = representation.match(PARSE_STRING_REGEXP);
        const infMatch = representation.match(PARSE_INF_REGEXP);
        const nanMatch = representation.match(PARSE_NAN_REGEXP);
        if ((!stringMatch && !infMatch && !nanMatch) || representation.length === 0) {
            throw new BSONError('' + representation + ' not a valid Decimal128 string');
        }
        if (stringMatch) {
            const unsignedNumber = stringMatch[2];
            const e = stringMatch[4];
            const expSign = stringMatch[5];
            const expNumber = stringMatch[6];
            if (e && expNumber === undefined)
                invalidErr(representation, 'missing exponent power');
            if (e && unsignedNumber === undefined)
                invalidErr(representation, 'missing exponent base');
            if (e === undefined && (expSign || expNumber)) {
                invalidErr(representation, 'missing e before exponent');
            }
        }
        if (representation[index] === '+' || representation[index] === '-') {
            sawSign = true;
            isNegative = representation[index++] === '-';
        }
        if (!isDigit(representation[index]) && representation[index] !== '.') {
            if (representation[index] === 'i' || representation[index] === 'I') {
                return new Decimal128(isNegative ? INF_NEGATIVE_BUFFER : INF_POSITIVE_BUFFER);
            }
            else if (representation[index] === 'N') {
                return new Decimal128(NAN_BUFFER);
            }
        }
        while (isDigit(representation[index]) || representation[index] === '.') {
            if (representation[index] === '.') {
                if (sawRadix)
                    invalidErr(representation, 'contains multiple periods');
                sawRadix = true;
                index = index + 1;
                continue;
            }
            if (nDigitsStored < MAX_DIGITS) {
                if (representation[index] !== '0' || foundNonZero) {
                    if (!foundNonZero) {
                        firstNonZero = nDigitsRead;
                    }
                    foundNonZero = true;
                    digits[digitsInsert++] = parseInt(representation[index], 10);
                    nDigitsStored = nDigitsStored + 1;
                }
            }
            if (foundNonZero)
                nDigits = nDigits + 1;
            if (sawRadix)
                radixPosition = radixPosition + 1;
            nDigitsRead = nDigitsRead + 1;
            index = index + 1;
        }
        if (sawRadix && !nDigitsRead)
            throw new BSONError('' + representation + ' not a valid Decimal128 string');
        if (representation[index] === 'e' || representation[index] === 'E') {
            const match = representation.substr(++index).match(EXPONENT_REGEX);
            if (!match || !match[2])
                return new Decimal128(NAN_BUFFER);
            exponent = parseInt(match[0], 10);
            index = index + match[0].length;
        }
        if (representation[index])
            return new Decimal128(NAN_BUFFER);
        if (!nDigitsStored) {
            digits[0] = 0;
            nDigits = 1;
            nDigitsStored = 1;
            significantDigits = 0;
        }
        else {
            lastDigit = nDigitsStored - 1;
            significantDigits = nDigits;
            if (significantDigits !== 1) {
                while (representation[firstNonZero + significantDigits - 1 + Number(sawSign) + Number(sawRadix)] === '0') {
                    significantDigits = significantDigits - 1;
                }
            }
        }
        if (exponent <= radixPosition && radixPosition > exponent + (1 << 14)) {
            exponent = EXPONENT_MIN;
        }
        else {
            exponent = exponent - radixPosition;
        }
        while (exponent > EXPONENT_MAX) {
            lastDigit = lastDigit + 1;
            if (lastDigit >= MAX_DIGITS) {
                if (significantDigits === 0) {
                    exponent = EXPONENT_MAX;
                    break;
                }
                invalidErr(representation, 'overflow');
            }
            exponent = exponent - 1;
        }
        if (options.allowRounding) {
            while (exponent < EXPONENT_MIN || nDigitsStored < nDigits) {
                if (lastDigit === 0 && significantDigits < nDigitsStored) {
                    exponent = EXPONENT_MIN;
                    significantDigits = 0;
                    break;
                }
                if (nDigitsStored < nDigits) {
                    nDigits = nDigits - 1;
                }
                else {
                    lastDigit = lastDigit - 1;
                }
                if (exponent < EXPONENT_MAX) {
                    exponent = exponent + 1;
                }
                else {
                    const digitsString = digits.join('');
                    if (digitsString.match(/^0+$/)) {
                        exponent = EXPONENT_MAX;
                        break;
                    }
                    invalidErr(representation, 'overflow');
                }
            }
            if (lastDigit + 1 < significantDigits) {
                let endOfString = nDigitsRead;
                if (sawRadix) {
                    firstNonZero = firstNonZero + 1;
                    endOfString = endOfString + 1;
                }
                if (sawSign) {
                    firstNonZero = firstNonZero + 1;
                    endOfString = endOfString + 1;
                }
                const roundDigit = parseInt(representation[firstNonZero + lastDigit + 1], 10);
                let roundBit = 0;
                if (roundDigit >= 5) {
                    roundBit = 1;
                    if (roundDigit === 5) {
                        roundBit = digits[lastDigit] % 2 === 1 ? 1 : 0;
                        for (let i = firstNonZero + lastDigit + 2; i < endOfString; i++) {
                            if (parseInt(representation[i], 10)) {
                                roundBit = 1;
                                break;
                            }
                        }
                    }
                }
                if (roundBit) {
                    let dIdx = lastDigit;
                    for (; dIdx >= 0; dIdx--) {
                        if (++digits[dIdx] > 9) {
                            digits[dIdx] = 0;
                            if (dIdx === 0) {
                                if (exponent < EXPONENT_MAX) {
                                    exponent = exponent + 1;
                                    digits[dIdx] = 1;
                                }
                                else {
                                    return new Decimal128(isNegative ? INF_NEGATIVE_BUFFER : INF_POSITIVE_BUFFER);
                                }
                            }
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        }
        else {
            while (exponent < EXPONENT_MIN || nDigitsStored < nDigits) {
                if (lastDigit === 0) {
                    if (significantDigits === 0) {
                        exponent = EXPONENT_MIN;
                        break;
                    }
                    invalidErr(representation, 'exponent underflow');
                }
                if (nDigitsStored < nDigits) {
                    if (representation[nDigits - 1 + Number(sawSign) + Number(sawRadix)] !== '0' &&
                        significantDigits !== 0) {
                        invalidErr(representation, 'inexact rounding');
                    }
                    nDigits = nDigits - 1;
                }
                else {
                    if (digits[lastDigit] !== 0) {
                        invalidErr(representation, 'inexact rounding');
                    }
                    lastDigit = lastDigit - 1;
                }
                if (exponent < EXPONENT_MAX) {
                    exponent = exponent + 1;
                }
                else {
                    invalidErr(representation, 'overflow');
                }
            }
            if (lastDigit + 1 < significantDigits) {
                if (sawRadix) {
                    firstNonZero = firstNonZero + 1;
                }
                if (sawSign) {
                    firstNonZero = firstNonZero + 1;
                }
                const roundDigit = parseInt(representation[firstNonZero + lastDigit + 1], 10);
                if (roundDigit !== 0) {
                    invalidErr(representation, 'inexact rounding');
                }
            }
        }
        significandHigh = Long.fromNumber(0);
        significandLow = Long.fromNumber(0);
        if (significantDigits === 0) {
            significandHigh = Long.fromNumber(0);
            significandLow = Long.fromNumber(0);
        }
        else if (lastDigit < 17) {
            let dIdx = 0;
            significandLow = Long.fromNumber(digits[dIdx++]);
            significandHigh = new Long(0, 0);
            for (; dIdx <= lastDigit; dIdx++) {
                significandLow = significandLow.multiply(Long.fromNumber(10));
                significandLow = significandLow.add(Long.fromNumber(digits[dIdx]));
            }
        }
        else {
            let dIdx = 0;
            significandHigh = Long.fromNumber(digits[dIdx++]);
            for (; dIdx <= lastDigit - 17; dIdx++) {
                significandHigh = significandHigh.multiply(Long.fromNumber(10));
                significandHigh = significandHigh.add(Long.fromNumber(digits[dIdx]));
            }
            significandLow = Long.fromNumber(digits[dIdx++]);
            for (; dIdx <= lastDigit; dIdx++) {
                significandLow = significandLow.multiply(Long.fromNumber(10));
                significandLow = significandLow.add(Long.fromNumber(digits[dIdx]));
            }
        }
        const significand = multiply64x2(significandHigh, Long.fromString('100000000000000000'));
        significand.low = significand.low.add(significandLow);
        if (lessThan(significand.low, significandLow)) {
            significand.high = significand.high.add(Long.fromNumber(1));
        }
        biasedExponent = exponent + EXPONENT_BIAS;
        const dec = { low: Long.fromNumber(0), high: Long.fromNumber(0) };
        if (significand.high.shiftRightUnsigned(49).and(Long.fromNumber(1)).equals(Long.fromNumber(1))) {
            dec.high = dec.high.or(Long.fromNumber(0x3).shiftLeft(61));
            dec.high = dec.high.or(Long.fromNumber(biasedExponent).and(Long.fromNumber(0x3fff).shiftLeft(47)));
            dec.high = dec.high.or(significand.high.and(Long.fromNumber(0x7fffffffffff)));
        }
        else {
            dec.high = dec.high.or(Long.fromNumber(biasedExponent & 0x3fff).shiftLeft(49));
            dec.high = dec.high.or(significand.high.and(Long.fromNumber(0x1ffffffffffff)));
        }
        dec.low = significand.low;
        if (isNegative) {
            dec.high = dec.high.or(Long.fromString('9223372036854775808'));
        }
        const buffer = ByteUtils.allocate(16);
        index = 0;
        buffer[index++] = dec.low.low & 0xff;
        buffer[index++] = (dec.low.low >> 8) & 0xff;
        buffer[index++] = (dec.low.low >> 16) & 0xff;
        buffer[index++] = (dec.low.low >> 24) & 0xff;
        buffer[index++] = dec.low.high & 0xff;
        buffer[index++] = (dec.low.high >> 8) & 0xff;
        buffer[index++] = (dec.low.high >> 16) & 0xff;
        buffer[index++] = (dec.low.high >> 24) & 0xff;
        buffer[index++] = dec.high.low & 0xff;
        buffer[index++] = (dec.high.low >> 8) & 0xff;
        buffer[index++] = (dec.high.low >> 16) & 0xff;
        buffer[index++] = (dec.high.low >> 24) & 0xff;
        buffer[index++] = dec.high.high & 0xff;
        buffer[index++] = (dec.high.high >> 8) & 0xff;
        buffer[index++] = (dec.high.high >> 16) & 0xff;
        buffer[index++] = (dec.high.high >> 24) & 0xff;
        return new Decimal128(buffer);
    }
    toString() {
        let biased_exponent;
        let significand_digits = 0;
        const significand = new Array(36);
        for (let i = 0; i < significand.length; i++)
            significand[i] = 0;
        let index = 0;
        let is_zero = false;
        let significand_msb;
        let significand128 = { parts: [0, 0, 0, 0] };
        let j, k;
        const string = [];
        index = 0;
        const buffer = this.bytes;
        const low = buffer[index++] | (buffer[index++] << 8) | (buffer[index++] << 16) | (buffer[index++] << 24);
        const midl = buffer[index++] | (buffer[index++] << 8) | (buffer[index++] << 16) | (buffer[index++] << 24);
        const midh = buffer[index++] | (buffer[index++] << 8) | (buffer[index++] << 16) | (buffer[index++] << 24);
        const high = buffer[index++] | (buffer[index++] << 8) | (buffer[index++] << 16) | (buffer[index++] << 24);
        index = 0;
        const dec = {
            low: new Long(low, midl),
            high: new Long(midh, high)
        };
        if (dec.high.lessThan(Long.ZERO)) {
            string.push('-');
        }
        const combination = (high >> 26) & COMBINATION_MASK;
        if (combination >> 3 === 3) {
            if (combination === COMBINATION_INFINITY) {
                return string.join('') + 'Infinity';
            }
            else if (combination === COMBINATION_NAN) {
                return 'NaN';
            }
            else {
                biased_exponent = (high >> 15) & EXPONENT_MASK;
                significand_msb = 0x08 + ((high >> 14) & 0x01);
            }
        }
        else {
            significand_msb = (high >> 14) & 0x07;
            biased_exponent = (high >> 17) & EXPONENT_MASK;
        }
        const exponent = biased_exponent - EXPONENT_BIAS;
        significand128.parts[0] = (high & 0x3fff) + ((significand_msb & 0xf) << 14);
        significand128.parts[1] = midh;
        significand128.parts[2] = midl;
        significand128.parts[3] = low;
        if (significand128.parts[0] === 0 &&
            significand128.parts[1] === 0 &&
            significand128.parts[2] === 0 &&
            significand128.parts[3] === 0) {
            is_zero = true;
        }
        else {
            for (k = 3; k >= 0; k--) {
                let least_digits = 0;
                const result = divideu128(significand128);
                significand128 = result.quotient;
                least_digits = result.rem.low;
                if (!least_digits)
                    continue;
                for (j = 8; j >= 0; j--) {
                    significand[k * 9 + j] = least_digits % 10;
                    least_digits = Math.floor(least_digits / 10);
                }
            }
        }
        if (is_zero) {
            significand_digits = 1;
            significand[index] = 0;
        }
        else {
            significand_digits = 36;
            while (!significand[index]) {
                significand_digits = significand_digits - 1;
                index = index + 1;
            }
        }
        const scientific_exponent = significand_digits - 1 + exponent;
        if (scientific_exponent >= 34 || scientific_exponent <= -7 || exponent > 0) {
            if (significand_digits > 34) {
                string.push(`${0}`);
                if (exponent > 0)
                    string.push(`E+${exponent}`);
                else if (exponent < 0)
                    string.push(`E${exponent}`);
                return string.join('');
            }
            string.push(`${significand[index++]}`);
            significand_digits = significand_digits - 1;
            if (significand_digits) {
                string.push('.');
            }
            for (let i = 0; i < significand_digits; i++) {
                string.push(`${significand[index++]}`);
            }
            string.push('E');
            if (scientific_exponent > 0) {
                string.push(`+${scientific_exponent}`);
            }
            else {
                string.push(`${scientific_exponent}`);
            }
        }
        else {
            if (exponent >= 0) {
                for (let i = 0; i < significand_digits; i++) {
                    string.push(`${significand[index++]}`);
                }
            }
            else {
                let radix_position = significand_digits + exponent;
                if (radix_position > 0) {
                    for (let i = 0; i < radix_position; i++) {
                        string.push(`${significand[index++]}`);
                    }
                }
                else {
                    string.push('0');
                }
                string.push('.');
                while (radix_position++ < 0) {
                    string.push('0');
                }
                for (let i = 0; i < significand_digits - Math.max(radix_position - 1, 0); i++) {
                    string.push(`${significand[index++]}`);
                }
            }
        }
        return string.join('');
    }
    toJSON() {
        return { $numberDecimal: this.toString() };
    }
    toExtendedJSON() {
        return { $numberDecimal: this.toString() };
    }
    static fromExtendedJSON(doc) {
        return Decimal128.fromString(doc.$numberDecimal);
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.inspect();
    }
    inspect() {
        return `new Decimal128("${this.toString()}")`;
    }
}

class Double extends BSONValue {
    get _bsontype() {
        return 'Double';
    }
    constructor(value) {
        super();
        if (value instanceof Number) {
            value = value.valueOf();
        }
        this.value = +value;
    }
    valueOf() {
        return this.value;
    }
    toJSON() {
        return this.value;
    }
    toString(radix) {
        return this.value.toString(radix);
    }
    toExtendedJSON(options) {
        if (options && (options.legacy || (options.relaxed && isFinite(this.value)))) {
            return this.value;
        }
        if (Object.is(Math.sign(this.value), -0)) {
            return { $numberDouble: '-0.0' };
        }
        return {
            $numberDouble: Number.isInteger(this.value) ? this.value.toFixed(1) : this.value.toString()
        };
    }
    static fromExtendedJSON(doc, options) {
        const doubleValue = parseFloat(doc.$numberDouble);
        return options && options.relaxed ? doubleValue : new Double(doubleValue);
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.inspect();
    }
    inspect() {
        const eJSON = this.toExtendedJSON();
        return `new Double(${eJSON.$numberDouble})`;
    }
}

class Int32 extends BSONValue {
    get _bsontype() {
        return 'Int32';
    }
    constructor(value) {
        super();
        if (value instanceof Number) {
            value = value.valueOf();
        }
        this.value = +value | 0;
    }
    valueOf() {
        return this.value;
    }
    toString(radix) {
        return this.value.toString(radix);
    }
    toJSON() {
        return this.value;
    }
    toExtendedJSON(options) {
        if (options && (options.relaxed || options.legacy))
            return this.value;
        return { $numberInt: this.value.toString() };
    }
    static fromExtendedJSON(doc, options) {
        return options && options.relaxed ? parseInt(doc.$numberInt, 10) : new Int32(doc.$numberInt);
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.inspect();
    }
    inspect() {
        return `new Int32(${this.valueOf()})`;
    }
}

class MaxKey extends BSONValue {
    get _bsontype() {
        return 'MaxKey';
    }
    toExtendedJSON() {
        return { $maxKey: 1 };
    }
    static fromExtendedJSON() {
        return new MaxKey();
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.inspect();
    }
    inspect() {
        return 'new MaxKey()';
    }
}

class MinKey extends BSONValue {
    get _bsontype() {
        return 'MinKey';
    }
    toExtendedJSON() {
        return { $minKey: 1 };
    }
    static fromExtendedJSON() {
        return new MinKey();
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.inspect();
    }
    inspect() {
        return 'new MinKey()';
    }
}

const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');
let PROCESS_UNIQUE = null;
const kId = Symbol('id');
class ObjectId extends BSONValue {
    get _bsontype() {
        return 'ObjectId';
    }
    constructor(inputId) {
        super();
        let workingId;
        if (typeof inputId === 'object' && inputId && 'id' in inputId) {
            if (typeof inputId.id !== 'string' && !ArrayBuffer.isView(inputId.id)) {
                throw new BSONError('Argument passed in must have an id that is of type string or Buffer');
            }
            if ('toHexString' in inputId && typeof inputId.toHexString === 'function') {
                workingId = ByteUtils.fromHex(inputId.toHexString());
            }
            else {
                workingId = inputId.id;
            }
        }
        else {
            workingId = inputId;
        }
        if (workingId == null || typeof workingId === 'number') {
            this[kId] = ObjectId.generate(typeof workingId === 'number' ? workingId : undefined);
        }
        else if (ArrayBuffer.isView(workingId) && workingId.byteLength === 12) {
            this[kId] = ByteUtils.toLocalBufferType(workingId);
        }
        else if (typeof workingId === 'string') {
            if (workingId.length === 12) {
                const bytes = ByteUtils.fromUTF8(workingId);
                if (bytes.byteLength === 12) {
                    this[kId] = bytes;
                }
                else {
                    throw new BSONError('Argument passed in must be a string of 12 bytes');
                }
            }
            else if (workingId.length === 24 && checkForHexRegExp.test(workingId)) {
                this[kId] = ByteUtils.fromHex(workingId);
            }
            else {
                throw new BSONError('Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer');
            }
        }
        else {
            throw new BSONError('Argument passed in does not match the accepted types');
        }
        if (ObjectId.cacheHexString) {
            this.__id = ByteUtils.toHex(this.id);
        }
    }
    get id() {
        return this[kId];
    }
    set id(value) {
        this[kId] = value;
        if (ObjectId.cacheHexString) {
            this.__id = ByteUtils.toHex(value);
        }
    }
    toHexString() {
        if (ObjectId.cacheHexString && this.__id) {
            return this.__id;
        }
        const hexString = ByteUtils.toHex(this.id);
        if (ObjectId.cacheHexString && !this.__id) {
            this.__id = hexString;
        }
        return hexString;
    }
    static getInc() {
        return (ObjectId.index = (ObjectId.index + 1) % 0xffffff);
    }
    static generate(time) {
        if ('number' !== typeof time) {
            time = Math.floor(Date.now() / 1000);
        }
        const inc = ObjectId.getInc();
        const buffer = ByteUtils.allocate(12);
        BSONDataView.fromUint8Array(buffer).setUint32(0, time, false);
        if (PROCESS_UNIQUE === null) {
            PROCESS_UNIQUE = ByteUtils.randomBytes(5);
        }
        buffer[4] = PROCESS_UNIQUE[0];
        buffer[5] = PROCESS_UNIQUE[1];
        buffer[6] = PROCESS_UNIQUE[2];
        buffer[7] = PROCESS_UNIQUE[3];
        buffer[8] = PROCESS_UNIQUE[4];
        buffer[11] = inc & 0xff;
        buffer[10] = (inc >> 8) & 0xff;
        buffer[9] = (inc >> 16) & 0xff;
        return buffer;
    }
    toString(encoding) {
        if (encoding === 'base64')
            return ByteUtils.toBase64(this.id);
        if (encoding === 'hex')
            return this.toHexString();
        return this.toHexString();
    }
    toJSON() {
        return this.toHexString();
    }
    equals(otherId) {
        if (otherId === undefined || otherId === null) {
            return false;
        }
        if (otherId instanceof ObjectId) {
            return this[kId][11] === otherId[kId][11] && ByteUtils.equals(this[kId], otherId[kId]);
        }
        if (typeof otherId === 'string' &&
            ObjectId.isValid(otherId) &&
            otherId.length === 12 &&
            isUint8Array(this.id)) {
            return ByteUtils.equals(this.id, ByteUtils.fromISO88591(otherId));
        }
        if (typeof otherId === 'string' && ObjectId.isValid(otherId) && otherId.length === 24) {
            return otherId.toLowerCase() === this.toHexString();
        }
        if (typeof otherId === 'string' && ObjectId.isValid(otherId) && otherId.length === 12) {
            return ByteUtils.equals(ByteUtils.fromUTF8(otherId), this.id);
        }
        if (typeof otherId === 'object' &&
            'toHexString' in otherId &&
            typeof otherId.toHexString === 'function') {
            const otherIdString = otherId.toHexString();
            const thisIdString = this.toHexString().toLowerCase();
            return typeof otherIdString === 'string' && otherIdString.toLowerCase() === thisIdString;
        }
        return false;
    }
    getTimestamp() {
        const timestamp = new Date();
        const time = BSONDataView.fromUint8Array(this.id).getUint32(0, false);
        timestamp.setTime(Math.floor(time) * 1000);
        return timestamp;
    }
    static createPk() {
        return new ObjectId();
    }
    static createFromTime(time) {
        const buffer = ByteUtils.fromNumberArray([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        BSONDataView.fromUint8Array(buffer).setUint32(0, time, false);
        return new ObjectId(buffer);
    }
    static createFromHexString(hexString) {
        if (hexString?.length !== 24) {
            throw new BSONError('hex string must be 24 characters');
        }
        return new ObjectId(ByteUtils.fromHex(hexString));
    }
    static createFromBase64(base64) {
        if (base64?.length !== 16) {
            throw new BSONError('base64 string must be 16 characters');
        }
        return new ObjectId(ByteUtils.fromBase64(base64));
    }
    static isValid(id) {
        if (id == null)
            return false;
        try {
            new ObjectId(id);
            return true;
        }
        catch {
            return false;
        }
    }
    toExtendedJSON() {
        if (this.toHexString)
            return { $oid: this.toHexString() };
        return { $oid: this.toString('hex') };
    }
    static fromExtendedJSON(doc) {
        return new ObjectId(doc.$oid);
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.inspect();
    }
    inspect() {
        return `new ObjectId("${this.toHexString()}")`;
    }
}
ObjectId.index = Math.floor(Math.random() * 0xffffff);

function internalCalculateObjectSize(object, serializeFunctions, ignoreUndefined) {
    let totalLength = 4 + 1;
    if (Array.isArray(object)) {
        for (let i = 0; i < object.length; i++) {
            totalLength += calculateElement(i.toString(), object[i], serializeFunctions, true, ignoreUndefined);
        }
    }
    else {
        if (typeof object?.toBSON === 'function') {
            object = object.toBSON();
        }
        for (const key of Object.keys(object)) {
            totalLength += calculateElement(key, object[key], serializeFunctions, false, ignoreUndefined);
        }
    }
    return totalLength;
}
function calculateElement(name, value, serializeFunctions = false, isArray = false, ignoreUndefined = false) {
    if (typeof value?.toBSON === 'function') {
        value = value.toBSON();
    }
    switch (typeof value) {
        case 'string':
            return 1 + ByteUtils.utf8ByteLength(name) + 1 + 4 + ByteUtils.utf8ByteLength(value) + 1;
        case 'number':
            if (Math.floor(value) === value &&
                value >= JS_INT_MIN &&
                value <= JS_INT_MAX) {
                if (value >= BSON_INT32_MIN && value <= BSON_INT32_MAX) {
                    return (name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) + (4 + 1);
                }
                else {
                    return (name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) + (8 + 1);
                }
            }
            else {
                return (name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) + (8 + 1);
            }
        case 'undefined':
            if (isArray || !ignoreUndefined)
                return (name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) + 1;
            return 0;
        case 'boolean':
            return (name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) + (1 + 1);
        case 'object':
            if (value != null &&
                typeof value._bsontype === 'string' &&
                value[Symbol.for('@@mdb.bson.version')] !== BSON_MAJOR_VERSION) {
                throw new BSONVersionError();
            }
            else if (value == null || value._bsontype === 'MinKey' || value._bsontype === 'MaxKey') {
                return (name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) + 1;
            }
            else if (value._bsontype === 'ObjectId') {
                return (name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) + (12 + 1);
            }
            else if (value instanceof Date || isDate(value)) {
                return (name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) + (8 + 1);
            }
            else if (ArrayBuffer.isView(value) ||
                value instanceof ArrayBuffer ||
                isAnyArrayBuffer(value)) {
                return ((name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) + (1 + 4 + 1) + value.byteLength);
            }
            else if (value._bsontype === 'Long' ||
                value._bsontype === 'Double' ||
                value._bsontype === 'Timestamp') {
                return (name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) + (8 + 1);
            }
            else if (value._bsontype === 'Decimal128') {
                return (name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) + (16 + 1);
            }
            else if (value._bsontype === 'Code') {
                if (value.scope != null && Object.keys(value.scope).length > 0) {
                    return ((name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) +
                        1 +
                        4 +
                        4 +
                        ByteUtils.utf8ByteLength(value.code.toString()) +
                        1 +
                        internalCalculateObjectSize(value.scope, serializeFunctions, ignoreUndefined));
                }
                else {
                    return ((name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) +
                        1 +
                        4 +
                        ByteUtils.utf8ByteLength(value.code.toString()) +
                        1);
                }
            }
            else if (value._bsontype === 'Binary') {
                const binary = value;
                if (binary.sub_type === Binary.SUBTYPE_BYTE_ARRAY) {
                    return ((name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) +
                        (binary.position + 1 + 4 + 1 + 4));
                }
                else {
                    return ((name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) + (binary.position + 1 + 4 + 1));
                }
            }
            else if (value._bsontype === 'Symbol') {
                return ((name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) +
                    ByteUtils.utf8ByteLength(value.value) +
                    4 +
                    1 +
                    1);
            }
            else if (value._bsontype === 'DBRef') {
                const ordered_values = Object.assign({
                    $ref: value.collection,
                    $id: value.oid
                }, value.fields);
                if (value.db != null) {
                    ordered_values['$db'] = value.db;
                }
                return ((name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) +
                    1 +
                    internalCalculateObjectSize(ordered_values, serializeFunctions, ignoreUndefined));
            }
            else if (value instanceof RegExp || isRegExp(value)) {
                return ((name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) +
                    1 +
                    ByteUtils.utf8ByteLength(value.source) +
                    1 +
                    (value.global ? 1 : 0) +
                    (value.ignoreCase ? 1 : 0) +
                    (value.multiline ? 1 : 0) +
                    1);
            }
            else if (value._bsontype === 'BSONRegExp') {
                return ((name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) +
                    1 +
                    ByteUtils.utf8ByteLength(value.pattern) +
                    1 +
                    ByteUtils.utf8ByteLength(value.options) +
                    1);
            }
            else {
                return ((name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) +
                    internalCalculateObjectSize(value, serializeFunctions, ignoreUndefined) +
                    1);
            }
        case 'function':
            if (serializeFunctions) {
                return ((name != null ? ByteUtils.utf8ByteLength(name) + 1 : 0) +
                    1 +
                    4 +
                    ByteUtils.utf8ByteLength(value.toString()) +
                    1);
            }
    }
    return 0;
}

function alphabetize(str) {
    return str.split('').sort().join('');
}
class BSONRegExp extends BSONValue {
    get _bsontype() {
        return 'BSONRegExp';
    }
    constructor(pattern, options) {
        super();
        this.pattern = pattern;
        this.options = alphabetize(options ?? '');
        if (this.pattern.indexOf('\x00') !== -1) {
            throw new BSONError(`BSON Regex patterns cannot contain null bytes, found: ${JSON.stringify(this.pattern)}`);
        }
        if (this.options.indexOf('\x00') !== -1) {
            throw new BSONError(`BSON Regex options cannot contain null bytes, found: ${JSON.stringify(this.options)}`);
        }
        for (let i = 0; i < this.options.length; i++) {
            if (!(this.options[i] === 'i' ||
                this.options[i] === 'm' ||
                this.options[i] === 'x' ||
                this.options[i] === 'l' ||
                this.options[i] === 's' ||
                this.options[i] === 'u')) {
                throw new BSONError(`The regular expression option [${this.options[i]}] is not supported`);
            }
        }
    }
    static parseOptions(options) {
        return options ? options.split('').sort().join('') : '';
    }
    toExtendedJSON(options) {
        options = options || {};
        if (options.legacy) {
            return { $regex: this.pattern, $options: this.options };
        }
        return { $regularExpression: { pattern: this.pattern, options: this.options } };
    }
    static fromExtendedJSON(doc) {
        if ('$regex' in doc) {
            if (typeof doc.$regex !== 'string') {
                if (doc.$regex._bsontype === 'BSONRegExp') {
                    return doc;
                }
            }
            else {
                return new BSONRegExp(doc.$regex, BSONRegExp.parseOptions(doc.$options));
            }
        }
        if ('$regularExpression' in doc) {
            return new BSONRegExp(doc.$regularExpression.pattern, BSONRegExp.parseOptions(doc.$regularExpression.options));
        }
        throw new BSONError(`Unexpected BSONRegExp EJSON object form: ${JSON.stringify(doc)}`);
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.inspect();
    }
    inspect() {
        return `new BSONRegExp(${JSON.stringify(this.pattern)}, ${JSON.stringify(this.options)})`;
    }
}

class BSONSymbol extends BSONValue {
    get _bsontype() {
        return 'BSONSymbol';
    }
    constructor(value) {
        super();
        this.value = value;
    }
    valueOf() {
        return this.value;
    }
    toString() {
        return this.value;
    }
    inspect() {
        return `new BSONSymbol("${this.value}")`;
    }
    toJSON() {
        return this.value;
    }
    toExtendedJSON() {
        return { $symbol: this.value };
    }
    static fromExtendedJSON(doc) {
        return new BSONSymbol(doc.$symbol);
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.inspect();
    }
}

const LongWithoutOverridesClass = Long;
class Timestamp extends LongWithoutOverridesClass {
    get _bsontype() {
        return 'Timestamp';
    }
    constructor(low) {
        if (low == null) {
            super(0, 0, true);
        }
        else if (typeof low === 'bigint') {
            super(low, true);
        }
        else if (Long.isLong(low)) {
            super(low.low, low.high, true);
        }
        else if (typeof low === 'object' && 't' in low && 'i' in low) {
            if (typeof low.t !== 'number' && (typeof low.t !== 'object' || low.t._bsontype !== 'Int32')) {
                throw new BSONError('Timestamp constructed from { t, i } must provide t as a number');
            }
            if (typeof low.i !== 'number' && (typeof low.i !== 'object' || low.i._bsontype !== 'Int32')) {
                throw new BSONError('Timestamp constructed from { t, i } must provide i as a number');
            }
            const t = Number(low.t);
            const i = Number(low.i);
            if (t < 0 || Number.isNaN(t)) {
                throw new BSONError('Timestamp constructed from { t, i } must provide a positive t');
            }
            if (i < 0 || Number.isNaN(i)) {
                throw new BSONError('Timestamp constructed from { t, i } must provide a positive i');
            }
            if (t > 4294967295) {
                throw new BSONError('Timestamp constructed from { t, i } must provide t equal or less than uint32 max');
            }
            if (i > 4294967295) {
                throw new BSONError('Timestamp constructed from { t, i } must provide i equal or less than uint32 max');
            }
            super(i, t, true);
        }
        else {
            throw new BSONError('A Timestamp can only be constructed with: bigint, Long, or { t: number; i: number }');
        }
    }
    toJSON() {
        return {
            $timestamp: this.toString()
        };
    }
    static fromInt(value) {
        return new Timestamp(Long.fromInt(value, true));
    }
    static fromNumber(value) {
        return new Timestamp(Long.fromNumber(value, true));
    }
    static fromBits(lowBits, highBits) {
        return new Timestamp({ i: lowBits, t: highBits });
    }
    static fromString(str, optRadix) {
        return new Timestamp(Long.fromString(str, true, optRadix));
    }
    toExtendedJSON() {
        return { $timestamp: { t: this.high >>> 0, i: this.low >>> 0 } };
    }
    static fromExtendedJSON(doc) {
        const i = Long.isLong(doc.$timestamp.i)
            ? doc.$timestamp.i.getLowBitsUnsigned()
            : doc.$timestamp.i;
        const t = Long.isLong(doc.$timestamp.t)
            ? doc.$timestamp.t.getLowBitsUnsigned()
            : doc.$timestamp.t;
        return new Timestamp({ t, i });
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.inspect();
    }
    inspect() {
        return `new Timestamp({ t: ${this.getHighBits()}, i: ${this.getLowBits()} })`;
    }
}
Timestamp.MAX_VALUE = Long.MAX_UNSIGNED_VALUE;

const FIRST_BIT = 0x80;
const FIRST_TWO_BITS = 0xc0;
const FIRST_THREE_BITS = 0xe0;
const FIRST_FOUR_BITS = 0xf0;
const FIRST_FIVE_BITS = 0xf8;
const TWO_BIT_CHAR = 0xc0;
const THREE_BIT_CHAR = 0xe0;
const FOUR_BIT_CHAR = 0xf0;
const CONTINUING_CHAR = 0x80;
function validateUtf8(bytes, start, end) {
    let continuation = 0;
    for (let i = start; i < end; i += 1) {
        const byte = bytes[i];
        if (continuation) {
            if ((byte & FIRST_TWO_BITS) !== CONTINUING_CHAR) {
                return false;
            }
            continuation -= 1;
        }
        else if (byte & FIRST_BIT) {
            if ((byte & FIRST_THREE_BITS) === TWO_BIT_CHAR) {
                continuation = 1;
            }
            else if ((byte & FIRST_FOUR_BITS) === THREE_BIT_CHAR) {
                continuation = 2;
            }
            else if ((byte & FIRST_FIVE_BITS) === FOUR_BIT_CHAR) {
                continuation = 3;
            }
            else {
                return false;
            }
        }
    }
    return !continuation;
}

const JS_INT_MAX_LONG = Long.fromNumber(JS_INT_MAX);
const JS_INT_MIN_LONG = Long.fromNumber(JS_INT_MIN);
function internalDeserialize(buffer, options, isArray) {
    options = options == null ? {} : options;
    const index = options && options.index ? options.index : 0;
    const size = buffer[index] |
        (buffer[index + 1] << 8) |
        (buffer[index + 2] << 16) |
        (buffer[index + 3] << 24);
    if (size < 5) {
        throw new BSONError(`bson size must be >= 5, is ${size}`);
    }
    if (options.allowObjectSmallerThanBufferSize && buffer.length < size) {
        throw new BSONError(`buffer length ${buffer.length} must be >= bson size ${size}`);
    }
    if (!options.allowObjectSmallerThanBufferSize && buffer.length !== size) {
        throw new BSONError(`buffer length ${buffer.length} must === bson size ${size}`);
    }
    if (size + index > buffer.byteLength) {
        throw new BSONError(`(bson size ${size} + options.index ${index} must be <= buffer length ${buffer.byteLength})`);
    }
    if (buffer[index + size - 1] !== 0) {
        throw new BSONError("One object, sized correctly, with a spot for an EOO, but the EOO isn't 0x00");
    }
    return deserializeObject(buffer, index, options, isArray);
}
const allowedDBRefKeys = /^\$ref$|^\$id$|^\$db$/;
function deserializeObject(buffer, index, options, isArray = false) {
    const fieldsAsRaw = options['fieldsAsRaw'] == null ? null : options['fieldsAsRaw'];
    const raw = options['raw'] == null ? false : options['raw'];
    const bsonRegExp = typeof options['bsonRegExp'] === 'boolean' ? options['bsonRegExp'] : false;
    const promoteBuffers = options.promoteBuffers ?? false;
    const promoteLongs = options.promoteLongs ?? true;
    const promoteValues = options.promoteValues ?? true;
    const useBigInt64 = options.useBigInt64 ?? false;
    if (useBigInt64 && !promoteValues) {
        throw new BSONError('Must either request bigint or Long for int64 deserialization');
    }
    if (useBigInt64 && !promoteLongs) {
        throw new BSONError('Must either request bigint or Long for int64 deserialization');
    }
    const validation = options.validation == null ? { utf8: true } : options.validation;
    let globalUTFValidation = true;
    let validationSetting;
    const utf8KeysSet = new Set();
    const utf8ValidatedKeys = validation.utf8;
    if (typeof utf8ValidatedKeys === 'boolean') {
        validationSetting = utf8ValidatedKeys;
    }
    else {
        globalUTFValidation = false;
        const utf8ValidationValues = Object.keys(utf8ValidatedKeys).map(function (key) {
            return utf8ValidatedKeys[key];
        });
        if (utf8ValidationValues.length === 0) {
            throw new BSONError('UTF-8 validation setting cannot be empty');
        }
        if (typeof utf8ValidationValues[0] !== 'boolean') {
            throw new BSONError('Invalid UTF-8 validation option, must specify boolean values');
        }
        validationSetting = utf8ValidationValues[0];
        if (!utf8ValidationValues.every(item => item === validationSetting)) {
            throw new BSONError('Invalid UTF-8 validation option - keys must be all true or all false');
        }
    }
    if (!globalUTFValidation) {
        for (const key of Object.keys(utf8ValidatedKeys)) {
            utf8KeysSet.add(key);
        }
    }
    const startIndex = index;
    if (buffer.length < 5)
        throw new BSONError('corrupt bson message < 5 bytes long');
    const size = buffer[index++] | (buffer[index++] << 8) | (buffer[index++] << 16) | (buffer[index++] << 24);
    if (size < 5 || size > buffer.length)
        throw new BSONError('corrupt bson message');
    const object = isArray ? [] : {};
    let arrayIndex = 0;
    const done = false;
    let isPossibleDBRef = isArray ? false : null;
    const dataview = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    while (!done) {
        const elementType = buffer[index++];
        if (elementType === 0)
            break;
        let i = index;
        while (buffer[i] !== 0x00 && i < buffer.length) {
            i++;
        }
        if (i >= buffer.byteLength)
            throw new BSONError('Bad BSON Document: illegal CString');
        const name = isArray ? arrayIndex++ : ByteUtils.toUTF8(buffer, index, i);
        let shouldValidateKey = true;
        if (globalUTFValidation || utf8KeysSet.has(name)) {
            shouldValidateKey = validationSetting;
        }
        else {
            shouldValidateKey = !validationSetting;
        }
        if (isPossibleDBRef !== false && name[0] === '$') {
            isPossibleDBRef = allowedDBRefKeys.test(name);
        }
        let value;
        index = i + 1;
        if (elementType === BSON_DATA_STRING) {
            const stringSize = buffer[index++] |
                (buffer[index++] << 8) |
                (buffer[index++] << 16) |
                (buffer[index++] << 24);
            if (stringSize <= 0 ||
                stringSize > buffer.length - index ||
                buffer[index + stringSize - 1] !== 0) {
                throw new BSONError('bad string length in bson');
            }
            value = getValidatedString(buffer, index, index + stringSize - 1, shouldValidateKey);
            index = index + stringSize;
        }
        else if (elementType === BSON_DATA_OID) {
            const oid = ByteUtils.allocate(12);
            oid.set(buffer.subarray(index, index + 12));
            value = new ObjectId(oid);
            index = index + 12;
        }
        else if (elementType === BSON_DATA_INT && promoteValues === false) {
            value = new Int32(buffer[index++] | (buffer[index++] << 8) | (buffer[index++] << 16) | (buffer[index++] << 24));
        }
        else if (elementType === BSON_DATA_INT) {
            value =
                buffer[index++] |
                    (buffer[index++] << 8) |
                    (buffer[index++] << 16) |
                    (buffer[index++] << 24);
        }
        else if (elementType === BSON_DATA_NUMBER && promoteValues === false) {
            value = new Double(dataview.getFloat64(index, true));
            index = index + 8;
        }
        else if (elementType === BSON_DATA_NUMBER) {
            value = dataview.getFloat64(index, true);
            index = index + 8;
        }
        else if (elementType === BSON_DATA_DATE) {
            const lowBits = buffer[index++] |
                (buffer[index++] << 8) |
                (buffer[index++] << 16) |
                (buffer[index++] << 24);
            const highBits = buffer[index++] |
                (buffer[index++] << 8) |
                (buffer[index++] << 16) |
                (buffer[index++] << 24);
            value = new Date(new Long(lowBits, highBits).toNumber());
        }
        else if (elementType === BSON_DATA_BOOLEAN) {
            if (buffer[index] !== 0 && buffer[index] !== 1)
                throw new BSONError('illegal boolean type value');
            value = buffer[index++] === 1;
        }
        else if (elementType === BSON_DATA_OBJECT) {
            const _index = index;
            const objectSize = buffer[index] |
                (buffer[index + 1] << 8) |
                (buffer[index + 2] << 16) |
                (buffer[index + 3] << 24);
            if (objectSize <= 0 || objectSize > buffer.length - index)
                throw new BSONError('bad embedded document length in bson');
            if (raw) {
                value = buffer.slice(index, index + objectSize);
            }
            else {
                let objectOptions = options;
                if (!globalUTFValidation) {
                    objectOptions = { ...options, validation: { utf8: shouldValidateKey } };
                }
                value = deserializeObject(buffer, _index, objectOptions, false);
            }
            index = index + objectSize;
        }
        else if (elementType === BSON_DATA_ARRAY) {
            const _index = index;
            const objectSize = buffer[index] |
                (buffer[index + 1] << 8) |
                (buffer[index + 2] << 16) |
                (buffer[index + 3] << 24);
            let arrayOptions = options;
            const stopIndex = index + objectSize;
            if (fieldsAsRaw && fieldsAsRaw[name]) {
                arrayOptions = { ...options, raw: true };
            }
            if (!globalUTFValidation) {
                arrayOptions = { ...arrayOptions, validation: { utf8: shouldValidateKey } };
            }
            value = deserializeObject(buffer, _index, arrayOptions, true);
            index = index + objectSize;
            if (buffer[index - 1] !== 0)
                throw new BSONError('invalid array terminator byte');
            if (index !== stopIndex)
                throw new BSONError('corrupted array bson');
        }
        else if (elementType === BSON_DATA_UNDEFINED) {
            value = undefined;
        }
        else if (elementType === BSON_DATA_NULL) {
            value = null;
        }
        else if (elementType === BSON_DATA_LONG) {
            const dataview = BSONDataView.fromUint8Array(buffer.subarray(index, index + 8));
            const lowBits = buffer[index++] |
                (buffer[index++] << 8) |
                (buffer[index++] << 16) |
                (buffer[index++] << 24);
            const highBits = buffer[index++] |
                (buffer[index++] << 8) |
                (buffer[index++] << 16) |
                (buffer[index++] << 24);
            const long = new Long(lowBits, highBits);
            if (useBigInt64) {
                value = dataview.getBigInt64(0, true);
            }
            else if (promoteLongs && promoteValues === true) {
                value =
                    long.lessThanOrEqual(JS_INT_MAX_LONG) && long.greaterThanOrEqual(JS_INT_MIN_LONG)
                        ? long.toNumber()
                        : long;
            }
            else {
                value = long;
            }
        }
        else if (elementType === BSON_DATA_DECIMAL128) {
            const bytes = ByteUtils.allocate(16);
            bytes.set(buffer.subarray(index, index + 16), 0);
            index = index + 16;
            value = new Decimal128(bytes);
        }
        else if (elementType === BSON_DATA_BINARY) {
            let binarySize = buffer[index++] |
                (buffer[index++] << 8) |
                (buffer[index++] << 16) |
                (buffer[index++] << 24);
            const totalBinarySize = binarySize;
            const subType = buffer[index++];
            if (binarySize < 0)
                throw new BSONError('Negative binary type element size found');
            if (binarySize > buffer.byteLength)
                throw new BSONError('Binary type size larger than document size');
            if (buffer['slice'] != null) {
                if (subType === Binary.SUBTYPE_BYTE_ARRAY) {
                    binarySize =
                        buffer[index++] |
                            (buffer[index++] << 8) |
                            (buffer[index++] << 16) |
                            (buffer[index++] << 24);
                    if (binarySize < 0)
                        throw new BSONError('Negative binary type element size found for subtype 0x02');
                    if (binarySize > totalBinarySize - 4)
                        throw new BSONError('Binary type with subtype 0x02 contains too long binary size');
                    if (binarySize < totalBinarySize - 4)
                        throw new BSONError('Binary type with subtype 0x02 contains too short binary size');
                }
                if (promoteBuffers && promoteValues) {
                    value = ByteUtils.toLocalBufferType(buffer.slice(index, index + binarySize));
                }
                else {
                    value = new Binary(buffer.slice(index, index + binarySize), subType);
                    if (subType === BSON_BINARY_SUBTYPE_UUID_NEW && UUID.isValid(value)) {
                        value = value.toUUID();
                    }
                }
            }
            else {
                const _buffer = ByteUtils.allocate(binarySize);
                if (subType === Binary.SUBTYPE_BYTE_ARRAY) {
                    binarySize =
                        buffer[index++] |
                            (buffer[index++] << 8) |
                            (buffer[index++] << 16) |
                            (buffer[index++] << 24);
                    if (binarySize < 0)
                        throw new BSONError('Negative binary type element size found for subtype 0x02');
                    if (binarySize > totalBinarySize - 4)
                        throw new BSONError('Binary type with subtype 0x02 contains too long binary size');
                    if (binarySize < totalBinarySize - 4)
                        throw new BSONError('Binary type with subtype 0x02 contains too short binary size');
                }
                for (i = 0; i < binarySize; i++) {
                    _buffer[i] = buffer[index + i];
                }
                if (promoteBuffers && promoteValues) {
                    value = _buffer;
                }
                else {
                    value = new Binary(buffer.slice(index, index + binarySize), subType);
                    if (subType === BSON_BINARY_SUBTYPE_UUID_NEW && UUID.isValid(value)) {
                        value = value.toUUID();
                    }
                }
            }
            index = index + binarySize;
        }
        else if (elementType === BSON_DATA_REGEXP && bsonRegExp === false) {
            i = index;
            while (buffer[i] !== 0x00 && i < buffer.length) {
                i++;
            }
            if (i >= buffer.length)
                throw new BSONError('Bad BSON Document: illegal CString');
            const source = ByteUtils.toUTF8(buffer, index, i);
            index = i + 1;
            i = index;
            while (buffer[i] !== 0x00 && i < buffer.length) {
                i++;
            }
            if (i >= buffer.length)
                throw new BSONError('Bad BSON Document: illegal CString');
            const regExpOptions = ByteUtils.toUTF8(buffer, index, i);
            index = i + 1;
            const optionsArray = new Array(regExpOptions.length);
            for (i = 0; i < regExpOptions.length; i++) {
                switch (regExpOptions[i]) {
                    case 'm':
                        optionsArray[i] = 'm';
                        break;
                    case 's':
                        optionsArray[i] = 'g';
                        break;
                    case 'i':
                        optionsArray[i] = 'i';
                        break;
                }
            }
            value = new RegExp(source, optionsArray.join(''));
        }
        else if (elementType === BSON_DATA_REGEXP && bsonRegExp === true) {
            i = index;
            while (buffer[i] !== 0x00 && i < buffer.length) {
                i++;
            }
            if (i >= buffer.length)
                throw new BSONError('Bad BSON Document: illegal CString');
            const source = ByteUtils.toUTF8(buffer, index, i);
            index = i + 1;
            i = index;
            while (buffer[i] !== 0x00 && i < buffer.length) {
                i++;
            }
            if (i >= buffer.length)
                throw new BSONError('Bad BSON Document: illegal CString');
            const regExpOptions = ByteUtils.toUTF8(buffer, index, i);
            index = i + 1;
            value = new BSONRegExp(source, regExpOptions);
        }
        else if (elementType === BSON_DATA_SYMBOL) {
            const stringSize = buffer[index++] |
                (buffer[index++] << 8) |
                (buffer[index++] << 16) |
                (buffer[index++] << 24);
            if (stringSize <= 0 ||
                stringSize > buffer.length - index ||
                buffer[index + stringSize - 1] !== 0) {
                throw new BSONError('bad string length in bson');
            }
            const symbol = getValidatedString(buffer, index, index + stringSize - 1, shouldValidateKey);
            value = promoteValues ? symbol : new BSONSymbol(symbol);
            index = index + stringSize;
        }
        else if (elementType === BSON_DATA_TIMESTAMP) {
            const i = buffer[index++] +
                buffer[index++] * (1 << 8) +
                buffer[index++] * (1 << 16) +
                buffer[index++] * (1 << 24);
            const t = buffer[index++] +
                buffer[index++] * (1 << 8) +
                buffer[index++] * (1 << 16) +
                buffer[index++] * (1 << 24);
            value = new Timestamp({ i, t });
        }
        else if (elementType === BSON_DATA_MIN_KEY) {
            value = new MinKey();
        }
        else if (elementType === BSON_DATA_MAX_KEY) {
            value = new MaxKey();
        }
        else if (elementType === BSON_DATA_CODE) {
            const stringSize = buffer[index++] |
                (buffer[index++] << 8) |
                (buffer[index++] << 16) |
                (buffer[index++] << 24);
            if (stringSize <= 0 ||
                stringSize > buffer.length - index ||
                buffer[index + stringSize - 1] !== 0) {
                throw new BSONError('bad string length in bson');
            }
            const functionString = getValidatedString(buffer, index, index + stringSize - 1, shouldValidateKey);
            value = new Code(functionString);
            index = index + stringSize;
        }
        else if (elementType === BSON_DATA_CODE_W_SCOPE) {
            const totalSize = buffer[index++] |
                (buffer[index++] << 8) |
                (buffer[index++] << 16) |
                (buffer[index++] << 24);
            if (totalSize < 4 + 4 + 4 + 1) {
                throw new BSONError('code_w_scope total size shorter minimum expected length');
            }
            const stringSize = buffer[index++] |
                (buffer[index++] << 8) |
                (buffer[index++] << 16) |
                (buffer[index++] << 24);
            if (stringSize <= 0 ||
                stringSize > buffer.length - index ||
                buffer[index + stringSize - 1] !== 0) {
                throw new BSONError('bad string length in bson');
            }
            const functionString = getValidatedString(buffer, index, index + stringSize - 1, shouldValidateKey);
            index = index + stringSize;
            const _index = index;
            const objectSize = buffer[index] |
                (buffer[index + 1] << 8) |
                (buffer[index + 2] << 16) |
                (buffer[index + 3] << 24);
            const scopeObject = deserializeObject(buffer, _index, options, false);
            index = index + objectSize;
            if (totalSize < 4 + 4 + objectSize + stringSize) {
                throw new BSONError('code_w_scope total size is too short, truncating scope');
            }
            if (totalSize > 4 + 4 + objectSize + stringSize) {
                throw new BSONError('code_w_scope total size is too long, clips outer document');
            }
            value = new Code(functionString, scopeObject);
        }
        else if (elementType === BSON_DATA_DBPOINTER) {
            const stringSize = buffer[index++] |
                (buffer[index++] << 8) |
                (buffer[index++] << 16) |
                (buffer[index++] << 24);
            if (stringSize <= 0 ||
                stringSize > buffer.length - index ||
                buffer[index + stringSize - 1] !== 0)
                throw new BSONError('bad string length in bson');
            if (validation != null && validation.utf8) {
                if (!validateUtf8(buffer, index, index + stringSize - 1)) {
                    throw new BSONError('Invalid UTF-8 string in BSON document');
                }
            }
            const namespace = ByteUtils.toUTF8(buffer, index, index + stringSize - 1);
            index = index + stringSize;
            const oidBuffer = ByteUtils.allocate(12);
            oidBuffer.set(buffer.subarray(index, index + 12), 0);
            const oid = new ObjectId(oidBuffer);
            index = index + 12;
            value = new DBRef(namespace, oid);
        }
        else {
            throw new BSONError(`Detected unknown BSON type ${elementType.toString(16)} for fieldname "${name}"`);
        }
        if (name === '__proto__') {
            Object.defineProperty(object, name, {
                value,
                writable: true,
                enumerable: true,
                configurable: true
            });
        }
        else {
            object[name] = value;
        }
    }
    if (size !== index - startIndex) {
        if (isArray)
            throw new BSONError('corrupt array bson');
        throw new BSONError('corrupt object bson');
    }
    if (!isPossibleDBRef)
        return object;
    if (isDBRefLike(object)) {
        const copy = Object.assign({}, object);
        delete copy.$ref;
        delete copy.$id;
        delete copy.$db;
        return new DBRef(object.$ref, object.$id, object.$db, copy);
    }
    return object;
}
function getValidatedString(buffer, start, end, shouldValidateUtf8) {
    const value = ByteUtils.toUTF8(buffer, start, end);
    if (shouldValidateUtf8) {
        for (let i = 0; i < value.length; i++) {
            if (value.charCodeAt(i) === 0xfffd) {
                if (!validateUtf8(buffer, start, end)) {
                    throw new BSONError('Invalid UTF-8 string in BSON document');
                }
                break;
            }
        }
    }
    return value;
}

const regexp = /\x00/;
const ignoreKeys = new Set(['$db', '$ref', '$id', '$clusterTime']);
function serializeString(buffer, key, value, index) {
    buffer[index++] = BSON_DATA_STRING;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes + 1;
    buffer[index - 1] = 0;
    const size = ByteUtils.encodeUTF8Into(buffer, value, index + 4);
    buffer[index + 3] = ((size + 1) >> 24) & 0xff;
    buffer[index + 2] = ((size + 1) >> 16) & 0xff;
    buffer[index + 1] = ((size + 1) >> 8) & 0xff;
    buffer[index] = (size + 1) & 0xff;
    index = index + 4 + size;
    buffer[index++] = 0;
    return index;
}
const NUMBER_SPACE = new DataView(new ArrayBuffer(8), 0, 8);
const FOUR_BYTE_VIEW_ON_NUMBER = new Uint8Array(NUMBER_SPACE.buffer, 0, 4);
const EIGHT_BYTE_VIEW_ON_NUMBER = new Uint8Array(NUMBER_SPACE.buffer, 0, 8);
function serializeNumber(buffer, key, value, index) {
    const isNegativeZero = Object.is(value, -0);
    const type = !isNegativeZero &&
        Number.isSafeInteger(value) &&
        value <= BSON_INT32_MAX &&
        value >= BSON_INT32_MIN
        ? BSON_DATA_INT
        : BSON_DATA_NUMBER;
    if (type === BSON_DATA_INT) {
        NUMBER_SPACE.setInt32(0, value, true);
    }
    else {
        NUMBER_SPACE.setFloat64(0, value, true);
    }
    const bytes = type === BSON_DATA_INT ? FOUR_BYTE_VIEW_ON_NUMBER : EIGHT_BYTE_VIEW_ON_NUMBER;
    buffer[index++] = type;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0x00;
    buffer.set(bytes, index);
    index += bytes.byteLength;
    return index;
}
function serializeBigInt(buffer, key, value, index) {
    buffer[index++] = BSON_DATA_LONG;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index += numberOfWrittenBytes;
    buffer[index++] = 0;
    NUMBER_SPACE.setBigInt64(0, value, true);
    buffer.set(EIGHT_BYTE_VIEW_ON_NUMBER, index);
    index += EIGHT_BYTE_VIEW_ON_NUMBER.byteLength;
    return index;
}
function serializeNull(buffer, key, _, index) {
    buffer[index++] = BSON_DATA_NULL;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    return index;
}
function serializeBoolean(buffer, key, value, index) {
    buffer[index++] = BSON_DATA_BOOLEAN;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    buffer[index++] = value ? 1 : 0;
    return index;
}
function serializeDate(buffer, key, value, index) {
    buffer[index++] = BSON_DATA_DATE;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    const dateInMilis = Long.fromNumber(value.getTime());
    const lowBits = dateInMilis.getLowBits();
    const highBits = dateInMilis.getHighBits();
    buffer[index++] = lowBits & 0xff;
    buffer[index++] = (lowBits >> 8) & 0xff;
    buffer[index++] = (lowBits >> 16) & 0xff;
    buffer[index++] = (lowBits >> 24) & 0xff;
    buffer[index++] = highBits & 0xff;
    buffer[index++] = (highBits >> 8) & 0xff;
    buffer[index++] = (highBits >> 16) & 0xff;
    buffer[index++] = (highBits >> 24) & 0xff;
    return index;
}
function serializeRegExp(buffer, key, value, index) {
    buffer[index++] = BSON_DATA_REGEXP;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    if (value.source && value.source.match(regexp) != null) {
        throw new BSONError('value ' + value.source + ' must not contain null bytes');
    }
    index = index + ByteUtils.encodeUTF8Into(buffer, value.source, index);
    buffer[index++] = 0x00;
    if (value.ignoreCase)
        buffer[index++] = 0x69;
    if (value.global)
        buffer[index++] = 0x73;
    if (value.multiline)
        buffer[index++] = 0x6d;
    buffer[index++] = 0x00;
    return index;
}
function serializeBSONRegExp(buffer, key, value, index) {
    buffer[index++] = BSON_DATA_REGEXP;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    if (value.pattern.match(regexp) != null) {
        throw new BSONError('pattern ' + value.pattern + ' must not contain null bytes');
    }
    index = index + ByteUtils.encodeUTF8Into(buffer, value.pattern, index);
    buffer[index++] = 0x00;
    const sortedOptions = value.options.split('').sort().join('');
    index = index + ByteUtils.encodeUTF8Into(buffer, sortedOptions, index);
    buffer[index++] = 0x00;
    return index;
}
function serializeMinMax(buffer, key, value, index) {
    if (value === null) {
        buffer[index++] = BSON_DATA_NULL;
    }
    else if (value._bsontype === 'MinKey') {
        buffer[index++] = BSON_DATA_MIN_KEY;
    }
    else {
        buffer[index++] = BSON_DATA_MAX_KEY;
    }
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    return index;
}
function serializeObjectId(buffer, key, value, index) {
    buffer[index++] = BSON_DATA_OID;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    if (isUint8Array(value.id)) {
        buffer.set(value.id.subarray(0, 12), index);
    }
    else {
        throw new BSONError('object [' + JSON.stringify(value) + '] is not a valid ObjectId');
    }
    return index + 12;
}
function serializeBuffer(buffer, key, value, index) {
    buffer[index++] = BSON_DATA_BINARY;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    const size = value.length;
    buffer[index++] = size & 0xff;
    buffer[index++] = (size >> 8) & 0xff;
    buffer[index++] = (size >> 16) & 0xff;
    buffer[index++] = (size >> 24) & 0xff;
    buffer[index++] = BSON_BINARY_SUBTYPE_DEFAULT;
    buffer.set(value, index);
    index = index + size;
    return index;
}
function serializeObject(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, path) {
    if (path.has(value)) {
        throw new BSONError('Cannot convert circular structure to BSON');
    }
    path.add(value);
    buffer[index++] = Array.isArray(value) ? BSON_DATA_ARRAY : BSON_DATA_OBJECT;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    const endIndex = serializeInto(buffer, value, checkKeys, index, depth + 1, serializeFunctions, ignoreUndefined, path);
    path.delete(value);
    return endIndex;
}
function serializeDecimal128(buffer, key, value, index) {
    buffer[index++] = BSON_DATA_DECIMAL128;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    buffer.set(value.bytes.subarray(0, 16), index);
    return index + 16;
}
function serializeLong(buffer, key, value, index) {
    buffer[index++] =
        value._bsontype === 'Long' ? BSON_DATA_LONG : BSON_DATA_TIMESTAMP;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    const lowBits = value.getLowBits();
    const highBits = value.getHighBits();
    buffer[index++] = lowBits & 0xff;
    buffer[index++] = (lowBits >> 8) & 0xff;
    buffer[index++] = (lowBits >> 16) & 0xff;
    buffer[index++] = (lowBits >> 24) & 0xff;
    buffer[index++] = highBits & 0xff;
    buffer[index++] = (highBits >> 8) & 0xff;
    buffer[index++] = (highBits >> 16) & 0xff;
    buffer[index++] = (highBits >> 24) & 0xff;
    return index;
}
function serializeInt32(buffer, key, value, index) {
    value = value.valueOf();
    buffer[index++] = BSON_DATA_INT;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    buffer[index++] = value & 0xff;
    buffer[index++] = (value >> 8) & 0xff;
    buffer[index++] = (value >> 16) & 0xff;
    buffer[index++] = (value >> 24) & 0xff;
    return index;
}
function serializeDouble(buffer, key, value, index) {
    buffer[index++] = BSON_DATA_NUMBER;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    NUMBER_SPACE.setFloat64(0, value.value, true);
    buffer.set(EIGHT_BYTE_VIEW_ON_NUMBER, index);
    index = index + 8;
    return index;
}
function serializeFunction(buffer, key, value, index) {
    buffer[index++] = BSON_DATA_CODE;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    const functionString = value.toString();
    const size = ByteUtils.encodeUTF8Into(buffer, functionString, index + 4) + 1;
    buffer[index] = size & 0xff;
    buffer[index + 1] = (size >> 8) & 0xff;
    buffer[index + 2] = (size >> 16) & 0xff;
    buffer[index + 3] = (size >> 24) & 0xff;
    index = index + 4 + size - 1;
    buffer[index++] = 0;
    return index;
}
function serializeCode(buffer, key, value, index, checkKeys = false, depth = 0, serializeFunctions = false, ignoreUndefined = true, path) {
    if (value.scope && typeof value.scope === 'object') {
        buffer[index++] = BSON_DATA_CODE_W_SCOPE;
        const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
        index = index + numberOfWrittenBytes;
        buffer[index++] = 0;
        let startIndex = index;
        const functionString = value.code;
        index = index + 4;
        const codeSize = ByteUtils.encodeUTF8Into(buffer, functionString, index + 4) + 1;
        buffer[index] = codeSize & 0xff;
        buffer[index + 1] = (codeSize >> 8) & 0xff;
        buffer[index + 2] = (codeSize >> 16) & 0xff;
        buffer[index + 3] = (codeSize >> 24) & 0xff;
        buffer[index + 4 + codeSize - 1] = 0;
        index = index + codeSize + 4;
        const endIndex = serializeInto(buffer, value.scope, checkKeys, index, depth + 1, serializeFunctions, ignoreUndefined, path);
        index = endIndex - 1;
        const totalSize = endIndex - startIndex;
        buffer[startIndex++] = totalSize & 0xff;
        buffer[startIndex++] = (totalSize >> 8) & 0xff;
        buffer[startIndex++] = (totalSize >> 16) & 0xff;
        buffer[startIndex++] = (totalSize >> 24) & 0xff;
        buffer[index++] = 0;
    }
    else {
        buffer[index++] = BSON_DATA_CODE;
        const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
        index = index + numberOfWrittenBytes;
        buffer[index++] = 0;
        const functionString = value.code.toString();
        const size = ByteUtils.encodeUTF8Into(buffer, functionString, index + 4) + 1;
        buffer[index] = size & 0xff;
        buffer[index + 1] = (size >> 8) & 0xff;
        buffer[index + 2] = (size >> 16) & 0xff;
        buffer[index + 3] = (size >> 24) & 0xff;
        index = index + 4 + size - 1;
        buffer[index++] = 0;
    }
    return index;
}
function serializeBinary(buffer, key, value, index) {
    buffer[index++] = BSON_DATA_BINARY;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    const data = value.buffer;
    let size = value.position;
    if (value.sub_type === Binary.SUBTYPE_BYTE_ARRAY)
        size = size + 4;
    buffer[index++] = size & 0xff;
    buffer[index++] = (size >> 8) & 0xff;
    buffer[index++] = (size >> 16) & 0xff;
    buffer[index++] = (size >> 24) & 0xff;
    buffer[index++] = value.sub_type;
    if (value.sub_type === Binary.SUBTYPE_BYTE_ARRAY) {
        size = size - 4;
        buffer[index++] = size & 0xff;
        buffer[index++] = (size >> 8) & 0xff;
        buffer[index++] = (size >> 16) & 0xff;
        buffer[index++] = (size >> 24) & 0xff;
    }
    buffer.set(data, index);
    index = index + value.position;
    return index;
}
function serializeSymbol(buffer, key, value, index) {
    buffer[index++] = BSON_DATA_SYMBOL;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    const size = ByteUtils.encodeUTF8Into(buffer, value.value, index + 4) + 1;
    buffer[index] = size & 0xff;
    buffer[index + 1] = (size >> 8) & 0xff;
    buffer[index + 2] = (size >> 16) & 0xff;
    buffer[index + 3] = (size >> 24) & 0xff;
    index = index + 4 + size - 1;
    buffer[index++] = 0x00;
    return index;
}
function serializeDBRef(buffer, key, value, index, depth, serializeFunctions, path) {
    buffer[index++] = BSON_DATA_OBJECT;
    const numberOfWrittenBytes = ByteUtils.encodeUTF8Into(buffer, key, index);
    index = index + numberOfWrittenBytes;
    buffer[index++] = 0;
    let startIndex = index;
    let output = {
        $ref: value.collection || value.namespace,
        $id: value.oid
    };
    if (value.db != null) {
        output.$db = value.db;
    }
    output = Object.assign(output, value.fields);
    const endIndex = serializeInto(buffer, output, false, index, depth + 1, serializeFunctions, true, path);
    const size = endIndex - startIndex;
    buffer[startIndex++] = size & 0xff;
    buffer[startIndex++] = (size >> 8) & 0xff;
    buffer[startIndex++] = (size >> 16) & 0xff;
    buffer[startIndex++] = (size >> 24) & 0xff;
    return endIndex;
}
function serializeInto(buffer, object, checkKeys, startingIndex, depth, serializeFunctions, ignoreUndefined, path) {
    if (path == null) {
        if (object == null) {
            buffer[0] = 0x05;
            buffer[1] = 0x00;
            buffer[2] = 0x00;
            buffer[3] = 0x00;
            buffer[4] = 0x00;
            return 5;
        }
        if (Array.isArray(object)) {
            throw new BSONError('serialize does not support an array as the root input');
        }
        if (typeof object !== 'object') {
            throw new BSONError('serialize does not support non-object as the root input');
        }
        else if ('_bsontype' in object && typeof object._bsontype === 'string') {
            throw new BSONError(`BSON types cannot be serialized as a document`);
        }
        else if (isDate(object) ||
            isRegExp(object) ||
            isUint8Array(object) ||
            isAnyArrayBuffer(object)) {
            throw new BSONError(`date, regexp, typedarray, and arraybuffer cannot be BSON documents`);
        }
        path = new Set();
    }
    path.add(object);
    let index = startingIndex + 4;
    if (Array.isArray(object)) {
        for (let i = 0; i < object.length; i++) {
            const key = `${i}`;
            let value = object[i];
            if (typeof value?.toBSON === 'function') {
                value = value.toBSON();
            }
            if (typeof value === 'string') {
                index = serializeString(buffer, key, value, index);
            }
            else if (typeof value === 'number') {
                index = serializeNumber(buffer, key, value, index);
            }
            else if (typeof value === 'bigint') {
                index = serializeBigInt(buffer, key, value, index);
            }
            else if (typeof value === 'boolean') {
                index = serializeBoolean(buffer, key, value, index);
            }
            else if (value instanceof Date || isDate(value)) {
                index = serializeDate(buffer, key, value, index);
            }
            else if (value === undefined) {
                index = serializeNull(buffer, key, value, index);
            }
            else if (value === null) {
                index = serializeNull(buffer, key, value, index);
            }
            else if (isUint8Array(value)) {
                index = serializeBuffer(buffer, key, value, index);
            }
            else if (value instanceof RegExp || isRegExp(value)) {
                index = serializeRegExp(buffer, key, value, index);
            }
            else if (typeof value === 'object' && value._bsontype == null) {
                index = serializeObject(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, path);
            }
            else if (typeof value === 'object' &&
                value[Symbol.for('@@mdb.bson.version')] !== BSON_MAJOR_VERSION) {
                throw new BSONVersionError();
            }
            else if (value._bsontype === 'ObjectId') {
                index = serializeObjectId(buffer, key, value, index);
            }
            else if (value._bsontype === 'Decimal128') {
                index = serializeDecimal128(buffer, key, value, index);
            }
            else if (value._bsontype === 'Long' || value._bsontype === 'Timestamp') {
                index = serializeLong(buffer, key, value, index);
            }
            else if (value._bsontype === 'Double') {
                index = serializeDouble(buffer, key, value, index);
            }
            else if (typeof value === 'function' && serializeFunctions) {
                index = serializeFunction(buffer, key, value, index);
            }
            else if (value._bsontype === 'Code') {
                index = serializeCode(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, path);
            }
            else if (value._bsontype === 'Binary') {
                index = serializeBinary(buffer, key, value, index);
            }
            else if (value._bsontype === 'BSONSymbol') {
                index = serializeSymbol(buffer, key, value, index);
            }
            else if (value._bsontype === 'DBRef') {
                index = serializeDBRef(buffer, key, value, index, depth, serializeFunctions, path);
            }
            else if (value._bsontype === 'BSONRegExp') {
                index = serializeBSONRegExp(buffer, key, value, index);
            }
            else if (value._bsontype === 'Int32') {
                index = serializeInt32(buffer, key, value, index);
            }
            else if (value._bsontype === 'MinKey' || value._bsontype === 'MaxKey') {
                index = serializeMinMax(buffer, key, value, index);
            }
            else if (typeof value._bsontype !== 'undefined') {
                throw new BSONError(`Unrecognized or invalid _bsontype: ${String(value._bsontype)}`);
            }
        }
    }
    else if (object instanceof Map || isMap(object)) {
        const iterator = object.entries();
        let done = false;
        while (!done) {
            const entry = iterator.next();
            done = !!entry.done;
            if (done)
                continue;
            const key = entry.value[0];
            let value = entry.value[1];
            if (typeof value?.toBSON === 'function') {
                value = value.toBSON();
            }
            const type = typeof value;
            if (typeof key === 'string' && !ignoreKeys.has(key)) {
                if (key.match(regexp) != null) {
                    throw new BSONError('key ' + key + ' must not contain null bytes');
                }
                if (checkKeys) {
                    if ('$' === key[0]) {
                        throw new BSONError('key ' + key + " must not start with '$'");
                    }
                    else if (~key.indexOf('.')) {
                        throw new BSONError('key ' + key + " must not contain '.'");
                    }
                }
            }
            if (type === 'string') {
                index = serializeString(buffer, key, value, index);
            }
            else if (type === 'number') {
                index = serializeNumber(buffer, key, value, index);
            }
            else if (type === 'bigint') {
                index = serializeBigInt(buffer, key, value, index);
            }
            else if (type === 'boolean') {
                index = serializeBoolean(buffer, key, value, index);
            }
            else if (value instanceof Date || isDate(value)) {
                index = serializeDate(buffer, key, value, index);
            }
            else if (value === null || (value === undefined && ignoreUndefined === false)) {
                index = serializeNull(buffer, key, value, index);
            }
            else if (isUint8Array(value)) {
                index = serializeBuffer(buffer, key, value, index);
            }
            else if (value instanceof RegExp || isRegExp(value)) {
                index = serializeRegExp(buffer, key, value, index);
            }
            else if (type === 'object' && value._bsontype == null) {
                index = serializeObject(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, path);
            }
            else if (typeof value === 'object' &&
                value[Symbol.for('@@mdb.bson.version')] !== BSON_MAJOR_VERSION) {
                throw new BSONVersionError();
            }
            else if (value._bsontype === 'ObjectId') {
                index = serializeObjectId(buffer, key, value, index);
            }
            else if (type === 'object' && value._bsontype === 'Decimal128') {
                index = serializeDecimal128(buffer, key, value, index);
            }
            else if (value._bsontype === 'Long' || value._bsontype === 'Timestamp') {
                index = serializeLong(buffer, key, value, index);
            }
            else if (value._bsontype === 'Double') {
                index = serializeDouble(buffer, key, value, index);
            }
            else if (value._bsontype === 'Code') {
                index = serializeCode(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, path);
            }
            else if (typeof value === 'function' && serializeFunctions) {
                index = serializeFunction(buffer, key, value, index);
            }
            else if (value._bsontype === 'Binary') {
                index = serializeBinary(buffer, key, value, index);
            }
            else if (value._bsontype === 'BSONSymbol') {
                index = serializeSymbol(buffer, key, value, index);
            }
            else if (value._bsontype === 'DBRef') {
                index = serializeDBRef(buffer, key, value, index, depth, serializeFunctions, path);
            }
            else if (value._bsontype === 'BSONRegExp') {
                index = serializeBSONRegExp(buffer, key, value, index);
            }
            else if (value._bsontype === 'Int32') {
                index = serializeInt32(buffer, key, value, index);
            }
            else if (value._bsontype === 'MinKey' || value._bsontype === 'MaxKey') {
                index = serializeMinMax(buffer, key, value, index);
            }
            else if (typeof value._bsontype !== 'undefined') {
                throw new BSONError(`Unrecognized or invalid _bsontype: ${String(value._bsontype)}`);
            }
        }
    }
    else {
        if (typeof object?.toBSON === 'function') {
            object = object.toBSON();
            if (object != null && typeof object !== 'object') {
                throw new BSONError('toBSON function did not return an object');
            }
        }
        for (const key of Object.keys(object)) {
            let value = object[key];
            if (typeof value?.toBSON === 'function') {
                value = value.toBSON();
            }
            const type = typeof value;
            if (typeof key === 'string' && !ignoreKeys.has(key)) {
                if (key.match(regexp) != null) {
                    throw new BSONError('key ' + key + ' must not contain null bytes');
                }
                if (checkKeys) {
                    if ('$' === key[0]) {
                        throw new BSONError('key ' + key + " must not start with '$'");
                    }
                    else if (~key.indexOf('.')) {
                        throw new BSONError('key ' + key + " must not contain '.'");
                    }
                }
            }
            if (type === 'string') {
                index = serializeString(buffer, key, value, index);
            }
            else if (type === 'number') {
                index = serializeNumber(buffer, key, value, index);
            }
            else if (type === 'bigint') {
                index = serializeBigInt(buffer, key, value, index);
            }
            else if (type === 'boolean') {
                index = serializeBoolean(buffer, key, value, index);
            }
            else if (value instanceof Date || isDate(value)) {
                index = serializeDate(buffer, key, value, index);
            }
            else if (value === undefined) {
                if (ignoreUndefined === false)
                    index = serializeNull(buffer, key, value, index);
            }
            else if (value === null) {
                index = serializeNull(buffer, key, value, index);
            }
            else if (isUint8Array(value)) {
                index = serializeBuffer(buffer, key, value, index);
            }
            else if (value instanceof RegExp || isRegExp(value)) {
                index = serializeRegExp(buffer, key, value, index);
            }
            else if (type === 'object' && value._bsontype == null) {
                index = serializeObject(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, path);
            }
            else if (typeof value === 'object' &&
                value[Symbol.for('@@mdb.bson.version')] !== BSON_MAJOR_VERSION) {
                throw new BSONVersionError();
            }
            else if (value._bsontype === 'ObjectId') {
                index = serializeObjectId(buffer, key, value, index);
            }
            else if (type === 'object' && value._bsontype === 'Decimal128') {
                index = serializeDecimal128(buffer, key, value, index);
            }
            else if (value._bsontype === 'Long' || value._bsontype === 'Timestamp') {
                index = serializeLong(buffer, key, value, index);
            }
            else if (value._bsontype === 'Double') {
                index = serializeDouble(buffer, key, value, index);
            }
            else if (value._bsontype === 'Code') {
                index = serializeCode(buffer, key, value, index, checkKeys, depth, serializeFunctions, ignoreUndefined, path);
            }
            else if (typeof value === 'function' && serializeFunctions) {
                index = serializeFunction(buffer, key, value, index);
            }
            else if (value._bsontype === 'Binary') {
                index = serializeBinary(buffer, key, value, index);
            }
            else if (value._bsontype === 'BSONSymbol') {
                index = serializeSymbol(buffer, key, value, index);
            }
            else if (value._bsontype === 'DBRef') {
                index = serializeDBRef(buffer, key, value, index, depth, serializeFunctions, path);
            }
            else if (value._bsontype === 'BSONRegExp') {
                index = serializeBSONRegExp(buffer, key, value, index);
            }
            else if (value._bsontype === 'Int32') {
                index = serializeInt32(buffer, key, value, index);
            }
            else if (value._bsontype === 'MinKey' || value._bsontype === 'MaxKey') {
                index = serializeMinMax(buffer, key, value, index);
            }
            else if (typeof value._bsontype !== 'undefined') {
                throw new BSONError(`Unrecognized or invalid _bsontype: ${String(value._bsontype)}`);
            }
        }
    }
    path.delete(object);
    buffer[index++] = 0x00;
    const size = index - startingIndex;
    buffer[startingIndex++] = size & 0xff;
    buffer[startingIndex++] = (size >> 8) & 0xff;
    buffer[startingIndex++] = (size >> 16) & 0xff;
    buffer[startingIndex++] = (size >> 24) & 0xff;
    return index;
}

function isBSONType(value) {
    return (value != null &&
        typeof value === 'object' &&
        '_bsontype' in value &&
        typeof value._bsontype === 'string');
}
const keysToCodecs = {
    $oid: ObjectId,
    $binary: Binary,
    $uuid: Binary,
    $symbol: BSONSymbol,
    $numberInt: Int32,
    $numberDecimal: Decimal128,
    $numberDouble: Double,
    $numberLong: Long,
    $minKey: MinKey,
    $maxKey: MaxKey,
    $regex: BSONRegExp,
    $regularExpression: BSONRegExp,
    $timestamp: Timestamp
};
function deserializeValue(value, options = {}) {
    if (typeof value === 'number') {
        const in32BitRange = value <= BSON_INT32_MAX && value >= BSON_INT32_MIN;
        const in64BitRange = value <= BSON_INT64_MAX && value >= BSON_INT64_MIN;
        if (options.relaxed || options.legacy) {
            return value;
        }
        if (Number.isInteger(value) && !Object.is(value, -0)) {
            if (in32BitRange) {
                return new Int32(value);
            }
            if (in64BitRange) {
                if (options.useBigInt64) {
                    return BigInt(value);
                }
                return Long.fromNumber(value);
            }
        }
        return new Double(value);
    }
    if (value == null || typeof value !== 'object')
        return value;
    if (value.$undefined)
        return null;
    const keys = Object.keys(value).filter(k => k.startsWith('$') && value[k] != null);
    for (let i = 0; i < keys.length; i++) {
        const c = keysToCodecs[keys[i]];
        if (c)
            return c.fromExtendedJSON(value, options);
    }
    if (value.$date != null) {
        const d = value.$date;
        const date = new Date();
        if (options.legacy) {
            if (typeof d === 'number')
                date.setTime(d);
            else if (typeof d === 'string')
                date.setTime(Date.parse(d));
            else if (typeof d === 'bigint')
                date.setTime(Number(d));
            else
                throw new BSONRuntimeError(`Unrecognized type for EJSON date: ${typeof d}`);
        }
        else {
            if (typeof d === 'string')
                date.setTime(Date.parse(d));
            else if (Long.isLong(d))
                date.setTime(d.toNumber());
            else if (typeof d === 'number' && options.relaxed)
                date.setTime(d);
            else if (typeof d === 'bigint')
                date.setTime(Number(d));
            else
                throw new BSONRuntimeError(`Unrecognized type for EJSON date: ${typeof d}`);
        }
        return date;
    }
    if (value.$code != null) {
        const copy = Object.assign({}, value);
        if (value.$scope) {
            copy.$scope = deserializeValue(value.$scope);
        }
        return Code.fromExtendedJSON(value);
    }
    if (isDBRefLike(value) || value.$dbPointer) {
        const v = value.$ref ? value : value.$dbPointer;
        if (v instanceof DBRef)
            return v;
        const dollarKeys = Object.keys(v).filter(k => k.startsWith('$'));
        let valid = true;
        dollarKeys.forEach(k => {
            if (['$ref', '$id', '$db'].indexOf(k) === -1)
                valid = false;
        });
        if (valid)
            return DBRef.fromExtendedJSON(v);
    }
    return value;
}
function serializeArray(array, options) {
    return array.map((v, index) => {
        options.seenObjects.push({ propertyName: `index ${index}`, obj: null });
        try {
            return serializeValue(v, options);
        }
        finally {
            options.seenObjects.pop();
        }
    });
}
function getISOString(date) {
    const isoStr = date.toISOString();
    return date.getUTCMilliseconds() !== 0 ? isoStr : isoStr.slice(0, -5) + 'Z';
}
function serializeValue(value, options) {
    if (value instanceof Map || isMap(value)) {
        const obj = Object.create(null);
        for (const [k, v] of value) {
            if (typeof k !== 'string') {
                throw new BSONError('Can only serialize maps with string keys');
            }
            obj[k] = v;
        }
        return serializeValue(obj, options);
    }
    if ((typeof value === 'object' || typeof value === 'function') && value !== null) {
        const index = options.seenObjects.findIndex(entry => entry.obj === value);
        if (index !== -1) {
            const props = options.seenObjects.map(entry => entry.propertyName);
            const leadingPart = props
                .slice(0, index)
                .map(prop => `${prop} -> `)
                .join('');
            const alreadySeen = props[index];
            const circularPart = ' -> ' +
                props
                    .slice(index + 1, props.length - 1)
                    .map(prop => `${prop} -> `)
                    .join('');
            const current = props[props.length - 1];
            const leadingSpace = ' '.repeat(leadingPart.length + alreadySeen.length / 2);
            const dashes = '-'.repeat(circularPart.length + (alreadySeen.length + current.length) / 2 - 1);
            throw new BSONError('Converting circular structure to EJSON:\n' +
                `    ${leadingPart}${alreadySeen}${circularPart}${current}\n` +
                `    ${leadingSpace}\\${dashes}/`);
        }
        options.seenObjects[options.seenObjects.length - 1].obj = value;
    }
    if (Array.isArray(value))
        return serializeArray(value, options);
    if (value === undefined)
        return null;
    if (value instanceof Date || isDate(value)) {
        const dateNum = value.getTime(), inRange = dateNum > -1 && dateNum < 253402318800000;
        if (options.legacy) {
            return options.relaxed && inRange
                ? { $date: value.getTime() }
                : { $date: getISOString(value) };
        }
        return options.relaxed && inRange
            ? { $date: getISOString(value) }
            : { $date: { $numberLong: value.getTime().toString() } };
    }
    if (typeof value === 'number' && (!options.relaxed || !isFinite(value))) {
        if (Number.isInteger(value) && !Object.is(value, -0)) {
            if (value >= BSON_INT32_MIN && value <= BSON_INT32_MAX) {
                return { $numberInt: value.toString() };
            }
            if (value >= BSON_INT64_MIN && value <= BSON_INT64_MAX) {
                return { $numberLong: value.toString() };
            }
        }
        return { $numberDouble: Object.is(value, -0) ? '-0.0' : value.toString() };
    }
    if (typeof value === 'bigint') {
        if (!options.relaxed) {
            return { $numberLong: BigInt.asIntN(64, value).toString() };
        }
        return Number(BigInt.asIntN(64, value));
    }
    if (value instanceof RegExp || isRegExp(value)) {
        let flags = value.flags;
        if (flags === undefined) {
            const match = value.toString().match(/[gimuy]*$/);
            if (match) {
                flags = match[0];
            }
        }
        const rx = new BSONRegExp(value.source, flags);
        return rx.toExtendedJSON(options);
    }
    if (value != null && typeof value === 'object')
        return serializeDocument(value, options);
    return value;
}
const BSON_TYPE_MAPPINGS = {
    Binary: (o) => new Binary(o.value(), o.sub_type),
    Code: (o) => new Code(o.code, o.scope),
    DBRef: (o) => new DBRef(o.collection || o.namespace, o.oid, o.db, o.fields),
    Decimal128: (o) => new Decimal128(o.bytes),
    Double: (o) => new Double(o.value),
    Int32: (o) => new Int32(o.value),
    Long: (o) => Long.fromBits(o.low != null ? o.low : o.low_, o.low != null ? o.high : o.high_, o.low != null ? o.unsigned : o.unsigned_),
    MaxKey: () => new MaxKey(),
    MinKey: () => new MinKey(),
    ObjectId: (o) => new ObjectId(o),
    BSONRegExp: (o) => new BSONRegExp(o.pattern, o.options),
    BSONSymbol: (o) => new BSONSymbol(o.value),
    Timestamp: (o) => Timestamp.fromBits(o.low, o.high)
};
function serializeDocument(doc, options) {
    if (doc == null || typeof doc !== 'object')
        throw new BSONError('not an object instance');
    const bsontype = doc._bsontype;
    if (typeof bsontype === 'undefined') {
        const _doc = {};
        for (const name of Object.keys(doc)) {
            options.seenObjects.push({ propertyName: name, obj: null });
            try {
                const value = serializeValue(doc[name], options);
                if (name === '__proto__') {
                    Object.defineProperty(_doc, name, {
                        value,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                }
                else {
                    _doc[name] = value;
                }
            }
            finally {
                options.seenObjects.pop();
            }
        }
        return _doc;
    }
    else if (doc != null &&
        typeof doc === 'object' &&
        typeof doc._bsontype === 'string' &&
        doc[Symbol.for('@@mdb.bson.version')] !== BSON_MAJOR_VERSION) {
        throw new BSONVersionError();
    }
    else if (isBSONType(doc)) {
        let outDoc = doc;
        if (typeof outDoc.toExtendedJSON !== 'function') {
            const mapper = BSON_TYPE_MAPPINGS[doc._bsontype];
            if (!mapper) {
                throw new BSONError('Unrecognized or invalid _bsontype: ' + doc._bsontype);
            }
            outDoc = mapper(outDoc);
        }
        if (bsontype === 'Code' && outDoc.scope) {
            outDoc = new Code(outDoc.code, serializeValue(outDoc.scope, options));
        }
        else if (bsontype === 'DBRef' && outDoc.oid) {
            outDoc = new DBRef(serializeValue(outDoc.collection, options), serializeValue(outDoc.oid, options), serializeValue(outDoc.db, options), serializeValue(outDoc.fields, options));
        }
        return outDoc.toExtendedJSON(options);
    }
    else {
        throw new BSONError('_bsontype must be a string, but was: ' + typeof bsontype);
    }
}
function parse(text, options) {
    const ejsonOptions = {
        useBigInt64: options?.useBigInt64 ?? false,
        relaxed: options?.relaxed ?? true,
        legacy: options?.legacy ?? false
    };
    return JSON.parse(text, (key, value) => {
        if (key.indexOf('\x00') !== -1) {
            throw new BSONError(`BSON Document field names cannot contain null bytes, found: ${JSON.stringify(key)}`);
        }
        return deserializeValue(value, ejsonOptions);
    });
}
function stringify(value, replacer, space, options) {
    if (space != null && typeof space === 'object') {
        options = space;
        space = 0;
    }
    if (replacer != null && typeof replacer === 'object' && !Array.isArray(replacer)) {
        options = replacer;
        replacer = undefined;
        space = 0;
    }
    const serializeOptions = Object.assign({ relaxed: true, legacy: false }, options, {
        seenObjects: [{ propertyName: '(root)', obj: null }]
    });
    const doc = serializeValue(value, serializeOptions);
    return JSON.stringify(doc, replacer, space);
}
function EJSONserialize(value, options) {
    options = options || {};
    return JSON.parse(stringify(value, options));
}
function EJSONdeserialize(ejson, options) {
    options = options || {};
    return parse(JSON.stringify(ejson), options);
}
const EJSON = Object.create(null);
EJSON.parse = parse;
EJSON.stringify = stringify;
EJSON.serialize = EJSONserialize;
EJSON.deserialize = EJSONdeserialize;
Object.freeze(EJSON);

const MAXSIZE = 1024 * 1024 * 17;
let buffer = ByteUtils.allocate(MAXSIZE);
function setInternalBufferSize(size) {
    if (buffer.length < size) {
        buffer = ByteUtils.allocate(size);
    }
}
function serialize(object, options = {}) {
    const checkKeys = typeof options.checkKeys === 'boolean' ? options.checkKeys : false;
    const serializeFunctions = typeof options.serializeFunctions === 'boolean' ? options.serializeFunctions : false;
    const ignoreUndefined = typeof options.ignoreUndefined === 'boolean' ? options.ignoreUndefined : true;
    const minInternalBufferSize = typeof options.minInternalBufferSize === 'number' ? options.minInternalBufferSize : MAXSIZE;
    if (buffer.length < minInternalBufferSize) {
        buffer = ByteUtils.allocate(minInternalBufferSize);
    }
    const serializationIndex = serializeInto(buffer, object, checkKeys, 0, 0, serializeFunctions, ignoreUndefined, null);
    const finishedBuffer = ByteUtils.allocate(serializationIndex);
    finishedBuffer.set(buffer.subarray(0, serializationIndex), 0);
    return finishedBuffer;
}
function serializeWithBufferAndIndex(object, finalBuffer, options = {}) {
    const checkKeys = typeof options.checkKeys === 'boolean' ? options.checkKeys : false;
    const serializeFunctions = typeof options.serializeFunctions === 'boolean' ? options.serializeFunctions : false;
    const ignoreUndefined = typeof options.ignoreUndefined === 'boolean' ? options.ignoreUndefined : true;
    const startIndex = typeof options.index === 'number' ? options.index : 0;
    const serializationIndex = serializeInto(buffer, object, checkKeys, 0, 0, serializeFunctions, ignoreUndefined, null);
    finalBuffer.set(buffer.subarray(0, serializationIndex), startIndex);
    return startIndex + serializationIndex - 1;
}
function deserialize(buffer, options = {}) {
    return internalDeserialize(ByteUtils.toLocalBufferType(buffer), options);
}
function calculateObjectSize(object, options = {}) {
    options = options || {};
    const serializeFunctions = typeof options.serializeFunctions === 'boolean' ? options.serializeFunctions : false;
    const ignoreUndefined = typeof options.ignoreUndefined === 'boolean' ? options.ignoreUndefined : true;
    return internalCalculateObjectSize(object, serializeFunctions, ignoreUndefined);
}
function deserializeStream(data, startIndex, numberOfDocuments, documents, docStartIndex, options) {
    const internalOptions = Object.assign({ allowObjectSmallerThanBufferSize: true, index: 0 }, options);
    const bufferData = ByteUtils.toLocalBufferType(data);
    let index = startIndex;
    for (let i = 0; i < numberOfDocuments; i++) {
        const size = bufferData[index] |
            (bufferData[index + 1] << 8) |
            (bufferData[index + 2] << 16) |
            (bufferData[index + 3] << 24);
        internalOptions.index = index;
        documents[docStartIndex + i] = internalDeserialize(bufferData, internalOptions);
        index = index + size;
    }
    return index;
}

var bson = /*#__PURE__*/Object.freeze({
    __proto__: null,
    BSONError: BSONError,
    BSONRegExp: BSONRegExp,
    BSONRuntimeError: BSONRuntimeError,
    BSONSymbol: BSONSymbol,
    BSONType: BSONType,
    BSONValue: BSONValue,
    BSONVersionError: BSONVersionError,
    Binary: Binary,
    Code: Code,
    DBRef: DBRef,
    Decimal128: Decimal128,
    Double: Double,
    EJSON: EJSON,
    Int32: Int32,
    Long: Long,
    MaxKey: MaxKey,
    MinKey: MinKey,
    ObjectId: ObjectId,
    Timestamp: Timestamp,
    UUID: UUID,
    calculateObjectSize: calculateObjectSize,
    deserialize: deserialize,
    deserializeStream: deserializeStream,
    serialize: serialize,
    serializeWithBufferAndIndex: serializeWithBufferAndIndex,
    setInternalBufferSize: setInternalBufferSize
});

exports.BSON = bson;
exports.BSONError = BSONError;
exports.BSONRegExp = BSONRegExp;
exports.BSONRuntimeError = BSONRuntimeError;
exports.BSONSymbol = BSONSymbol;
exports.BSONType = BSONType;
exports.BSONValue = BSONValue;
exports.BSONVersionError = BSONVersionError;
exports.Binary = Binary;
exports.Code = Code;
exports.DBRef = DBRef;
exports.Decimal128 = Decimal128;
exports.Double = Double;
exports.EJSON = EJSON;
exports.Int32 = Int32;
exports.Long = Long;
exports.MaxKey = MaxKey;
exports.MinKey = MinKey;
exports.ObjectId = ObjectId;
exports.Timestamp = Timestamp;
exports.UUID = UUID;
exports.calculateObjectSize = calculateObjectSize;
exports.deserialize = deserialize;
exports.deserializeStream = deserializeStream;
exports.serialize = serialize;
exports.serializeWithBufferAndIndex = serializeWithBufferAndIndex;
exports.setInternalBufferSize = setInternalBufferSize;
//# sourceMappingURL=bson.cjs.map


/***/ }),

/***/ 419:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"X":{"postExecutionScriptName":"./post_exec.sh","dbPath":"courtBooking.db","dbScriptsFolderPath":"./dbScripts","newContractZipFileName":"./newContractData.zip"}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const HotPocket = __nccwpck_require__(875);
const { Controller } = __nccwpck_require__(656);
const { DBInitializer } = __nccwpck_require__(616);
const bson = __nccwpck_require__(618);
const { SharedService } = __nccwpck_require__(981);
const { EventTypes } = __nccwpck_require__(488);

const foodWasteReductionContract = async ctx => {
	console.log(`court booking contract is running.`);

	SharedService.context = ctx;
	const isReadOnly = ctx.readonly;

	if (!isReadOnly) {
		// Listen to npl message with specific type
		ctx.unl.onMessage((node, msg) => {
			const obj = JSON.parse(msg.toString());
			if (obj.type && obj.type === EventTypes.HTTP_RESPONSE) {
				SharedService.nplEventEmitter.emit(EventTypes.HTTP_RESPONSE, node, msg);
			} else {
				throw "An event type is neither a defined nor a accepted type.";
			}
		});
	}

	// Initialize database
	await DBInitializer.init();

	const controller = new Controller();

	for (const user of ctx.users.list()) {
		// Loop through inputs sent by each user.
		for (const input of user.inputs) {
			// Read the data buffer sent by user (this can be any kind of data like string, json or binary data).
			const buf = await ctx.users.read(input);

			let message = null;
			console.log(`User ${user.id} sent a message: ${buf.toString()}`);
			// Let's assume all data buffers for this contract are JSON,   but for contract upload, it is BSON
			try {
				message = JSON.parse(buf);
			} catch (e) {
				message = bson.deserialize(buf);
			}
			// Pass the JSON message to our application logic component.
			await controller.handleRequest(user, message, isReadOnly);
		}
	}
};

const hpc = new HotPocket.Contract();
hpc.init(foodWasteReductionContract, null, true);

})();

module.exports = __webpack_exports__;
/******/ })()
;