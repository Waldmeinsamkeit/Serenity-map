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
var IncrementalSetConstructor_exports = {};
__export(IncrementalSetConstructor_exports, {
  IncrementalSetConstructor: () => IncrementalSetConstructor
});
module.exports = __toCommonJS(IncrementalSetConstructor_exports);
class IncrementalSetConstructor {
  constructor(previousValue) {
    this.previousValue = previousValue;
  }
  /**
   * The next value of the set.
   *
   * @internal
   */
  nextValue;
  /**
   * The diff of the set.
   *
   * @internal
   */
  diff;
  /**
   * Gets the result of the incremental set construction if any changes were made.
   * Returns undefined if no additions or removals occurred.
   *
   * @returns An object containing the final set value and the diff of changes,
   * or undefined if no changes were made
   *
   * @example
   * ```ts
   * const constructor = new IncrementalSetConstructor(new Set(['a', 'b']))
   * constructor.add('c')
   *
   * const result = constructor.get()
   * // result = {
   * //   value: Set(['a', 'b', 'c']),
   * //   diff: { added: Set(['c']) }
   * // }
   * ```
   *
   * @public
   */
  get() {
    const numRemoved = this.diff?.removed?.size ?? 0;
    const numAdded = this.diff?.added?.size ?? 0;
    if (numRemoved === 0 && numAdded === 0) {
      return void 0;
    }
    return { value: this.nextValue, diff: this.diff };
  }
  /**
   * Add an item to the set.
   *
   * @param item - The item to add.
   * @param wasAlreadyPresent - Whether the item was already present in the set.
   * @internal
   */
  _add(item, wasAlreadyPresent) {
    this.nextValue ??= new Set(this.previousValue);
    this.nextValue.add(item);
    this.diff ??= {};
    if (wasAlreadyPresent) {
      this.diff.removed?.delete(item);
    } else {
      this.diff.added ??= /* @__PURE__ */ new Set();
      this.diff.added.add(item);
    }
  }
  /**
   * Adds an item to the set. If the item was already present in the original set
   * and was previously removed during this construction, it will be restored.
   * If the item is already present and wasn't removed, this is a no-op.
   *
   * @param item - The item to add to the set
   *
   * @example
   * ```ts
   * const constructor = new IncrementalSetConstructor(new Set(['a', 'b']))
   * constructor.add('c') // Adds new item
   * constructor.add('a') // No-op, already present
   * constructor.remove('b')
   * constructor.add('b') // Restores previously removed item
   * ```
   *
   * @public
   */
  add(item) {
    const wasAlreadyPresent = this.previousValue.has(item);
    if (wasAlreadyPresent) {
      const wasRemoved = this.diff?.removed?.has(item);
      if (!wasRemoved) return;
      return this._add(item, wasAlreadyPresent);
    }
    const isCurrentlyPresent = this.nextValue?.has(item);
    if (isCurrentlyPresent) return;
    this._add(item, wasAlreadyPresent);
  }
  /**
   * Remove an item from the set.
   *
   * @param item - The item to remove.
   * @param wasAlreadyPresent - Whether the item was already present in the set.
   * @internal
   */
  _remove(item, wasAlreadyPresent) {
    this.nextValue ??= new Set(this.previousValue);
    this.nextValue.delete(item);
    this.diff ??= {};
    if (wasAlreadyPresent) {
      this.diff.removed ??= /* @__PURE__ */ new Set();
      this.diff.removed.add(item);
    } else {
      this.diff.added?.delete(item);
    }
  }
  /**
   * Removes an item from the set. If the item wasn't present in the original set
   * and was added during this construction, it will be removed from the added diff.
   * If the item is not present at all, this is a no-op.
   *
   * @param item - The item to remove from the set
   *
   * @example
   * ```ts
   * const constructor = new IncrementalSetConstructor(new Set(['a', 'b']))
   * constructor.remove('a') // Removes existing item
   * constructor.remove('c') // No-op, not present
   * constructor.add('d')
   * constructor.remove('d') // Removes recently added item
   * ```
   *
   * @public
   */
  remove(item) {
    const wasAlreadyPresent = this.previousValue.has(item);
    if (!wasAlreadyPresent) {
      const wasAdded = this.diff?.added?.has(item);
      if (!wasAdded) return;
      return this._remove(item, wasAlreadyPresent);
    }
    const hasAlreadyBeenRemoved = this.diff?.removed?.has(item);
    if (hasAlreadyBeenRemoved) return;
    this._remove(item, wasAlreadyPresent);
  }
}
//# sourceMappingURL=IncrementalSetConstructor.js.map
