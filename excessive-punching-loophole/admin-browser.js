const initAdminBrowser = async (config) => {
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch({
    executablePath: config.chromePath,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  return page;
};

module.exports = initAdminBrowser;
