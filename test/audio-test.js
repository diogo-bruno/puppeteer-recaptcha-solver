var audio = require('./audio-file');

var utils = require('../src/utils');

const axios = require('../axios');

const exec = async () => {
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

  const buffer = utils.Base64Binary.decodeArrayBuffer(audio);
  const audioBytes = Array.from(new Uint8Array(buffer));

  var response = await getTextAudio(audioBytes);

  console.log(response);
};

exec();
