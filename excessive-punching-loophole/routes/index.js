const bcrypt = require("bcrypt");
const _ = require("lodash");
const sanitizeHtml = require("sanitize-html");
const initAdminBrowser = require("../admin-browser");

const setupRoutes = (app, passport, db, config) => {
  let adminPage;
  initAdminBrowser(config).then((page) => {
    adminPage = page;
  });

  // Define routes
  app.post("/report",
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

  app.get("/report")
};

module.exports = setupRoutes;
