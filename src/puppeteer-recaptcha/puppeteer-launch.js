const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const utils = require('../utils');

async function puppeteerLaunch(pageUrl, headless) {
  puppeteer.use(pluginStealth());
  console.info('Preparing init puppeteer launch');

  const optionsLaunch = {
    headless: headless,
    args: utils.args,
    devtools: headless ? false : true,
    slowMo: 100,
    ignoreDefaultArgs: ['--enable-automation'],
    ignoreHTTPSErrors: true,
  };

  if (process.env.CHROME_PATH) {
    optionsLaunch.executablePath = process.env.CHROME_PATH;
  }

  const browser = await puppeteer.launch(optionsLaunch);
  const pageOne = (await browser.pages())[0];
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.setDefaultTimeout(0);
  await page.setCacheEnabled(false);
  page.on('dialog', async (dialog) => {
    await dialog.dismiss();
  });
  await page.goto(pageUrl, {waitUntil: 'load', timeout: 0});
  await pageOne.close();
  console.info(`Open page ${pageUrl}`);
  await utils.delay(1000);
  return browser;
}

module.exports = puppeteerLaunch;
