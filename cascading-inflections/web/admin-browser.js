const initAdminBrowser = async (config) => {
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch({
    executablePath: config.chromePath,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(`http://localhost:${config.port}/login`, { waitUntil: "networkidle2" });
  await page.type("#username", "admin");
  await page.type("#password", config.adminPassword);

  await Promise.all([
        page.click("#submit"),
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
  ]);

  await page.goto(`http://localhost:${config.port}/profile`, {
    waitUntil: "networkidle2",
  });

  return page;
};

module.exports = initAdminBrowser;
