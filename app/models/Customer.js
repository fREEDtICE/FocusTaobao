var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    validator = require('validator'),
    ObjectId = Schema.ObjectId;

var CustomerSchema = new Schema({
    firstName: {type: String},
    lastName: {type: String},
    email: {type: String, required: true, unique: true},
    gender: {type: Number, default: -1},
    phone: {type: String, unique: true},
    salt: Buffer,
    hpwd: {type: String, required: true},
    lastLogin: {type: Number, default: Date.now()},
    moneyAccount: {
        paypal: {type: Number, dedault: 0},
        money: {type: Number, dedault: 0}
    },
    shippingAddress: [
        {
            zipCode: Number,
            addressee: {type: String, required: true},
            addresseeContact: {type: String, required: true},
            address: {type: String, required: true},
            tag: String
        }
    ]
});

CustomerSchema.virtual("pwd").set(function (pwd) {
    this.salt = this.makeSalt();
    this.hpwd = this.encryptPassword(pwd, salt);
    this.pwd = this.pwd;
}).get(function () {
    return this.pwd;
});

CustomerSchema.path("email").validate(function (v) {
    return validator.isEmail(v);
}, "invalid email");

CustomerSchema.path("gender").validate(function (v) {
    return /0|1|-1/i.test(v);
}, "invalid gender");

CustomerSchema.path("phone").validate(function (v) {
    return  /^\d{6,15}$/.test(v);
}, "invalid phone");

CustomerSchema.methods.makeSalt = function () {
    return require("crypto").randomBytes(32).toString('hex');
};

CustomerSchema.methods.authenticate = function (pwd) {
    return this.hpwd === this.encryptPassword(pwd);
};

CustomerSchema.methods.encryptPassword = function (pwd) {
    if (!pwd) {
        return '';
    }
    try {
        return require("crypto").createHmac('sha1', this.salt).update(pwd).digest('hex');
    } catch (err) {
        return ''
    }
};


var Customer = mongoose.model('Customer', CustomerSchema);

module.exports.schema = exports.schema = CustomerSchema;

module.exports.model = exports.model = Customer;