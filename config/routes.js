/*!
 * Module dependencies.
 */

var async = require('async')

/**
 * Controllers
 */

var customers = require('../app/controllers/customers'),
    items = require('../app/controllers/items'),
    admins = require('../app/controllers/admins'),
    auth = require('./middlewares/authorization');

/**
 * Route middlewares
 */

var customerAuth = [auth.customer.requiresLogin, auth.customer.hasAuthorization];

/**
 * Expose routes
 */

module.exports = function (app, passport) {
    app.get('/', customers.home);
    app.get('/items/d/:itemid', items.detail);
    app.post('/items/s/a/:itemid/:skuid', items.addToShoppingcart);
    app.get("/customer/checkout", auth.customer.requiresLogin, customers.showcart);
    app.get("/customer/showcart", customers.showcart);
    app.get("/customer/register", customers.register);
    app.get("/customer/login", customers.login);
    app.get("/customer/logout", customers.logout);
    app.get("/customer/:customerId/profile", customerAuth, customers.profile);
    app.get("/customer/:customerId/myorder", customerAuth, customers.myorder);
    app.post("/customer/login",
        passport.authenticate('customer', {
            failureRedirect: '/customer/login'
        }),
        customers.authCallback);
    app.post("/customer/register", customers.create);
    app.get("/customer/get-shoppingcart", customers.getShoppingCart);
    app.param('customerId', customers.customer);

}
