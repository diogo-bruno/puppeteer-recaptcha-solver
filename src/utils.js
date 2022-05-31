require('console-stamp')(console, {
  metadata: function () {
    return `[ ${Math.round(process.memoryUsage().rss / 1e6)} MB ] [ PID ${process.pid} ]`;
  },
  colors: {
    stamp: 'yellow',
    label: 'white',
    metadata: 'green',
  },
});

const ora = require('ora');
const fs = require('fs');
const {promisify} = require('util');
const mkdir = promisify(fs.mkdir);

var spinner;

const utils = {};

utils.spinnerStart = async function (text, page) {
  spinner = ora({
    spinner: 'dots2',
    text: text,
  }).start();
  if (page) {
    await utils.saveScreenshot(page, text);
  }
};

utils.spinnerUpdate = function (text) {
  if (spinner) spinner.text = text;
};

utils.spinnerInfo = function (text) {
  if (spinner) spinner.info(text);
};

utils.spinnerStop = function (text) {
  if (spinner) spinner.succeed(text);
};

utils.rdn = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

utils.getUserAgent = function () {
  const index = utils.rdn(1, 4);
  const agents = [
    'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3440.106 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36',
  ];
  return agents[index];
};

utils.args = [
  '--renderer',
  '--start-maximized',
  '--window-position=0,0',
  '--window-size=1920,1040',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-features=site-per-process',
  '--disable-site-isolation-trials',
  '--disable-web-security',
  '--allow-cross-origin-auth-prompt',
  '-–allow-file-access-from-files',
  '--user-agent="' + utils.getUserAgent() + '"',
  '--lang=en-US,en;q=0.9',
  '--disk-cache-size=0',
];

utils.randomHashString = function (length) {
  if (!length) length = 10;
  const chars = [...'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789'];
  return [...Array(length)].map(() => chars[(Math.random() * chars.length) | 0]).join``;
};

utils.headersVision = function (contentType, userAgent) {
  return {
    Origin: 'https://content-vision.googleapis.com',
    'x-client-data': `${utils.randomHashString(30)}/${utils.randomHashString(36)}=`,
    'x-clientdetails': `appVersion=${encodeURIComponent(userAgent.split('Mozilla/')[1])}&userAgent=${encodeURIComponent(userAgent)}`,
    'x-origin': 'https://explorer.apis.google.com',
    'x-referer': 'https://explorer.apis.google.com',
    'Content-Type': contentType,
  };
};

utils.headersDefault = function (contentType, urlOrigin) {
  let origin = '';
  try {
    origin = new URL(urlOrigin).origin;
  } catch (error) {}
  return {
    Origin: origin,
    'Content-Type': contentType,
  };
};

utils.sleep = function (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

utils.getBase64FromImageUrl = async function (url) {
  const axios = require('./axios');
  let image = await axios.get(url, {responseType: 'arraybuffer'});
  return Buffer.from(image.data).toString('base64');
};

utils.log = function (msg, log) {
  if (!log) log = '...';
  console.log(new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() + ' LOG -> ' + msg, log);
};

utils.saveScreenshot = async function (page, name) {
  try {
    if (!fs.existsSync(`screenshots`)) {
      await mkdir(`screenshots`);
    }
    name = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    await page.screenshot({
      path: 'screenshots/' + new Date().getTime() + '-' + (name ? name : '') + '.png',
    });
  } catch (error) {}
};

utils.delay = function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

utils.recaptchaTokenMinLength = 2000;

utils.isValueRecaptcha = async function (page) {
  return page.evaluate((utils_) => {
    const iframe = document.querySelector('iframe[src*="api2/bframe"]');
    if (iframe) {
      const docIframe = iframe.contentWindow.document;
      if (docIframe.querySelector('#recaptcha-token')) {
        if (docIframe.querySelector('#recaptcha-token').value && docIframe.querySelector('#recaptcha-token').value.length < utils_.recaptchaTokenMinLength) return true;
      }
    }
    return false;
  }, utils);
};

utils.resolutionRecaptchaDisabled = async function (page) {
  return page.evaluate(() => {
    const iframe = document.querySelector('iframe[src*="api2/bframe"]');
    if (!iframe) return false;
    return iframe.contentWindow.document.querySelector('[href="https://developers.google.com/recaptcha/docs/faq#my-computer-or-network-may-be-sending-automated-queries"]');
  });
};

var Base64Binary = {
  _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

  /* will return a  Uint8Array type */
  decodeArrayBuffer: function (input) {
    var bytes = (input.length / 4) * 3;
    var ab = new ArrayBuffer(bytes);
    this.decode(input, ab);

    return ab;
  },

  removePaddingChars: function (input) {
    var lkey = this._keyStr.indexOf(input.charAt(input.length - 1));
    if (lkey == 64) {
      return input.substring(0, input.length - 1);
    }
    return input;
  },

  decode: function (input, arrayBuffer) {
    //get last chars to see if are valid
    input = this.removePaddingChars(input);
    input = this.removePaddingChars(input);

    var bytes = parseInt((input.length / 4) * 3, 10);

    var uarray;
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;

    let j = 0;

    if (arrayBuffer) uarray = new Uint8Array(arrayBuffer);
    else uarray = new Uint8Array(bytes);

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

    for (let i = 0; i < bytes; i += 3) {
      //get the 3 octects in 4 ascii chars
      enc1 = this._keyStr.indexOf(input.charAt(j++));
      enc2 = this._keyStr.indexOf(input.charAt(j++));
      enc3 = this._keyStr.indexOf(input.charAt(j++));
      enc4 = this._keyStr.indexOf(input.charAt(j++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      uarray[i] = chr1;
      if (enc3 != 64) uarray[i + 1] = chr2;
      if (enc4 != 64) uarray[i + 2] = chr3;
    }

    return uarray;
  },
};

utils.Base64Binary = Base64Binary;

utils.getByteArray = (filePath) => {
  let fileData = fs.readFileSync(filePath).toString('hex');
  let result = [];
  for (var i = 0; i < fileData.length; i += 2) result.push('0x' + fileData[i] + '' + fileData[i + 1]);
  return result;
};

utils.trimText = (text) => {
  return text.trim();
};

module.exports = utils;
