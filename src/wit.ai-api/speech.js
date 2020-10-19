const axios = require('../axios');

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
  if (response.data && response.data.text) return response.data.text.trim();
  return '';
}

module.exports = getTextAudio;
