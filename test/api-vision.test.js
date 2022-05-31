const getInfoImageByVision = require('../src/google-api/vision');
const {image} = require('./data-files');

const assert = require('assert');

describe('ApiVisionResult', function () {
  describe('Test Function getInfoImageByVision()', function () {
    it('should return the result of vision', async function () {
      return getInfoImageByVision(image).then(function (response) {
        assert.equal(response.data.responses[0].labelAnnotations[0].description, 'Fire hydrant');
        assert.ok(response);
      });
    }).timeout(30000);
  });
});
