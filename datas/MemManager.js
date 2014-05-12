var Memcached = require("memcached"),
    async = require("async"),
    BloomFilter = require("bloomfilter").BloomFilter;

module.exports = exports = (function () {
    this.defaultLoc = "127.0.0.1:11222";
    this.defaultConfig = {
        "maxKeySize": 500,
        "maxExpiration": 60 * 60 * 24,
        "maxValue": 1024 * 1024,
        "poolSize": 10,
        "reconnect": 60 * 1000 * 30,
        "timeout": 2000,
        "retries": 2,
        "retry": 5000,
        "idle": 3000
    };
    this.mems = {};
    this.location = this.defaultLoc;
    this.config = JSON.parse(JSON.stringify(this.defaultConfig));


    var that = this;


    function BloomMem(bloomCfg) {
        bloomCfg = bloomCfg || {
            bits: 512 * 32,
            funcs: 16
        };

        this.mem = new Memcached(that.location, that.config);
        var bits = (bloomCfg.bits ? bloomCfg.bits : 512 * 32),
            funcs = (bloomCfg.funcs ? bloomCfg.funcs : 16);
        this.bloom = new BloomFilter(bits, funcs);
        this.lifetime = 60 * 60 * 24;
    };

    BloomMem.prototype.touch = function (key, cb) {
        var me = this;
        me.mem.touch(key, me.lifetime, cb);
    };


    BloomMem.prototype.set = function (key, value, cb) {
        var me = this;
        var lifetime = me.lifetime;
        if (arguments.length > 3) {
            lifetime = (typeof arguments[2] === "number") ? arguments[2] : me.lifetime;
            cb = arguments[arguments.length - 1];
        }
        me.mem.set(key, value, lifetime, function (err) {
            console.log("bloom set key is %s, time is %s", key, lifetime);
            console.log(err);
            if (!err) {
                me.bloom.add(key);
                console.log("bloom add key %s", key);
            }

            if ("function" === typeof cb) {
                return cb(err);
            }
        });
    };

    BloomMem.prototype.get = function (key, cb) {
        console.log("bloom test ==> " + this.bloom.test(key));
        if (this.bloom.test(key)) {
            return this.mem.get(key, cb);
        } else if (cb) {
            return cb(null, null);
        }
    };

    BloomMem.prototype.getOrCache = function (key, fn, callback) {
        var me = this, args = Array.prototype.slice.call(arguments);
//      key, fn, fn-params, cb
        function getInCache(cb) {
            me.get(key, function (err, data) {
                cb(err, data);
            });
        };

        function cacheIfNotExists(data, cb) {
            if (!data) {
//                var lifetime;
                var fn_args;
                if (args.length > 3) {
                    fn_args = args.slice(2, args.length - 1);
//                    lifetime = args[3];
                }
//                lifetime = (lifetime instanceof Number) ? lifetime : me.lifetime;


                var result;
                if ("function" === typeof fn) {
                    result = fn.apply(this, fn_args);
                }


                if (result) {
                    me.set(key, data, function (err) {
                        return cb(err, data)
                    });
                }
            } else {
                return cb(null, data);
            }
        };

        var exe_funcs = [];
        if (args.length < 1) {
            return new Error("invalid args, need key");
        }
        exe_funcs.push(getInCache);

        if (args.length > 2) {
            exe_funcs.push(cacheIfNotExists);
        }

        async.waterfall(exe_funcs, function (err, result) {
            callback = args[args.length - 1];
            if (callback instanceof Function) {
                callback(err, result);
            }
        });
    };


    return {
        init: function (loc, config) {
            that.location = loc || that.defaultLoc;
            that.config = config || JSON.parse(JSON.stringify(that.defaultConfig));
        },

        getMem: function (key) {
            var mem = that.mems[key];
            if (!mem) {
                mem = new BloomMem();
                that.mems[key] = mem;
            }
            return mem;
        }
    };
}());