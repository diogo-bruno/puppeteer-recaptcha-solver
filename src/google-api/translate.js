var querystring = require('querystring');
var axios = require('../axios');
var languages = require('./translate-languages');

var window = {
  TKK: '0',
};

function sM(a) {
  var b;
  if (null !== yr) b = yr;
  else {
    b = wr(String.fromCharCode(84));
    var c = wr(String.fromCharCode(75));
    b = [b(), b()];
    b[1] = c();
    b = (yr = window[b.join(c())] || '') || '';
  }
  var d = wr(String.fromCharCode(116)),
    c = wr(String.fromCharCode(107)),
    d = [d(), d()];
  d[1] = c();
  c = '&' + d.join('') + '=';
  d = b.split('.');
  b = Number(d[0]) || 0;
  for (var e = [], f = 0, g = 0; g < a.length; g++) {
    var l = a.charCodeAt(g);
    128 > l
      ? (e[f++] = l)
      : (2048 > l
          ? (e[f++] = (l >> 6) | 192)
          : (55296 == (l & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512)
              ? ((l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023)), (e[f++] = (l >> 18) | 240), (e[f++] = ((l >> 12) & 63) | 128))
              : (e[f++] = (l >> 12) | 224),
            (e[f++] = ((l >> 6) & 63) | 128)),
        (e[f++] = (l & 63) | 128));
  }
  a = b;
  for (f = 0; f < e.length; f++) (a += e[f]), (a = xr(a, '+-a^+6'));
  a = xr(a, '+-3^+b+-f');
  a ^= Number(d[1]) || 0;
  0 > a && (a = (a & 2147483647) + 2147483648);
  a %= 1e6;
  return c + (a.toString() + '.' + (a ^ b));
}

var yr = null;
var wr = function (a) {
    return function () {
      return a;
    };
  },
  xr = function (a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
      var d = b.charAt(c + 2),
        d = 'a' <= d ? d.charCodeAt(0) - 87 : Number(d),
        d = '+' == b.charAt(c + 1) ? a >>> d : a << d;
      a = '+' == b.charAt(c) ? (a + d) & 4294967295 : a ^ d;
    }
    return a;
  };

function updateTKK(opts) {
  opts = opts || {tld: 'com'};
  return new Promise(function (resolve, reject) {
    var now = Math.floor(Date.now() / 3600000);

    if (Number(window.TKK.split('.')[0]) === now) {
      resolve();
    } else {
      axios({url: 'https://translate.google.' + opts.tld, method: 'get', responseType: 'text'})
        .then(function (res) {
          var matches = res.data.match(/tkk:\s?'(.+?)'/i);
          var token_ = '';
          if (matches) {
            token_ = matches[1];
            window.TKK = token_;
          }
          resolve(token_);
        })
        .catch(function (err) {
          var e = new Error();
          e.code = 'BAD_NETWORK';
          e.message = err.message;
          reject(e);
        });
    }
  });
}

function tokenGet(text, opts) {
  return updateTKK(opts)
    .then(function () {
      var tk = sM(text);
      tk = tk.replace('&tk=', '');
      return {name: 'tk', value: tk};
    })
    .catch(function (err) {
      throw err;
    });
}

function translate(text, opts) {
  opts = opts || {};
  var e;
  [opts.from, opts.to].forEach(function (lang) {
    if (lang && !languages.isSupported(lang)) {
      e = new Error();
      e.code = 400;
      e.message = "The language '" + lang + "' is not supported";
    }
  });
  if (e) {
    return new Promise(function (resolve, reject) {
      reject(e);
    });
  }

  opts.from = opts.from || 'auto';
  opts.to = opts.to || 'en';
  opts.tld = opts.tld || 'com';

  opts.from = languages.getCode(opts.from);
  opts.to = languages.getCode(opts.to);

  return tokenGet(text, {tld: opts.tld})
    .then(function (token) {
      var url = 'https://translate.google.' + opts.tld + '/translate_a/single';
      var data = {
        client: opts.client || 't',
        sl: opts.from,
        tl: opts.to,
        hl: opts.to,
        dt: ['at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
        ie: 'UTF-8',
        oe: 'UTF-8',
        otf: 1,
        ssel: 0,
        tsel: 0,
        kc: 7,
        q: text,
      };
      data[token.name] = token.value;

      return url + '?' + querystring.stringify(data);
    })
    .then(function (url) {
      const opstionsAxios = {
        method: 'get',
        url: url,
        responseType: 'text',
      };

      return axios(opstionsAxios)
        .then(function (res) {
          var result = {
            text: '',
            pronunciation: '',
            from: {
              language: {
                didYouMean: false,
                iso: '',
              },
              text: {
                autoCorrected: false,
                value: '',
                didYouMean: false,
              },
            },
            raw: '',
          };

          if (opts.raw) {
            result.raw = res.data;
          }
          var body = res.data;
          body[0].forEach(function (obj) {
            if (obj[0]) {
              result.text += obj[0];
            }
            if (obj[2]) {
              result.pronunciation += obj[2];
            }
          });

          if (body[2] === body[8][0][0]) {
            result.from.language.iso = body[2];
          } else {
            result.from.language.didYouMean = true;
            result.from.language.iso = body[8][0][0];
          }

          if (body[7] && body[7][0]) {
            var str = body[7][0];

            str = str.replace(/<b><i>/g, '[');
            str = str.replace(/<\/i><\/b>/g, ']');

            result.from.text.value = str;

            if (body[7][5] === true) {
              result.from.text.autoCorrected = true;
            } else {
              result.from.text.didYouMean = true;
            }
          }

          return result;
        })
        .catch(function (err) {
          throw err;
        });
    });
}

async function getTranslate(text) {
  return new Promise((resolve, reject) => {
    translate(text, {to: 'en'})
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        console.error(err);
        reject(null);
      });
  });
}

module.exports = getTranslate;
