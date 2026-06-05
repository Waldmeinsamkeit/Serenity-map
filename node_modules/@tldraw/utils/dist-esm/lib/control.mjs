import { omitFromStackTrace } from "./function.mjs";
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
const assert = omitFromStackTrace(
  (value, message) => {
    if (!value) {
      throw new Error(message || "Assertion Error");
    }
  }
);
const assertExists = omitFromStackTrace((value, message) => {
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
export {
  Result,
  assert,
  assertExists,
  exhaustiveSwitchError,
  promiseWithResolve,
  sleep
};
//# sourceMappingURL=control.mjs.map
