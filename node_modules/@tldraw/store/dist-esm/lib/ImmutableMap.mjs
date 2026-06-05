/*!
 * This file was lovingly and delicately extracted from Immutable.js
 * MIT License: https://github.com/immutable-js/immutable-js/blob/main/LICENSE
 * Copyright (c) 2014-present, Lee Byron and other contributors.
 */
function smi(i32) {
  return i32 >>> 1 & 1073741824 | i32 & 3221225471;
}
const defaultValueOf = Object.prototype.valueOf;
function hash(o) {
  if (o == null) {
    return hashNullish(o);
  }
  if (typeof o.hashCode === "function") {
    return smi(o.hashCode(o));
  }
  const v = valueOf(o);
  if (v == null) {
    return hashNullish(v);
  }
  switch (typeof v) {
    case "boolean":
      return v ? 1108378657 : 1108378656;
    case "number":
      return hashNumber(v);
    case "string":
      return cachedHashString(v);
    case "object":
    case "function":
      return hashJSObj(v);
    case "symbol":
      return hashSymbol(v);
    default:
      if (typeof v.toString === "function") {
        return hashString(v.toString());
      }
      throw new Error("Value type " + typeof v + " cannot be hashed.");
  }
}
function hashNullish(nullish) {
  return nullish === null ? 1108378658 : (
    /* undefined */
    (1108378659)
  );
}
function hashNumber(n) {
  if (n !== n || n === Infinity) {
    return 0;
  }
  let hash2 = n | 0;
  if (hash2 !== n) {
    hash2 ^= n * 4294967295;
  }
  while (n > 4294967295) {
    n /= 4294967295;
    hash2 ^= n;
  }
  return smi(hash2);
}
function cachedHashString(string) {
  let hashed = stringHashCache[string];
  if (hashed === void 0) {
    hashed = hashString(string);
    if (stringHashCacheCount === STRING_HASH_CACHE_SIZE) {
      stringHashCacheCount = 0;
      stringHashCache = {};
    }
    stringHashCache[string] = hashed;
    stringHashCacheCount++;
  }
  return hashed;
}
function hashString(string) {
  let hashed = 0;
  for (let ii = 0; ii < string.length; ii++) {
    hashed = 31 * hashed + string.charCodeAt(ii) | 0;
  }
  return smi(hashed);
}
function hashSymbol(sym) {
  let hashed = symbolMap[sym];
  if (hashed !== void 0) {
    return hashed;
  }
  hashed = nextHash();
  symbolMap[sym] = hashed;
  return hashed;
}
function hashJSObj(obj) {
  let hashed = weakMap.get(obj);
  if (hashed !== void 0) {
    return hashed;
  }
  hashed = nextHash();
  weakMap.set(obj, hashed);
  return hashed;
}
function valueOf(obj) {
  return obj.valueOf !== defaultValueOf && typeof obj.valueOf === "function" ? obj.valueOf(obj) : obj;
}
function nextHash() {
  const nextHash2 = ++_objHashUID;
  if (_objHashUID & 1073741824) {
    _objHashUID = 0;
  }
  return nextHash2;
}
const weakMap = /* @__PURE__ */ new WeakMap();
const symbolMap = /* @__PURE__ */ Object.create(null);
let _objHashUID = 0;
let stringHashCache = {};
let stringHashCacheCount = 0;
const STRING_HASH_CACHE_SIZE = 24e3;
const SHIFT = 5;
const SIZE = 1 << SHIFT;
const MASK = SIZE - 1;
const NOT_SET = {};
function MakeRef() {
  return { value: false };
}
function SetRef(ref) {
  if (ref) {
    ref.value = true;
  }
}
function arrCopy(arr, offset = 0) {
  return arr.slice(offset);
}
class OwnerID {
}
class ImmutableMap {
  // @pragma Construction
  // @ts-ignore
  _root;
  // @ts-ignore
  size;
  // @ts-ignore
  __ownerID;
  // @ts-ignore
  __hash;
  // @ts-ignore
  __altered;
  /**
   * Creates a new ImmutableMap instance.
   *
   * @param value - An iterable of key-value pairs to populate the map, or null/undefined for an empty map
   * @example
   * ```ts
   * // Create from array of pairs
   * const map1 = new ImmutableMap([['a', 1], ['b', 2]])
   *
   * // Create empty map
   * const map2 = new ImmutableMap()
   *
   * // Create from another map
   * const map3 = new ImmutableMap(map1)
   * ```
   */
  constructor(value) {
    return value === void 0 || value === null ? emptyMap() : value instanceof ImmutableMap ? value : emptyMap().withMutations((map) => {
      for (const [k, v] of value) {
        map.set(k, v);
      }
    });
  }
  /**
   * Gets the value associated with the specified key, with a fallback value.
   *
   * @param k - The key to look up
   * @param notSetValue - The value to return if the key is not found
   * @returns The value associated with the key, or the fallback value if not found
   * @example
   * ```ts
   * const map = new ImmutableMap([['key1', 'value1']])
   * console.log(map.get('key1', 'default')) // 'value1'
   * console.log(map.get('missing', 'default')) // 'default'
   * ```
   */
  get(k, notSetValue) {
    return this._root ? this._root.get(0, void 0, k, notSetValue) : notSetValue;
  }
  /**
   * Returns a new ImmutableMap with the specified key-value pair added or updated.
   * If the key already exists, its value is replaced. Otherwise, a new entry is created.
   *
   * @param k - The key to set
   * @param v - The value to associate with the key
   * @returns A new ImmutableMap with the key-value pair set
   * @example
   * ```ts
   * const map = new ImmutableMap([['a', 1]])
   * const updated = map.set('b', 2) // New map with both 'a' and 'b'
   * const replaced = map.set('a', 10) // New map with 'a' updated to 10
   * ```
   */
  set(k, v) {
    return updateMap(this, k, v);
  }
  /**
   * Returns a new ImmutableMap with the specified key removed.
   * If the key doesn't exist, returns the same map instance.
   *
   * @param k - The key to remove
   * @returns A new ImmutableMap with the key removed, or the same instance if key not found
   * @example
   * ```ts
   * const map = new ImmutableMap([['a', 1], ['b', 2]])
   * const smaller = map.delete('a') // New map with only 'b'
   * const same = map.delete('missing') // Returns original map
   * ```
   */
  delete(k) {
    return updateMap(this, k, NOT_SET);
  }
  /**
   * Returns a new ImmutableMap with all specified keys removed.
   * This is more efficient than calling delete() multiple times.
   *
   * @param keys - An iterable of keys to remove
   * @returns A new ImmutableMap with all specified keys removed
   * @example
   * ```ts
   * const map = new ImmutableMap([['a', 1], ['b', 2], ['c', 3]])
   * const smaller = map.deleteAll(['a', 'c']) // New map with only 'b'
   * ```
   */
  deleteAll(keys) {
    return this.withMutations((map) => {
      for (const key of keys) {
        map.delete(key);
      }
    });
  }
  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      if (this.size === 0) {
        return emptyMap();
      }
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeMap(this.size, this._root, ownerID, this.__hash);
  }
  /**
   * Applies multiple mutations efficiently by creating a mutable copy,
   * applying all changes, then returning an immutable result.
   * This is more efficient than chaining multiple set/delete operations.
   *
   * @param fn - Function that receives a mutable copy and applies changes
   * @returns A new ImmutableMap with all mutations applied, or the same instance if no changes
   * @example
   * ```ts
   * const map = new ImmutableMap([['a', 1]])
   * const updated = map.withMutations(mutable => {
   *   mutable.set('b', 2)
   *   mutable.set('c', 3)
   *   mutable.delete('a')
   * }) // Efficiently applies all changes at once
   * ```
   */
  withMutations(fn) {
    const mutable = this.asMutable();
    fn(mutable);
    return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
  }
  /**
   * Checks if this map instance has been altered during a mutation operation.
   * This is used internally to optimize mutations.
   *
   * @returns True if the map was altered, false otherwise
   * @internal
   */
  wasAltered() {
    return this.__altered;
  }
  /**
   * Returns a mutable copy of this map that can be efficiently modified.
   * Multiple changes to the mutable copy are batched together.
   *
   * @returns A mutable copy of this map
   * @internal
   */
  asMutable() {
    return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
  }
  /**
   * Makes the map iterable, yielding key-value pairs.
   *
   * @returns An iterator over [key, value] pairs
   * @example
   * ```ts
   * const map = new ImmutableMap([['a', 1], ['b', 2]])
   * for (const [key, value] of map) {
   *   console.log(key, value) // 'a' 1, then 'b' 2
   * }
   * ```
   */
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
  /**
   * Returns an iterable of key-value pairs.
   *
   * @returns An iterable over [key, value] pairs
   * @example
   * ```ts
   * const map = new ImmutableMap([['a', 1], ['b', 2]])
   * const entries = Array.from(map.entries()) // [['a', 1], ['b', 2]]
   * ```
   */
  entries() {
    return new MapIterator(this, ITERATE_ENTRIES, false);
  }
  /**
   * Returns an iterable of keys.
   *
   * @returns An iterable over keys
   * @example
   * ```ts
   * const map = new ImmutableMap([['a', 1], ['b', 2]])
   * const keys = Array.from(map.keys()) // ['a', 'b']
   * ```
   */
  keys() {
    return new MapIterator(this, ITERATE_KEYS, false);
  }
  /**
   * Returns an iterable of values.
   *
   * @returns An iterable over values
   * @example
   * ```ts
   * const map = new ImmutableMap([['a', 1], ['b', 2]])
   * const values = Array.from(map.values()) // [1, 2]
   * ```
   */
  values() {
    return new MapIterator(this, ITERATE_VALUES, false);
  }
}
class ArrayMapNode {
  constructor(ownerID, entries) {
    this.ownerID = ownerID;
    this.entries = entries;
  }
  get(_shift, _keyHash, key, notSetValue) {
    const entries = this.entries;
    for (let ii = 0, len = entries.length; ii < len; ii++) {
      if (Object.is(key, entries[ii][0])) {
        return entries[ii][1];
      }
    }
    return notSetValue;
  }
  update(ownerID, _shift, _keyHash, key, value, didChangeSize, didAlter) {
    const removed = value === NOT_SET;
    const entries = this.entries;
    let idx = 0;
    const len = entries.length;
    for (; idx < len; idx++) {
      if (Object.is(key, entries[idx][0])) {
        break;
      }
    }
    const exists = idx < len;
    if (exists ? entries[idx][1] === value : removed) {
      return this;
    }
    SetRef(didAlter);
    if (removed || !exists) SetRef(didChangeSize);
    if (removed && entries.length === 1) {
      return;
    }
    if (!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE) {
      return createNodes(ownerID, entries, key, value);
    }
    const isEditable = ownerID && ownerID === this.ownerID;
    const newEntries = isEditable ? entries : arrCopy(entries);
    if (exists) {
      if (removed) {
        if (idx === len - 1) {
          newEntries.pop();
        } else {
          newEntries[idx] = newEntries.pop();
        }
      } else {
        newEntries[idx] = [key, value];
      }
    } else {
      newEntries.push([key, value]);
    }
    if (isEditable) {
      this.entries = newEntries;
      return this;
    }
    return new ArrayMapNode(ownerID, newEntries);
  }
}
class BitmapIndexedNode {
  constructor(ownerID, bitmap, nodes) {
    this.ownerID = ownerID;
    this.bitmap = bitmap;
    this.nodes = nodes;
  }
  get(shift, keyHash, key, notSetValue) {
    if (keyHash === void 0) {
      keyHash = hash(key);
    }
    const bit = 1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK);
    const bitmap = this.bitmap;
    return (bitmap & bit) === 0 ? notSetValue : this.nodes[popCount(bitmap & bit - 1)].get(shift + SHIFT, keyHash, key, notSetValue);
  }
  update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
    if (keyHash === void 0) {
      keyHash = hash(key);
    }
    const keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
    const bit = 1 << keyHashFrag;
    const bitmap = this.bitmap;
    const exists = (bitmap & bit) !== 0;
    if (!exists && value === NOT_SET) {
      return this;
    }
    const idx = popCount(bitmap & bit - 1);
    const nodes = this.nodes;
    const node = exists ? nodes[idx] : void 0;
    const newNode = updateNode(
      node,
      ownerID,
      shift + SHIFT,
      keyHash,
      key,
      value,
      didChangeSize,
      didAlter
    );
    if (newNode === node) {
      return this;
    }
    if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
      return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);
    }
    if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
      return nodes[idx ^ 1];
    }
    if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
      return newNode;
    }
    const isEditable = ownerID && ownerID === this.ownerID;
    const newBitmap = exists ? newNode ? bitmap : bitmap ^ bit : bitmap | bit;
    const newNodes = exists ? newNode ? setAt(nodes, idx, newNode, isEditable) : spliceOut(nodes, idx, isEditable) : spliceIn(nodes, idx, newNode, isEditable);
    if (isEditable) {
      this.bitmap = newBitmap;
      this.nodes = newNodes;
      return this;
    }
    return new BitmapIndexedNode(ownerID, newBitmap, newNodes);
  }
}
class HashArrayMapNode {
  constructor(ownerID, count, nodes) {
    this.ownerID = ownerID;
    this.count = count;
    this.nodes = nodes;
  }
  get(shift, keyHash, key, notSetValue) {
    if (keyHash === void 0) {
      keyHash = hash(key);
    }
    const idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
    const node = this.nodes[idx];
    return node ? node.get(shift + SHIFT, keyHash, key, notSetValue) : notSetValue;
  }
  update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
    if (keyHash === void 0) {
      keyHash = hash(key);
    }
    const idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
    const removed = value === NOT_SET;
    const nodes = this.nodes;
    const node = nodes[idx];
    if (removed && !node) {
      return this;
    }
    const newNode = updateNode(
      node,
      ownerID,
      shift + SHIFT,
      keyHash,
      key,
      value,
      didChangeSize,
      didAlter
    );
    if (newNode === node) {
      return this;
    }
    let newCount = this.count;
    if (!node) {
      newCount++;
    } else if (!newNode) {
      newCount--;
      if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
        return packNodes(ownerID, nodes, newCount, idx);
      }
    }
    const isEditable = ownerID && ownerID === this.ownerID;
    const newNodes = setAt(nodes, idx, newNode, isEditable);
    if (isEditable) {
      this.count = newCount;
      this.nodes = newNodes;
      return this;
    }
    return new HashArrayMapNode(ownerID, newCount, newNodes);
  }
}
class HashCollisionNode {
  constructor(ownerID, keyHash, entries) {
    this.ownerID = ownerID;
    this.keyHash = keyHash;
    this.entries = entries;
  }
  get(shift, keyHash, key, notSetValue) {
    const entries = this.entries;
    for (let ii = 0, len = entries.length; ii < len; ii++) {
      if (Object.is(key, entries[ii][0])) {
        return entries[ii][1];
      }
    }
    return notSetValue;
  }
  update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
    if (keyHash === void 0) {
      keyHash = hash(key);
    }
    const removed = value === NOT_SET;
    if (keyHash !== this.keyHash) {
      if (removed) {
        return this;
      }
      SetRef(didAlter);
      SetRef(didChangeSize);
      return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);
    }
    const entries = this.entries;
    let idx = 0;
    const len = entries.length;
    for (; idx < len; idx++) {
      if (Object.is(key, entries[idx][0])) {
        break;
      }
    }
    const exists = idx < len;
    if (exists ? entries[idx][1] === value : removed) {
      return this;
    }
    SetRef(didAlter);
    if (removed || !exists) SetRef(didChangeSize);
    if (removed && len === 2) {
      return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);
    }
    const isEditable = ownerID && ownerID === this.ownerID;
    const newEntries = isEditable ? entries : arrCopy(entries);
    if (exists) {
      if (removed) {
        if (idx === len - 1) {
          newEntries.pop();
        } else {
          newEntries[idx] = newEntries.pop();
        }
      } else {
        newEntries[idx] = [key, value];
      }
    } else {
      newEntries.push([key, value]);
    }
    if (isEditable) {
      this.entries = newEntries;
      return this;
    }
    return new HashCollisionNode(ownerID, this.keyHash, newEntries);
  }
}
class ValueNode {
  constructor(ownerID, keyHash, entry) {
    this.ownerID = ownerID;
    this.keyHash = keyHash;
    this.entry = entry;
  }
  get(shift, keyHash, key, notSetValue) {
    return Object.is(key, this.entry[0]) ? this.entry[1] : notSetValue;
  }
  update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
    const removed = value === NOT_SET;
    const keyMatch = Object.is(key, this.entry[0]);
    if (keyMatch ? value === this.entry[1] : removed) {
      return this;
    }
    SetRef(didAlter);
    if (removed) {
      SetRef(didChangeSize);
      return;
    }
    if (keyMatch) {
      if (ownerID && ownerID === this.ownerID) {
        this.entry[1] = value;
        return this;
      }
      return new ValueNode(ownerID, this.keyHash, [key, value]);
    }
    SetRef(didChangeSize);
    return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);
  }
}
class MapIterator {
  constructor(map, _type, _reverse) {
    this._type = _type;
    this._reverse = _reverse;
    this._stack = map._root && mapIteratorFrame(map._root);
  }
  _stack;
  [Symbol.iterator]() {
    return this;
  }
  next() {
    const type = this._type;
    let stack = this._stack;
    while (stack) {
      const node = stack.node;
      const index = stack.index++;
      let maxIndex;
      if (node.entry) {
        if (index === 0) {
          return mapIteratorValue(type, node.entry);
        }
      } else if ("entries" in node && node.entries) {
        maxIndex = node.entries.length - 1;
        if (index <= maxIndex) {
          return mapIteratorValue(type, node.entries[this._reverse ? maxIndex - index : index]);
        }
      } else {
        maxIndex = node.nodes.length - 1;
        if (index <= maxIndex) {
          const subNode = node.nodes[this._reverse ? maxIndex - index : index];
          if (subNode) {
            if (subNode.entry) {
              return mapIteratorValue(type, subNode.entry);
            }
            stack = this._stack = mapIteratorFrame(subNode, stack);
          }
          continue;
        }
      }
      stack = this._stack = this._stack.__prev;
    }
    return iteratorDone();
  }
}
function mapIteratorValue(type, entry) {
  return iteratorValue(type, entry[0], entry[1]);
}
function mapIteratorFrame(node, prev) {
  return {
    node,
    index: 0,
    __prev: prev
  };
}
const ITERATE_KEYS = 0;
const ITERATE_VALUES = 1;
const ITERATE_ENTRIES = 2;
function iteratorValue(type, k, v, iteratorResult) {
  const value = type === ITERATE_KEYS ? k : type === ITERATE_VALUES ? v : [k, v];
  if (iteratorResult) {
    iteratorResult.value = value;
  } else {
    iteratorResult = { value, done: false };
  }
  return iteratorResult;
}
function iteratorDone() {
  return { value: void 0, done: true };
}
function makeMap(size, root, ownerID, hash2) {
  const map = Object.create(ImmutableMap.prototype);
  map.size = size;
  map._root = root;
  map.__ownerID = ownerID;
  map.__hash = hash2;
  map.__altered = false;
  return map;
}
let EMPTY_MAP;
function emptyMap() {
  return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
}
function updateMap(map, k, v) {
  let newRoot;
  let newSize;
  if (!map._root) {
    if (v === NOT_SET) {
      return map;
    }
    newSize = 1;
    newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);
  } else {
    const didChangeSize = MakeRef();
    const didAlter = MakeRef();
    newRoot = updateNode(map._root, map.__ownerID, 0, void 0, k, v, didChangeSize, didAlter);
    if (!didAlter.value) {
      return map;
    }
    newSize = map.size + (didChangeSize.value ? v === NOT_SET ? -1 : 1 : 0);
  }
  if (map.__ownerID) {
    map.size = newSize;
    map._root = newRoot;
    map.__hash = void 0;
    map.__altered = true;
    return map;
  }
  return newRoot ? makeMap(newSize, newRoot) : emptyMap();
}
function updateNode(node, ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  if (!node) {
    if (value === NOT_SET) {
      return node;
    }
    SetRef(didAlter);
    SetRef(didChangeSize);
    return new ValueNode(ownerID, keyHash, [key, value]);
  }
  return node.update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter);
}
function isLeafNode(node) {
  return node.constructor === ValueNode || node.constructor === HashCollisionNode;
}
function mergeIntoNode(node, ownerID, shift, keyHash, entry) {
  if (node.keyHash === keyHash) {
    return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);
  }
  const idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
  const idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
  let newNode;
  const nodes = idx1 === idx2 ? [mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)] : (newNode = new ValueNode(ownerID, keyHash, entry), idx1 < idx2 ? [node, newNode] : [newNode, node]);
  return new BitmapIndexedNode(ownerID, 1 << idx1 | 1 << idx2, nodes);
}
function createNodes(ownerID, entries, key, value) {
  if (!ownerID) {
    ownerID = new OwnerID();
  }
  let node = new ValueNode(ownerID, hash(key), [key, value]);
  for (let ii = 0; ii < entries.length; ii++) {
    const entry = entries[ii];
    node = node.update(ownerID, 0, void 0, entry[0], entry[1]);
  }
  return node;
}
function packNodes(ownerID, nodes, count, excluding) {
  let bitmap = 0;
  let packedII = 0;
  const packedNodes = new Array(count);
  for (let ii = 0, bit = 1, len = nodes.length; ii < len; ii++, bit <<= 1) {
    const node = nodes[ii];
    if (node !== void 0 && ii !== excluding) {
      bitmap |= bit;
      packedNodes[packedII++] = node;
    }
  }
  return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
}
function expandNodes(ownerID, nodes, bitmap, including, node) {
  let count = 0;
  const expandedNodes = new Array(SIZE);
  for (let ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
    expandedNodes[ii] = bitmap & 1 ? nodes[count++] : void 0;
  }
  expandedNodes[including] = node;
  return new HashArrayMapNode(ownerID, count + 1, expandedNodes);
}
function popCount(x) {
  x -= x >> 1 & 1431655765;
  x = (x & 858993459) + (x >> 2 & 858993459);
  x = x + (x >> 4) & 252645135;
  x += x >> 8;
  x += x >> 16;
  return x & 127;
}
function setAt(array, idx, val, canEdit) {
  const newArray = canEdit ? array : arrCopy(array);
  newArray[idx] = val;
  return newArray;
}
function spliceIn(array, idx, val, canEdit) {
  const newLen = array.length + 1;
  if (canEdit && idx + 1 === newLen) {
    array[idx] = val;
    return array;
  }
  const newArray = new Array(newLen);
  let after = 0;
  for (let ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      newArray[ii] = val;
      after = -1;
    } else {
      newArray[ii] = array[ii + after];
    }
  }
  return newArray;
}
function spliceOut(array, idx, canEdit) {
  const newLen = array.length - 1;
  if (canEdit && idx === newLen) {
    array.pop();
    return array;
  }
  const newArray = new Array(newLen);
  let after = 0;
  for (let ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      after = 1;
    }
    newArray[ii] = array[ii + after];
  }
  return newArray;
}
const MAX_ARRAY_MAP_SIZE = SIZE / 4;
const MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
const MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;
export {
  ImmutableMap,
  emptyMap,
  iteratorDone
};
//# sourceMappingURL=ImmutableMap.mjs.map
