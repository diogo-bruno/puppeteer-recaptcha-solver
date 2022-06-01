const utils = require('../utils');
const solverByAudio = require('./solver-recaptcha-audio');
const solverByImage = require('./solver-recaptcha-image');
const config = require('../../config.json');
let resultaDataPage;

async function getDataPage(page, waitSelectorSucces) {
  let dataPage;

  try {
    if (waitSelectorSucces)
      await page.waitForSelector(waitSelectorSucces, {
        timeout: 10000,
      });
  } catch (error) {}

  try {
    dataPage = await page.evaluate((utils_) => {
      const data = {};
      const iframe = document.querySelector('iframe[src*="api2/bframe"]');
      const docIframe = iframe.contentWindow.document;
      data.recaptchaToken = '';
      if (docIframe.querySelector('#recaptcha-token')) {
        if (docIframe.querySelector('#recaptcha-token').value && docIframe.querySelector('#recaptcha-token').value.length < utils_.recaptchaTokenMinLength)
          data.recaptchaToken = docIframe.querySelector('#recaptcha-token').value;
      }
      data.cookie = document.cookie;
      data.localStorage = JSON.stringify(localStorage);
      return data;
    }, utils);
  } catch (error) {
    console.error(`Error select data page: ${error}`);
  }

  return dataPage;
}

async function solverRecaptcha(page, waitSelectorSucces) {
  try {
    let resolverCaptchaImage = config.resolverCaptchaImage;

    let resolved = false;

    const tokenExist = await utils.isValueRecaptcha(page);

    if (tokenExist) {
      resolved = true;
      await page.waitForTimeout(1000);
      resultaDataPage = await getDataPage(page, waitSelectorSucces);
      return resultaDataPage;
    }

    console.info('Awaiting response from the page\n\n\n');

    await page.waitForFunction(
      () => {
        const iframe = document.querySelector('iframe[src*="api2/anchor"]');
        if (!iframe) return false;
        return !!iframe.contentWindow.document.querySelector('#recaptcha-anchor');
      },
      {
        timeout: 60000,
      }
    );

    await utils.clickCheckBoxRecaptcha(page);

    await page.waitForTimeout(1000);

    const resolutionDisable = await utils.resolutionRecaptchaDisabled(page);

    if (resolutionDisable) {
      console.info('Resolution disabled');
      return false;
    }

    const valueRecaptcha = await utils.isValueRecaptcha(page);

    if (valueRecaptcha) {
      resultaDataPage = await getDataPage(page, waitSelectorSucces);
      return Promise.resolve(resultaDataPage);
    }

    await page.waitForFunction(() => {
      const iframe = document.querySelector('iframe[src*="api2/bframe"]');
      if (!iframe) return false;
      const img = iframe.contentWindow.document.querySelector('.rc-image-tile-wrapper img');
      return img && img.complete;
    });

    if (resolverCaptchaImage) {
      resolved = 'reload-images';

      let attemptsImages = 0;
      const maxAttemptsImages = config.maxAttemptsImages;

      await (async () => {
        while (resolved === 'reload-images') {
          resolved = await solverByImage(page, attemptsImages);

          if (attemptsImages === maxAttemptsImages) {
            console.info(`More than ${maxAttemptsImages} attempts!`);
            resolved = false;
          }
          attemptsImages++;
        }
      })();
    }

    if (!resolved) {
      resolved = await solverByAudio(page);
    }

    if (!resolved) {
      return false;
    }

    await page.waitForTimeout(1000);

    resultaDataPage = await getDataPage(page, waitSelectorSucces);

    return resultaDataPage;
  } catch (e) {
    console.error(e);
    return false;
  }
}

module.exports = solverRecaptcha;
