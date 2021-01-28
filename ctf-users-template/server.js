const express = require("express");
const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const db = require("./db")("./db/db.sqlite");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` which receives the credentials
// (`username` and `password`) submitted by the user.  The must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(
  new Strategy((username, password, cb) => {
    db.users
      .findOne({ where: { username: username } })
      .then((user) => {
        if (!user) {
          cb(null, false);
          return Promise.reject("Invalid Credentials");
        }
        return user;
      })
      .then((user) => {
        return bcrypt.compare(password, user.password).then((result) => {
          if (result) {
            return cb(null, user);
          } else {
            return cb(null, false);
          }
        });
      })
      .catch((err) => {
        if (_.isString(err)) {
          cb(null, false);
        } else {
          cb(err);
        }
      });
  })
);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  db.users
    .findByPk(id)
    .then((user) => {
      cb(null, user);
    })
    .catch((err) => {
      return cb(err);
    });
});

// Create a new Express application.
const app = express();

// Configure view engine to render EJS templates.
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require("morgan")("combined"));
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: 'x.F#=!"v6E3YVp.Kq!{<\\,4#^5Hu-EWV',
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      res.render("login", { error: err });
    }
    if (!user) {
      return res.render("login", { error: "Invalid Credentials" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  })(req, res, next);
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  // Do we have a username that's not empty
  if (!req.body.username || !_.isString(req.body.username)) {
    res.render("register", { error: "Username is required" });
    return;
  }
  // Do we have non-empty passwords
  if (!req.body.password || !req.body.passwordtoo) {
    res.render("register", { error: "Password is required" });
    return;
  }
  // Do the passwords match?
  if (req.body.password !== req.body.passwordtoo) {
    res.render("register", { error: "Passwords do not match" });
    return;
  }
  // Check for existing username
  db.users
    .findOne({ where: { username: req.body.username } })
    .then((user) => {
      if (user !== null) {
        return Promise.reject("User already exists");
      } else {
        // Username doesn't exist, hash the password and...
        return bcrypt.hash(req.body.password, SALT_ROUNDS);
      }
    })
    .then((hash) => {
      // ...insert the user into the database
      return db.users.create({ username: req.body.username, password: hash });
    })
    .then(() => {
      // redirect to the login screen on success
      res.redirect("/login");
    })
    .catch((err) => {
      res.render("register", { error: err });
    });
});

app.get(
  "/profile",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res) => {
    res.render("profile", { user: req.user });
  }
);

app.listen(3000);
