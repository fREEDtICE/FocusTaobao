var mongoose = require('mongoose'),
    Customer = mongoose.model('Customer');

exports.register = function (req, res) {
};

exports.login = function (req, res) {
};

exports.showProfile = function (req, res) {
};

exports.editProfile = function (req, res) {
};

exports.logout = function (req, res) {
};

exports.addShoppingCart = function (req, res) {
};

exports.home = function (req, res) {
    console.log("asdasd");
    res.render("customer/home", {user: {name: "test"}});
};






