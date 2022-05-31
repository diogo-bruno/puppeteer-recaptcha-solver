const {apiKeyVision} = require('../src/google-api/vision');

const assert = require('assert');

describe('ApiVisionKey', function () {
  describe('Test Function apiKeyVision()', function () {
    it('should return vision key', async function () {
      const key = await apiKeyVision();
      assert.equal(key.startsWith('AIzaSy'), true);
    });
  });
});
