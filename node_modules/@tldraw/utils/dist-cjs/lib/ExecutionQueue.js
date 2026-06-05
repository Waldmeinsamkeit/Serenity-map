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
var ExecutionQueue_exports = {};
__export(ExecutionQueue_exports, {
  ExecutionQueue: () => ExecutionQueue
});
module.exports = __toCommonJS(ExecutionQueue_exports);
var import_control = require("./control");
class ExecutionQueue {
  /**
   * Creates a new ExecutionQueue.
   *
   * Creates a new execution queue that will process tasks sequentially.
   * If a timeout is provided, there will be a delay between each task execution,
   * which is useful for rate limiting or controlling execution flow.
   *
   * timeout - Optional delay in milliseconds between task executions
   * @example
   * ```ts
   * // Create queue without delay
   * const fastQueue = new ExecutionQueue()
   *
   * // Create queue with 500ms delay between tasks
   * const slowQueue = new ExecutionQueue(500)
   * ```
   */
  constructor(timeout) {
    this.timeout = timeout;
  }
  queue = [];
  running = false;
  /**
   * Checks if the queue is empty and not currently running a task.
   *
   * Determines whether the execution queue has completed all tasks and is idle.
   * Returns true only when there are no pending tasks in the queue AND no task is currently being executed.
   *
   * @returns True if the queue has no pending tasks and is not currently executing
   * @example
   * ```ts
   * const queue = new ExecutionQueue()
   *
   * console.log(queue.isEmpty()) // true - queue is empty
   *
   * queue.push(() => console.log('task'))
   * console.log(queue.isEmpty()) // false - task is running/pending
   * ```
   */
  isEmpty() {
    return this.queue.length === 0 && !this.running;
  }
  async run() {
    if (this.running) return;
    try {
      this.running = true;
      while (this.queue.length) {
        const task = this.queue.shift();
        await task();
        if (this.timeout) {
          await (0, import_control.sleep)(this.timeout);
        }
      }
    } finally {
      this.running = false;
    }
  }
  /**
   * Adds a task to the queue and returns a promise that resolves with the task's result.
   *
   * Enqueues a task for sequential execution. The task will be executed after all
   * previously queued tasks have completed. If a timeout was specified in the constructor,
   * there will be a delay between this task and the next one.
   *
   * @param task - The function to execute (can be sync or async)
   * @returns Promise that resolves with the task's return value
   * @example
   * ```ts
   * const queue = new ExecutionQueue(100)
   *
   * // Add async task
   * const result = await queue.push(async () => {
   *   const response = await fetch('/api/data')
   *   return response.json()
   * })
   *
   * // Add sync task
   * const number = await queue.push(() => 42)
   * ```
   */
  async push(task) {
    return new Promise((resolve, reject) => {
      this.queue.push(() => Promise.resolve(task()).then(resolve).catch(reject));
      this.run();
    });
  }
  /**
   * Clears all pending tasks from the queue.
   *
   * Immediately removes all pending tasks from the queue. Any currently
   * running task will complete normally, but no additional tasks will be executed.
   * This method does not wait for the current task to finish.
   *
   * @returns void
   * @example
   * ```ts
   * const queue = new ExecutionQueue()
   *
   * // Add several tasks
   * queue.push(() => console.log('task 1'))
   * queue.push(() => console.log('task 2'))
   * queue.push(() => console.log('task 3'))
   *
   * // Clear all pending tasks
   * queue.close()
   * // Only 'task 1' will execute if it was already running
   * ```
   */
  close() {
    this.queue = [];
  }
}
//# sourceMappingURL=ExecutionQueue.js.map
