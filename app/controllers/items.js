var httphelper = require("../utils/HttpHelper"),
    tpi = require("../utils/TOPExecutor"),
    path = require("path"),
    swig = require("swig"),
    async = require("async"),
    crypto = require('crypto'),
    validator = require('validator'),
    app_cfg = require("../../app_config"),
    topConstants = require("../datas/TOPConstants"),
    validator = require("validator");

exports.detail = function (req, res) {
    var id = validator.toInt(req.params.itemid);
    if (!validator.isNumeric(id)) {
        return httphelper.errorResponse(res);
    }
};