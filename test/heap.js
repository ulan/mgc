'use strict';

const assert = require('assert');
const memory = require('../src/memory');
const heap = require('../src/heap');
const object = require('../src/object');

describe('heap', function () {
  beforeEach(function(){
    memory.reset();
  })
  it('should allocate a number', function() {
    let h = new heap.Heap();
    let address = h.allocateNumber([], 42);
    assert.equal(42, object.HeapNumber.value(address));
  });
  it('should allocate an array', function() {
    let h = new heap.Heap();
    let address = h.allocateArray([], 100);
    assert.equal(100, object.HeapArray.length(address));
  });
  it('should allocate many arrays', function() {
    let h = new heap.Heap();
    let length = 128;
    let _42 = h.allocateNumber([], 42);
    let count = memory.MEMORY_SIZE / object.HeapArray.sizeFor(length);
    for (let i = 0; i < 10 * count; i++) {
      let a = h.allocateArray([_42], length);
      assert.equal(length, object.HeapArray.length(a));
      object.HeapArray.setElement(a, 99, _42);
      assert.equal(_42, object.HeapArray.element(a, 99));
    }
  });
});
