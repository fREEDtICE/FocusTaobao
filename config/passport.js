var mongoose = require('mongoose'),
    LocalStrategy = require('passport-local').Strategy,
//  , TwitterStrategy = require('passport-twitter').Strategy
//  , FacebookStrategy = require('passport-facebook').Strategy
//  , GitHubStrategy = require('passport-github').Strategy
//  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
//  , LinkedinStrategy = require('passport-linkedin').Strategy
    Admin = mongoose.model('Admin'),
    Customer = mongoose.model("Customer");


module.exports = function (passport, config) {
    // require('./initializer')

    // serialize sessions
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        Admin.findOne({ _id: id }, function (err, user) {
            done(err, user);
        })
    });

    passport.deserializeUser(function (id, done) {
        Customer.findOne({ _id: id }, function (err, user) {
            done(err, user);
        })
    });

    // use local strategy
    passport.use("admin", new LocalStrategy({
            usernameField: 'token',
            passwordField: 'password'
        },
        function (token, pwd, done) {
            Admin.findOne({ token: token }, function (err, admin) {
                if (err) {
                    return done(err);
                }
                if (!admin) {
                    return done(null, false, { message: 'Unknown administrator' });
                }
                if (!admin.authenticate(pwd)) {
                    return done(null, false, { message: 'Invalid password' });
                }
                return done(null, admin);
            })
        }
    ));

    passport.use("admin", new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function (email, pwd, done) {
            Customer.findOne({ email: email }, function (err, cus) {
                if (err) {
                    return done(err);
                }
                if (!cus) {
                    return done(null, false, { message: 'Unknown customer' });
                }
                if (!cus.authenticate(pwd)) {
                    return done(null, false, { message: 'Invalid password' });
                }
                return done(null, admin);
            })
        }
    ));

//    // use twitter strategy
//    passport.use(new TwitterStrategy({
//            consumerKey: config.twitter.clientID,
//            consumerSecret: config.twitter.clientSecret,
//            callbackURL: config.twitter.callbackURL
//        },
//        function (token, tokenSecret, profile, done) {
//            User.findOne({ 'twitter.id_str': profile.id }, function (err, user) {
//                if (err) {
//                    return done(err)
//                }
//                if (!user) {
//                    user = new User({
//                        name: profile.displayName,
//                        username: profile.username,
//                        provider: 'twitter',
//                        twitter: profile._json
//                    })
//                    user.save(function (err) {
//                        if (err) console.log(err)
//                        return done(err, user)
//                    })
//                }
//                else {
//                    return done(err, user)
//                }
//            })
//        }
//    ))
//
//    // use facebook strategy
//    passport.use(new FacebookStrategy({
//            clientID: config.facebook.clientID,
//            clientSecret: config.facebook.clientSecret,
//            callbackURL: config.facebook.callbackURL
//        },
//        function (accessToken, refreshToken, profile, done) {
//            User.findOne({ 'facebook.id': profile.id }, function (err, user) {
//                if (err) {
//                    return done(err)
//                }
//                if (!user) {
//                    user = new User({
//                        name: profile.displayName,
//                        email: profile.emails[0].value,
//                        username: profile.username,
//                        provider: 'facebook',
//                        facebook: profile._json
//                    })
//                    user.save(function (err) {
//                        if (err) console.log(err)
//                        return done(err, user)
//                    })
//                }
//                else {
//                    return done(err, user)
//                }
//            })
//        }
//    ))
//
//    // use github strategy
//    passport.use(new GitHubStrategy({
//            clientID: config.github.clientID,
//            clientSecret: config.github.clientSecret,
//            callbackURL: config.github.callbackURL
//        },
//        function (accessToken, refreshToken, profile, done) {
//            User.findOne({ 'github.id': profile.id }, function (err, user) {
//                if (!user) {
//                    user = new User({
//                        name: profile.displayName,
//                        email: profile.emails[0].value,
//                        username: profile.username,
//                        provider: 'github',
//                        github: profile._json
//                    })
//                    user.save(function (err) {
//                        if (err) console.log(err)
//                        return done(err, user)
//                    })
//                } else {
//                    return done(err, user)
//                }
//            })
//        }
//    ))
//
//    // use google strategy
//    passport.use(new GoogleStrategy({
//            clientID: config.google.clientID,
//            clientSecret: config.google.clientSecret,
//            callbackURL: config.google.callbackURL
//        },
//        function (accessToken, refreshToken, profile, done) {
//            User.findOne({ 'google.id': profile.id }, function (err, user) {
//                if (!user) {
//                    user = new User({
//                        name: profile.displayName,
//                        email: profile.emails[0].value,
//                        username: profile.username,
//                        provider: 'google',
//                        google: profile._json
//                    })
//                    user.save(function (err) {
//                        if (err) console.log(err)
//                        return done(err, user)
//                    })
//                } else {
//                    return done(err, user)
//                }
//            })
//        }
//    ));
//
//    // use linkedin strategy
//    passport.use(new LinkedinStrategy({
//            consumerKey: config.linkedin.clientID,
//            consumerSecret: config.linkedin.clientSecret,
//            callbackURL: config.linkedin.callbackURL,
//            profileFields: ['id', 'first-name', 'last-name', 'email-address']
//        },
//        function (accessToken, refreshToken, profile, done) {
//            User.findOne({ 'linkedin.id': profile.id }, function (err, user) {
//                if (!user) {
//                    user = new User({
//                        name: profile.displayName, email: profile.emails[0].value, username: profile.emails[0].value, provider: 'linkedin'
//                    })
//                    user.save(function (err) {
//                        if (err) console.log(err)
//                        return done(err, user)
//                    })
//                } else {
//                    return done(err, user)
//                }
//            })
//        }
//    ));
}
