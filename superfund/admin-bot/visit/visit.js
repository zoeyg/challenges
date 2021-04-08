const express = require('express');
const bodyParser = require('body-parser');
const chromePath = process.env.CHROME_PATH || "/usr/bin/chromium";

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 8080;

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

const initialize = async () => {
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: ['--no-sandbox']
  });

  app.post('/', async (req, res) => {
    let ctx;
    try {
      if (!req.body) {
        const msg = 'no Pub/Sub message received';
        console.error(`error: ${msg}`);
        res.status(400).send(`Bad Request: ${msg}`);
        return;
      }
      if (!req.body.message) {
        const msg = 'invalid Pub/Sub message format';
        console.error(`error: ${msg}`);
        res.status(400).send(`Bad Request: ${msg}`);
        return;
      }

      const pubSubMessage = req.body.message;
      const url = pubSubMessage.data
        ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
        : '';
      console.log(`Visiting url ${url}`);

      ctx = await browser.createIncognitoBrowserContext();
      const page = await ctx.newPage();
      await page.goto('https://superfund.2r.is/admin/', {
        timeout: 3000,
        waitUntil: 'domcontentloaded'
      });
      await page.type('#password', 'jloguVrx9TfGDJV1nA04jGoUxOny5XZG');
      await Promise.all([
        page.click("input[type=submit]"),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
      ]);
      await page.goto('https://superfund.2r.is/' + url, {
        timeout: 3000,
        waitUntil: 'domcontentloaded'
      });
      await sleep(3000);
      console.log(`Site visited: ${url}`);
      res.status(204).send();
    } catch (e) {
      console.log('Error: ' + e);
    }

    try {
      ctx.close();
    } catch {}

  });

  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
};

initialize();