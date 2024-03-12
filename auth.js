const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy({
    // clientID: CLIENTID,
    // clientSecret: CLIENTSECRET,
    clientID: process.env.CLIENTID,
    clientSecret: process.env.CLIENTSECRET,
    // callbackURL: "http://localhost:8080/auth/google/callback",
    callbackURL: "/auth/google/callback",
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
            return done(null, profile);
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});