function rotateArray(arr, offset) {
  if (arr.length === 0) return [];
  const normalizedOffset = (Math.abs(offset) % arr.length + arr.length) % arr.length;
  return [...arr.slice(normalizedOffset), ...arr.slice(0, normalizedOffset)];
}
function dedupe(input, equals) {
  const result = [];
  mainLoop: for (const item of input) {
    for (const existing of result) {
      if (equals ? equals(item, existing) : item === existing) {
        continue mainLoop;
      }
    }
    result.push(item);
  }
  return result;
}
function compact(arr) {
  return arr.filter((i) => i !== void 0 && i !== null);
}
function last(arr) {
  return arr[arr.length - 1];
}
function minBy(arr, fn) {
  let min;
  let minVal = Infinity;
  for (const item of arr) {
    const val = fn(item);
    if (val < minVal) {
      min = item;
      minVal = val;
    }
  }
  return min;
}
function maxBy(arr, fn) {
  let max;
  let maxVal = -Infinity;
  for (const item of arr) {
    const val = fn(item);
    if (val > maxVal) {
      max = item;
      maxVal = val;
    }
  }
  return max;
}
function partition(arr, predicate) {
  const satisfies = [];
  const doesNotSatisfy = [];
  for (const item of arr) {
    if (predicate(item)) {
      satisfies.push(item);
    } else {
      doesNotSatisfy.push(item);
    }
  }
  return [satisfies, doesNotSatisfy];
}
function areArraysShallowEqual(arr1, arr2) {
  if (arr1 === arr2) return true;
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (!Object.is(arr1[i], arr2[i])) {
      return false;
    }
  }
  return true;
}
function mergeArraysAndReplaceDefaults(key, customEntries, defaults) {
  const overrideTypes = new Set(customEntries.map((entry) => entry[key]));
  const result = [];
  for (const defaultEntry of defaults) {
    if (overrideTypes.has(defaultEntry[key])) continue;
    result.push(defaultEntry);
  }
  for (const customEntry of customEntries) {
    result.push(customEntry);
  }
  return result;
}
export {
  areArraysShallowEqual,
  compact,
  dedupe,
  last,
  maxBy,
  mergeArraysAndReplaceDefaults,
  minBy,
  partition,
  rotateArray
};
//# sourceMappingURL=array.mjs.map
