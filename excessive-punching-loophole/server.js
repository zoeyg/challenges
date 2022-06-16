const express = require("express");
const _ = require("lodash");
const crypto = require('crypto');
const initAdminBrowser = require("./admin-browser");
const sanitizeHtml = require("sanitize-html");

require("dotenv").config();

const config = {
  chromePath: process.env.CHROME_PATH || "/usr/bin/chromium",
  port: parseInt(process.env.PORT || 3000),
  flag: process.env.FLAG || 'tdiCTF{dev_flag}'
};

// Random so only the admin can find the flag route that sets the flag as a cookie
const flagRouteId = crypto.randomBytes(64).toString('hex');

// We'll just store the reports in memory for 10 seconds
const reports = new Map();

async function initialize() {

  const adminBrowser = await initAdminBrowser(config);

  // Create a new Express application.
  const app = express();
  
  // Configure view engine to render EJS templates.
  app.set("views", __dirname + "/views");
  app.set("view engine", "ejs");
  
  app.use(require("body-parser").urlencoded({ extended: true }));
  app.use((req, res, next) => {
    console.log(req.method, req.url, req.headers['user-agent']);
    res.set('Content-Security-Policy', "object-src 'none'; script-src 'unsafe-eval' https://cdnjs.cloudflare.com 'sha256-Q5N0cw09nnZl0+fIqYsMHGZxS/dEhotEcCaA5qphoug='; style-src 'unsafe-inline'")
    next();
  });
  app.use(express.static('static'));
  
  app.post("/report", (req, res) => {
    if (!req.body.report || !_.isString(req.body.report)) {
      res.redirect('/');
    }

    // Sanitize so you're forced into using the DOM clobbering to include a script
    const sanitizedReport = sanitizeHtml(req.body.report, {
      allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'div', 'p', 'span' ],
      allowedAttributes: false
    });

    const id = crypto.randomBytes(32).toString('hex');
    reports.set(id, sanitizedReport);
    res.redirect(`/report/${id}`);

    // Admin visits report page
    adminBrowser.goto(`http://localhost:${config.port}/report/${id}`, { waitUntil: "networkidle2" });
  });

  app.get("/report/:id", (req, res) => {
    if (reports.has(req.params.id)) {
      const reportHtml = reports.get(req.params.id);
      res.render('report', { report: reportHtml });

      // Get rid of report after 10 seconds
      setTimeout(() => {
        reports.delete(req.params.id);
      }, 10000);
    } else {
      res.redirect('/');
    }
  });

  app.get("/flag/:id", (req, res) => {
    if (req.params.id && req.params.id === flagRouteId) {
      res.set('Set-Cookie', `flag=${config.flag}; Path=/`);
      res.redirect('/');
    }
  });

  console.log('Listening on port', config.port)
  app.listen(config.port);

  // Setup the cookie in the admin browser
  adminBrowser.goto(`http://localhost:${config.port}/flag/${flagRouteId}`, { waitUntil: "networkidle2" });
  
}

try {
  initialize();
} catch (e) {
  console.error('Caught error', e);
}