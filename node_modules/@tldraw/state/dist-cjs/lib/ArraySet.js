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
var ArraySet_exports = {};
__export(ArraySet_exports, {
  ARRAY_SIZE_THRESHOLD: () => ARRAY_SIZE_THRESHOLD,
  ArraySet: () => ArraySet
});
module.exports = __toCommonJS(ArraySet_exports);
const ARRAY_SIZE_THRESHOLD = 8;
class ArraySet {
  arraySize = 0;
  array = Array(ARRAY_SIZE_THRESHOLD);
  set = null;
  /**
   * Get whether this ArraySet has any elements.
   *
   * @returns True if this ArraySet has any elements, false otherwise.
   */
  // eslint-disable-next-line no-restricted-syntax
  get isEmpty() {
    if (this.array) {
      return this.arraySize === 0;
    }
    if (this.set) {
      return this.set.size === 0;
    }
    throw new Error("no set or array");
  }
  /**
   * Add an element to the ArraySet if it is not already present.
   *
   * @param elem - The element to add to the set
   * @returns `true` if the element was added, `false` if it was already present
   * @example
   * ```ts
   * const arraySet = new ArraySet<string>()
   *
   * console.log(arraySet.add('hello')) // true
   * console.log(arraySet.add('hello')) // false (already exists)
   * ```
   */
  add(elem) {
    if (this.array) {
      const idx = this.array.indexOf(elem);
      if (idx !== -1) {
        return false;
      }
      if (this.arraySize < ARRAY_SIZE_THRESHOLD) {
        this.array[this.arraySize] = elem;
        this.arraySize++;
        return true;
      } else {
        this.set = new Set(this.array);
        this.array = null;
        this.set.add(elem);
        return true;
      }
    }
    if (this.set) {
      if (this.set.has(elem)) {
        return false;
      }
      this.set.add(elem);
      return true;
    }
    throw new Error("no set or array");
  }
  /**
   * Remove an element from the ArraySet if it is present.
   *
   * @param elem - The element to remove from the set
   * @returns `true` if the element was removed, `false` if it was not present
   * @example
   * ```ts
   * const arraySet = new ArraySet<string>()
   * arraySet.add('hello')
   *
   * console.log(arraySet.remove('hello')) // true
   * console.log(arraySet.remove('hello')) // false (not present)
   * ```
   */
  remove(elem) {
    if (this.array) {
      const idx = this.array.indexOf(elem);
      if (idx === -1) {
        return false;
      }
      this.array[idx] = void 0;
      this.arraySize--;
      if (idx !== this.arraySize) {
        this.array[idx] = this.array[this.arraySize];
        this.array[this.arraySize] = void 0;
      }
      return true;
    }
    if (this.set) {
      if (!this.set.has(elem)) {
        return false;
      }
      this.set.delete(elem);
      return true;
    }
    throw new Error("no set or array");
  }
  /**
   * Execute a callback function for each element in the ArraySet.
   *
   * @param visitor - A function to call for each element in the set
   * @example
   * ```ts
   * const arraySet = new ArraySet<string>()
   * arraySet.add('hello')
   * arraySet.add('world')
   *
   * arraySet.visit((item) => {
   *   console.log(item) // 'hello', 'world'
   * })
   * ```
   */
  visit(visitor) {
    if (this.array) {
      for (let i = 0; i < this.arraySize; i++) {
        const elem = this.array[i];
        if (typeof elem !== "undefined") {
          visitor(elem);
        }
      }
      return;
    }
    if (this.set) {
      this.set.forEach(visitor);
      return;
    }
    throw new Error("no set or array");
  }
  /**
   * Make the ArraySet iterable, allowing it to be used in for...of loops and with spread syntax.
   *
   * @returns An iterator that yields each element in the set
   * @example
   * ```ts
   * const arraySet = new ArraySet<number>()
   * arraySet.add(1)
   * arraySet.add(2)
   *
   * for (const item of arraySet) {
   *   console.log(item) // 1, 2
   * }
   *
   * const items = [...arraySet] // [1, 2]
   * ```
   */
  *[Symbol.iterator]() {
    if (this.array) {
      for (let i = 0; i < this.arraySize; i++) {
        const elem = this.array[i];
        if (typeof elem !== "undefined") {
          yield elem;
        }
      }
    } else if (this.set) {
      yield* this.set;
    } else {
      throw new Error("no set or array");
    }
  }
  /**
   * Check whether an element is present in the ArraySet.
   *
   * @param elem - The element to check for
   * @returns `true` if the element is present, `false` otherwise
   * @example
   * ```ts
   * const arraySet = new ArraySet<string>()
   * arraySet.add('hello')
   *
   * console.log(arraySet.has('hello')) // true
   * console.log(arraySet.has('world')) // false
   * ```
   */
  has(elem) {
    if (this.array) {
      return this.array.indexOf(elem) !== -1;
    } else {
      return this.set.has(elem);
    }
  }
  /**
   * Remove all elements from the ArraySet.
   *
   * @example
   * ```ts
   * const arraySet = new ArraySet<string>()
   * arraySet.add('hello')
   * arraySet.add('world')
   *
   * arraySet.clear()
   * console.log(arraySet.size()) // 0
   * ```
   */
  clear() {
    if (this.set) {
      this.set.clear();
    } else {
      this.arraySize = 0;
      this.array = [];
    }
  }
  /**
   * Get the number of elements in the ArraySet.
   *
   * @returns The number of elements in the set
   * @example
   * ```ts
   * const arraySet = new ArraySet<string>()
   * console.log(arraySet.size()) // 0
   *
   * arraySet.add('hello')
   * console.log(arraySet.size()) // 1
   * ```
   */
  size() {
    if (this.set) {
      return this.set.size;
    } else {
      return this.arraySize;
    }
  }
}
//# sourceMappingURL=ArraySet.js.map
