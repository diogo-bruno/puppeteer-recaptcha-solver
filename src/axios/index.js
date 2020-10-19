const axios = require('axios');
const https = require('https');
const HttpsProxyAgent = require('https-proxy-agent');
const utils = require('../utils');

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

module.exports = axiosInstance;
