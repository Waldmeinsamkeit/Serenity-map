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
var AtomSet_exports = {};
__export(AtomSet_exports, {
  AtomSet: () => AtomSet
});
module.exports = __toCommonJS(AtomSet_exports);
var import_AtomMap = require("./AtomMap");
class AtomSet {
  constructor(name, keys) {
    this.name = name;
    const entries = keys ? Array.from(keys, (k) => [k, k]) : void 0;
    this.map = new import_AtomMap.AtomMap(name, entries);
  }
  map;
  add(value) {
    this.map.set(value, value);
    return this;
  }
  clear() {
    this.map.clear();
  }
  delete(value) {
    return this.map.delete(value);
  }
  forEach(callbackfn, thisArg) {
    for (const value of this) {
      callbackfn.call(thisArg, value, value, this);
    }
  }
  has(value) {
    return this.map.has(value);
  }
  // eslint-disable-next-line no-restricted-syntax
  get size() {
    return this.map.size;
  }
  entries() {
    return this.map.entries();
  }
  keys() {
    return this.map.keys();
  }
  values() {
    return this.map.keys();
  }
  [Symbol.iterator]() {
    return this.map.keys();
  }
  [Symbol.toStringTag] = "AtomSet";
}
//# sourceMappingURL=AtomSet.js.map
