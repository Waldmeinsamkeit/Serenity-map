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
var localStorageAtom_exports = {};
__export(localStorageAtom_exports, {
  localStorageAtom: () => localStorageAtom
});
module.exports = __toCommonJS(localStorageAtom_exports);
var import_utils = require("@tldraw/utils");
var import_Atom = require("./Atom");
var import_EffectScheduler = require("./EffectScheduler");
function localStorageAtom(name, initialValue, options) {
  let _initialValue = initialValue;
  try {
    const value = (0, import_utils.getFromLocalStorage)(name);
    if (value) {
      _initialValue = JSON.parse(value);
    }
  } catch {
    (0, import_utils.deleteFromLocalStorage)(name);
  }
  const outAtom = (0, import_Atom.atom)(name, _initialValue, options);
  const reactCleanup = (0, import_EffectScheduler.react)(`save ${name} to localStorage`, () => {
    (0, import_utils.setInLocalStorage)(name, JSON.stringify(outAtom.get()));
  });
  const handleStorageEvent = (event) => {
    if (event.key !== name) return;
    if (event.newValue === null) {
      outAtom.set(initialValue);
      return;
    }
    try {
      const newValue = JSON.parse(event.newValue);
      outAtom.set(newValue);
    } catch {
    }
  };
  window.addEventListener("storage", handleStorageEvent);
  const cleanup = () => {
    reactCleanup();
    window.removeEventListener("storage", handleStorageEvent);
  };
  return [outAtom, cleanup];
}
//# sourceMappingURL=localStorageAtom.js.map
