import { generateKeyBetween, generateNKeysBetween } from "jittered-fractional-indexing";
const generateNKeysBetweenWithNoJitter = (a, b, n) => {
  return generateNKeysBetween(a, b, n, { jitterBits: 0 });
};
const generateKeysFn = process.env.NODE_ENV === "test" ? generateNKeysBetweenWithNoJitter : generateNKeysBetween;
const ZERO_INDEX_KEY = "a0";
function validateIndexKey(index) {
  try {
    generateKeyBetween(index, null);
  } catch {
    throw new Error("invalid index: " + index);
  }
}
function getIndicesBetween(below, above, n) {
  return generateKeysFn(below ?? null, above ?? null, n);
}
function getIndicesAbove(below, n) {
  return generateKeysFn(below ?? null, null, n);
}
function getIndicesBelow(above, n) {
  return generateKeysFn(null, above ?? null, n);
}
function getIndexBetween(below, above) {
  return generateKeysFn(below ?? null, above ?? null, 1)[0];
}
function getIndexAbove(below = null) {
  return generateKeysFn(below, null, 1)[0];
}
function getIndexBelow(above = null) {
  return generateKeysFn(null, above, 1)[0];
}
function getIndices(n, start = "a1") {
  return [start, ...generateKeysFn(start, null, n)];
}
function sortByIndex(a, b) {
  if (a.index < b.index) {
    return -1;
  } else if (a.index > b.index) {
    return 1;
  }
  return 0;
}
function sortByMaybeIndex(a, b) {
  if (a.index && b.index) {
    return a.index < b.index ? -1 : 1;
  }
  if (a.index && b.index == null) {
    return -1;
  }
  if (a.index == null && b.index == null) {
    return 0;
  }
  return 1;
}
export {
  ZERO_INDEX_KEY,
  getIndexAbove,
  getIndexBelow,
  getIndexBetween,
  getIndices,
  getIndicesAbove,
  getIndicesBelow,
  getIndicesBetween,
  sortByIndex,
  sortByMaybeIndex,
  validateIndexKey
};
//# sourceMappingURL=reordering.mjs.map
