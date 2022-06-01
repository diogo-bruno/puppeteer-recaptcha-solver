const axios = require('axios');
const https = require('https');
const HttpsProxyAgent = require('https-proxy-agent');
const utils = require('../src/utils');
const express = require('express');
const bodyParser = require('body-parser');
const port = 3031;
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.raw());

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

app.post('/web-hook-response', (req, res) => {
  console.log('Web-hook-response');
  console.log(req.body);
  res.send();
});

app.listen(port, () => console.log(`WebHook Response running in port ${port}`));

async function callService() {
  return axiosInstance
    .post('http://localhost:3030/resolveRecaptcha', {
      urlRecaptcha: 'https://www.google.com/recaptcha/api2/demo',
      waitSelectorSucces: '[class="recaptcha-success"]',
      urlWebHook: `http://host.docker.internal:${port}/web-hook-response`,
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
