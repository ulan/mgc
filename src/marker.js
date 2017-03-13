'use strict';
const assert = require('assert');
const object = require('./object');
const color = require('./color');

const BLACK = color.BLACK;
const GREY = color.GREY;
const WHITE = color.WHITE;

class Marker {
  constructor(roots) {
    this.worklist = [];
    this.roots = roots;
  }
  markObject(address) {
    let color = object.Header.color(address);
    if (color == WHITE) {
      object.Header.setColor(address, GREY);
      this.worklist.push(address);
    }
  }
  run() {
    for (let x of this.roots) {
      this.markObject(x);
    }
    while (this.worklist.length > 0) {
      let address = this.worklist.pop();
      let color = object.Header.color(address);
      assert(color == GREY);
      object.iteratePointers(address, this.markObject);
      object.Header.setColor(address, BLACK);
    }
  }
}


module.exports = {
  Marker
};
