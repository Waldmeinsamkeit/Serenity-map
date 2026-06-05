import { generateKeyBetween as generateKeyBetween$1, generateNKeysBetween as generateNKeysBetween$1 } from "fractional-indexing";
const DEFAULT_JITTER_BITS = 30;
const DEFAULT_GET_RANDOM_BIT = () => Math.random() < 0.5;
function assertIsNonnegativeInteger(paramName, n) {
  if (!Number.isInteger(n)) {
    throw new Error(`"${paramName}" must be an integer, got '${n}'`);
  }
  if (n < 0) {
    throw new Error(
      `"${paramName}" must be greater than or equal to 0, got '${n}'`
    );
  }
}
function generateKeyBetween(a, b, opts) {
  const {
    digits,
    jitterBits = DEFAULT_JITTER_BITS,
    getRandomBit = DEFAULT_GET_RANDOM_BIT
  } = opts ?? {};
  assertIsNonnegativeInteger("jitterBits", jitterBits);
  let remainingJitterBits = jitterBits;
  let low = a;
  let high = b;
  let midpoint = generateKeyBetween$1(a, b, digits);
  while (remainingJitterBits > 0) {
    const randomBit = getRandomBit() ? 1 : 0;
    if (randomBit === 1) {
      low = midpoint;
    } else {
      high = midpoint;
    }
    midpoint = generateKeyBetween$1(low, high, digits);
    remainingJitterBits--;
  }
  return midpoint;
}
function generateNKeysBetween(a, b, n, opts) {
  const { digits, jitterBits } = opts ?? {};
  assertIsNonnegativeInteger("n", n);
  if (n === 0) {
    return [];
  }
  if (jitterBits === 0) {
    return generateNKeysBetween$1(a, b, n, digits);
  }
  const keys = generateNKeysBetween$1(a, b, n + 1, digits);
  const jitteredKeys = [];
  for (let i = 0; i < n; i++) {
    const currentKey = keys[i];
    const nextKey = keys[i + 1];
    jitteredKeys.push(generateKeyBetween(currentKey, nextKey, opts));
  }
  return jitteredKeys;
}
export {
  generateKeyBetween,
  generateNKeysBetween
};
