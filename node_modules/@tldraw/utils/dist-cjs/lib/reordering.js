"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var reordering_exports = {};
__export(reordering_exports, {
  ZERO_INDEX_KEY: () => ZERO_INDEX_KEY,
  getIndexAbove: () => getIndexAbove,
  getIndexBelow: () => getIndexBelow,
  getIndexBetween: () => getIndexBetween,
  getIndices: () => getIndices,
  getIndicesAbove: () => getIndicesAbove,
  getIndicesBelow: () => getIndicesBelow,
  getIndicesBetween: () => getIndicesBetween,
  sortByIndex: () => sortByIndex,
  sortByMaybeIndex: () => sortByMaybeIndex,
  validateIndexKey: () => validateIndexKey
});
module.exports = __toCommonJS(reordering_exports);
var import_jittered_fractional_indexing = require("jittered-fractional-indexing");
const generateNKeysBetweenWithNoJitter = (a, b, n) => {
  return (0, import_jittered_fractional_indexing.generateNKeysBetween)(a, b, n, { jitterBits: 0 });
};
const generateKeysFn = process.env.NODE_ENV === "test" ? generateNKeysBetweenWithNoJitter : import_jittered_fractional_indexing.generateNKeysBetween;
const ZERO_INDEX_KEY = "a0";
function validateIndexKey(index) {
  try {
    (0, import_jittered_fractional_indexing.generateKeyBetween)(index, null);
  } catch {
    throw new Error("invalid index: " + index);
  }
}
function getIndicesBetween(below, above, n) {
  return generateKeysFn(below ?? null, above ?? null, n);
}
function getIndicesAbove(below, n) {
  return generateKeysFn(below ?? null, null, n);
}
function getIndicesBelow(above, n) {
  return generateKeysFn(null, above ?? null, n);
}
function getIndexBetween(below, above) {
  return generateKeysFn(below ?? null, above ?? null, 1)[0];
}
function getIndexAbove(below = null) {
  return generateKeysFn(below, null, 1)[0];
}
function getIndexBelow(above = null) {
  return generateKeysFn(null, above, 1)[0];
}
function getIndices(n, start = "a1") {
  return [start, ...generateKeysFn(start, null, n)];
}
function sortByIndex(a, b) {
  if (a.index < b.index) {
    return -1;
  } else if (a.index > b.index) {
    return 1;
  }
  return 0;
}
function sortByMaybeIndex(a, b) {
  if (a.index && b.index) {
    return a.index < b.index ? -1 : 1;
  }
  if (a.index && b.index == null) {
    return -1;
  }
  if (a.index == null && b.index == null) {
    return 0;
  }
  return 1;
}
//# sourceMappingURL=reordering.js.map
