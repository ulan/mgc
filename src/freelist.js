'use strict';
const assert = require('assert');
const memory = require('./memory');
const object = require('./object');

const SENTINEL = 0xffffffff;
assert(!memory.wordAligned(SENTINEL));

class FreeList {
  constructor() {
    this.head = SENTINEL;
  }
  clear() {
    this.head = SENTINEL;
  }
  find(size) {
    let previous = SENTINEL;
    let current = this.head;
    while (current !== SENTINEL &&
           object.FreeSpace.size(current) < size) {
      previous = current;
      current = object.FreeSpace.next(current);
    }
    if (current === SENTINEL) {
      return {success: false, start: 0, end: 0};
    }
    let next = object.FreeSpace.next(current);
    if (previous === SENTINEL) {
      this.head = next; 
    } else {
      object.FreeSpace.setNext(previous, next);
    }
    return {
        success: true,
        start: current,
        end: current + object.FreeSpace.size(current)
    };
  }
  add(start, end) {
    let size = end - start;
    if (size >= object.FreeSpace.minSize()) {
      object.FreeSpace.initialize(start, size);
      object.FreeSpace.setNext(start, this.head);
      this.head = start;
    } else {
      while (start < end) {
        object.Filler.initialize(start);
        start += object.Filler.size(start);
      }
    }
  }
}

module.exports = {
  FreeList
};
