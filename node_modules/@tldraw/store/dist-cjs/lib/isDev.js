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
var isDev_exports = {};
__export(isDev_exports, {
  isDev: () => isDev
});
module.exports = __toCommonJS(isDev_exports);
const import_meta = {};
let _isDev = false;
try {
  _isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
} catch (_e) {
}
try {
  _isDev = _isDev || import_meta.env.DEV || import_meta.env.TEST || import_meta.env.MODE === "development" || import_meta.env.MODE === "test";
} catch (_e) {
}
function isDev() {
  return _isDev;
}
//# sourceMappingURL=isDev.js.map
