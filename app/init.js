exports.CataManager = module.exports.CataManager = require('./singletons/CategoryManager');
exports.LangManager = module.exports.LangManager = require('./singletons/LangDictManager');
exports.MemManager = module.exports.MemManager = require('./singletons/MemManager');

exports = module.exports = function (app, config) {
    console.log(config);
    exports.MemManager.init(config.memcached.server, config.memcached.config);
};