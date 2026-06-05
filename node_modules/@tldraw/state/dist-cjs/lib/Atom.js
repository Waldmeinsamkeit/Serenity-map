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
var Atom_exports = {};
__export(Atom_exports, {
  _Atom: () => _Atom,
  atom: () => atom,
  isAtom: () => isAtom
});
module.exports = __toCommonJS(Atom_exports);
var import_ArraySet = require("./ArraySet");
var import_HistoryBuffer = require("./HistoryBuffer");
var import_capture = require("./capture");
var import_helpers = require("./helpers");
var import_transactions = require("./transactions");
var import_types = require("./types");
class __Atom__ {
  constructor(name, current, options) {
    this.name = name;
    this.current = current;
    this.isEqual = options?.isEqual ?? null;
    if (!options) return;
    if (options.historyLength) {
      this.historyBuffer = new import_HistoryBuffer.HistoryBuffer(options.historyLength);
    }
    this.computeDiff = options.computeDiff;
  }
  /**
   * Custom equality function for comparing values, or null to use default equality.
   * @internal
   */
  isEqual;
  /**
   * Optional function to compute diffs between old and new values.
   * @internal
   */
  computeDiff;
  /**
   * The global epoch when this atom was last changed.
   * @internal
   */
  lastChangedEpoch = (0, import_transactions.getGlobalEpoch)();
  /**
   * Set of child signals that depend on this atom.
   * @internal
   */
  children = new import_ArraySet.ArraySet();
  /**
   * Optional history buffer for tracking changes over time.
   * @internal
   */
  historyBuffer;
  /**
   * Gets the current value without capturing it as a dependency in the current reactive context.
   * This is unsafe because it breaks the reactivity chain - use with caution.
   *
   * @param _ignoreErrors - Unused parameter for API compatibility
   * @returns The current value
   * @internal
   */
  __unsafe__getWithoutCapture(_ignoreErrors) {
    return this.current;
  }
  /**
   * Gets the current value of this atom. When called within a computed signal or reaction,
   * this atom will be automatically captured as a dependency.
   *
   * @returns The current value
   * @example
   * ```ts
   * const count = atom('count', 5)
   * console.log(count.get()) // 5
   * ```
   */
  get() {
    (0, import_capture.maybeCaptureParent)(this);
    return this.current;
  }
  /**
   * Sets the value of this atom to the given value. If the value is the same as the current value, this is a no-op.
   *
   * @param value - The new value to set
   * @param diff - The diff to use for the update. If not provided, the diff will be computed using {@link AtomOptions.computeDiff}
   * @returns The new value
   * @example
   * ```ts
   * const count = atom('count', 0)
   * count.set(5) // count.get() is now 5
   * ```
   */
  set(value, diff) {
    if (this.isEqual?.(this.current, value) ?? (0, import_helpers.equals)(this.current, value)) {
      return this.current;
    }
    (0, import_transactions.advanceGlobalEpoch)();
    if (this.historyBuffer) {
      this.historyBuffer.pushEntry(
        this.lastChangedEpoch,
        (0, import_transactions.getGlobalEpoch)(),
        diff ?? this.computeDiff?.(this.current, value, this.lastChangedEpoch, (0, import_transactions.getGlobalEpoch)()) ?? import_types.RESET_VALUE
      );
    }
    this.lastChangedEpoch = (0, import_transactions.getGlobalEpoch)();
    const oldValue = this.current;
    this.current = value;
    (0, import_transactions.atomDidChange)(this, oldValue);
    return value;
  }
  /**
   * Updates the value of this atom using the given updater function. If the returned value is the same as the current value, this is a no-op.
   *
   * @param updater - A function that takes the current value and returns the new value
   * @returns The new value
   * @example
   * ```ts
   * const count = atom('count', 5)
   * count.update(n => n + 1) // count.get() is now 6
   * ```
   */
  update(updater) {
    return this.set(updater(this.current));
  }
  /**
   * Gets all the diffs that have occurred since the given epoch. When called within a computed
   * signal or reaction, this atom will be automatically captured as a dependency.
   *
   * @param epoch - The epoch to get changes since
   * @returns An array of diffs, or RESET_VALUE if history is insufficient
   * @internal
   */
  getDiffSince(epoch) {
    (0, import_capture.maybeCaptureParent)(this);
    if (epoch >= this.lastChangedEpoch) {
      return import_helpers.EMPTY_ARRAY;
    }
    return this.historyBuffer?.getChangesSince(epoch) ?? import_types.RESET_VALUE;
  }
}
const _Atom = (0, import_helpers.singleton)("Atom", () => __Atom__);
function atom(name, initialValue, options) {
  return new _Atom(name, initialValue, options);
}
function isAtom(value) {
  return value instanceof _Atom;
}
//# sourceMappingURL=Atom.js.map
