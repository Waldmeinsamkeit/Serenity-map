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
var control_exports = {};
__export(control_exports, {
  Result: () => Result,
  assert: () => assert,
  assertExists: () => assertExists,
  exhaustiveSwitchError: () => exhaustiveSwitchError,
  promiseWithResolve: () => promiseWithResolve,
  sleep: () => sleep
});
module.exports = __toCommonJS(control_exports);
var import_function = require("./function");
const Result = {
  /**
   * Create a successful result containing a value.
   *
   * @param value - The success value to wrap
   * @returns An OkResult containing the value
   */
  ok(value) {
    return { ok: true, value };
  },
  /**
   * Create a failed result containing an error.
   *
   * @param error - The error value to wrap
   * @returns An ErrorResult containing the error
   */
  err(error) {
    return { ok: false, error };
  },
  /**
   * Create a successful result containing an array of values.
   *
   * If any of the results are errors, the returned result will be an error containing the first error.
   *
   * @param results - The array of results to wrap
   * @returns An OkResult containing the array of values
   */
  all(results) {
    return results.every((result) => result.ok) ? Result.ok(results.map((result) => result.value)) : Result.err(results.find((result) => !result.ok)?.error);
  }
};
function exhaustiveSwitchError(value, property) {
  const debugValue = property && value && typeof value === "object" && property in value ? value[property] : value;
  throw new Error(`Unknown switch case ${debugValue}`);
}
const assert = (0, import_function.omitFromStackTrace)(
  (value, message) => {
    if (!value) {
      throw new Error(message || "Assertion Error");
    }
  }
);
const assertExists = (0, import_function.omitFromStackTrace)((value, message) => {
  if (value == null) {
    throw new Error(message ?? "value must be defined");
  }
  return value;
});
function promiseWithResolve() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return Object.assign(promise, {
    resolve,
    reject
  });
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=control.js.map
