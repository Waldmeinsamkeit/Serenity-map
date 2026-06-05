import {
  assert,
  exhaustiveSwitchError,
  getOwnProperty,
  isEqual,
  objectMapEntries,
  Result,
  structuredClone
} from "@tldraw/utils";
import { devFreeze } from "./devFreeze.mjs";
import {
  MigrationFailureReason,
  parseMigrationId,
  sortMigrations,
  validateMigrations
} from "./migrate.mjs";
function upgradeSchema(schema) {
  if (schema.schemaVersion > 2 || schema.schemaVersion < 1) return Result.err("Bad schema version");
  if (schema.schemaVersion === 2) return Result.ok(schema);
  const result = {
    schemaVersion: 2,
    sequences: {
      "com.tldraw.store": schema.storeVersion
    }
  };
  for (const [typeName, recordVersion] of Object.entries(schema.recordVersions)) {
    result.sequences[`com.tldraw.${typeName}`] = recordVersion.version;
    if ("subTypeKey" in recordVersion) {
      for (const [subType, version] of Object.entries(recordVersion.subTypeVersions)) {
        result.sequences[`com.tldraw.${typeName}.${subType}`] = version;
      }
    }
  }
  return Result.ok(result);
}
class StoreSchema {
  constructor(types, options) {
    this.types = types;
    this.options = options;
    for (const m of options.migrations ?? []) {
      assert(!this.migrations[m.sequenceId], `Duplicate migration sequenceId ${m.sequenceId}`);
      validateMigrations(m);
      this.migrations[m.sequenceId] = m;
    }
    const allMigrations = Object.values(this.migrations).flatMap((m) => m.sequence);
    this.sortedMigrations = sortMigrations(allMigrations);
    for (const migration of this.sortedMigrations) {
      if (!migration.dependsOn?.length) continue;
      for (const dep of migration.dependsOn) {
        const depMigration = allMigrations.find((m) => m.id === dep);
        assert(depMigration, `Migration '${migration.id}' depends on missing migration '${dep}'`);
      }
    }
  }
  /**
   * Creates a new StoreSchema with the given record types and options.
   *
   * This static factory method is the recommended way to create a StoreSchema.
   * It ensures type safety while providing a clean API for schema definition.
   *
   * @param types - Object mapping type names to their RecordType definitions
   * @param options - Optional configuration for migrations, validation, and integrity checking
   * @returns A new StoreSchema instance
   *
   * @example
   * ```ts
   * const Book = createRecordType<Book>('book', { scope: 'document' })
   * const Author = createRecordType<Author>('author', { scope: 'document' })
   *
   * const schema = StoreSchema.create(
   *   {
   *     book: Book,
   *     author: Author
   *   },
   *   {
   *     migrations: [bookMigrations],
   *     onValidationFailure: (failure) => failure.record
   *   }
   * )
   * ```
   *
   * @public
   */
  static create(types, options) {
    return new StoreSchema(types, options ?? {});
  }
  migrations = {};
  sortedMigrations;
  migrationCache = /* @__PURE__ */ new WeakMap();
  /**
   * Validates a record using its corresponding RecordType validator.
   *
   * This method ensures that records conform to their type definitions before
   * being stored. If validation fails and an onValidationFailure handler is
   * provided, it will be called to potentially recover from the error.
   *
   * @param store - The store instance where validation is occurring
   * @param record - The record to validate
   * @param phase - The lifecycle phase where validation is happening
   * @param recordBefore - The previous version of the record (for updates)
   * @returns The validated record, potentially modified by validation failure handler
   *
   * @example
   * ```ts
   * try {
   *   const validatedBook = schema.validateRecord(
   *     store,
   *     { id: 'book:1', typeName: 'book', title: '', author: 'Jane Doe' },
   *     'createRecord',
   *     null
   *   )
   * } catch (error) {
   *   console.error('Record validation failed:', error)
   * }
   * ```
   *
   * @public
   */
  validateRecord(store, record, phase, recordBefore) {
    try {
      const recordType = getOwnProperty(this.types, record.typeName);
      if (!recordType) {
        throw new Error(`Missing definition for record type ${record.typeName}`);
      }
      return recordType.validate(record, recordBefore ?? void 0);
    } catch (error) {
      if (this.options.onValidationFailure) {
        return this.options.onValidationFailure({
          store,
          record,
          phase,
          recordBefore,
          error
        });
      } else {
        throw error;
      }
    }
  }
  /**
   * Gets all migrations that need to be applied to upgrade from a persisted schema
   * to the current schema version.
   *
   * This method compares the persisted schema with the current schema and determines
   * which migrations need to be applied to bring the data up to date. It handles
   * both regular migrations and retroactive migrations, and caches results for
   * performance.
   *
   * @param persistedSchema - The schema version that was previously persisted
   * @returns A Result containing the list of migrations to apply, or an error message
   *
   * @example
   * ```ts
   * const persistedSchema = {
   *   schemaVersion: 2,
   *   sequences: { 'com.tldraw.book': 1, 'com.tldraw.author': 0 }
   * }
   *
   * const migrationsResult = schema.getMigrationsSince(persistedSchema)
   * if (migrationsResult.ok) {
   *   console.log('Migrations to apply:', migrationsResult.value.length)
   *   // Apply each migration to bring data up to date
   * }
   * ```
   *
   * @public
   */
  getMigrationsSince(persistedSchema) {
    const cached = this.migrationCache.get(persistedSchema);
    if (cached) {
      return cached;
    }
    const upgradeResult = upgradeSchema(persistedSchema);
    if (!upgradeResult.ok) {
      this.migrationCache.set(persistedSchema, upgradeResult);
      return upgradeResult;
    }
    const schema = upgradeResult.value;
    const sequenceIdsToInclude = new Set(
      // start with any shared sequences
      Object.keys(schema.sequences).filter((sequenceId) => this.migrations[sequenceId])
    );
    for (const sequenceId in this.migrations) {
      if (schema.sequences[sequenceId] === void 0 && this.migrations[sequenceId].retroactive) {
        sequenceIdsToInclude.add(sequenceId);
      }
    }
    if (sequenceIdsToInclude.size === 0) {
      const result2 = Result.ok([]);
      this.migrationCache.set(persistedSchema, result2);
      return result2;
    }
    const allMigrationsToInclude = /* @__PURE__ */ new Set();
    for (const sequenceId of sequenceIdsToInclude) {
      const theirVersion = schema.sequences[sequenceId];
      if (typeof theirVersion !== "number" && this.migrations[sequenceId].retroactive || theirVersion === 0) {
        for (const migration of this.migrations[sequenceId].sequence) {
          allMigrationsToInclude.add(migration.id);
        }
        continue;
      }
      const theirVersionId = `${sequenceId}/${theirVersion}`;
      const idx = this.migrations[sequenceId].sequence.findIndex((m) => m.id === theirVersionId);
      if (idx === -1) {
        const result2 = Result.err("Incompatible schema?");
        this.migrationCache.set(persistedSchema, result2);
        return result2;
      }
      for (const migration of this.migrations[sequenceId].sequence.slice(idx + 1)) {
        allMigrationsToInclude.add(migration.id);
      }
    }
    const result = Result.ok(
      this.sortedMigrations.filter(({ id }) => allMigrationsToInclude.has(id))
    );
    this.migrationCache.set(persistedSchema, result);
    return result;
  }
  /**
   * Migrates a single persisted record to match the current schema version.
   *
   * This method applies the necessary migrations to transform a record from an
   * older (or newer) schema version to the current version. It supports both
   * forward ('up') and backward ('down') migrations.
   *
   * @param record - The record to migrate
   * @param persistedSchema - The schema version the record was persisted with
   * @param direction - Direction to migrate ('up' for newer, 'down' for older)
   * @returns A MigrationResult containing the migrated record or an error
   *
   * @example
   * ```ts
   * const oldRecord = { id: 'book:1', typeName: 'book', title: 'Old Title', publishDate: '2020-01-01' }
   * const oldSchema = { schemaVersion: 2, sequences: { 'com.tldraw.book': 1 } }
   *
   * const result = schema.migratePersistedRecord(oldRecord, oldSchema, 'up')
   * if (result.type === 'success') {
   *   console.log('Migrated record:', result.value)
   *   // Record now has publishedYear instead of publishDate
   * } else {
   *   console.error('Migration failed:', result.reason)
   * }
   * ```
   *
   * @public
   */
  migratePersistedRecord(record, persistedSchema, direction = "up") {
    const migrations = this.getMigrationsSince(persistedSchema);
    if (!migrations.ok) {
      console.error("Error migrating record", migrations.error);
      return { type: "error", reason: MigrationFailureReason.MigrationError };
    }
    let migrationsToApply = migrations.value;
    if (migrationsToApply.length === 0) {
      return { type: "success", value: record };
    }
    if (!migrationsToApply.every((m) => m.scope === "record")) {
      return {
        type: "error",
        reason: direction === "down" ? MigrationFailureReason.TargetVersionTooOld : MigrationFailureReason.TargetVersionTooNew
      };
    }
    if (direction === "down") {
      if (!migrationsToApply.every((m) => m.scope === "record" && m.down)) {
        return {
          type: "error",
          reason: MigrationFailureReason.TargetVersionTooOld
        };
      }
      migrationsToApply = migrationsToApply.slice().reverse();
    }
    record = structuredClone(record);
    try {
      for (const migration of migrationsToApply) {
        if (migration.scope === "store") throw new Error(
          /* won't happen, just for TS */
        );
        if (migration.scope === "storage") throw new Error(
          /* won't happen, just for TS */
        );
        const shouldApply = migration.filter ? migration.filter(record) : true;
        if (!shouldApply) continue;
        const result = migration[direction](record);
        if (result) {
          record = structuredClone(result);
        }
      }
    } catch (e) {
      console.error("Error migrating record", e);
      return { type: "error", reason: MigrationFailureReason.MigrationError };
    }
    return { type: "success", value: record };
  }
  migrateStorage(storage) {
    const schema = storage.getSchema();
    assert(schema, "Schema is missing.");
    const migrations = this.getMigrationsSince(schema);
    if (!migrations.ok) {
      console.error("Error migrating store", migrations.error);
      throw new Error(migrations.error);
    }
    const migrationsToApply = migrations.value;
    if (migrationsToApply.length === 0) {
      return;
    }
    storage.setSchema(this.serialize());
    for (const migration of migrationsToApply) {
      if (migration.scope === "record") {
        const updates = [];
        for (const [id, state] of storage.entries()) {
          const shouldApply = migration.filter ? migration.filter(state) : true;
          if (!shouldApply) continue;
          const record = structuredClone(state);
          const result = migration.up(record) ?? record;
          if (!isEqual(result, state)) {
            updates.push([id, result]);
          }
        }
        for (const [id, record] of updates) {
          storage.set(id, record);
        }
      } else if (migration.scope === "store") {
        const prevStore = Object.fromEntries(storage.entries());
        let nextStore = structuredClone(prevStore);
        nextStore = migration.up(nextStore) ?? nextStore;
        for (const [id, state] of Object.entries(nextStore)) {
          if (!state) continue;
          if (!isEqual(state, prevStore[id])) {
            storage.set(id, state);
          }
        }
        for (const id of Object.keys(prevStore)) {
          if (!nextStore[id]) {
            storage.delete(id);
          }
        }
      } else if (migration.scope === "storage") {
        migration.up(storage);
      } else {
        exhaustiveSwitchError(migration);
      }
    }
    for (const [id, state] of storage.entries()) {
      if (this.getType(state.typeName).scope !== "document") {
        storage.delete(id);
      }
    }
  }
  /**
   * Migrates an entire store snapshot to match the current schema version.
   *
   * This method applies all necessary migrations to bring a persisted store
   * snapshot up to the current schema version. It handles both record-level
   * and store-level migrations, and can optionally mutate the input store
   * for performance.
   *
   * @param snapshot - The store snapshot containing data and schema information
   * @param opts - Options controlling migration behavior
   *   - mutateInputStore - Whether to modify the input store directly (default: false)
   * @returns A MigrationResult containing the migrated store or an error
   *
   * @example
   * ```ts
   * const snapshot = {
   *   schema: { schemaVersion: 2, sequences: { 'com.tldraw.book': 1 } },
   *   store: {
   *     'book:1': { id: 'book:1', typeName: 'book', title: 'Old Book', publishDate: '2020-01-01' }
   *   }
   * }
   *
   * const result = schema.migrateStoreSnapshot(snapshot)
   * if (result.type === 'success') {
   *   console.log('Migrated store:', result.value)
   *   // All records are now at current schema version
   * }
   * ```
   *
   * @public
   */
  migrateStoreSnapshot(snapshot, opts) {
    const migrations = this.getMigrationsSince(snapshot.schema);
    if (!migrations.ok) {
      console.error("Error migrating store", migrations.error);
      return { type: "error", reason: MigrationFailureReason.MigrationError };
    }
    const migrationsToApply = migrations.value;
    if (migrationsToApply.length === 0) {
      return { type: "success", value: snapshot.store };
    }
    const store = Object.assign(
      new Map(objectMapEntries(snapshot.store).map(devFreeze)),
      {
        getSchema: () => snapshot.schema,
        setSchema: (_) => {
        }
      }
    );
    try {
      this.migrateStorage(store);
      if (opts?.mutateInputStore) {
        for (const [id, record] of store.entries()) {
          snapshot.store[id] = record;
        }
        for (const id of Object.keys(snapshot.store)) {
          if (!store.has(id)) {
            delete snapshot.store[id];
          }
        }
        return { type: "success", value: snapshot.store };
      } else {
        return {
          type: "success",
          value: Object.fromEntries(store.entries())
        };
      }
    } catch (e) {
      console.error("Error migrating store", e);
      return { type: "error", reason: MigrationFailureReason.MigrationError };
    }
  }
  /**
   * Creates an integrity checker function for the given store.
   *
   * This method calls the createIntegrityChecker option if provided, allowing
   * custom integrity checking logic to be set up for the store. The integrity
   * checker is used to validate store consistency and catch data corruption.
   *
   * @param store - The store instance to create an integrity checker for
   * @returns An integrity checker function, or undefined if none is configured
   *
   * @internal
   */
  createIntegrityChecker(store) {
    return this.options.createIntegrityChecker?.(store) ?? void 0;
  }
  /**
   * Serializes the current schema to a SerializedSchemaV2 format.
   *
   * This method creates a serialized representation of the current schema,
   * capturing the latest version number for each migration sequence.
   * The result can be persisted and later used to determine what migrations
   * need to be applied when loading data.
   *
   * @returns A SerializedSchemaV2 object representing the current schema state
   *
   * @example
   * ```ts
   * const serialized = schema.serialize()
   * console.log(serialized)
   * // {
   * //   schemaVersion: 2,
   * //   sequences: {
   * //     'com.tldraw.book': 3,
   * //     'com.tldraw.author': 2
   * //   }
   * // }
   *
   * // Store this with your data for future migrations
   * localStorage.setItem('schema', JSON.stringify(serialized))
   * ```
   *
   * @public
   */
  serialize() {
    return {
      schemaVersion: 2,
      sequences: Object.fromEntries(
        Object.values(this.migrations).map(({ sequenceId, sequence }) => [
          sequenceId,
          sequence.length ? parseMigrationId(sequence.at(-1).id).version : 0
        ])
      )
    };
  }
  /**
   * Serializes a schema representing the earliest possible version.
   *
   * This method creates a serialized schema where all migration sequences
   * are set to version 0, representing the state before any migrations
   * have been applied. This is used in specific legacy scenarios.
   *
   * @returns A SerializedSchema with all sequences set to version 0
   *
   * @deprecated This is only here for legacy reasons, don't use it unless you have david's blessing!
   * @internal
   */
  serializeEarliestVersion() {
    return {
      schemaVersion: 2,
      sequences: Object.fromEntries(
        Object.values(this.migrations).map(({ sequenceId }) => [sequenceId, 0])
      )
    };
  }
  /**
   * Gets the RecordType definition for a given type name.
   *
   * This method retrieves the RecordType associated with the specified
   * type name, which contains the record's validation, creation, and
   * other behavioral logic.
   *
   * @param typeName - The name of the record type to retrieve
   * @returns The RecordType definition for the specified type
   *
   * @throws Will throw an error if the record type does not exist
   *
   * @internal
   */
  getType(typeName) {
    const type = getOwnProperty(this.types, typeName);
    assert(type, "record type does not exists");
    return type;
  }
}
export {
  StoreSchema,
  upgradeSchema
};
//# sourceMappingURL=StoreSchema.mjs.map
