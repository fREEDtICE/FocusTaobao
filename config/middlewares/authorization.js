/*
 *  User authorization routing middleware
 */

var mongoose = require('mongoose'),
    Customer = mongoose.model('Customer'),
    Admin = mongoose.model('Admin');

exports.customer = {
    hasAuthorization: function (req, res, next) {
        if (req.customer.id != req.user.id) {
            var routePath = req.route.path.replace(":customerId", req.customer.id);
            return res.redirect(routePath);
        }
        next();
    },
    requiresLogin: function (req, res, next) {
        if (req.isAuthUserCustomer()) {
            return next();
        }
        if (req.method === 'GET') {
            req.session.returnTo = req.originalUrl;
        }
        res.redirect('/customer/login');
    }
};
