const axios = require('../axios');
const utils = require('../utils');

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

let keyVision;

async function getInfoImageByVision(imageB64) {
  if (!keyVision) keyVision = await apiKeyvision();

  const opstionsAxios = {
    method: 'post',
    url: `https://content-vision.googleapis.com/v1/images:annotate?alt=json&key=${keyVision}`,
    data: {
      requests: [
        {
          image: {content: imageB64},
          features: [
            //{type: 'LANDMARK_DETECTION', maxResults: 50},
            //{type: 'FACE_DETECTION', maxResults: 50},
            {type: 'OBJECT_LOCALIZATION', maxResults: 50},
            //{type: 'LOGO_DETECTION', maxResults: 50},
            {type: 'LABEL_DETECTION', maxResults: 50},
            //{type: 'DOCUMENT_TEXT_DETECTION', maxResults: 50},
            //{type: 'SAFE_SEARCH_DETECTION', maxResults: 50},
            {type: 'IMAGE_PROPERTIES', maxResults: 50},
            //{type: 'CROP_HINTS', maxResults: 50},
            {type: 'WEB_DETECTION', maxResults: 50},
          ],
          imageContext: {cropHintsParams: {aspectRatios: [0.8, 1, 1.2]}},
        },
      ],
    },
    headers: utils.headersVision('application/json', axios.defaults.headers['User-Agent']),
  };

  return axios(opstionsAxios);
}

module.exports = getInfoImageByVision;
