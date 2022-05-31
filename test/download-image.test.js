const download = require('../src/image-downloader');
const fs = require('fs');

var assert = require('assert');
describe('DownloadImage', function () {
  describe('Test Function download.image()', function () {
    it('must save the image in the specified destination', async function () {
      const fileDest = `./tmp/payload${new Date().getTime()}.jpg`;
      await download.image({
        url: 'https://p.bigstockphoto.com/GeFvQkBbSLaMdpKXF1Zv_bigstock-Aerial-View-Of-Blue-Lakes-And--227291596.jpg',
        dest: fileDest,
      });

      assert.equal(fs.existsSync(fileDest), true);
    });
  });
});
