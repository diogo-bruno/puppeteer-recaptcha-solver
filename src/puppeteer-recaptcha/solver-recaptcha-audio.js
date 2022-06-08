const getTextAudio = require('../witai-api/speech');
const utils = require('../utils');

async function solverByAudio(page) {
  try {
    await utils.reloadIframeRecaptcha(page, true);

    await page.waitForTimeout(1500);

    let frames = await page.frames();
    const bframe = frames.find((frame) => frame.url().includes('api2/bframe'));

    if (!bframe) {
      console.error('Error: bframe not found');
      return false;
    }

    const audioButton = await bframe.$('#recaptcha-audio-button');

    if (!audioButton || audioButton.length === 0) {
      console.error('AudioButton not found');
      return false;
    }

    try {
      await audioButton.click({delay: utils.rdn(30, 600)});
    } catch (error) {
      console.error('AudioButton not click , error: ', error.message);
      return false;
    }

    await page.waitForTimeout(1500);

    const valueRecaptcha = await utils.isValueRecaptcha(page);
    if (valueRecaptcha) return true;

    const resolutionAudioDisable = await utils.resolutionRecaptchaDisabled(page);

    if (resolutionAudioDisable) {
      console.info('Audio resolution disabled');
      return false;
    }

    console.info('Download audio captcha');

    await page.waitForFunction(() => {
      const iframe = document.querySelector('iframe[src*="api2/bframe"]');
      if (!iframe) return false;
      return !!iframe.contentWindow.document.querySelector('#audio-source');
    });

    const audioLink = await page.evaluate(() => {
      const iframe = document.querySelector('iframe[src*="api2/bframe"]');
      return iframe.contentWindow.document.querySelector('#audio-source').src;
    });

    const audioBytes = await page.evaluate((audioLink_) => {
      return (async () => {
        const response = await window.fetch(audioLink_);
        const buffer = await response.arrayBuffer();
        return Array.from(new Uint8Array(buffer));
      })();
    }, audioLink);

    console.info('Checking audio in the api');

    const audioTranscript = await getTextAudio(audioBytes);

    console.info('Writing audio - ' + audioTranscript);

    const input = await bframe.$('#audio-response');
    await input.click({delay: utils.rdn(30, 1000)});
    await input.type(audioTranscript, {delay: utils.rdn(30, 75)});

    await page.evaluate(() => {
      const iframe = document.querySelector('iframe[src*="api2/bframe"]');
      if (!iframe) return false;
      const documentFrame = iframe.contentWindow.document;
      function rdn(min, max) {
        return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + Math.ceil(min);
      }
      documentFrame.querySelector('#recaptcha-verify-button').click({delay: rdn(40, 200)});
    });

    await page.waitForTimeout(1500);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

module.exports = solverByAudio;
