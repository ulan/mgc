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
    this.predefined = {zero: this.allocateNumber({}, 0)};
  }
  allocateNumber(context, value) {
    let size = object.HeapNumber.sizeForAllocation();
    let address = this.allocate(context, size);
    object.HeapNumber.initialize(address, value);
    return address;
  }
  allocateString(context, value) {
    let size = object.HeapString.sizeForAllocation(value.length);
    let address = this.allocate(context, size);
    object.HeapString.initialize(address, value);
    return address;
  }
  allocateArray(context, length) {
    let size = object.HeapArray.sizeForAllocation(length);
    let address = this.allocate(context, size);
    object.HeapArray.initialize(address, length, this.predefined.zero);
    return address;
  }
  allocate(context, size) {
    if (this.allocationAreaSize() < size) {
      this.retireAllocationArea();
      if (!this.findAllocationArea(size)) {
        this.collectGarbage(context);
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
  collectGarbage(context) {
    this.retireAllocationArea();
    this.mark(context);
    this.sweep(this.pages);
  }

  mark(context) {
    let roots = Object.values(this.predefined) + Object.values(context);
    let marker = new Marker(roots);
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
