const fs = require('fs').promises;

const axios = require('../axios');

const download = {};

download.image = async function (options) {
  const bytes = await axios.get(options.url, {
    responseType: 'arraybuffer',
  });
  await fs.writeFile(options.dest, bytes.data);
};

module.exports = download;
