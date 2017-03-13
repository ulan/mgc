'use strict';

const assert = require('assert');
const memory = require('../src/memory');

describe('memory', function () {
  beforeEach(function(){
    memory.reset();
  })
  it('should allocate', function() {
    let result = memory.allocate(memory.MEMORY_SIZE); 
    assert(result.success);
    assert.equal(0, result.address);
  });
  it('should allocate after release', function() {
    let result = memory.allocate(memory.MEMORY_SIZE);
    memory.release(result.address);
    result = memory.allocate(memory.MEMORY_SIZE); 
    assert(result.success);
    assert.equal(0, result.address);
  });
  it('should fail to allocate', function() {
    let result = memory.allocate(memory.MEMORY_SIZE / 2);
    assert(result.success);
    let result2 = memory.allocate(
        memory.MEMORY_SIZE / 2 + memory.PAGE_SIZE);
    assert(!result2.success);
  });
  it('should load, store', function() {
    let result = memory.allocate(memory.MEMORY_SIZE); 
    result = memory.allocate(memory.MEMORY_SIZE); 
    assert.equal(0, memory.load(result.address));
    memory.store(result.address, 10);
    assert.equal(10, memory.load(result.address));
  });
});
