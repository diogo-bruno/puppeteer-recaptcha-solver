const translate = require('../src/google-api/translate');

const assert = require('assert');

describe('Translate', function () {
  describe('Test Function translate()', function () {
    it('should return the text translated into english', async function () {
      const text = 'Olá, mundo!';
      const textTranslate = await translate(text, {to: 'en'});
      assert.equal(textTranslate.text, 'Hello World!');
    });
  });
});
