const bcrypt = require("bcrypt");
const _ = require("lodash");
const sanitizeHtml = require("sanitize-html");
const initAdminBrowser = require("../admin-browser");
const SALT_ROUNDS = 10;

const setupRoutes = (app, passport, db, config) => {
  let adminPage;
  initAdminBrowser(config).then((page) => {
    adminPage = page;
  });

  // Define routes
  app.get("/", (req, res) => {
    if (req.user) {
      db.messages
        .findAll({
          where: { recipient: req.user.id },
          order: [['id', 'DESC']],
          limit: 5
        })
        .then((messages) => {
          return db.users.findAll().then((users) => {
            res.render("home", { user: req.user, users, messages });
          });
        })
        .catch((err) => {
          console.error(err);
          res.sendStatus(500);
        });
    } else {
      res.render("home", { user: req.user });
    }
  });

  app.get("/login", (req, res) => {
    res.render("login", { user: req.user });
  });

  app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.render("login", { user: req.user, error: "Invalid Credentials" });
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
    res.render("register", { user: req.user });
  });

  app.post("/register", (req, res) => {
    // Do we have a username that's not empty
    if (!req.body.username || !_.isString(req.body.username)) {
      res.render("register", { user: req.user, error: "Username is required" });
      return;
    }
    // Do we have non-empty passwords
    if (!req.body.password || !req.body.passwordtoo) {
      res.render("register", { user: req.user, error: "Password is required" });
      return;
    }
    // Do the passwords match?
    if (req.body.password !== req.body.passwordtoo) {
      res.render("register", { user: req.user, error: "Passwords do not match" });
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
        res.render("register", { user: req.user, error: err });
      });
  });

  app.get(
    "/profile",
    require("connect-ensure-login").ensureLoggedIn(),
    (req, res) => {
      db.messages
        .findAll({
          where: { recipient: req.user.id },
          order: [['id', 'DESC']],
          limit: 5
         })
        .then((messages) => {
          return db.users.findAll().then((users) => {
            res.render("profile", { user: req.user, users, messages });
          });
        })
        .catch(() => {
          res.sendStatus(500);
        });
    }
  );

  app.post(
    "/profile",
    require("connect-ensure-login").ensureLoggedIn(),
    (req, res) => {
      db.users
        .update(
          {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            siteUrl: req.body.siteUrl,
          },
          { where: { username: req.user.username } }
        )
        .then(() => {
          res.redirect("/profile");
        })
        .catch(() => {
          res.sendStatus(500);
        });
    }
  );

  app.post("/message",
    require("connect-ensure-login").ensureLoggedIn(),
    (req, res) => {
      const clean = sanitizeHtml(req.body.message, {
        allowedTags: ["style"],
      });
      db.messages
        .create({
          message: clean,
          sender: req.user.username,
          recipient: req.body.recipient,
        })
        .then(() => {
          console.log('Redirect to profile');
          res.redirect("/profile");
        })
        .then(() => {
          console.log('adminPage.reload()');
          adminPage.reload();
        })
        .catch((e) => {
          console.error(e);
          res.sendStatus(500);
        });
  });
};

module.exports = setupRoutes;
