const express = require("express");
const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const _ = require("lodash");

require("dotenv").config();

const config = {
  adminPassword: process.env.ADMIN_PASSWORD || "@dm1nPa55w()|2d",
  chromePath: process.env.CHROME_PATH || "/usr/bin/chromium",
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  sequelizeConfig: JSON.parse(
    process.env.SEQUELIZE_CONFIG ||
      '{ "dialect": "sqlite", "storage": "app.db" }'
  ),
  sessionSecret:
    process.env.SESSION_SECRET || 'x.F#=!"v6E3YVp.Kq!{<\\,4#^5Hu-EWV',
  secureSessionCookie: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT || '3000')
};

async function initialize() {
  const db = await require("./db")(config.sequelizeConfig);

  const initRoutes = require("./routes");
  
  // Create the admin user if we don't have it
  await bcrypt.hash(config.adminPassword, config.bcryptRounds).then((hash) => {
    db.users.findOrCreate({
      where: { username: "admin" },
      defaults: {
        username: "admin",
        password: hash,
        admin: true,
      },
    });
  });
  
  // Configure the local strategy for use by Passport.
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
  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });
  
  passport.deserializeUser((id, cb) => {
    db.users
      .findByPk(id)
      .then((user) => {
        return cb(null, user);
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
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: config.secureSessionCookie },
    })
  );
  
  // Initialize Passport and restore authentication state, if any, from the
  // session.
  app.use(passport.initialize());
  app.use(passport.session());

  // Initialize Routes
  app.use(express.static('static'));
  initRoutes(app, passport, db, config);
  
  app.listen(3000);
  
}

try {
  initialize();
} catch (e) {
  console.error('Caught error', e);
}
