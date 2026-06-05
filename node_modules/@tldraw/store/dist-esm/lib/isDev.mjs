let _isDev = false;
try {
  _isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
} catch (_e) {
}
try {
  _isDev = _isDev || import.meta.env.DEV || import.meta.env.TEST || import.meta.env.MODE === "development" || import.meta.env.MODE === "test";
} catch (_e) {
}
function isDev() {
  return _isDev;
}
export {
  isDev
};
//# sourceMappingURL=isDev.mjs.map
