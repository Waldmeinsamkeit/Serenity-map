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
var Store_exports = {};
__export(Store_exports, {
  Store: () => Store,
  createComputedCache: () => createComputedCache
});
module.exports = __toCommonJS(Store_exports);
var import_state = require("@tldraw/state");
var import_utils = require("@tldraw/utils");
var import_AtomMap = require("./AtomMap");
var import_RecordsDiff = require("./RecordsDiff");
var import_StoreQueries = require("./StoreQueries");
var import_StoreSideEffects = require("./StoreSideEffects");
var import_devFreeze = require("./devFreeze");
class Store {
  /**
   * The unique identifier of the store instance.
   *
   * @public
   */
  id;
  /**
   * An AtomMap containing the stores records.
   *
   * @internal
   * @readonly
   */
  records;
  /**
   * An atom containing the store's history.
   *
   * @public
   * @readonly
   */
  history = (0, import_state.atom)("history", 0, {
    historyLength: 1e3
  });
  /**
   * Reactive queries and indexes for efficiently accessing store data.
   * Provides methods for filtering, indexing, and subscribing to subsets of records.
   *
   * @example
   * ```ts
   * // Create an index by a property
   * const booksByAuthor = store.query.index('book', 'author')
   *
   * // Get records matching criteria
   * const inStockBooks = store.query.records('book', () => ({
   *   inStock: { eq: true }
   * }))
   * ```
   *
   * @public
   * @readonly
   */
  query;
  /**
   * A set containing listeners that have been added to this store.
   *
   * @internal
   */
  listeners = /* @__PURE__ */ new Set();
  /**
   * An array of history entries that have not yet been flushed.
   *
   * @internal
   */
  historyAccumulator = new HistoryAccumulator();
  /**
   * A reactor that responds to changes to the history by squashing the accumulated history and
   * notifying listeners of the changes.
   *
   * @internal
   */
  historyReactor;
  /**
   * Function to dispose of any in-flight timeouts.
   *
   * @internal
   */
  cancelHistoryReactor() {
  }
  /**
   * The schema that defines the structure and validation rules for records in this store.
   *
   * @public
   */
  schema;
  /**
   * Custom properties associated with this store instance.
   *
   * @public
   */
  props;
  /**
   * A mapping of record scopes to the set of record type names that belong to each scope.
   * Used to filter records by their persistence and synchronization behavior.
   *
   * @public
   */
  scopedTypes;
  /**
   * Side effects manager that handles lifecycle events for record operations.
   * Allows registration of callbacks for create, update, delete, and validation events.
   *
   * @example
   * ```ts
   * store.sideEffects.registerAfterCreateHandler('book', (book) => {
   *   console.log('Book created:', book.title)
   * })
   * ```
   *
   * @public
   */
  sideEffects = new import_StoreSideEffects.StoreSideEffects(this);
  /**
   * Creates a new Store instance.
   *
   * @example
   * ```ts
   * const store = new Store({
   *   schema: StoreSchema.create({ book: Book }),
   *   props: { appName: 'MyLibrary' },
   *   initialData: savedData
   * })
   * ```
   *
   * @param config - Configuration object for the store
   */
  constructor(config) {
    const { initialData, schema, id } = config;
    this.id = id ?? (0, import_utils.uniqueId)();
    this.schema = schema;
    this.props = config.props;
    if (initialData) {
      this.records = new import_AtomMap.AtomMap(
        "store",
        (0, import_utils.objectMapEntries)(initialData).map(([id2, record]) => [
          id2,
          (0, import_devFreeze.devFreeze)(this.schema.validateRecord(this, record, "initialize", null))
        ])
      );
    } else {
      this.records = new import_AtomMap.AtomMap("store");
    }
    this.query = new import_StoreQueries.StoreQueries(this.records, this.history);
    this.historyReactor = (0, import_state.reactor)(
      "Store.historyReactor",
      () => {
        this.history.get();
        this._flushHistory();
      },
      { scheduleEffect: (cb) => this.cancelHistoryReactor = (0, import_utils.throttleToNextFrame)(cb) }
    );
    this.scopedTypes = {
      document: new Set(
        (0, import_utils.objectMapValues)(this.schema.types).filter((t) => t.scope === "document").map((t) => t.typeName)
      ),
      session: new Set(
        (0, import_utils.objectMapValues)(this.schema.types).filter((t) => t.scope === "session").map((t) => t.typeName)
      ),
      presence: new Set(
        (0, import_utils.objectMapValues)(this.schema.types).filter((t) => t.scope === "presence").map((t) => t.typeName)
      )
    };
  }
  _flushHistory() {
    if (this.historyAccumulator.hasChanges()) {
      const entries = this.historyAccumulator.flush();
      for (const { changes, source } of entries) {
        let instanceChanges = null;
        let documentChanges = null;
        let presenceChanges = null;
        for (const { onHistory, filters } of this.listeners) {
          if (filters.source !== "all" && filters.source !== source) {
            continue;
          }
          if (filters.scope !== "all") {
            if (filters.scope === "document") {
              documentChanges ??= this.filterChangesByScope(changes, "document");
              if (!documentChanges) continue;
              onHistory({ changes: documentChanges, source });
            } else if (filters.scope === "session") {
              instanceChanges ??= this.filterChangesByScope(changes, "session");
              if (!instanceChanges) continue;
              onHistory({ changes: instanceChanges, source });
            } else {
              presenceChanges ??= this.filterChangesByScope(changes, "presence");
              if (!presenceChanges) continue;
              onHistory({ changes: presenceChanges, source });
            }
          } else {
            onHistory({ changes, source });
          }
        }
      }
    }
  }
  dispose() {
    this.cancelHistoryReactor();
  }
  /**
   * Filters out non-document changes from a diff. Returns null if there are no changes left.
   * @param change - the records diff
   * @param scope - the records scope
   * @returns
   */
  filterChangesByScope(change, scope) {
    const result = {
      added: (0, import_utils.filterEntries)(change.added, (_, r) => this.scopedTypes[scope].has(r.typeName)),
      updated: (0, import_utils.filterEntries)(change.updated, (_, r) => this.scopedTypes[scope].has(r[1].typeName)),
      removed: (0, import_utils.filterEntries)(change.removed, (_, r) => this.scopedTypes[scope].has(r.typeName))
    };
    if (Object.keys(result.added).length === 0 && Object.keys(result.updated).length === 0 && Object.keys(result.removed).length === 0) {
      return null;
    }
    return result;
  }
  /**
   * Update the history with a diff of changes.
   *
   * @param changes - The changes to add to the history.
   */
  updateHistory(changes) {
    this.historyAccumulator.add({
      changes,
      source: this.isMergingRemoteChanges ? "remote" : "user"
    });
    if (this.listeners.size === 0) {
      this.historyAccumulator.clear();
    }
    this.history.set(this.history.get() + 1, changes);
  }
  validate(phase) {
    this.allRecords().forEach((record) => this.schema.validateRecord(this, record, phase, null));
  }
  /**
   * Add or update records in the store. If a record with the same ID already exists, it will be updated.
   * Otherwise, a new record will be created.
   *
   * @example
   * ```ts
   * // Add new records
   * const book = Book.create({ title: 'Lathe Of Heaven', author: 'Le Guin' })
   * store.put([book])
   *
   * // Update existing record
   * store.put([{ ...book, title: 'The Lathe of Heaven' }])
   * ```
   *
   * @param records - The records to add or update
   * @param phaseOverride - Override the validation phase (used internally)
   * @public
   */
  put(records, phaseOverride) {
    this.atomic(() => {
      const updates = {};
      const additions = {};
      let record;
      let didChange = false;
      const source = this.isMergingRemoteChanges ? "remote" : "user";
      for (let i = 0, n = records.length; i < n; i++) {
        record = records[i];
        const initialValue = this.records.__unsafe__getWithoutCapture(record.id);
        if (initialValue) {
          record = this.sideEffects.handleBeforeChange(initialValue, record, source);
          const validated = this.schema.validateRecord(
            this,
            record,
            phaseOverride ?? "updateRecord",
            initialValue
          );
          if (validated === initialValue) continue;
          record = (0, import_devFreeze.devFreeze)(record);
          this.records.set(record.id, record);
          didChange = true;
          updates[record.id] = [initialValue, record];
          this.addDiffForAfterEvent(initialValue, record);
        } else {
          record = this.sideEffects.handleBeforeCreate(record, source);
          didChange = true;
          record = this.schema.validateRecord(
            this,
            record,
            phaseOverride ?? "createRecord",
            null
          );
          record = (0, import_devFreeze.devFreeze)(record);
          additions[record.id] = record;
          this.addDiffForAfterEvent(null, record);
          this.records.set(record.id, record);
        }
      }
      if (!didChange) return;
      this.updateHistory({
        added: additions,
        updated: updates,
        removed: {}
      });
    });
  }
  /**
   * Remove records from the store by their IDs.
   *
   * @example
   * ```ts
   * // Remove a single record
   * store.remove([book.id])
   *
   * // Remove multiple records
   * store.remove([book1.id, book2.id, book3.id])
   * ```
   *
   * @param ids - The IDs of the records to remove
   * @public
   */
  remove(ids) {
    this.atomic(() => {
      const toDelete = new Set(ids);
      const source = this.isMergingRemoteChanges ? "remote" : "user";
      if (this.sideEffects.isEnabled()) {
        for (const id of ids) {
          const record = this.records.__unsafe__getWithoutCapture(id);
          if (!record) continue;
          if (this.sideEffects.handleBeforeDelete(record, source) === false) {
            toDelete.delete(id);
          }
        }
      }
      const actuallyDeleted = this.records.deleteMany(toDelete);
      if (actuallyDeleted.length === 0) return;
      const removed = {};
      for (const [id, record] of actuallyDeleted) {
        removed[id] = record;
        this.addDiffForAfterEvent(record, null);
      }
      this.updateHistory({ added: {}, updated: {}, removed });
    });
  }
  /**
   * Get a record by its ID. This creates a reactive subscription to the record.
   *
   * @example
   * ```ts
   * const book = store.get(bookId)
   * if (book) {
   *   console.log(book.title)
   * }
   * ```
   *
   * @param id - The ID of the record to get
   * @returns The record if it exists, undefined otherwise
   * @public
   */
  get(id) {
    return this.records.get(id);
  }
  /**
   * Get a record by its ID without creating a reactive subscription.
   * Use this when you need to access a record but don't want reactive updates.
   *
   * @example
   * ```ts
   * // Won't trigger reactive updates when this record changes
   * const book = store.unsafeGetWithoutCapture(bookId)
   * ```
   *
   * @param id - The ID of the record to get
   * @returns The record if it exists, undefined otherwise
   * @public
   */
  unsafeGetWithoutCapture(id) {
    return this.records.__unsafe__getWithoutCapture(id);
  }
  /**
   * Serialize the store's records to a plain JavaScript object.
   * Only includes records matching the specified scope.
   *
   * @example
   * ```ts
   * // Serialize only document records (default)
   * const documentData = store.serialize('document')
   *
   * // Serialize all records
   * const allData = store.serialize('all')
   * ```
   *
   * @param scope - The scope of records to serialize. Defaults to 'document'
   * @returns The serialized store data
   * @public
   */
  serialize(scope = "document") {
    const result = {};
    for (const [id, record] of this.records) {
      if (scope === "all" || this.scopedTypes[scope].has(record.typeName)) {
        result[id] = record;
      }
    }
    return result;
  }
  /**
   * Get a serialized snapshot of the store and its schema.
   * This includes both the data and schema information needed for proper migration.
   *
   * @example
   * ```ts
   * const snapshot = store.getStoreSnapshot()
   * localStorage.setItem('myApp', JSON.stringify(snapshot))
   *
   * // Later...
   * const saved = JSON.parse(localStorage.getItem('myApp'))
   * store.loadStoreSnapshot(saved)
   * ```
   *
   * @param scope - The scope of records to serialize. Defaults to 'document'
   * @returns A snapshot containing both store data and schema information
   * @public
   */
  getStoreSnapshot(scope = "document") {
    return {
      store: this.serialize(scope),
      schema: this.schema.serialize()
    };
  }
  /**
   * Migrate a serialized snapshot to the current schema version.
   * This applies any necessary migrations to bring old data up to date.
   *
   * @example
   * ```ts
   * const oldSnapshot = JSON.parse(localStorage.getItem('myApp'))
   * const migratedSnapshot = store.migrateSnapshot(oldSnapshot)
   * ```
   *
   * @param snapshot - The snapshot to migrate
   * @returns The migrated snapshot with current schema version
   * @throws Error if migration fails
   * @public
   */
  migrateSnapshot(snapshot) {
    const migrationResult = this.schema.migrateStoreSnapshot(snapshot);
    if (migrationResult.type === "error") {
      throw new Error(`Failed to migrate snapshot: ${migrationResult.reason}`);
    }
    return {
      store: migrationResult.value,
      schema: this.schema.serialize()
    };
  }
  /**
   * Load a serialized snapshot into the store, replacing all current data.
   * The snapshot will be automatically migrated to the current schema version if needed.
   *
   * @example
   * ```ts
   * const snapshot = JSON.parse(localStorage.getItem('myApp'))
   * store.loadStoreSnapshot(snapshot)
   * ```
   *
   * @param snapshot - The snapshot to load
   * @throws Error if migration fails or snapshot is invalid
   * @public
   */
  loadStoreSnapshot(snapshot) {
    const migrationResult = this.schema.migrateStoreSnapshot(snapshot);
    if (migrationResult.type === "error") {
      throw new Error(`Failed to migrate snapshot: ${migrationResult.reason}`);
    }
    const prevSideEffectsEnabled = this.sideEffects.isEnabled();
    try {
      this.sideEffects.setIsEnabled(false);
      this.atomic(() => {
        this.clear();
        this.put(Object.values(migrationResult.value));
        this.ensureStoreIsUsable();
      });
    } finally {
      this.sideEffects.setIsEnabled(prevSideEffectsEnabled);
    }
  }
  /**
   * Get an array of all records in the store.
   *
   * @example
   * ```ts
   * const allRecords = store.allRecords()
   * const books = allRecords.filter(r => r.typeName === 'book')
   * ```
   *
   * @returns An array containing all records in the store
   * @public
   */
  allRecords() {
    return Array.from(this.records.values());
  }
  /**
   * Remove all records from the store.
   *
   * @example
   * ```ts
   * store.clear()
   * console.log(store.allRecords().length) // 0
   * ```
   *
   * @public
   */
  clear() {
    this.remove(Array.from(this.records.keys()));
  }
  /**
   * Update a single record using an updater function. To update multiple records at once,
   * use the `update` method of the `TypedStore` class.
   *
   * @example
   * ```ts
   * store.update(book.id, (book) => ({
   *   ...book,
   *   title: 'Updated Title'
   * }))
   * ```
   *
   * @param id - The ID of the record to update
   * @param updater - A function that receives the current record and returns the updated record
   * @public
   */
  update(id, updater) {
    const existing = this.unsafeGetWithoutCapture(id);
    if (!existing) {
      console.error(`Record ${id} not found. This is probably an error`);
      return;
    }
    this.put([updater(existing)]);
  }
  /**
   * Check whether a record with the given ID exists in the store.
   *
   * @example
   * ```ts
   * if (store.has(bookId)) {
   *   console.log('Book exists!')
   * }
   * ```
   *
   * @param id - The ID of the record to check
   * @returns True if the record exists, false otherwise
   * @public
   */
  has(id) {
    return this.records.has(id);
  }
  /**
   * Add a listener that will be called when the store changes.
   * Returns a function to remove the listener.
   *
   * @example
   * ```ts
   * const removeListener = store.listen((entry) => {
   *   console.log('Changes:', entry.changes)
   *   console.log('Source:', entry.source)
   * })
   *
   * // Listen only to user changes to document records
   * const removeDocumentListener = store.listen(
   *   (entry) => console.log('Document changed:', entry),
   *   { source: 'user', scope: 'document' }
   * )
   *
   * // Later, remove the listener
   * removeListener()
   * ```
   *
   * @param onHistory - The listener function to call when changes occur
   * @param filters - Optional filters to control when the listener is called
   * @returns A function that removes the listener when called
   * @public
   */
  listen(onHistory, filters) {
    this._flushHistory();
    const listener = {
      onHistory,
      filters: {
        source: filters?.source ?? "all",
        scope: filters?.scope ?? "all"
      }
    };
    if (!this.historyReactor.scheduler.isActivelyListening) {
      this.historyReactor.start();
      this.historyReactor.scheduler.execute();
    }
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.historyReactor.stop();
      }
    };
  }
  isMergingRemoteChanges = false;
  /**
   * Merge changes from a remote source. Changes made within the provided function
   * will be marked with source 'remote' instead of 'user'.
   *
   * @example
   * ```ts
   * // Changes from sync/collaboration
   * store.mergeRemoteChanges(() => {
   *   store.put(remoteRecords)
   *   store.remove(deletedIds)
   * })
   * ```
   *
   * @param fn - A function that applies the remote changes
   * @public
   */
  mergeRemoteChanges(fn) {
    if (this.isMergingRemoteChanges) {
      return fn();
    }
    if (this._isInAtomicOp) {
      throw new Error("Cannot merge remote changes while in atomic operation");
    }
    try {
      this.atomic(fn, true, true);
    } finally {
      this.ensureStoreIsUsable();
    }
  }
  /**
   * Run `fn` and return a {@link RecordsDiff} of the changes that occurred as a result.
   */
  extractingChanges(fn) {
    const changes = [];
    const dispose = this.historyAccumulator.addInterceptor((entry) => changes.push(entry.changes));
    try {
      (0, import_state.transact)(fn);
      return (0, import_RecordsDiff.squashRecordDiffs)(changes);
    } finally {
      dispose();
    }
  }
  applyDiff(diff, {
    runCallbacks = true,
    ignoreEphemeralKeys = false
  } = {}) {
    this.atomic(() => {
      const toPut = (0, import_utils.objectMapValues)(diff.added);
      for (const [_from, to] of (0, import_utils.objectMapValues)(diff.updated)) {
        const type = this.schema.getType(to.typeName);
        if (ignoreEphemeralKeys && type.ephemeralKeySet.size) {
          const existing = this.get(to.id);
          if (!existing) {
            toPut.push(to);
            continue;
          }
          let changed = null;
          for (const [key, value] of Object.entries(to)) {
            if (type.ephemeralKeySet.has(key) || Object.is(value, (0, import_utils.getOwnProperty)(existing, key))) {
              continue;
            }
            if (!changed) changed = { ...existing };
            changed[key] = value;
          }
          if (changed) toPut.push(changed);
        } else {
          toPut.push(to);
        }
      }
      const toRemove = (0, import_utils.objectMapKeys)(diff.removed);
      if (toPut.length) {
        this.put(toPut);
      }
      if (toRemove.length) {
        this.remove(toRemove);
      }
    }, runCallbacks);
  }
  /**
   * Create a cache based on values in the store. Pass in a function that takes and ID and a
   * signal for the underlying record. Return a signal (usually a computed) for the cached value.
   * For simple derivations, use {@link Store.createComputedCache}. This function is useful if you
   * need more precise control over intermediate values.
   */
  createCache(create) {
    const cache = new import_utils.WeakCache();
    return {
      get: (id) => {
        const atom2 = this.records.getAtom(id);
        if (!atom2) return void 0;
        return cache.get(atom2, () => create(id, atom2)).get();
      }
    };
  }
  /**
   * Create a computed cache.
   *
   * @param name - The name of the derivation cache.
   * @param derive - A function used to derive the value of the cache.
   * @param opts - Options for the computed cache.
   * @public
   */
  createComputedCache(name, derive, opts) {
    return this.createCache((id, record) => {
      const recordSignal = opts?.areRecordsEqual ? (0, import_state.computed)(`${name}:${id}:isEqual`, () => record.get(), { isEqual: opts.areRecordsEqual }) : record;
      return (0, import_state.computed)(
        name + ":" + id,
        () => {
          return derive(recordSignal.get());
        },
        {
          isEqual: opts?.areResultsEqual
        }
      );
    });
  }
  _integrityChecker;
  /** @internal */
  ensureStoreIsUsable() {
    this.atomic(() => {
      this._integrityChecker ??= this.schema.createIntegrityChecker(this);
      this._integrityChecker?.();
    });
  }
  _isPossiblyCorrupted = false;
  /** @internal */
  markAsPossiblyCorrupted() {
    this._isPossiblyCorrupted = true;
  }
  /** @internal */
  isPossiblyCorrupted() {
    return this._isPossiblyCorrupted;
  }
  pendingAfterEvents = null;
  addDiffForAfterEvent(before, after) {
    (0, import_utils.assert)(this.pendingAfterEvents, "must be in event operation");
    if (before === after) return;
    if (before && after) (0, import_utils.assert)(before.id === after.id);
    if (!before && !after) return;
    const id = (before || after).id;
    const existing = this.pendingAfterEvents.get(id);
    if (existing) {
      existing.after = after;
    } else {
      this.pendingAfterEvents.set(id, { before, after });
    }
  }
  flushAtomicCallbacks(isMergingRemoteChanges) {
    let updateDepth = 0;
    let source = isMergingRemoteChanges ? "remote" : "user";
    while (this.pendingAfterEvents) {
      const events = this.pendingAfterEvents;
      this.pendingAfterEvents = null;
      if (!this.sideEffects.isEnabled()) continue;
      updateDepth++;
      if (updateDepth > 100) {
        throw new Error("Maximum store update depth exceeded, bailing out");
      }
      for (const { before, after } of events.values()) {
        if (before && after && before !== after && !(0, import_utils.isEqual)(before, after)) {
          this.sideEffects.handleAfterChange(before, after, source);
        } else if (before && !after) {
          this.sideEffects.handleAfterDelete(before, source);
        } else if (!before && after) {
          this.sideEffects.handleAfterCreate(after, source);
        }
      }
      if (!this.pendingAfterEvents) {
        this.sideEffects.handleOperationComplete(source);
      } else {
        source = "user";
      }
    }
  }
  _isInAtomicOp = false;
  /** @internal */
  atomic(fn, runCallbacks = true, isMergingRemoteChanges = false) {
    return (0, import_state.transact)(() => {
      if (this._isInAtomicOp) {
        if (!this.pendingAfterEvents) this.pendingAfterEvents = /* @__PURE__ */ new Map();
        const prevSideEffectsEnabled2 = this.sideEffects.isEnabled();
        (0, import_utils.assert)(!isMergingRemoteChanges, "cannot call mergeRemoteChanges while in atomic operation");
        try {
          if (prevSideEffectsEnabled2 && !runCallbacks) {
            this.sideEffects.setIsEnabled(false);
          }
          return fn();
        } finally {
          this.sideEffects.setIsEnabled(prevSideEffectsEnabled2);
        }
      }
      this.pendingAfterEvents = /* @__PURE__ */ new Map();
      const prevSideEffectsEnabled = this.sideEffects.isEnabled();
      this.sideEffects.setIsEnabled(runCallbacks ?? prevSideEffectsEnabled);
      this._isInAtomicOp = true;
      if (isMergingRemoteChanges) {
        this.isMergingRemoteChanges = true;
      }
      try {
        const result = fn();
        this.isMergingRemoteChanges = false;
        this.flushAtomicCallbacks(isMergingRemoteChanges);
        return result;
      } finally {
        this.pendingAfterEvents = null;
        this.sideEffects.setIsEnabled(prevSideEffectsEnabled);
        this._isInAtomicOp = false;
        this.isMergingRemoteChanges = false;
      }
    });
  }
  /** @internal */
  addHistoryInterceptor(fn) {
    return this.historyAccumulator.addInterceptor(
      (entry) => fn(entry, this.isMergingRemoteChanges ? "remote" : "user")
    );
  }
}
function squashHistoryEntries(entries) {
  if (entries.length === 0) return [];
  const chunked = [];
  let chunk = [entries[0]];
  let entry;
  for (let i = 1, n = entries.length; i < n; i++) {
    entry = entries[i];
    if (chunk[0].source !== entry.source) {
      chunked.push(chunk);
      chunk = [];
    }
    chunk.push(entry);
  }
  chunked.push(chunk);
  return (0, import_devFreeze.devFreeze)(
    chunked.map((chunk2) => ({
      source: chunk2[0].source,
      changes: (0, import_RecordsDiff.squashRecordDiffs)(chunk2.map((e) => e.changes))
    }))
  );
}
class HistoryAccumulator {
  _history = [];
  _interceptors = /* @__PURE__ */ new Set();
  /**
   * Add an interceptor that will be called for each history entry.
   * Returns a function to remove the interceptor.
   */
  addInterceptor(fn) {
    this._interceptors.add(fn);
    return () => {
      this._interceptors.delete(fn);
    };
  }
  /**
   * Add a history entry to the accumulator.
   * Calls all registered interceptors with the entry.
   */
  add(entry) {
    this._history.push(entry);
    for (const interceptor of this._interceptors) {
      interceptor(entry);
    }
  }
  /**
   * Flush all accumulated history entries, squashing adjacent entries from the same source.
   * Clears the internal history buffer.
   */
  flush() {
    const history = squashHistoryEntries(this._history);
    this._history = [];
    return history;
  }
  /**
   * Clear all accumulated history entries without flushing.
   */
  clear() {
    this._history = [];
  }
  /**
   * Check if there are any accumulated history entries.
   */
  hasChanges() {
    return this._history.length > 0;
  }
}
function createComputedCache(name, derive, opts) {
  const cache = new import_utils.WeakCache();
  return {
    get(context, id) {
      const computedCache = cache.get(context, () => {
        const store = context instanceof Store ? context : context.store;
        return store.createComputedCache(name, (record) => derive(context, record), opts);
      });
      return computedCache.get(id);
    }
  };
}
//# sourceMappingURL=Store.js.map
