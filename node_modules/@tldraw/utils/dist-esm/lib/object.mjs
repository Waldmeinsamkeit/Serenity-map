import isEqualWith from "lodash.isequalwith";
function hasOwnProperty(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function getOwnProperty(obj, key) {
  if (!hasOwnProperty(obj, key)) {
    return void 0;
  }
  return obj[key];
}
function objectMapKeys(object) {
  return Object.keys(object);
}
function objectMapValues(object) {
  return Object.values(object);
}
function objectMapEntries(object) {
  return Object.entries(object);
}
function* objectMapEntriesIterable(object) {
  for (const key in object) {
    if (!Object.prototype.hasOwnProperty.call(object, key)) continue;
    yield [key, object[key]];
  }
}
function objectMapFromEntries(entries) {
  return Object.fromEntries(entries);
}
function filterEntries(object, predicate) {
  const result = {};
  let didChange = false;
  for (const key in object) {
    if (!Object.prototype.hasOwnProperty.call(object, key)) continue;
    const value = object[key];
    if (predicate(key, value)) {
      result[key] = value;
    } else {
      didChange = true;
    }
  }
  return didChange ? result : object;
}
function mapObjectMapValues(object, mapper) {
  const result = {};
  for (const key in object) {
    if (!Object.prototype.hasOwnProperty.call(object, key)) continue;
    result[key] = mapper(key, object[key]);
  }
  return result;
}
function areObjectsShallowEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  const keys1 = Object.keys(obj1);
  if (keys1.length !== Object.keys(obj2).length) return false;
  for (const key of keys1) {
    if (!hasOwnProperty(obj2, key)) return false;
    if (!Object.is(obj1[key], obj2[key])) return false;
  }
  return true;
}
function groupBy(array, keySelector) {
  const result = {};
  for (const value of array) {
    const key = keySelector(value);
    if (!result[key]) result[key] = [];
    result[key].push(value);
  }
  return result;
}
function omit(obj, keys) {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}
function getChangedKeys(obj1, obj2) {
  const result = [];
  for (const key in obj1) {
    if (!Object.is(obj1[key], obj2[key])) {
      result.push(key);
    }
  }
  return result;
}
function isEqualAllowingForFloatingPointErrors(obj1, obj2, threshold = 1e-6) {
  return isEqualWith(obj1, obj2, (value1, value2) => {
    if (typeof value1 === "number" && typeof value2 === "number") {
      return Math.abs(value1 - value2) < threshold;
    }
    return void 0;
  });
}
export {
  areObjectsShallowEqual,
  filterEntries,
  getChangedKeys,
  getOwnProperty,
  groupBy,
  hasOwnProperty,
  isEqualAllowingForFloatingPointErrors,
  mapObjectMapValues,
  objectMapEntries,
  objectMapEntriesIterable,
  objectMapFromEntries,
  objectMapKeys,
  objectMapValues,
  omit
};
//# sourceMappingURL=object.mjs.map
