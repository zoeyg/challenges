const bcrypt = require("bcrypt");
const _ = require("lodash");
const crypto = require('crypto');
const { Op } = require("sequelize");
const SALT_ROUNDS = 10;

const setupRoutes = (app, passport, db) => {

  // Define routes
  app.get("/api/user-info",
    require("connect-ensure-login").ensureLoggedIn(),
    (req, res) => {
      let cleanUser = {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email
      };
      res.json(cleanUser);
    }
  );
  
  app.post("/api/change-email",
    require("connect-ensure-login").ensureLoggedIn(),
    (req, res) => {
      let verificationToken;
      const email = req.body.email;

      // Validate email address
      if (!email || !_.isString(email) || email.length > 255 ||
        !/^[a-zA-Z0-9_]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/.test(email))
      {
        res.json({ success: false, message: "Invalid email address" });
        return;
      }

      // Update user record with unverified email
      db.users.update({
          unverifiedEmail: email
        }, {
            where: { id: req.user.id }
        }).then(() => {
          // Generate Token
          return new Promise((resolve) => {
            crypto.randomBytes(32, (err, buffer) => {
              if (err) throw err;
              resolve(buffer.toString('hex'));
            });
          });
        }).then((token) => {
          // Create new token
          verificationToken = token;
          return db.verificationTokens.create({
            token,
            valid: true,
            userId: req.user.id
          });
        }).then(() => {
          /*
           * WARNING: This is only here to help the hacker attempting the challenge to win the race more consistently.
           *          Remove it before packaging up the source again for download.
           */
          return new Promise(resolve => {
            setTimeout(() => resolve(), 1000);
          });
        }).then(() => {
          // Invalidate old tokens
          return db.verificationTokens.update(
            {
              valid: false,
            },{ where: {
              token: { [Op.not]: verificationToken },
              userId: req.user.id
            }
          });
        }).then(() => {
          // Pretend like we sent an email and just return the token if it's not an @tdi.ctf address
          if (!/^[a-zA-Z0-9_]+@tdi\.ctf$/.test(email)) {
            res.json({ token: verificationToken });
          } else {
            res.json({ message: "Check your company email" });
          }
        });
    }
  );

  app.post("/api/verify-email-change",
    require("connect-ensure-login").ensureLoggedIn(),
    (req, res) => {

      if (!req.body.token || !_.isString(req.body.token)) {
        res.json({ success: false, message: "Invalid token" });
        return;
      }
    
      // See if we've been given a valid token
      db.verificationTokens.findOne({
        where: {
          token: req.body.token,
          userId: req.user.id,
          valid: true
        }
      }).then(token => {
        if (token === null) { // No valid token
          res.send({ success: false, message: "Invalid token" });
        } else { // We have a valid token
          // Invalidate token
          return db.verificationTokens.update({
            valid: false
          }, {
            where: { userId: req.user.id }
          }).then(() => {
            // Get unverified email
            return db.users.findByPk(req.user.id);
          }).then(dbUser => {
            // Set unverified as verified email
            return db.users.update({
              email: dbUser.unverifiedEmail
            }, {
              where: { id: req.user.id }
            });
          }).then((user) => {
            // Return success
            res.json({ success: true, email: user.email });
          });
        }
      });

  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.json({ success: false, message: "Invalid Credentials" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.json({ success: true });
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout();
    res.json({ success: true });
  });

  app.post("/api/register", (req, res) => {
    // Do we have a username that's not empty
    if (!req.body.username || !_.isString(req.body.username)) {
      res.json({ success: false, error: "Username is required" });
      return;
    }
    // Do we have non-empty passwords
    if (!req.body.password || !req.body.passwordtoo ||
      !_.isString(req.body.password) || !_.isString(req.body.passwordtoo))
    {
      res.json({ success: false, error: "Password is required" });
      return;
    }
    // Is email valid
    if (!req.body.email || !_.isString(req.body.email)
      || /^[a-zA-Z0-9_]+@tdi\.ctf$/.test(req.body.email)
      || !/^[a-zA-Z0-9_]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/.test(req.body.email)
      || req.body.email.length > 255)
    {
      res.json({ success: false, error: "Invalid or empty email" });
      return;
    }
    // Do the passwords match?
    if (req.body.password !== req.body.passwordtoo) {
      res.json({ success: false, error: "Passwords do not match" });
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
        return db.users.create({
          username: req.body.username,
          password: hash,
          email: req.body.email
        });
      })
      .then(() => {
        // respond with success
        res.json({ success: true });
      })
      .catch((err) => {
        res.json({ success: false, error: err.message });
      });
  });

  app.get("/api/flag",
    require("connect-ensure-login").ensureLoggedIn(),
    (req, res) => {
      if (/^[a-zA-Z0-9_]+@tdi\.ctf$/.test(req.user.email)) {
        res.json({ flag: process.env.FLAG });
      } else {
        res.json({ success: false, message: "Only available to users with @tdi.ctf emails" })
      }
  });
};

module.exports = setupRoutes;
