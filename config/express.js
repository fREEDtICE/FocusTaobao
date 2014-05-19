/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
//    io = require('socket.io'),
    session = require('express-session'),
    winston = require('winston'),
    helmet = require('helmet'),
    taobao = require('taobao');

var mongoose = require('mongoose'),
//        sesion_mongo = require('connect-mongo')(express);
    RedisStore = require('connect-redis')(session);

var swig = require('swig');

var pkg = require('../package.json');

var langMng = require("../app/models/LangDictManager"),
    MemMng = require("../app/datas/MemManager");

var env = process.env.NODE_ENV || 'development';

module.exports = function (app, config, passport) {

    app.set('showStackError', true)


    // Logging
    // Use winston on production
    var log
    if (env !== 'development') {
        log = {
            stream: {
                write: function (message, encoding) {
                    winston.info(message)
                }
            }
        }
    } else {
        log = 'dev'
    }
    // Don't log during tests
    if (env !== 'test') app.use(express.logger(log))

    // all environments
    app.set('port', process.env.PORT || 8000);
    app.engine('html', swig.renderFile);
    app.set('view engine', 'html');
    app.set('views', config.root + "/app/views");
//app.set('view engine', 'jade');

    require("./template")(swig);

    app.set('view cache', false);
// To disable Swig's cache, do the following:
    swig.setDefaults({ cache: false });

    // should be placed before express.static
    app.use(express.compress({
        filter: function (req, res) {
            return /json|text|javascript|css/.test(res.getHeader('Content-Type'))
        },
        level: 9
    }));

    app.use(express.favicon());
//    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());

    app.use(helmet.xframe());
    app.use(helmet.iexss());
    app.use(helmet.contentTypeOptions());
    app.use(helmet.cacheControl());
    app.use(express.methodOverride());
    app.use(express.cookieParser(config.session.secret));
    app.use(express.session({
        secret: config.session.secret,
        store: new RedisStore({
            db: 'focustaobao',
            host: "localhost",
            port: 6379,
            ttl: 60 * 10
        }),
        cookie: { maxAge: 60 * 1000 * 30, expires: new Date(Date.now() + 60 * 1000 * 30), httpOnly: true }
    }));

    var connect = function () {
        mongoose.connect(config.db, config.mongoose.options);
    }
    connect();

// Error handler
    mongoose.connection.on('error', function (err) {
        console.log(err);
    })

// Reconnect when closed
    mongoose.connection.on('disconnected', function () {
        connect();
    })
    taobao.config({
        app_key: config.taobao.app_key,
        app_secret: config.taobao.app_secret
    });

    app.use(express.static(config.root + '/public'));

    app.use(express.csrf({
        value: function (req) {
            return req.session.__csrf;
        }
    }));
    app.use(function (req, res, next) {
        var token = req.csrfToken();
        res.locals.csrftoken = token;
        req.session.__csrf = token;
        next();
    });

    app.param(function (name, fn) {
        if (fn instanceof RegExp) {
            return function (req, res, next, val) {
                var captures;
                if (captures = fn.exec(String(val))) {
                    req.params[name] = captures;
                    next();
                } else {
                    next('route');
                }
            }
        }
    });

//app.set('socket.io', io.listen(8100));

    MemMng.init(config.memcached.server, config.memcached.config);

//app.set('lang_mng', langMng);

    app.use(app.router);

    app.use(function (req, res, next) {
        if (req.method !== "GET") {
            return next();
        }

        function getLang(req) {
            return (req.cookies.fav_lang) || (req.acceptedLanguages && req.acceptedLanguages.length > 0 ?
                req.acceptedLanguages[0] : "en");
        };

        res.locals.langs = (function () {
            var lang = getLang(req);
//        var langDict = langMng.getDict(lang) || langMng.getDict("en");
            return langMng.getDict(lang) || langMng.getDict("en");
        })(req);
        next();
    });

    app.use(function (err, req, res, next) {
        if (err) {
            console.log(err);
            console.log(err.stack);
            return res.send(500);
        }

        res.status(404);

        // respond with html page
        if (req.accepts('html')) {
            res.render('404', { url: req.url });
            return;
        }

        // respond with json
        if (req.accepts('json')) {
            res.send({ error: 'Not found' });
            return;
        }

        // default to plain-text. send()
        res.type('txt').send('Not found');
    });

// development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }


    // set views path, template engine and default layout
//    app.set('views', config.root + '/app/views')
//    app.set('view engine', 'jade')
//
//    app.configure(function () {
//        // expose package.json to views
//        app.use(function (req, res, next) {
//            res.locals.pkg = pkg
//            next()
//        })
//
//        // cookieParser should be above session
//        app.use(express.cookieParser())
//
//        // bodyParser should be above methodOverride
//        app.use(express.bodyParser())
//        app.use(express.methodOverride())
//
//        // express/mongo session storage
//        app.use(express.session({
//            secret: pkg.name,
//            store: new mongoStore({
//                url: config.db,
//                collection: 'sessions'
//            })
//        }))
//
//        // use passport session
//        app.use(passport.initialize())
//        app.use(passport.session())
//
//        // connect flash for flash messages - should be declared after sessions
//        app.use(flash())
//
//        // should be declared after session and flash
//        app.use(helpers(pkg.name))
//
//        // adds CSRF support
//        if (process.env.NODE_ENV !== 'test') {
//            app.use(express.csrf())
//
//            // This could be moved to view-helpers :-)
//            app.use(function (req, res, next) {
//                res.locals.csrf_token = req.csrfToken()
//                next()
//            })
//        }
//
//        // routes should be at the last
//
//        // assume "not found" in the error msgs
//        // is a 404. this is somewhat silly, but
//        // valid, you can do whatever you like, set
//        // properties, use instanceof etc.
//        app.use(function (err, req, res, next) {
//            // treat as 404
//            if (err.message
//                && (~err.message.indexOf('not found')
//                    || (~err.message.indexOf('Cast to ObjectId failed')))) {
//                return next()
//            }
//
//            // log it
//            // send emails if you want
//            console.error(err.stack)
//
//            // error page
//            res.status(500).render('500', { error: err.stack })
//        })
//
//        // assume 404 since no middleware responded
//        app.use(function (req, res, next) {
//            res.status(404).render('404', {
//                url: req.originalUrl,
//                error: 'Not found'
//            })
//        })
//    })
//
//    // development env config
//    app.configure('development', function () {
//        app.locals.pretty = true
//    })
}