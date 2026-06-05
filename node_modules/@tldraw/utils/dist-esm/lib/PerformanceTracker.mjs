import { PERFORMANCE_COLORS, PERFORMANCE_PREFIX_COLOR } from "./perf.mjs";
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
    const background = fps > 55 ? PERFORMANCE_COLORS.Good : fps > 30 ? PERFORMANCE_COLORS.Mid : PERFORMANCE_COLORS.Poor;
    const color = background === PERFORMANCE_COLORS.Mid ? "black" : "white";
    const capitalized = this.name[0].toUpperCase() + this.name.slice(1);
    console.debug(
      `%cPerf%c ${capitalized} %c${fps}%c fps`,
      `color: white; background: ${PERFORMANCE_PREFIX_COLOR};padding: 2px;border-radius: 3px;`,
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
export {
  PerformanceTracker
};
//# sourceMappingURL=PerformanceTracker.mjs.map
