const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const utils = require('../utils');

async function puppeteerLaunch(pageUrl, headless) {
  puppeteer.use(pluginStealth());
  console.info('Preparing init puppeteer launch\n\n\n');

  const optionsLaunch = {
    headless: headless,
    args: utils.args,
    devtools: headless ? false : true,
    slowMo: 110,
    ignoreDefaultArgs: ['--enable-automation'],
    ignoreHTTPSErrors: true,
  };

  if (process.env.CHROME_PATH) {
    optionsLaunch.executablePath = process.env.CHROME_PATH;
  }

  const browser = await puppeteer.launch(optionsLaunch);
  const pageOne = (await browser.pages())[0];

  if (process.env.TOR_HOST) {
    await pageOne.goto('https://check.torproject.org/');
    const isUsingTor = await pageOne.$eval('body', (el) => el.innerHTML.includes('Congratulations. This browser is configured to use Tor'));

    if (!isUsingTor) {
      console.log('Not using Tor. Closing...');
      await browser.close();
      return false;
    }
  }

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.setDefaultTimeout(0);
  await page.setCacheEnabled(false);
  await pageOne.close();
  const session = await page.target().createCDPSession();
  await session.send('Page.enable');
  await session.send('Page.setWebLifecycleState', {state: 'active'});
  await page.bringToFront();

  page.on('dialog', async (dialog) => {
    await dialog.dismiss();
  });

  const headlessUserAgent = await page.evaluate(() => navigator.userAgent);
  const chromeUserAgent = headlessUserAgent.replace('HeadlessChrome', 'Chrome');
  await page.setUserAgent(chromeUserAgent);
  await page.setExtraHTTPHeaders({
    'accept-language': 'en-US,en;q=0.9',
  });

  await page.goto(pageUrl, {waitUntil: 'load', timeout: 0});

  console.info(`Open page ${pageUrl}`);
  await utils.delay(1000);

  browser.on('disconnected', () => {
    browser.disconnected = true;
  });

  return browser;
}

module.exports = puppeteerLaunch;
