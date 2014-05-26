var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var validator = require("validator");

var util = require("../../utils/CommonUtils");

var ValidRoles = ["super", "buyer", "logistic", "admin", "customer_service"];

var AdminSchema = new Schema({
    token: {type: String, unique: true, required: true},
    salt: {type: String, required: true},
    hpwd: {type: String, required: true},
    role: {type: String, required: true, default: ["customer_service"]},
    lastLogin: {type: Number, default: Date.now()},
    status: Number
});

AdminSchema.virtual("password").set(function (pwd) {
    this.salt = this.makeSalt();
    this.hpwd = this.encryptPassword(pwd, salt);
    this.pwd = this.pwd;
}).get(function () {
    return this.pwd;
});


AdminSchema.path("role").validate(function (v) {
    return util.inArray(ValidRoles, v);
}, "invalid role");

AdminSchema.methods.makeSalt = function () {
    return require("crypto").randomBytes(32).toString('hex');
};

AdminSchema.methods.authenticate = function (pwd) {
    return this.hpwd === this.encryptPassword(pwd);
};

AdminSchema.methods.encryptPassword = function (pwd) {
    if (!pwd) {
        return '';
    }
    try {
        return require("crypto").createHmac('sha1', this.salt).update(pwd).digest('hex');
    } catch (err) {
        return ''
    }
};

var Admin = mongoose.model('Admin', AdminSchema);

module.exports.schema = exports.schema = AdminSchema;

module.exports.model = exports.model = Admin;