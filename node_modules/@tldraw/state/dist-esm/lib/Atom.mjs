import { ArraySet } from "./ArraySet.mjs";
import { HistoryBuffer } from "./HistoryBuffer.mjs";
import { maybeCaptureParent } from "./capture.mjs";
import { EMPTY_ARRAY, equals, singleton } from "./helpers.mjs";
import { advanceGlobalEpoch, atomDidChange, getGlobalEpoch } from "./transactions.mjs";
import { RESET_VALUE } from "./types.mjs";
class __Atom__ {
  constructor(name, current, options) {
    this.name = name;
    this.current = current;
    this.isEqual = options?.isEqual ?? null;
    if (!options) return;
    if (options.historyLength) {
      this.historyBuffer = new HistoryBuffer(options.historyLength);
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
  lastChangedEpoch = getGlobalEpoch();
  /**
   * Set of child signals that depend on this atom.
   * @internal
   */
  children = new ArraySet();
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
    maybeCaptureParent(this);
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
    if (this.isEqual?.(this.current, value) ?? equals(this.current, value)) {
      return this.current;
    }
    advanceGlobalEpoch();
    if (this.historyBuffer) {
      this.historyBuffer.pushEntry(
        this.lastChangedEpoch,
        getGlobalEpoch(),
        diff ?? this.computeDiff?.(this.current, value, this.lastChangedEpoch, getGlobalEpoch()) ?? RESET_VALUE
      );
    }
    this.lastChangedEpoch = getGlobalEpoch();
    const oldValue = this.current;
    this.current = value;
    atomDidChange(this, oldValue);
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
    maybeCaptureParent(this);
    if (epoch >= this.lastChangedEpoch) {
      return EMPTY_ARRAY;
    }
    return this.historyBuffer?.getChangesSince(epoch) ?? RESET_VALUE;
  }
}
const _Atom = singleton("Atom", () => __Atom__);
function atom(name, initialValue, options) {
  return new _Atom(name, initialValue, options);
}
function isAtom(value) {
  return value instanceof _Atom;
}
export {
  _Atom,
  atom,
  isAtom
};
//# sourceMappingURL=Atom.mjs.map
