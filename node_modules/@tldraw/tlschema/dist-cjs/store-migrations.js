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
var store_migrations_exports = {};
__export(store_migrations_exports, {
  storeMigrations: () => storeMigrations,
  storeVersions: () => Versions
});
module.exports = __toCommonJS(store_migrations_exports);
var import_store = require("@tldraw/store");
var import_utils = require("@tldraw/utils");
const Versions = (0, import_store.createMigrationIds)("com.tldraw.store", {
  RemoveCodeAndIconShapeTypes: 1,
  AddInstancePresenceType: 2,
  RemoveTLUserAndPresenceAndAddPointer: 3,
  RemoveUserDocument: 4,
  FixIndexKeys: 5
});
const storeMigrations = (0, import_store.createMigrationSequence)({
  sequenceId: "com.tldraw.store",
  retroactive: false,
  sequence: [
    {
      id: Versions.RemoveCodeAndIconShapeTypes,
      scope: "storage",
      up: (storage) => {
        for (const [id, record] of storage.entries()) {
          if (record.typeName === "shape" && "type" in record && (record.type === "icon" || record.type === "code")) {
            storage.delete(id);
          }
        }
      }
    },
    {
      id: Versions.AddInstancePresenceType,
      scope: "storage",
      up(_storage) {
      }
    },
    {
      // remove user and presence records and add pointer records
      id: Versions.RemoveTLUserAndPresenceAndAddPointer,
      scope: "storage",
      up: (storage) => {
        for (const [id, record] of storage.entries()) {
          if (record.typeName.match(/^(user|user_presence)$/)) {
            storage.delete(id);
          }
        }
      }
    },
    {
      // remove user document records
      id: Versions.RemoveUserDocument,
      scope: "storage",
      up: (storage) => {
        for (const [id, record] of storage.entries()) {
          if (record.typeName.match("user_document")) {
            storage.delete(id);
          }
        }
      }
    },
    {
      id: Versions.FixIndexKeys,
      scope: "record",
      up: (record) => {
        if (["shape", "page"].includes(record.typeName) && "index" in record) {
          const recordWithIndex = record;
          if (recordWithIndex.index.endsWith("0") && recordWithIndex.index !== "a0") {
            recordWithIndex.index = recordWithIndex.index.slice(0, -1) + getNRandomBase62Digits(3);
          }
          if (record.typeName === "shape" && recordWithIndex.type === "line") {
            const lineShape = recordWithIndex;
            for (const [_, point] of (0, import_utils.objectMapEntries)(lineShape.props.points)) {
              if (point.index.endsWith("0") && point.index !== "a0") {
                point.index = point.index.slice(0, -1) + getNRandomBase62Digits(3);
              }
            }
          }
        }
      },
      down: () => {
      }
    }
  ]
});
const BASE_62_DIGITS_WITHOUT_ZERO = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const getRandomBase62Digit = () => {
  return BASE_62_DIGITS_WITHOUT_ZERO.charAt(
    Math.floor(Math.random() * BASE_62_DIGITS_WITHOUT_ZERO.length)
  );
};
const getNRandomBase62Digits = (n) => {
  return Array.from({ length: n }, getRandomBase62Digit).join("");
};
//# sourceMappingURL=store-migrations.js.map
