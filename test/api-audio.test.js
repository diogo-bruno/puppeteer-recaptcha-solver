const {audio} = require('./data-files');
const getTextAudio = require('../src/wit.ai-api/speech');
const utils = require('../src/utils');
const assert = require('assert');

describe('Audio', function () {
  describe('Test Function getTextAudio()', function () {
    it('should return the text of the audio informed', async function () {
      const buffer = utils.Base64Binary.decodeArrayBuffer(audio);
      const audioBytes = Array.from(new Uint8Array(buffer));
      const response = await getTextAudio(audioBytes);
      assert.equal(response.startsWith('Hey '), true);
    });
  });
});
