const utils = require('../utils');
const puppeteerLaunch = require('./puppeteer-launch');
const solverRecaptcha = require('./solver-recaptcha');
const config = require('../../config.json');

const getPageData = async (url, waitSelectorSucces, headless) => {
  const browser = await puppeteerLaunch(url, headless);
  const page = (await browser.pages())[0];
  const dataPage = await solverRecaptcha(page, waitSelectorSucces);
  await utils.delay(5000);
  if (config.closePageFinal) {
    await page.close();
  }
  if (config.closeBrowserFinal) {
    await browser.close();
  }
  return dataPage;
};

module.exports = getPageData;
