'use strict';

const assert = require('assert');

const KB = 1024;
const MB = 1024 * KB;
const PAGE_SIZE = 4 * KB;
const WORD_SIZE = 4;
const MEMORY_SIZE = MB;
const NUMBER_OF_PAGES = MEMORY_SIZE / PAGE_SIZE;

// Word addressable memory.
var memory;
// Regions of available pages.
var freePages;
// Maps a page index to 'is-allocated' boolean.
var isAllocatedPage;
// Maps a page index to the number of allocated pages.
var allocatedPageToCount;

function reset() {
  memory = new Uint32Array(MEMORY_SIZE / WORD_SIZE);
  freePages = [{start: 0, count: NUMBER_OF_PAGES}];
  isAllocatedPage = {};
  allocatedPageToCount = {};
}

function pageAligned(address) {
  return address % PAGE_SIZE === 0;
}

function wordAligned(address) {
  return address % WORD_SIZE === 0;
}

function allocated(address) {
  return isAllocatedPage[(address / PAGE_SIZE) | 0];
}

function markPagesAsAllocated(start, count) {
  allocatedPageToCount[start] = count;
  for (let i = 0; i < count; i++) {
    assert(!isAllocatedPage[start + i]);
    isAllocatedPage[start + i] = true;
  }
}

function markPagesAsFree(start, count) {
  allocatedPageToCount[start] = 0;
  for (let i = 0; i < count; i++) {
    assert(isAllocatedPage[start + i]);
    isAllocatedPage[start + i] = false;
  }
}

function findFirstFitIndex(pagesNeeded) {
  for (let i = 0; i < freePages.length; i++) {
    if (freePages[i].count >= pagesNeeded) {
      return i;
    }
  }
  return freePages.length;
}

function allocate(size) {
  assert(pageAligned(size));
  let pagesNeeded = size / PAGE_SIZE;
  let i = findFirstFitIndex(pagesNeeded);
  if (i === freePages.length) {
    return {success: false, address: 0};
  }
  let result = freePages[i].start * PAGE_SIZE;
  markPagesAsAllocated(freePages[i].start, pagesNeeded);
  freePages[i].start += pagesNeeded;
  freePages[i].count -= pagesNeeded;
  if (freePages[i].count === 0) {
    let lastIndex = freePages.length - 1;
    freePages[i] = freePages[lastIndex];
    freePages.pop();
  }
  return {success: true, address: result};
}

function release(address) {
  assert(pageAligned(address));
  let start = address / PAGE_SIZE;
  let count = allocatedPageToCount[start];
  assert(count > 0);
  markPagesAsFree(start, count);
  freePages.push({start: start, count: count});
}

function load(address) {
  assert(wordAligned(address));
  assert(allocated(address));
  return memory[address / WORD_SIZE];
}

function store(address, value) {
  assert(wordAligned(address));
  assert(allocated(address));
  memory[address / WORD_SIZE] = value;
}

reset();

module.exports = {
  allocate,
  load,
  store,
  release,
  reset,
  wordAligned,
  MEMORY_SIZE,
  PAGE_SIZE,
  WORD_SIZE
}
