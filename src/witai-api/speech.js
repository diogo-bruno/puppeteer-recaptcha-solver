const axios = require('../axios');
const utils = require('../utils');

async function getTextAudio(audioBytes) {
  const opstionsAxios = {
    method: 'post',
    url: 'https://api.wit.ai/speech',
    data: new Uint8Array(audioBytes).buffer,
    headers: {
      Authorization: 'Bearer JVHWCNWJLWLGN6MFALYLHAPKUFHMNTAC',
      'Content-Type': 'audio/mpeg3',
    },
  };
  const response = await axios(opstionsAxios);
  if (response.data && response.data.text) {
    return utils.trimText(response.data.text);
  } else {
    try {
      const splitData = response.data.split(`"entities"`);
      const data = JSON.parse(`{"entities"` + splitData[splitData.length - 1]);
      return utils.trimText(data.text);
    } catch (error) {}
  }
  return '';
}

module.exports = getTextAudio;
