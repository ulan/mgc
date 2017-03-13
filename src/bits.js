'use strict';

const assert = require('assert');

function rangeToMask(range) {
  assert(range.start + range.count <= 32);
  let msb = 1 << (range.count - 1);
  return (msb + (msb - 1)) << range.start;
}

function get(range, word) {
  let mask = rangeToMask(range);
  return (word & mask) >>> range.start;
}

function set(range, word, value) {
  let mask = rangeToMask(range);
  let shiftedValue = value << range.start;
  assert.equal(mask, mask | shiftedValue);
  return (word & ~mask) | shiftedValue; 
}

module.exports = {};
module.exports.get = get;
module.exports.set = set;
