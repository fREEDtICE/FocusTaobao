//var mongoose = require('mongoose'),
//    Schema = mongoose.Schema,
//    validator = require('validator'),
//    util = require("util");
//
//
//function BaseSchema() {
//    Schema.call(this);
//};
//
//util.inherits(BaseSchema, Schema);
//
//console.log(BaseSchema);
//
//BaseSchema.pre("save", function (next) {
//    var self = this;
//    self.eachPath(function (p) {
//        console.log(p.pathType);
//    });
//});
//
//module.exports = exports = BaseSchema;