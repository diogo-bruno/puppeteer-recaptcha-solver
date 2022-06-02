const utils = require('../utils');
const puppeteerLaunch = require('./puppeteer-launch');
const solverRecaptcha = require('./solver-recaptcha');
const config = require('../../config.json');

const getPageData = async (url, waitSelectorSucces, headless) => {
  const browser = await puppeteerLaunch(url, headless);
  const page = (await browser.pages())[0];

  const intervalCheck = setInterval(async () => {
    const labelError = await utils.existErrorRecaptcha(page);
    if (labelError && !browser.disconnected) {
      console.info(`Error in recaptcha: ${labelError}`);
      await utils.clickCheckBoxRecaptcha(page);
    }
  }, 5000);

  const dataPage = await solverRecaptcha(page, waitSelectorSucces);

  clearInterval(intervalCheck);

  await utils.delay(5000);

  try {
    if (!browser.disconnected) {
      if (config.closePageFinal) await page.close();
      if (config.closeBrowserFinal) await browser.close();
    }
  } catch (error) {}

  return dataPage;
};

module.exports = getPageData;
