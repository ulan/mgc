'use strict';

const assert = require('assert');
const bits = require('../src/bits');

describe('bits', function () {
  it('should get bit 0', function() {
    assert.equal(1, bits.get({start: 0, count: 1}, 1));
  });
  it('should get bit 31', function() {
    assert.equal(1, bits.get({start: 31, count: 1}, 0x80000000));
  });
  it('should get two bits', function() {
    assert.equal(0b11, bits.get({start: 1, count: 2}, 0b110));
  });
  it('should set bit 0', function() {
    assert.equal(1, bits.set({start: 0, count: 1}, 0, 1));
  });
  it('should set bit 31', function() {
    assert.equal(0x80000000 | 0, bits.set({start: 31, count: 1}, 0, 1));
  });
  it('should set two bis', function() {
    assert.equal(0b10110, bits.set({start: 1, count: 2}, 0b10000, 0b11));
  });
});
