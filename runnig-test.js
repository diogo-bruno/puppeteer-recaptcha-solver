// POST http://localhost:3000/resolveRecaptcha HTTP/1.1
// content-type: application/json

// {
//     "urlRecaptcha": "https://portalbnmp.cnj.jus.br/",
//     "waitSelectorSucces": "[label=\"Pesquisar\"]"
// }

// {
//     "urlRecaptcha": "https://www.google.com/recaptcha/api2/demo",
//     "waitSelectorSucces": ""
// }

const axios = require('axios');
const https = require('https');
const HttpsProxyAgent = require('https-proxy-agent');
const utils = require('./src/utils');

https.globalAgent.options.rejectUnauthorized = false;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = false;

const axiosInstance = axios.create({
  timeout: 60 * 2 * 1000, //2min
  headers: {
    'User-Agent': utils.getUserAgent(),
  },
  proxy: false,
  httpsAgent: process.env['npm_config_proxy'] ? new HttpsProxyAgent(process.env['npm_config_proxy']) : new https.Agent({rejectUnauthorized: false}),
});

axiosInstance
  .post('http://localhost:3030/resolveRecaptcha', {
    // urlRecaptcha: 'https://www.google.com/recaptcha/api2/demo',
    // waitSelectorSucces: '',
    urlRecaptcha: 'https://portalbnmp.cnj.jus.br/',
    waitSelectorSucces: '[label="Pesquisar"]',
  })
  .then((res) => {
    console.log(res.data);
  })
  .catch((error) => {
    console.error(error);
  });
