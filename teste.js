const axios = require('./src/axios');
const utils = require('./src/utils');

async function apiKeyvision() {
  const opstionsAxios = {
    method: 'get',
    url: 'https://explorer.apis.google.com/embedded.js',
    headers: utils.headersVision('text/plain', axios.defaults.headers['User-Agent']),
  };
  const response = await axios(opstionsAxios);
  let key;
  try {
    const apiKeys = String(response.data).split('={api_key:{');
    return apiKeys[1].split('"},')[0].split(':"')[1];
  } catch (error) {
    console.error(error);
  }
  if (!key) key = 'AIzaSyAa8yy0GdcGPHdtD083HiGGx_S0vMPScDM';
  return key;
}

(async () => {
  console.log('1');
  const key = await apiKeyvision();
  console.log(key);
  console.log('2');
})();
