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
  const agents = [
    'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3440.106 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36',
    'Mozilla/5.0 (Linux; U; Android 9; Redmi 6 Pro Build/PKQ1.180917.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.96 Mobile Safari/537.36 OPR/43.2.2254.141238',
    'Mozilla/5.0 (Linux; Android 8.0.0; GM 5 Plus) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; arm_64; Android 7.1.2; 15 Lite) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.4.2.101.00 SA/1 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.15025',
    'Mozilla/5.0 (Linux; Android 9; Nokia 5.1 Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.83 Mobile Safari/537.36 YaApp_Android/10.91 YaSearchBrowser/10.91',
    'Mozilla/5.0 (Linux; arm_64; Android 8.1.0; Swift 2 Plus) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 YaApp_Android/10.45 YaSearchBrowser/10.45 BroPP/1.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 8.1.0; AS260) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; HD1907) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.37 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; Redmi Note 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Mobile Safari/537.36 OPR/54.3.2672.50220',
    'Mozilla/5.0 (Linux; Android 10; BKL-AL00 Build/HUAWEIBKL-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/76.0.3809.89 Mobile Safari/537.36 T7/11.23 SP-engine/2.19.0 baiduboxapp/11.23.5.10 (Baidu; P1 10) NABar/1.0',
    'Mozilla/5.0 (Linux; U; Android 8.1.0; TECNO KB7 Build/O11019; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.149 Mobile Safari/537.36 OPR/43.2.2254.140270',
    'Mozilla/5.0 (Linux; Android 10; Redmi Note 5 Build/QQ1B.200105.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.186 Mobile Safari/537.36 YaApp_Android/10.91 YaSearchBrowser/10.91',
    'Mozilla/5.0 (Linux; Android 10; POT-LX1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 YaBrowser/19.4.0.535.00 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 7.0; X60L Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36 YaApp_Android/10.91 YaSearchBrowser/10.91',
    'Mozilla/5.0 (Linux; Android 8.1.0; Linx X1 3G LS4050MG) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.92 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; arm_64; Android 8.1.0; ZTE BLADE V0920) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.4.2.101.00 SA/1 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 6.0.1; Redmi Note 3 Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36 YaApp_Android/10.91 YaSearchBrowser/10.91',
    'Mozilla/5.0 (Linux; Android 6.0; Power Five Max Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.96 YaBrowser/19.6.0.158 (lite) Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; IN2010) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.117 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 7.0; SM-G928S Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.137 Mobile Safari/537.36 YaApp_Android/9.99 YaSearchBrowser/9.99',
    'Mozilla/5.0 (Linux; Android 10; SM-A605GN Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.96 Mobile Safari/537.36 [Pinterest/Android]',
    'Mozilla/5.0 (Linux; Android 9; Infinix X5516) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 4.4.2; CHM-U01 Build/HonorCHM-U01) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.68 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 9; Redmi Note 8 Build/PKQ1.190616.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.96 Mobile Safari/537.36[FBAN/EMA;FBLC/ru_RU;FBAV/201.0.0.7.119;]',
    'Mozilla/5.0 (Linux; Android 9; LLD-L31 Build/HONORLLD-L31) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36 YaApp_Android/9.85 YaSearchBrowser/9.85',
    'Mozilla/5.0 (Linux; Android 9; CLT-L29 Build/HUAWEICLT-L29; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.83 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/264.0.0.44.111;]',
    'Mozilla/5.0 (Linux; arm_64; Android 9; Redmi 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.4.3.90.00 SA/1 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 7.0; TLE722G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.117 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 8.1.0; Redmi Note 6 Pro Build/OPM1.171019.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.96 Mobile Safari/537.36 YandexSearch/8.05 YandexSearchBrowser/8.05',
    'Mozilla/5.0 (Linux; Android 9; RMX1927) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.101 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; arm_64; Android 8.1.0; vivo 1808) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.4.2.101.00 SA/1 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 7.1.2; Redmi 4A Build/N2G47H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Mobile Safari/537.36 YaApp_Android/10.70 YaSearchBrowser/10.70',
    'Mozilla/5.0 (Linux; Android 7.1.1; Y3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 4.4.2_EYAL_M_C; SM-G7102) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 9; SM-J415FN Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.136 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/273.0.0.39.123;]',
    'Mozilla/5.0 (Linux; Android 6.0; HUAWEI GRA-TL00) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 9; ONEPLUS A5010 Build/PKQ1.180716.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.96 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/273.0.0.39.123;]',
    'Mozilla/5.0 (Linux; Android 7.0; ZTE BLADE A520) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 8.0.0; SM-A605FN Build/R16NW; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/69.0.3497.100 Mobile Safari/537.36 YandexSearch/8.00 YandexSearchBrowser/8.00',
    'Mozilla/5.0 (Linux; Android 4.2.2; GT-I9200 Build/JDQ39) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.99 Safari/537.36 OPR/50.4.2426.146257',
    'Mozilla/5.0 (Linux; Android 9; Redmi S2 Build/PKQ1.181203.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.83 Mobile Safari/537.36 Instagram 144.0.0.25.119 Android (28/9; 320dpi; 720x1344; Xiaomi/xiaomi; Redmi S2; ysl; qcom; ru_RU; 217948959)',
    'Mozilla/5.0 (Linux; Android 8.1.0; POCO F1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; arm_64; Android 9; TA-1053) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.4.3.90.00 SA/1 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 9; Nokia 2.1 Build/PKQ1.181105.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36 YaApp_Android/10.91 YaSearchBrowser/10.91',
    'Mozilla/5.0 (Linux; arm; Android 7.0; BG2-U01) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 YaBrowser/20.3.0.276.00 Mobile SA/1 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 8.0.0; LLD-AL10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 7.0; CUBOT KING KONG Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.96 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; PCT-L29 Build/HUAWEIPCT-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36 YaApp_Android/10.91 YaSearchBrowser/10.91',
    'Mozilla/5.0 (Linux; Android 6.0; E5603 Build/30.2.A.2.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36 YaApp_Android/10.61 YaSearchBrowser/10.61',
    'Mozilla/5.0 (Linux; Android 5.1; T03 Build/LMY47D; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.96 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/273.0.0.39.123;]',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 DuckDuckGo/7',
    'Mozilla/5.0 (Linux; U; Android 10; en-US; BKL-L09 Build/HUAWEIBKL-L09S) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/13.2.0.1296 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 LightSpeed [FBAN/MessengerLiteForiOS;FBAV/267.1.0.63.120;FBBV/218223117;FBDV/iPhone10,4;FBMD/iPhone;FBSN/iOS;FBSV/13.4.1;FBSS/2;FBCR/;FBID/phone;FBLC/ru_LT;FBOP/0]',
    'Mozilla/5.0 (Linux; Android 9; Redmi Note 7 Pro Build/PKQ1.181203.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.96 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/273.0.0.39.123;]',
    'Mozilla/5.0 (Linux; Android 5.0; BLU STUDIO C 5+5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.119 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 6.0.1; SM-J106F Build/MMB29Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Mobile Safari/537.36 YaApp_Android/10.30 YaSearchBrowser/10.30',
    'Mozilla/5.0 (Linux; Android 9; MAR-LX1B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 5.0.1; Lenovo TAB 2 A10-70L Build/LRX21M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.83 Mobile Safari/537.36 YaApp_Android/9.85/apad YaSearchBrowser/9.85',
    'Mozilla/5.0 (Linux; Android 4.1.2; C1905 Build/15.1.C.2.8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.99 Mobile Safari/537.36 OPR/50.4.2426.146257',
    'Mozilla/5.0 (Linux; Android 6.0.1; SAMSUNG SM-G925F) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/11.2 Chrome/75.0.3770.143 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 9; SM-J600F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.83 Mobile Safari/537.36 YaApp_Android/10.91 YaSearchBrowser/10.91',
    'Mozilla/5.0 (Linux; arm_64; Android 7.0; CPN-L09) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.4.3.90.00 SA/1 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 6.0; hi6210sft) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 7.0; LG-M250) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.101 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; arm_64; Android 7.0; S8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.96 YaBrowser/20.4.0.237.00 SA/1 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 6.0; K10000 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.119 Mobile Safari/537.36 YaApp_Android/10.61 YaSearchBrowser/10.61',
    'Mozilla/5.0 (Linux; Android 10; SM-G980F Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/273.0.0.39.123;]',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBDV/iPhone8,4;FBMD/iPhone;FBSN/iOS;FBSV/13.5;FBSS/2;FBID/phone;FBLC/en_GB;FBOP/5]',
    'Mozilla/5.0 (Linux; Android 10; ELS-NX9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.101 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; GM1910) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36 OPR/58.2.2878.53403',
    'Mozilla/5.0 (Linux; arm; Android 8.0.0; SM-A320F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 YaApp_Android/10.63 YaSearchBrowser/10.63 BroPP/1.0 SA/1 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 8.0.0; SM-G570F Build/R16NW; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.83 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/272.0.0.50.125;]',
    'Mozilla/5.0 (Linux; Android 8.1.0; BV9500-RU) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 13_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/111.0.314264656 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; U; Android 7.0; en-US; SM-G930F Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.13.4.1214 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 7.1.1; SM-J510FN Build/NMF26X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Mobile Safari/537.36 YaApp_Android/9.20 YaSearchBrowser/9.20',
    'Mozilla/5.0 (Linux; Android 8.1.0; DUA-L22 Build/HONORDUA-L22) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Mobile Safari/537.36 YaApp_Android/10.20 YaSearchBrowser/10.20',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 13_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBDV/iPhone9,3;FBMD/iPhone;FBSN/iOS;FBSV/13.1;FBSS/2;FBID/phone;FBLC/ru_RU;FBOP/5;FBCR/]',
    'Mozilla/5.0 (Linux; Android 8.1.0; SM-T585 Build/M1AJQ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36 OPR/51.3.2461.138727',
    'Mozilla/5.0 (Linux; Android 7.0; VOX_G501_4G_VS5033ML) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 9; TA-1021) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36 OPR/58.2.2878.53403',
    'Mozilla/5.0 (Linux; Android 6.0; PMT3118_3G Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.132 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 6.0.1; SM-N920F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.136 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; U; Android 7.0;en-us; DLI-AL10 Build/HONORDLI-AL10) AppleWebKit/537.36 (KHTML, like Gecko)Version/4.0 Chrome/57.0.2987.132 MQQBrowser/8.1 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 8.1.0; DRA-LX5 Build/HONORDRA-LX5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.83 Mobile Safari/537.36 YaApp_Android/10.91 YaSearchBrowser/10.91',
    'Mozilla/5.0 (Linux; arm; Android 7.0; ZTE BLADE A520) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.4.2.101.00 SA/1 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 6.0; MYA-U29 Build/HUAWEIMYA-U29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.91 Mobile Safari/537.36 YaApp_Android/10.44 YaSearchBrowser/10.44',
    'Mozilla/5.0 (Linux; Android 8.0.0; ASUS_Z01KDA) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.96 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 7.0; NEM-L51 Build/HONORNEM-L51) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Mobile Safari/537.36 YaApp_Android/10.20 YaSearchBrowser/10.20',
    'Mozilla/5.0 (Linux; Android 8.1.0; LG-M700 Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.96 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/273.0.0.39.123;]',
    'Mozilla/5.0 (Linux; Android 8.0.0; RNE-L21 Build/HUAWEIRNE-L21; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.96 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/273.0.0.39.123;]',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Mobile/15B93 YaBrowser/19.5.2.38.10 YaApp_iOS/25.00 YaApp_iOS_Browser/25.00 Safari/604.1',
    'Mozilla/5.0 (Linux; arm_64; Android 9; RMX1927) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 YaBrowser/20.4.2.101.00 SA/1 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 9; SM-G9750 Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/71.0.3578.99 Mobile Safari/537.36 YandexSearch/8.45 YandexSearchBrowser/8.45',
    'Mozilla/5.0 (Linux; Android 5.0.2; HTC One E9PLUS dual sim) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; SM-A750FN Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.96 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/273.0.0.39.123;]',
    'Mozilla/5.0 (Linux; U; Android 5.0.2; en-US; SM-A700FD Build/LRX22G) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.13.2.1208 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 9; ANE-LX1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.101 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 8.1.0; DUA-L22 Build/HONORDUA-L22) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Mobile Safari/537.36 YaApp_Android/10.44 YaSearchBrowser/10.44',
    'Mozilla/5.0 (Linux; Android 10; MI 9 Build/QKQ1.190825.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.96 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/273.0.0.39.123;]',
  ];
  const index = utils.rdn(1, agents.length);
  return agents[index];
};

utils.args = [
  '--renderer',
  '--start-maximized',
  '--window-position=0,0',
  '--window-size=1920,1040',
  '--no-sandbox',
  '--disable-features=site-per-process',
  '--disable-site-isolation-trials',
  '--disable-web-security',
  '--allow-cross-origin-auth-prompt',
  '-–allow-file-access-from-files',
  '--user-agent="' + utils.getUserAgent() + '"',
  '--lang=en-US,en;q=0.9',
  '--disk-cache-size=0',
  '--disable-dev-shm-usage',
  '--disable-setuid-sandbox',
  '--disable-threaded-animation',
  '--enable-javascript',
  '--ignore-certificate-errors',
  '--disable-popup-blocking',
  '--disable-translate',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-infobars',
  '--disable-breakpad',
  '--no-zygote',
  '--enable-webgl',
  '--no-first-run',
  '--deterministic-fetch',
  '--disable-features=IsolateOrigins',
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

utils.existErrorRecaptcha = async (page) => {
  return page.evaluate(() => {
    const iframe = document.querySelector('iframe[src*="api2/anchor"]');
    if (!iframe) return false;
    if (iframe.contentWindow.document.querySelector('.rc-anchor-error-msg-container')) {
      if (iframe.contentWindow.document.querySelector('.rc-anchor-error-msg-container').style.display !== 'none') {
        return iframe.contentWindow.document.querySelector('.rc-anchor-error-msg-container').innerText;
      }
    }
    return false;
  });
};

utils.clickCheckBoxRecaptcha = async (page) => {
  try {
    let frames = await page.frames();
    const recaptchaFrame = frames.find((frame) => frame.url().includes('api2/anchor'));
    if (recaptchaFrame) {
      const checkbox = await recaptchaFrame.$('.recaptcha-checkbox-border');
      if (checkbox) await checkbox.click({delay: utils.rdn(30, 500)});
    }
    await page.waitForTimeout(500);
  } catch (error) {
    console.error(error);
  }
};

module.exports = utils;
