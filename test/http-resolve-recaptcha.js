const axios = require('axios');
const https = require('https');
const HttpsProxyAgent = require('https-proxy-agent');
const utils = require('../src/utils');

https.globalAgent.options.rejectUnauthorized = false;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = false;

const axiosInstance = axios.create({
  timeout: 60 * 2 * 1000,
  headers: {
    'User-Agent': utils.getUserAgent(),
  },
  proxy: false,
  httpsAgent: process.env['npm_config_proxy'] ? new HttpsProxyAgent(process.env['npm_config_proxy']) : new https.Agent({rejectUnauthorized: false}),
});

async function callService() {
  return axiosInstance
    .post('http://localhost:3030/resolveRecaptcha', {
      urlRecaptcha: 'https://www.google.com/recaptcha/api2/demo',
      waitSelectorSucces: '[class="recaptcha-success"]',
    })
    .then((res) => {
      console.log(res.data);
    })
    .catch((error) => {
      console.error(error);
    });
}

(async () => {
  const sleep = 1000 * 60 * 5;
  while (true) {
    try {
      await callService();
      console.log(`\nAwait for next call in ${sleep} ms`);
      await utils.sleep(sleep);
    } catch (error) {
      console.error(error);
      break;
    }
  }
})();
