const axios = require('../axios');
const utils = require('../utils');

async function webHookResponseRecaptcha(options, dataPage) {
  let response = {};
  if (options.urlWebHook) {
    const opstionsAxios = {
      method: 'post',
      url: options.urlWebHook,
      data: dataPage,
      headers: utils.headersDefault('application/json', options.urlWebHook),
    };
    response = await axios(opstionsAxios);
  } else {
    response.status = 200;
  }

  console.info(`Response Page: ${JSON.stringify(dataPage)}`);
  console.info(`CALL Page: ${options.urlWebHook}`);

  if (response.status != 200) return false;

  return true;
}

module.exports = webHookResponseRecaptcha;
