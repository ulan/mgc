'use strict';
const assert = require('assert');
const memory = require('./memory');
const object = require('./object');
const freeList = require('./freelist');

class Page {
  constructor(address) {
    this.address = address;
    this.end = address + Page.size();
    this.freeList = new freeList.FreeList();
    this.freeList.add(this.address, this.end);
  }
  static size() {
    return memory.PAGE_SIZE;
  }
  findAllocationArea(size) {
    let maybeArea = this.freeList.find(size);
    maybeArea.page = this;
    return maybeArea;
  }
  retireAllocationArea(area) {
    assert.equal(this, area.page);
    this.freeList.add(area.start, area.end);
  }
  iterateObjects(callback) {
    let current = this.address;
    while (current < this.end) {
      callback(current);
      current += object.size(current);
    }
  }
}

function allocatePage() {
  let maybeAddress = memory.allocate(Page.size());
  if (maybeAddress.success) {
    let page = new Page(maybeAddress.address);
    return {success: true, page: page};
  } else {
    return {success: false, page: null};
  }
}

module.exports = {
  Page,
  allocatePage
};
