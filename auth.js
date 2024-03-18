const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

CLIENTID: "322533522504-fvjeefbu8nisf9pk72m81r1sr7qjfskh.apps.googleusercontent.com";
CLIENTSECRET: "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";

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