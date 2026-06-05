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
var cache_exports = {};
__export(cache_exports, {
  WeakCache: () => WeakCache
});
module.exports = __toCommonJS(cache_exports);
class WeakCache {
  /**
   * The internal WeakMap storage for cached key-value pairs.
   *
   * @public
   */
  items = /* @__PURE__ */ new WeakMap();
  /**
   * Get the cached value for a given key, computing it if not already cached.
   *
   * Retrieves the cached value associated with the given key. If no cached
   * value exists, calls the provided callback function to compute the value, stores it
   * in the cache, and returns it. Subsequent calls with the same key will return the
   * cached value without recomputation.
   *
   * @param item - The object key to retrieve the cached value for
   * @param cb - Callback function that computes the value when not already cached
   * @returns The cached value if it exists, otherwise the newly computed value from the callback
   *
   * @example
   * ```ts
   * const cache = new WeakCache<HTMLElement, DOMRect>()
   * const element = document.getElementById('my-element')!
   *
   * // First call computes and caches the bounding rect
   * const rect1 = cache.get(element, (el) => el.getBoundingClientRect())
   *
   * // Second call returns cached value
   * const rect2 = cache.get(element, (el) => el.getBoundingClientRect())
   * // rect1 and rect2 are the same object
   * ```
   */
  get(item, cb) {
    if (!this.items.has(item)) {
      this.items.set(item, cb(item));
    }
    return this.items.get(item);
  }
}
//# sourceMappingURL=cache.js.map
