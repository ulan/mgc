'use strict';

const assert = require('assert');
const memory = require('./memory');
const bits = require('./bits');
const tag = require('./tag');

const TYPE_TAG_BITS = {start: 0, count: 2};
const COLOR_BITS = {start: 16, count: 2};

class Header {
  static tag(address) {
    let header = memory.load(address);
    return bits.get(TYPE_TAG_BITS, header);
  }
  static setTag(address, tag) {
    let header = memory.load(address);
    memory.store(address, bits.set(TYPE_TAG_BITS, header, tag));
  }
  static color(address) {
    let header = memory.load(address);
    return bits.get(COLOR_BITS, header);
  }
  static setColor(address, color) {
    let header = memory.load(address);
    memory.store(address, bits.set(COLOR_BITS, header, color));
  }
}

class FreeSpace {
  static initialize(address, size) {
    assert(size >= FreeSpace.minSize());
    Header.setTag(address, tag.FREE_SPACE);
    FreeSpace.setSize(address, size);
    FreeSpace.setNext(address, address);
  }
  static size(address) {
    return memory.load(address + FreeSpace.offsetOfSize());
  } 
  static setSize(address, size) {
    return memory.store(address + FreeSpace.offsetOfSize(), size);
  }
  static next(address) {
    return memory.load(address + FreeSpace.offsetOfNext());
  } 
  static setNext(address, next) {
    return memory.store(address + FreeSpace.offsetOfNext(), next);
  }
  static offsetOfSize() {
    return memory.WORD_SIZE;
  }
  static offsetOfNext() {
    return FreeSpace.offsetOfSize() + memory.WORD_SIZE;
  }
  static minSize() {
    return 3 * memory.WORD_SIZE;
  }
}

class Filler {
  static initialize(address) {
    Header.setTag(address, tag.FILLER);
  }
  static size() {
    return memory.WORD_SIZE;
  }
}

class HeapNumber {
  static initialize(address, value) {
    Header.setTag(address, tag.NUMBER);
    HeapNumber.setValue(address, value);
  }
  static value(address) {
    return memory.load(address + HeapNumber.offsetOfValue());
  } 
  static setValue(address, value) {
    memory.store(address + HeapNumber.offsetOfValue(), value);
  }
  static offsetOfValue() {
    return memory.WORD_SIZE;
  }
  static size() {
    return HeapNumber.sizeFor(); 
  }
  static sizeFor() {
    return HeapNumber.offsetOfValue() + memory.WORD_SIZE;
  }
}

class HeapArray {
  static initialize(address, length, value) {
    Header.setTag(address, tag.ARRAY);
    HeapArray.setLength(address, length);
    for (let i = 0; i < length; i++) {
      HeapArray.setElement(address, i, value);
    }
  }
  static length(address) {
    return memory.load(address + HeapArray.offsetOfLength());
  } 
  static setLength(address, length) {
    return memory.store(address + HeapArray.offsetOfLength(), length);
  } 
  static element(address, index) {
    return memory.load(address + HeapArray.offsetOfElement(index));
  }
  static setElement(address, index, value) {
    return memory.store(address + HeapArray.offsetOfElement(index), value);
  }
  static value(address) {
    let result = [];
    let length = HeapArray.length(address);
    for (let i = 0; i < length; i++) {
      result.push(HeapArray.element(address, i));
    }
    return result;
  }
  static offsetOfLength() {
    return memory.WORD_SIZE;
  }
  static offsetOfElement(index) {
    return HeapArray.offsetOfLength() + memory.WORD_SIZE +
           index * memory.WORD_SIZE;
  }
  static size(address) {
    return HeapArray.sizeFor(HeapArray.length(address));
  }
  static sizeFor(length) {
    return HeapArray.offsetOfElement(length);
  }
}

function iteratePointers(address, callback) {
  switch (Header.tag(address)) {
    case tag.ARRAY: {
      let length = HeapArray.length(address);
      for (let i = 0; i < length; i++) {
        callback(HeapArray.element(address, i));
      }
    }
    break;
    case tag.NUMBER:
    // No pointers in number.
    break;
    default:
      assert(false); // Unreachable.
    break;
  }
}

function size(address) {
  switch (Header.tag(address)) {
    case tag.ARRAY:
      return HeapArray.size(address);
    case tag.NUMBER:
      return HeapNumber.size(address);
    case tag.FILLER:
      return Filler.size(address);
    case tag.FREE_SPACE:
      return FreeSpace.size(address);
    default:
      assert(false); // Unreachable.
    break;
  }
}

module.exports = {
  FreeSpace,
  Header,
  HeapArray,
  HeapNumber,
  iteratePointers,
  size
};
