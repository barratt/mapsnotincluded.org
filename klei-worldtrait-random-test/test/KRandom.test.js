// TODO Implement actual test logic 
const KRandom = require('../KRandom.js');

const assert = require('assert');

describe('KRandom', function() {
  describe('next()', function() {
    it('should return correct prediction', function() {
        let kRandom = new KRandom(228);
        let value = kRandom.Next(0, 22);
        assert.strictEqual(value, 18);
    });
  });
});
