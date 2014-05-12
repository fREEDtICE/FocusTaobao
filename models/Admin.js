var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    Mixed = Schema.Types.Mixed;

var validator = require("validator");

var ValidRoles = ["super", "buyer"].join(",");

var AdminSchema = new Schema({
    token: {type: String, unique: true, required: true},
    salt: {type: Buffer, required: true},
    pwd: {type: String, required: true},
    roles: {type: [String], required: true, default: ["guest"]},
    lastLogin: {type: Number, default: Date.now()},
    status: Number
});


var Admin = mongoose.model('Admin', AdminSchema);

Admin.schema.path("roles").validate(function (v) {
    return v instanceof Array;
}, "invalid role");

AdminSchema.methods.addRole = function (role) {
    if (!validator.contains(ValidRoles, role)) {
        return new Error("invalid role value");
    }

    this.roles.push(role);
    return this.save(function (err) {
        if (err) {
            console.log(err);
        }
    });
};

module.exports.schema = exports.schema = AdminSchema;

module.exports.model = exports.model = Admin;