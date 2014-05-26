var httphelper = require("../../utils/HttpHelper");

var _ = require('lodash');

var mongoose = require('mongoose'),
    Customer = mongoose.model('Customer');

var convertSignedCookies = function (object) {
    if (!object) {
        return {};
    }

    var parseTime = 0;
    while ((typeof object === 'string') && (parseTime < 3)) {
        try {
            object = JSON.parse(object);
        }
        catch (ex) {
            console.log(ex);
        }
        parseTime++;
    }

    return object;
};

var syncShoppingCart = function (req, res) {
    var cookieShoppingCart = req.signedCookies.shoppingcart;
    var resultCart;
    if (req.isAuthUserCustomer()) {
        console.log("is authenticated");
        if (cookieShoppingCart) {
            cookieShoppingCart = convertSignedCookies(cookieShoppingCart);
            req.user.cookieToCart(cookieShoppingCart);
            res.clearCookie("shoppingcart");
        }
        resultCart = req.user.shoppingcart;
    } else {
        cookieShoppingCart = convertSignedCookies(cookieShoppingCart);
        resultCart = [];
        _.forIn(cookieShoppingCart, function (v, k) {
            resultCart.push(v);
        });
    }
    return resultCart;
};


exports.getShoppingCart = function (req, res) {
    return httphelper.JSONResponse(res, syncShoppingCart(req, res));
};


exports.register = function (req, res) {
    return res.render("customer/register", {
        customer: new Customer()
    });
};

exports.create = function (req, res) {
    var customer = new Customer(req.body);
    customer.save(function (err) {
        if (err) {
            return res.render('customer/register', {
                customer: customer
            });
        }

        // manually login the user once successfully signed up
        req.logIn(customer, function (err) {
            if (err) {
                return next(err);
            }
            exports.authCallback(req, res);
        });
    })
};

exports.authCallback = function (req, res) {
    var redirectTo = req.session.returnTo ? req.session.returnTo : '/';
    delete req.session.returnTo;
    res.redirect(redirectTo);
};

exports.customer = function (req, res, next, id) {
    Customer.findOne({ _id: id }).exec(function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new Error('Failed to load User ' + id))
        }
        req.customer = user;
        next();
    });
};

exports.login = function (req, res) {
    return res.render("customer/login");
};

exports.profile = function (req, res) {
    return res.render("customer/profile");
};

exports.logout = function (req, res) {
    req.logout();
    res.redirect('/customer/login');
};

exports.home = function (req, res) {
    return res.render("customer/home", {showcart: true});
};

exports.pay = function (req, res) {
    return res.render("customer/pay");
};

exports.submitOrder = function (req, res) {
    var cart = req.user.shoppingcart;
};


exports.doPayment = function (req, res) {

};


exports.showcart = function (req, res, next) {
    return res.render("customer/showcart", {"shoppingcart": syncShoppingCart(req, res)});
};

exports.checkout = function (req, res, next) {
    return res.render("customer/checkout", {"shoppingcart": syncShoppingCart(req, res)});
};

exports.myorder = function (req, res, next) {
    return res.render("customer/myorder");
};

exports.adjustCartItemQuantity = function (req, res, next) {
    if (req.isAuthUserCustomer()) {

    } else {

    }
};

exports.removeCartItem = function (req, res, next) {
    if (req.isAuthUserCustomer()) {

    } else {

    }
};









