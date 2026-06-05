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
var PerformanceTracker_exports = {};
__export(PerformanceTracker_exports, {
  PerformanceTracker: () => PerformanceTracker
});
module.exports = __toCommonJS(PerformanceTracker_exports);
var import_perf = require("./perf");
class PerformanceTracker {
  startTime = 0;
  name = "";
  frames = 0;
  started = false;
  frame = null;
  /**
   * Records animation frames to calculate frame rate.
   * Called automatically during performance tracking.
   */
  // eslint-disable-next-line local/prefer-class-methods
  recordFrame = () => {
    this.frames++;
    if (!this.started) return;
    this.frame = requestAnimationFrame(this.recordFrame);
  };
  /**
   * Starts performance tracking for a named operation.
   *
   * @param name - A descriptive name for the operation being tracked
   *
   * @example
   * ```ts
   * tracker.start('canvas-render')
   * // ... perform rendering operations
   * tracker.stop()
   * ```
   */
  start(name) {
    this.name = name;
    this.frames = 0;
    this.started = true;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(this.recordFrame);
    this.startTime = performance.now();
  }
  /**
   * Stops performance tracking and logs results to the console.
   *
   * Displays the operation name, frame rate, and uses color coding:
   * - Green background: \> 55 FPS (good performance)
   * - Yellow background: 30-55 FPS (moderate performance)
   * - Red background: \< 30 FPS (poor performance)
   *
   * @example
   * ```ts
   * tracker.start('interaction')
   * handleUserInteraction()
   * tracker.stop() // Logs: "Perf Interaction 60 fps"
   * ```
   */
  stop() {
    this.started = false;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    const duration = (performance.now() - this.startTime) / 1e3;
    const fps = duration === 0 ? 0 : Math.floor(this.frames / duration);
    const background = fps > 55 ? import_perf.PERFORMANCE_COLORS.Good : fps > 30 ? import_perf.PERFORMANCE_COLORS.Mid : import_perf.PERFORMANCE_COLORS.Poor;
    const color = background === import_perf.PERFORMANCE_COLORS.Mid ? "black" : "white";
    const capitalized = this.name[0].toUpperCase() + this.name.slice(1);
    console.debug(
      `%cPerf%c ${capitalized} %c${fps}%c fps`,
      `color: white; background: ${import_perf.PERFORMANCE_PREFIX_COLOR};padding: 2px;border-radius: 3px;`,
      "font-weight: normal",
      `font-weight: bold; padding: 2px; background: ${background};color: ${color};`,
      "font-weight: normal"
    );
  }
  /**
   * Checks whether performance tracking is currently active.
   *
   * @returns True if tracking is in progress, false otherwise
   *
   * @example
   * ```ts
   * if (!tracker.isStarted()) {
   *   tracker.start('new-operation')
   * }
   * ```
   */
  isStarted() {
    return this.started;
  }
}
//# sourceMappingURL=PerformanceTracker.js.map
