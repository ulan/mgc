'use strict';
const assert = require('assert');
const object = require('./object');
const page = require('./page');
const marker = require('./marker');
const sweeper = require('./sweeper');

const Marker = marker.Marker;
const Sweeper = sweeper.Sweeper;

class Heap {
  constructor() {
    this.pages = [];
    this.allocationArea = {page: null, start: 0, end: 0};
    this.predefined = {}
    this.predefined.zero = this.allocateNumber({}, 0);
  }
  allocateNumber(roots, value) {
    let size = object.HeapNumber.sizeFor();
    let address = this.allocate(roots, size);
    object.HeapNumber.initialize(address, value);
    return address;
  }
  allocateString(roots, value) {
    let size = object.HeapString.sizeFor(value.length);
    let address = this.allocate(roots, size);
    object.HeapString.initialize(address, value);
    return address;
  }
  allocateArray(roots, length) {
    let size = object.HeapArray.sizeFor(length);
    let address = this.allocate(roots, size);
    object.HeapArray.initialize(address, length, this.predefined.zero);
    return address;
  }
  allocate(roots, size) {
    if (this.allocationAreaSize() < size) {
      this.retireAllocationArea();
      if (!this.findAllocationArea(size)) {
        this.collectGarbage(roots);
        if (!this.findAllocationArea(size)) {
          throw new Error('Out of memory');
        }
      }
    }
    let result = this.allocationArea.start;
    this.allocationArea.start += size;
    return result;
  }
  allocationAreaSize() {
    return this.allocationArea.end - this.allocationArea.start;
  }
  retireAllocationArea() {
    let page = this.allocationArea.page;
    if (page != null) {
      page.retireAllocationArea(this.allocationArea);
    }
  }
  findAllocationArea(size) {
    return this.tryFreeList(size) || this.tryNewPage(size);
  }
  tryFreeList(size) {
    for (let page of this.pages) {
      let candidate = page.findAllocationArea(size);
      if (candidate.start < candidate.end) {
        this.allocationArea = candidate;
        assert(this.allocationAreaSize() >= size);
        return true;
      }
    }
    return false;
  }
  tryNewPage(size) {
    let maybePage = page.allocatePage();
    if (maybePage.success) {
      let page = maybePage.page;
      this.pages.push(page);
      this.allocationArea = page.findAllocationArea(size); 
      assert(this.allocationAreaSize() >= size);
      return true;
    }
    return false;
  }
  collectGarbage(roots) {
    this.retireAllocationArea();
    this.mark(roots);
    this.sweep(this.pages);
  }
  mark(roots) {
    let marker = new Marker(roots.concat(Object.values(this.predefined)));
    marker.run();
  }
  sweep(pages) {
    let sweeper = new Sweeper(pages);
    sweeper.run();
  }
}

module.exports = {
  Heap
};
