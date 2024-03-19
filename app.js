if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
};

const express = require('express');
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require('express-session');
const passport = require('passport');
require('./auth');

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

// Database connection
// const dbURL = "mongodb://127.0.0.1:27017/uexam";

// main()
//   .then(() => {
//     console.log("mongodb connection sucessfull");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// async function main() {
//   await mongoose.connect(dbURL);
// }

// Set and use
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Session
app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.render("home.ejs");
});

app.get('/auth/google',
passport.authenticate('google', { scope: [ 'email', 'profile' ] }
));

app.get('/auth/google/callback',
passport.authenticate( 'google', {
  successRedirect: '/dashboard',
  failureRedirect: '/auth/google/failure'
})
);

app.get('/dashboard', isLoggedIn, (req, res) => {
  res.render("dashboard/index.ejs",
  {
    title: "Dashboard - UExam",
    name: req.user.displayName,
    profilePicture: req.user.picture,
  });
});

app.get('/test', (req, res) => {
  res.render("exam/test.ejs");
});

app.get('/dashboard/profile', isLoggedIn, (req, res) => {
  res.render("dashboard/profile.ejs",
  {
    title: "Profile - UExam",
    css: "/css/profile.css",
    id: req.user.id,
    firstName: req.user.name.givenName,
    lastName: req.user.name.familyName,
    name: req.user.displayName,
    profilePicture: req.user.picture,
    email: req.user.emails[0].value
  });
});

app.get('/logout', function(req, res) {
  req.logout(function(err) {
    if (err) {
      console.log('Logout error:', err);
            res.status(500).send('Logout failed');
        } else {
            req.session.destroy();
            res.redirect('/');
        }
    });
});

app.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});

app.listen(8080, () => console.log('listening on port: 8080'));