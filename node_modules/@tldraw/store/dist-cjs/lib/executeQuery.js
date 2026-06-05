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
var executeQuery_exports = {};
__export(executeQuery_exports, {
  executeQuery: () => executeQuery,
  objectMatchesQuery: () => objectMatchesQuery
});
module.exports = __toCommonJS(executeQuery_exports);
var import_setUtils = require("./setUtils");
function isQueryValueMatcher(value) {
  if (typeof value !== "object" || value === null) return false;
  return "eq" in value || "neq" in value || "gt" in value;
}
function extractMatcherPaths(query, prefix = "") {
  const paths = [];
  for (const [key, value] of Object.entries(query)) {
    const currentPath = prefix ? `${prefix}\\${key}` : key;
    if (isQueryValueMatcher(value)) {
      paths.push({ path: currentPath, matcher: value });
    } else if (typeof value === "object" && value !== null) {
      paths.push(...extractMatcherPaths(value, currentPath));
    }
  }
  return paths;
}
function objectMatchesQuery(query, object) {
  for (const [key, matcher] of Object.entries(query)) {
    const value = object[key];
    if (isQueryValueMatcher(matcher)) {
      if ("eq" in matcher && value !== matcher.eq) return false;
      if ("neq" in matcher && value === matcher.neq) return false;
      if ("gt" in matcher && (typeof value !== "number" || value <= matcher.gt)) return false;
      continue;
    }
    if (typeof value !== "object" || value === null) return false;
    if (!objectMatchesQuery(matcher, value)) {
      return false;
    }
  }
  return true;
}
function executeQuery(store, typeName, query) {
  const matcherPaths = extractMatcherPaths(query);
  const matchIds = Object.fromEntries(matcherPaths.map(({ path }) => [path, /* @__PURE__ */ new Set()]));
  for (const { path, matcher } of matcherPaths) {
    const index = store.index(typeName, path);
    if ("eq" in matcher) {
      const ids = index.get().get(matcher.eq);
      if (ids) {
        for (const id of ids) {
          matchIds[path].add(id);
        }
      }
    } else if ("neq" in matcher) {
      for (const [value, ids] of index.get()) {
        if (value !== matcher.neq) {
          for (const id of ids) {
            matchIds[path].add(id);
          }
        }
      }
    } else if ("gt" in matcher) {
      for (const [value, ids] of index.get()) {
        if (typeof value === "number" && value > matcher.gt) {
          for (const id of ids) {
            matchIds[path].add(id);
          }
        }
      }
    }
    if (matchIds[path].size === 0) {
      return /* @__PURE__ */ new Set();
    }
  }
  return (0, import_setUtils.intersectSets)(Object.values(matchIds));
}
//# sourceMappingURL=executeQuery.js.map
