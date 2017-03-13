'use strict';
const assert = require('assert');
const object = require('./object');
const color = require('./color');

const BLACK = color.BLACK;
const WHITE = color.WHITE;

class Sweeper{
  constructor(pages) {
    this.pages = pages;
  }
  run() {
    for (let page of this.pages) {
      this.sweepPage(page);
    } 
  }
  sweepPage(page) {
    page.freeList.clear();
    let freeStart = page.address;
    page.iterateObjects(function(address) {
      let color = object.Header.color(address);
      let size = object.size(address);
      assert(color === BLACK || color === WHITE);
      if (color === BLACK) {
        page.freeList.add(freeStart, address);
        freeStart = address + size;
        object.Header.setColor(address, WHITE);
      }
    });
    page.freeList.add(freeStart, page.end);
  }
}

module.exports = {
  Sweeper
};
