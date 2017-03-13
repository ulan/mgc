'use strict';

const assert = require('assert');
const memory = require('../src/memory');
const object = require('../src/object');
const tag = require('../src/tag');

describe('object', function () {
  beforeEach(function(){
    memory.reset();
  })
  it('should initialize number', function() {
    let allocation = memory.allocate(memory.PAGE_SIZE);
    assert(allocation.success);
    let address = allocation.address;
    object.HeapNumber.initialize(address, 10);
    assert.equal(tag.NUMBER, object.Header.tag(address));
    assert.equal(10, object.HeapNumber.value(address));
  });
  it('should initialize string', function() {
    let allocation = memory.allocate(memory.PAGE_SIZE);
    assert(allocation.success);
    let address = allocation.address;
    object.HeapString.initialize(address, "sample");
    assert.equal(tag.STRING, object.Header.tag(address));
    assert.equal(4 + 4 + 6 * 4, object.HeapString.size(address));
    assert.equal("sample", object.HeapString.value(address));
  });
  it('should initialize array', function() {
    let allocation = memory.allocate(memory.PAGE_SIZE);
    assert(allocation.success);
    let address = allocation.address;
    object.HeapArray.initialize(address, 2, address);
    assert.equal(tag.ARRAY, object.Header.tag(address));
    assert.equal(4 + 4 + 2 * 4, object.HeapArray.size(address));
    assert.deepEqual([address, address], object.HeapArray.value(address));
  });
  it('should initialize free space', function() {
    let allocation = memory.allocate(memory.PAGE_SIZE);
    assert(allocation.success);
    let address = allocation.address;
    object.FreeSpace.initialize(address, object.FreeSpace.fullSize());
    assert.equal(tag.FREE_SPACE, object.Header.tag(address));
    assert.equal(3 * 4, object.FreeSpace.size(address));
  });
});
