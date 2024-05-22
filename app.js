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
const User = require('./models/user.js')
const cookieParser = require('cookie-parser');
require('./auth');

app.use(cookieParser());

//
function isLoggedIn(req, res, next) {
  if (req.cookies.authToken) {
    next();
  } else {
    res.sendStatus(400);
  }
}

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
  passport.authenticate('google', { scope: ['email', 'profile'] }
  ));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/google/failure'
  })
);

app.get('/dashboard', isLoggedIn, (req, res) => {
  res.render("dashboard/index.ejs",
    {
      title: "Dashboard - UExam",
    });
});

app.get('/dashboard/ongoing', (req, res) => {
  res.render("dashboard/pages/ongoing.ejs",
    {
      title: "Ongoing - UExam",
      name: req.user.displayName,
      profilePicture: req.user.picture,
    });
});
app.get('/signup', (req, res) => {
  res.render("signup.ejs",
    {
      title: "Sign Up - UExam",
    });
});

app.post('/signup/todb', async (req, res) => {
  const data = req.body;
  try {
    mongoose.connect('mongodb://localhost:27017/uexam')
    const newUser = new User({
      email: data.email,
      fullName: data.fullName,
      username: data.username
    })
    await newUser.save();
    res.cookie('email', data.email, { maxAge: 3600000, httpOnly: true });
    res.redirect('/dashboard')
  } catch (error) {
    res.sendStatus(500)
  }
});
app.post('/signin/todb', async (req, res) => {
  const data = req.body;
  try {
    mongoose.connect('mongodb://localhost:27017/uexam')

    // if field is username or email
    const findUser = await User.find({
      email: data.email
    })

    // check if user is present or not
    if(!findUser) res.sendStatus(201);

    if(findUser.password !== data.password){
      res.sendStatus(201);
    }

    const authToken = '';

    res.cookie('authToken', authToken, { maxAge: 3600000, httpOnly: true });

    // redirecting
    res.redirect('/dashboard')
  } catch (error) {
    res.sendStatus(500)
  }
});



app.get('/dashboard/completed', (req, res) => {
  res.render("dashboard/pages/completed.ejs",
    {
      title: "Completed - UExam",
      name: req.user.displayName,
      profilePicture: req.user.picture,
    });
});

app.get('/dashboard/upcoming', (req, res) => {
  res.render("dashboard/pages/upcoming.ejs",
    {
      title: "Upcoming - UExam",
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

app.get('/logout', function (req, res) {
  req.logout(function (err) {
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