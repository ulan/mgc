'use strict';

const assert = require('assert');
const memory = require('../src/memory');
const freelist = require('../src/freelist');

describe('freelist', function () {
  beforeEach(function(){
    memory.reset();
  })
  it('should get item from free list', function() {
    let allocation = memory.allocate(memory.PAGE_SIZE);
    let freeList = new freelist.FreeList();
    let address = allocation.address;
    let size = 3 * memory.WORD_SIZE;
    freeList.add(address, size);
    let free = freeList.find(size);
    assert.equal(address, free.start);
    assert.equal(address + size, free.end);
  });
  it('should search in free list', function() {
    let allocation = memory.allocate(memory.PAGE_SIZE);
    let freeList = new freelist.FreeList();
    let address = allocation.address;
    let size = 3 * memory.WORD_SIZE;
    freeList.add(address, address + size);
    freeList.add(address + size, address + 3 * size);
    freeList.add(address + 3 * size, address + 4 * size);
    let free = freeList.find(size + 1);
    assert.equal(address + size, free.start);
    assert.equal(address + 3 * size, free.end);
  });
});
