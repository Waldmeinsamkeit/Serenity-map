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
var RecordType_exports = {};
__export(RecordType_exports, {
  RecordType: () => RecordType,
  assertIdType: () => assertIdType,
  createRecordType: () => createRecordType
});
module.exports = __toCommonJS(RecordType_exports);
var import_utils = require("@tldraw/utils");
class RecordType {
  /**
   * Creates a new RecordType instance.
   *
   * typeName - The unique type name for records created by this RecordType
   * config - Configuration object for the RecordType
   *   - createDefaultProperties - Function that returns default properties for new records
   *   - validator - Optional validator function for record validation
   *   - scope - Optional scope determining persistence behavior (defaults to 'document')
   *   - ephemeralKeys - Optional mapping of property names to ephemeral status
   * @public
   */
  constructor(typeName, config) {
    this.typeName = typeName;
    this.createDefaultProperties = config.createDefaultProperties;
    this.validator = config.validator ?? { validate: (r) => r };
    this.scope = config.scope ?? "document";
    this.ephemeralKeys = config.ephemeralKeys;
    const ephemeralKeySet = /* @__PURE__ */ new Set();
    if (config.ephemeralKeys) {
      for (const [key, isEphemeral] of (0, import_utils.objectMapEntries)(config.ephemeralKeys)) {
        if (isEphemeral) ephemeralKeySet.add(key);
      }
    }
    this.ephemeralKeySet = ephemeralKeySet;
  }
  /**
   * Factory function that creates default properties for new records.
   * @public
   */
  createDefaultProperties;
  /**
   * Validator function used to validate records of this type.
   * @public
   */
  validator;
  /**
   * Optional configuration specifying which record properties are ephemeral.
   * Ephemeral properties are not included in snapshots or synchronization.
   * @public
   */
  ephemeralKeys;
  /**
   * Set of property names that are marked as ephemeral for efficient lookup.
   * @public
   */
  ephemeralKeySet;
  /**
   * The scope that determines how records of this type are persisted and synchronized.
   * @public
   */
  scope;
  /**
   * Creates a new record of this type with the given properties.
   *
   * Properties are merged with default properties from the RecordType configuration.
   * If no id is provided, a unique id will be generated automatically.
   *
   * @example
   * ```ts
   * const book = Book.create({
   *   title: 'The Great Gatsby',
   *   author: 'F. Scott Fitzgerald'
   * })
   * // Result: { id: 'book:abc123', typeName: 'book', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', inStock: true }
   * ```
   *
   * @param properties - The properties for the new record, including both required and optional fields
   * @returns The newly created record with generated id and typeName
   * @public
   */
  create(properties) {
    const result = {
      ...this.createDefaultProperties(),
      id: "id" in properties ? properties.id : this.createId()
    };
    for (const [k, v] of Object.entries(properties)) {
      if (v !== void 0) {
        result[k] = v;
      }
    }
    result.typeName = this.typeName;
    return result;
  }
  /**
   * Creates a deep copy of an existing record with a new unique id.
   *
   * This method performs a deep clone of all properties while generating a fresh id,
   * making it useful for duplicating records without id conflicts.
   *
   * @example
   * ```ts
   * const originalBook = Book.create({ title: '1984', author: 'George Orwell' })
   * const duplicatedBook = Book.clone(originalBook)
   * // duplicatedBook has same properties but different id
   * ```
   *
   * @param record - The record to clone
   * @returns A new record with the same properties but a different id
   * @public
   */
  clone(record) {
    return { ...(0, import_utils.structuredClone)(record), id: this.createId() };
  }
  /**
   * Create a new ID for this record type.
   *
   * @example
   *
   * ```ts
   * const id = recordType.createId()
   * ```
   *
   * @returns The new ID.
   * @public
   */
  createId(customUniquePart) {
    return this.typeName + ":" + (customUniquePart ?? (0, import_utils.uniqueId)());
  }
  /**
   * Extracts the unique identifier part from a full record id.
   *
   * Record ids have the format `typeName:uniquePart`. This method returns just the unique part.
   *
   * @example
   * ```ts
   * const bookId = Book.createId() // 'book:abc123'
   * const uniquePart = Book.parseId(bookId) // 'abc123'
   * ```
   *
   * @param id - The full record id to parse
   * @returns The unique identifier portion after the colon
   * @throws Error if the id is not valid for this record type
   * @public
   */
  parseId(id) {
    if (!this.isId(id)) {
      throw new Error(`ID "${id}" is not a valid ID for type "${this.typeName}"`);
    }
    return id.slice(this.typeName.length + 1);
  }
  /**
   * Type guard that checks whether a record belongs to this RecordType.
   *
   * This method performs a runtime check by comparing the record's typeName
   * against this RecordType's typeName.
   *
   * @example
   * ```ts
   * if (Book.isInstance(someRecord)) {
   *   // someRecord is now typed as a book record
   *   console.log(someRecord.title)
   * }
   * ```
   *
   * @param record - The record to check, may be undefined
   * @returns True if the record is an instance of this record type
   * @public
   */
  isInstance(record) {
    return record?.typeName === this.typeName;
  }
  /**
   * Type guard that checks whether an id string belongs to this RecordType.
   *
   * Validates that the id starts with this RecordType's typeName followed by a colon.
   * This is more efficient than parsing the full id when you only need to verify the type.
   *
   * @example
   * ```ts
   * if (Book.isId(someId)) {
   *   // someId is now typed as IdOf<BookRecord>
   *   const book = store.get(someId)
   * }
   * ```
   *
   * @param id - The id string to check, may be undefined
   * @returns True if the id belongs to this record type
   * @public
   */
  isId(id) {
    if (!id) return false;
    for (let i = 0; i < this.typeName.length; i++) {
      if (id[i] !== this.typeName[i]) return false;
    }
    return id[this.typeName.length] === ":";
  }
  /**
   * Create a new RecordType that has the same type name as this RecordType and includes the given
   * default properties.
   *
   * @example
   *
   * ```ts
   * const authorType = createRecordType('author', () => ({ living: true }))
   * const deadAuthorType = authorType.withDefaultProperties({ living: false })
   * ```
   *
   * @param createDefaultProperties - A function that returns the default properties of the new RecordType.
   * @returns The new RecordType.
   */
  withDefaultProperties(createDefaultProperties) {
    return new RecordType(this.typeName, {
      createDefaultProperties,
      validator: this.validator,
      scope: this.scope,
      ephemeralKeys: this.ephemeralKeys
    });
  }
  /**
   * Validates a record against this RecordType's validator and returns it with proper typing.
   *
   * This method runs the configured validator function and throws an error if validation fails.
   * If a previous version of the record is provided, it may use optimized validation.
   *
   * @example
   * ```ts
   * try {
   *   const validBook = Book.validate(untrustedData)
   *   // validBook is now properly typed and validated
   * } catch (error) {
   *   console.log('Validation failed:', error.message)
   * }
   * ```
   *
   * @param record - The unknown record data to validate
   * @param recordBefore - Optional previous version for optimized validation
   * @returns The validated and properly typed record
   * @throws Error if validation fails
   * @public
   */
  validate(record, recordBefore) {
    if (recordBefore && this.validator.validateUsingKnownGoodVersion) {
      return this.validator.validateUsingKnownGoodVersion(recordBefore, record);
    }
    return this.validator.validate(record);
  }
}
function createRecordType(typeName, config) {
  return new RecordType(typeName, {
    createDefaultProperties: () => ({}),
    validator: config.validator,
    scope: config.scope,
    ephemeralKeys: config.ephemeralKeys
  });
}
function assertIdType(id, type) {
  if (!id || !type.isId(id)) {
    throw new Error(`string ${JSON.stringify(id)} is not a valid ${type.typeName} id`);
  }
}
//# sourceMappingURL=RecordType.js.map
