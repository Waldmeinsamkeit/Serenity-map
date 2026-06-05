import {
  computed,
  EMPTY_ARRAY,
  isUninitialized,
  RESET_VALUE,
  withDiff
} from "@tldraw/state";
import { areArraysShallowEqual, isEqual, objectMapValues } from "@tldraw/utils";
import { executeQuery, objectMatchesQuery } from "./executeQuery.mjs";
import { IncrementalSetConstructor } from "./IncrementalSetConstructor.mjs";
import { diffSets } from "./setUtils.mjs";
class StoreQueries {
  /**
   * Creates a new StoreQueries instance.
   *
   * recordMap - The atom map containing all records in the store
   * history - The atom tracking the store's change history with diffs
   *
   * @internal
   */
  constructor(recordMap, history) {
    this.recordMap = recordMap;
    this.history = history;
  }
  /**
   * A cache of derivations (indexes).
   *
   * @internal
   */
  indexCache = /* @__PURE__ */ new Map();
  /**
   * A cache of derivations (filtered histories).
   *
   * @internal
   */
  historyCache = /* @__PURE__ */ new Map();
  /**
   * @internal
   */
  getAllIdsForType(typeName) {
    const ids = /* @__PURE__ */ new Set();
    for (const record of this.recordMap.values()) {
      if (record.typeName === typeName) {
        ids.add(record.id);
      }
    }
    return ids;
  }
  /**
   * @internal
   */
  getRecordById(typeName, id) {
    const record = this.recordMap.get(id);
    if (record && record.typeName === typeName) {
      return record;
    }
    return void 0;
  }
  /**
   * Helper to extract nested property value using pre-split path parts.
   * @internal
   */
  getNestedValue(obj, pathParts) {
    let current = obj;
    for (const part of pathParts) {
      if (current == null || typeof current !== "object") return void 0;
      current = current[part];
    }
    return current;
  }
  /**
   * Creates a reactive computed that tracks the change history for records of a specific type.
   * The returned computed provides incremental diffs showing what records of the given type
   * have been added, updated, or removed.
   *
   * @param typeName - The type name to filter the history by
   * @returns A computed value containing the current epoch and diffs of changes for the specified type
   *
   * @example
   * ```ts
   * // Track changes to book records only
   * const bookHistory = store.query.filterHistory('book')
   *
   * // React to book changes
   * react('book-changes', () => {
   *   const currentEpoch = bookHistory.get()
   *   console.log('Books updated at epoch:', currentEpoch)
   * })
   * ```
   *
   * @public
   */
  filterHistory(typeName) {
    if (this.historyCache.has(typeName)) {
      return this.historyCache.get(typeName);
    }
    const filtered = computed(
      "filterHistory:" + typeName,
      (lastValue, lastComputedEpoch) => {
        if (isUninitialized(lastValue)) {
          return this.history.get();
        }
        const diff = this.history.getDiffSince(lastComputedEpoch);
        if (diff === RESET_VALUE) return this.history.get();
        const res = { added: {}, removed: {}, updated: {} };
        let numAdded = 0;
        let numRemoved = 0;
        let numUpdated = 0;
        for (const changes of diff) {
          for (const added of objectMapValues(changes.added)) {
            if (added.typeName === typeName) {
              if (res.removed[added.id]) {
                const original = res.removed[added.id];
                delete res.removed[added.id];
                numRemoved--;
                if (original !== added) {
                  res.updated[added.id] = [original, added];
                  numUpdated++;
                }
              } else {
                res.added[added.id] = added;
                numAdded++;
              }
            }
          }
          for (const [from, to] of objectMapValues(changes.updated)) {
            if (to.typeName === typeName) {
              if (res.added[to.id]) {
                res.added[to.id] = to;
              } else if (res.updated[to.id]) {
                res.updated[to.id] = [res.updated[to.id][0], to];
              } else {
                res.updated[to.id] = [from, to];
                numUpdated++;
              }
            }
          }
          for (const removed of objectMapValues(changes.removed)) {
            if (removed.typeName === typeName) {
              if (res.added[removed.id]) {
                delete res.added[removed.id];
                numAdded--;
              } else if (res.updated[removed.id]) {
                res.removed[removed.id] = res.updated[removed.id][0];
                delete res.updated[removed.id];
                numUpdated--;
                numRemoved++;
              } else {
                res.removed[removed.id] = removed;
                numRemoved++;
              }
            }
          }
        }
        if (numAdded || numRemoved || numUpdated) {
          return withDiff(this.history.get(), res);
        } else {
          return lastValue;
        }
      },
      { historyLength: 100 }
    );
    this.historyCache.set(typeName, filtered);
    return filtered;
  }
  /**
   * Creates a reactive index that maps property values to sets of record IDs for efficient lookups.
   * The index automatically updates when records are added, updated, or removed, and results are cached
   * for performance.
   *
   * Supports nested property paths using backslash separator (e.g., 'metadata\\sessionId').
   *
   * @param typeName - The type name of records to index
   * @param path - The property name or backslash-delimited path to index by
   * @returns A reactive computed containing the index map with change diffs
   *
   * @example
   * ```ts
   * // Create an index of books by author ID
   * const booksByAuthor = store.query.index('book', 'authorId')
   *
   * // Get all books by a specific author
   * const authorBooks = booksByAuthor.get().get('author:leguin')
   * console.log(authorBooks) // Set<RecordId<Book>>
   *
   * // Index by nested property using backslash separator
   * const booksBySession = store.query.index('book', 'metadata\\sessionId')
   * const sessionBooks = booksBySession.get().get('session:alpha')
   * ```
   *
   * @public
   */
  index(typeName, path) {
    const cacheKey = typeName + ":" + path;
    if (this.indexCache.has(cacheKey)) {
      return this.indexCache.get(cacheKey);
    }
    const index = this.__uncached_createIndex(typeName, path);
    this.indexCache.set(cacheKey, index);
    return index;
  }
  /**
   * Creates a new index without checking the cache. This method performs the actual work
   * of building the reactive index computation that tracks property values to record ID sets.
   *
   * Supports nested property paths using backslash separator.
   *
   * @param typeName - The type name of records to index
   * @param path - The property name or backslash-delimited path to index by
   * @returns A reactive computed containing the index map with change diffs
   *
   * @internal
   */
  __uncached_createIndex(typeName, path) {
    const typeHistory = this.filterHistory(typeName);
    const pathParts = path.split("\\");
    const getPropertyValue = pathParts.length > 1 ? (obj) => this.getNestedValue(obj, pathParts) : (obj) => obj[path];
    const fromScratch = () => {
      typeHistory.get();
      const res = /* @__PURE__ */ new Map();
      for (const record of this.recordMap.values()) {
        if (record.typeName === typeName) {
          const value = getPropertyValue(record);
          if (value !== void 0) {
            if (!res.has(value)) {
              res.set(value, /* @__PURE__ */ new Set());
            }
            res.get(value).add(record.id);
          }
        }
      }
      return res;
    };
    return computed(
      "index:" + typeName + ":" + path,
      (prevValue, lastComputedEpoch) => {
        if (isUninitialized(prevValue)) return fromScratch();
        const history = typeHistory.getDiffSince(lastComputedEpoch);
        if (history === RESET_VALUE) {
          return fromScratch();
        }
        const setConstructors = /* @__PURE__ */ new Map();
        const add = (value, id) => {
          let setConstructor = setConstructors.get(value);
          if (!setConstructor)
            setConstructor = new IncrementalSetConstructor(
              prevValue.get(value) ?? /* @__PURE__ */ new Set()
            );
          setConstructor.add(id);
          setConstructors.set(value, setConstructor);
        };
        const remove = (value, id) => {
          let set = setConstructors.get(value);
          if (!set) set = new IncrementalSetConstructor(prevValue.get(value) ?? /* @__PURE__ */ new Set());
          set.remove(id);
          setConstructors.set(value, set);
        };
        for (const changes of history) {
          for (const record of objectMapValues(changes.added)) {
            if (record.typeName === typeName) {
              const value = getPropertyValue(record);
              if (value !== void 0) {
                add(value, record.id);
              }
            }
          }
          for (const [from, to] of objectMapValues(changes.updated)) {
            if (to.typeName === typeName) {
              const prev = getPropertyValue(from);
              const next = getPropertyValue(to);
              if (prev !== next) {
                if (prev !== void 0) {
                  remove(prev, to.id);
                }
                if (next !== void 0) {
                  add(next, to.id);
                }
              }
            }
          }
          for (const record of objectMapValues(changes.removed)) {
            if (record.typeName === typeName) {
              const value = getPropertyValue(record);
              if (value !== void 0) {
                remove(value, record.id);
              }
            }
          }
        }
        let nextValue = void 0;
        let nextDiff = void 0;
        for (const [value, setConstructor] of setConstructors) {
          const result = setConstructor.get();
          if (!result) continue;
          if (!nextValue) nextValue = new Map(prevValue);
          if (!nextDiff) nextDiff = /* @__PURE__ */ new Map();
          if (result.value.size === 0) {
            nextValue.delete(value);
          } else {
            nextValue.set(value, result.value);
          }
          nextDiff.set(value, result.diff);
        }
        if (nextValue && nextDiff) {
          return withDiff(nextValue, nextDiff);
        }
        return prevValue;
      },
      { historyLength: 100 }
    );
  }
  /**
   * Creates a reactive query that returns the first record matching the given query criteria.
   * Returns undefined if no matching record is found. The query automatically updates
   * when records change.
   *
   * @param typeName - The type name of records to query
   * @param queryCreator - Function that returns the query expression object to match against
   * @param name - Optional name for the query computation (used for debugging)
   * @returns A computed value containing the first matching record or undefined
   *
   * @example
   * ```ts
   * // Find the first book with a specific title
   * const bookLatheOfHeaven = store.query.record('book', () => ({ title: { eq: 'The Lathe of Heaven' } }))
   * console.log(bookLatheOfHeaven.get()?.title) // 'The Lathe of Heaven' or undefined
   *
   * // Find any book in stock
   * const anyInStockBook = store.query.record('book', () => ({ inStock: { eq: true } }))
   * ```
   *
   * @public
   */
  record(typeName, queryCreator = () => ({}), name = "record:" + typeName + (queryCreator ? ":" + queryCreator.toString() : "")) {
    const ids = this.ids(typeName, queryCreator, name);
    return computed(name, () => {
      for (const id of ids.get()) {
        return this.recordMap.get(id);
      }
      return void 0;
    });
  }
  /**
   * Creates a reactive query that returns an array of all records matching the given query criteria.
   * The array automatically updates when records are added, updated, or removed.
   *
   * @param typeName - The type name of records to query
   * @param queryCreator - Function that returns the query expression object to match against
   * @param name - Optional name for the query computation (used for debugging)
   * @returns A computed value containing an array of all matching records
   *
   * @example
   * ```ts
   * // Get all books in stock
   * const inStockBooks = store.query.records('book', () => ({ inStock: { eq: true } }))
   * console.log(inStockBooks.get()) // Book[]
   *
   * // Get all books by a specific author
   * const leguinBooks = store.query.records('book', () => ({ authorId: { eq: 'author:leguin' } }))
   *
   * // Get all books (no filter)
   * const allBooks = store.query.records('book')
   * ```
   *
   * @public
   */
  records(typeName, queryCreator = () => ({}), name = "records:" + typeName + (queryCreator ? ":" + queryCreator.toString() : "")) {
    const ids = this.ids(typeName, queryCreator, "ids:" + name);
    return computed(
      name,
      () => {
        return Array.from(ids.get(), (id) => this.recordMap.get(id));
      },
      {
        isEqual: areArraysShallowEqual
      }
    );
  }
  /**
   * Creates a reactive query that returns a set of record IDs matching the given query criteria.
   * This is more efficient than `records()` when you only need the IDs and not the full record objects.
   * The set automatically updates with collection diffs when records change.
   *
   * @param typeName - The type name of records to query
   * @param queryCreator - Function that returns the query expression object to match against
   * @param name - Optional name for the query computation (used for debugging)
   * @returns A computed value containing a set of matching record IDs with collection diffs
   *
   * @example
   * ```ts
   * // Get IDs of all books in stock
   * const inStockBookIds = store.query.ids('book', () => ({ inStock: { eq: true } }))
   * console.log(inStockBookIds.get()) // Set<RecordId<Book>>
   *
   * // Get all book IDs (no filter)
   * const allBookIds = store.query.ids('book')
   *
   * // Use with other queries for efficient lookups
   * const authorBookIds = store.query.ids('book', () => ({ authorId: { eq: 'author:leguin' } }))
   * ```
   *
   * @public
   */
  ids(typeName, queryCreator = () => ({}), name = "ids:" + typeName + (queryCreator ? ":" + queryCreator.toString() : "")) {
    const typeHistory = this.filterHistory(typeName);
    const fromScratch = () => {
      typeHistory.get();
      const query = queryCreator();
      if (Object.keys(query).length === 0) {
        return this.getAllIdsForType(typeName);
      }
      return executeQuery(this, typeName, query);
    };
    const fromScratchWithDiff = (prevValue) => {
      const nextValue = fromScratch();
      const diff = diffSets(prevValue, nextValue);
      if (diff) {
        return withDiff(nextValue, diff);
      } else {
        return prevValue;
      }
    };
    const cachedQuery = computed("ids_query:" + name, queryCreator, {
      isEqual
    });
    return computed(
      "query:" + name,
      (prevValue, lastComputedEpoch) => {
        const query = cachedQuery.get();
        if (isUninitialized(prevValue)) {
          return fromScratch();
        }
        if (lastComputedEpoch < cachedQuery.lastChangedEpoch) {
          return fromScratchWithDiff(prevValue);
        }
        const history = typeHistory.getDiffSince(lastComputedEpoch);
        if (history === RESET_VALUE) {
          return fromScratchWithDiff(prevValue);
        }
        const setConstructor = new IncrementalSetConstructor(
          prevValue
        );
        for (const changes of history) {
          for (const added of objectMapValues(changes.added)) {
            if (added.typeName === typeName && objectMatchesQuery(query, added)) {
              setConstructor.add(added.id);
            }
          }
          for (const [_, updated] of objectMapValues(changes.updated)) {
            if (updated.typeName === typeName) {
              if (objectMatchesQuery(query, updated)) {
                setConstructor.add(updated.id);
              } else {
                setConstructor.remove(updated.id);
              }
            }
          }
          for (const removed of objectMapValues(changes.removed)) {
            if (removed.typeName === typeName) {
              setConstructor.remove(removed.id);
            }
          }
        }
        const result = setConstructor.get();
        if (!result) {
          return prevValue;
        }
        return withDiff(result.value, result.diff);
      },
      { historyLength: 50 }
    );
  }
  /**
   * Executes a one-time query against the current store state and returns matching records.
   * This is a non-reactive query that returns results immediately without creating a computed value.
   * Use this when you need a snapshot of data at a specific point in time.
   *
   * @param typeName - The type name of records to query
   * @param query - The query expression object to match against
   * @returns An array of records that match the query at the current moment
   *
   * @example
   * ```ts
   * // Get current in-stock books (non-reactive)
   * const currentInStockBooks = store.query.exec('book', { inStock: { eq: true } })
   * console.log(currentInStockBooks) // Book[]
   *
   * // Unlike records(), this won't update when the data changes
   * const staticBookList = store.query.exec('book', { authorId: { eq: 'author:leguin' } })
   * ```
   *
   * @public
   */
  exec(typeName, query) {
    const ids = executeQuery(this, typeName, query);
    if (ids.size === 0) {
      return EMPTY_ARRAY;
    }
    return Array.from(ids, (id) => this.recordMap.get(id));
  }
}
export {
  StoreQueries
};
//# sourceMappingURL=StoreQueries.mjs.map
