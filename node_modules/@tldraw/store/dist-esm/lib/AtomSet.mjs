import { AtomMap } from "./AtomMap.mjs";
class AtomSet {
  constructor(name, keys) {
    this.name = name;
    const entries = keys ? Array.from(keys, (k) => [k, k]) : void 0;
    this.map = new AtomMap(name, entries);
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
export {
  AtomSet
};
//# sourceMappingURL=AtomSet.mjs.map
