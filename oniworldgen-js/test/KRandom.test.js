// TODO Implement actual test logic 
const KRandom = require('../oni/KRandom.js');

const assert = require('assert');

describe('KRandom', function() {
  describe('next()', function() {
    it('Single next generation', function() {
      const testPairs = [
        { value: 18, seed: 228, min: 0, max: 22 },
        { value: 4, seed: 1429, min: 0, max: 15 },
        { value: 21, seed: 1453, min: 0, max: 26 },
        { value: 3, seed: 1511, min: 0, max: 30 },
        { value: 1, seed: 2493, min: 0, max: 15 },
        { value: 17, seed: 2519, min: 0, max: 25 },
        { value: 21, seed: 3166, min: 0, max: 29 },
        { value: 15, seed: 3193, min: 0, max: 19 },
        { value: 6, seed: 3661, min: 0, max: 20 },
        { value: 13, seed: 3727, min: 0, max: 17 },
        { value: 19, seed: 4248, min: 0, max: 20 },
        { value: 12, seed: 4831, min: 0, max: 23 },
        { value: 17, seed: 6728, min: 0, max: 29 },
        { value: 0, seed: 6813, min: 0, max: 26 },
        { value: 13, seed: 6933, min: 0, max: 19 },
        { value: 2, seed: 7374, min: 0, max: 24 },
        { value: 3, seed: 7533, min: 0, max: 24 },
        { value: 2, seed: 8289, min: 0, max: 23 },
        { value: 5, seed: 8427, min: 0, max: 25 },
        { value: 11, seed: 9387, min: 0, max: 16 },
        { value: 9, seed: 3877051, min: 0, max: 30 },
        { value: 14, seed: 12505137, min: 0, max: 17 },
        { value: 15, seed: 62327631, min: 0, max: 17 },
        { value: 19, seed: 103437507, min: 0, max: 24 },
        { value: 6, seed: 128700338, min: 0, max: 25 },
        { value: 15, seed: 155254378, min: 0, max: 17 },
        { value: 12, seed: 243169491, min: 0, max: 27 },
        { value: 8, seed: 288378422, min: 0, max: 19 },
        { value: 24, seed: 346144831, min: 0, max: 30 },
        { value: 14, seed: 394430372, min: 0, max: 20 },
        { value: 2, seed: 442791810, min: 0, max: 15 },
        { value: 10, seed: 636632812, min: 0, max: 18 },
        { value: 25, seed: 849161932, min: 0, max: 30 },
        { value: 5, seed: 874114891, min: 0, max: 20 },
        { value: 9, seed: 980353723, min: 0, max: 19 },
        { value: 3, seed: 1066598119, min: 0, max: 21 },
        { value: 1, seed: 1140530034, min: 0, max: 24 },
        { value: 0, seed: 1193225258, min: 0, max: 15 },
        { value: 9, seed: 1247801877, min: 0, max: 25 },
        { value: 0, seed: 1305373386, min: 0, max: 24 },
        { value: 3, seed: 1400086846, min: 0, max: 24 },
        { value: 6, seed: 1402642722, min: 0, max: 15 },
        { value: 14, seed: 1414984680, min: 0, max: 19 },
        { value: 7, seed: 1524667743, min: 0, max: 18 },
        { value: 18, seed: 1701812372, min: 0, max: 22 },
        { value: 19, seed: 1794067469, min: 0, max: 22 },
        { value: 4, seed: 1842032567, min: 0, max: 15 },
        { value: 13, seed: 1864236681, min: 0, max: 26 },
        { value: 5, seed: 1991602915, min: 0, max: 17 },
        { value: 10, seed: 2021179729, min: 0, max: 16 },
      ];
      
      let failures = 0;
      for (const pair of testPairs) {
        const result = new KRandom(pair.seed).next(pair.min, pair.max);
        if (result !== pair.value) {
          console.log(`Failed: ${pair.seed} => ${result} !== ${pair.value}`);
          failures++;
        }
      }

      assert.strictEqual(failures, 0);
    });
  });
});
