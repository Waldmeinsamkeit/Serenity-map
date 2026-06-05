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
var throttle_exports = {};
__export(throttle_exports, {
  FpsScheduler: () => FpsScheduler,
  fpsThrottle: () => fpsThrottle,
  throttleToNextFrame: () => throttleToNextFrame
});
module.exports = __toCommonJS(throttle_exports);
const isTest = () => typeof process !== "undefined" && process.env.NODE_ENV === "test" && // @ts-expect-error
!globalThis.__FORCE_RAF_IN_TESTS__;
const timingVarianceFactor = 0.9;
const getTargetTimePerFrame = (targetFps) => Math.floor(1e3 / targetFps) * timingVarianceFactor;
class FpsScheduler {
  targetFps;
  targetTimePerFrame;
  fpsQueue = [];
  frameRaf;
  flushRaf;
  lastFlushTime;
  constructor(targetFps = 120) {
    this.targetFps = targetFps;
    this.targetTimePerFrame = getTargetTimePerFrame(targetFps);
    this.lastFlushTime = -this.targetTimePerFrame;
  }
  updateTargetFps(targetFps) {
    if (targetFps === this.targetFps) return;
    this.targetFps = targetFps;
    this.targetTimePerFrame = getTargetTimePerFrame(targetFps);
    this.lastFlushTime = -this.targetTimePerFrame;
  }
  flush() {
    const queue = this.fpsQueue.splice(0, this.fpsQueue.length);
    for (const fn of queue) {
      fn();
    }
  }
  tick(isOnNextFrame = false) {
    if (this.frameRaf) return;
    const now = Date.now();
    const elapsed = now - this.lastFlushTime;
    if (elapsed < this.targetTimePerFrame) {
      this.frameRaf = requestAnimationFrame(() => {
        this.frameRaf = void 0;
        this.tick(true);
      });
      return;
    }
    if (isOnNextFrame) {
      if (this.flushRaf) return;
      this.lastFlushTime = now;
      this.flush();
    } else {
      if (this.flushRaf) return;
      this.flushRaf = requestAnimationFrame(() => {
        this.flushRaf = void 0;
        this.lastFlushTime = Date.now();
        this.flush();
      });
    }
  }
  /**
   * Creates a throttled version of a function that executes at most once per frame.
   * The default target frame rate is set by the FpsScheduler instance.
   * Subsequent calls within the same frame are ignored, ensuring smooth performance
   * for high-frequency events like mouse movements or scroll events.
   *
   * @param fn - The function to throttle, optionally with a cancel method
   * @returns A throttled function with an optional cancel method to remove pending calls
   *
   * @public
   */
  fpsThrottle(fn) {
    if (isTest()) {
      fn.cancel = () => {
        if (this.frameRaf) {
          cancelAnimationFrame(this.frameRaf);
          this.frameRaf = void 0;
        }
        if (this.flushRaf) {
          cancelAnimationFrame(this.flushRaf);
          this.flushRaf = void 0;
        }
      };
      return fn;
    }
    const throttledFn = () => {
      if (this.fpsQueue.includes(fn)) {
        return;
      }
      this.fpsQueue.push(fn);
      this.tick();
    };
    throttledFn.cancel = () => {
      const index = this.fpsQueue.indexOf(fn);
      if (index > -1) {
        this.fpsQueue.splice(index, 1);
      }
    };
    return throttledFn;
  }
  /**
   * Schedules a function to execute on the next animation frame.
   * If the same function is passed multiple times before the frame executes,
   * it will only be called once, effectively batching multiple calls.
   *
   * @param fn - The function to execute on the next frame
   * @returns A cancel function that can prevent execution if called before the next frame
   *
   * @public
   */
  throttleToNextFrame(fn) {
    if (isTest()) {
      fn();
      return () => void 0;
    }
    if (!this.fpsQueue.includes(fn)) {
      this.fpsQueue.push(fn);
      this.tick();
    }
    return () => {
      const index = this.fpsQueue.indexOf(fn);
      if (index > -1) {
        this.fpsQueue.splice(index, 1);
      }
    };
  }
}
const defaultScheduler = new FpsScheduler(120);
function fpsThrottle(fn) {
  return defaultScheduler.fpsThrottle(fn);
}
function throttleToNextFrame(fn) {
  return defaultScheduler.throttleToNextFrame(fn);
}
//# sourceMappingURL=throttle.js.map
