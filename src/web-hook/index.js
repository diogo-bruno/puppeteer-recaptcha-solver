const axios = require('../axios');
const utils = require('../utils');

async function webHookResponseRecaptcha(options, dataPage) {
  let response = {};
  if (options.urlWebHook) {
    if (!dataPage || dataPage === {}) {
      dataPage = {
        url: options.url,
        status: 'error',
        error: 'No dataPage',
      };
    } else {
      dataPage.status = 'success';
    }

    dataPage.task = options.task;
    dataPage.startedExecution = options.start;

    const opstionsAxios = {
      method: 'post',
      url: options.urlWebHook,
      data: dataPage,
      headers: utils.headersDefault('application/json', options.urlWebHook),
    };
    try {
      response = await axios(opstionsAxios);
    } catch (error) {
      console.error(error);
    }
  } else {
    response.status = 200;
  }
  console.info(`Response Page: ${JSON.stringify(dataPage)}`);
  console.info(`CALL Page: ${options.urlWebHook}`);
  return response.status === 200;
}

module.exports = webHookResponseRecaptcha;
