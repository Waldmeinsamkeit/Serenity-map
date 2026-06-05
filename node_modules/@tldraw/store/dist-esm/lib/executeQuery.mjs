import { intersectSets } from "./setUtils.mjs";
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
  return intersectSets(Object.values(matchIds));
}
export {
  executeQuery,
  objectMatchesQuery
};
//# sourceMappingURL=executeQuery.mjs.map
