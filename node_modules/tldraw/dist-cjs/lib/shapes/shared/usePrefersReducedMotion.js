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
var usePrefersReducedMotion_exports = {};
__export(usePrefersReducedMotion_exports, {
  usePrefersReducedMotion: () => usePrefersReducedMotion
});
module.exports = __toCommonJS(usePrefersReducedMotion_exports);
var import_editor = require("@tldraw/editor");
var import_react = require("react");
function usePrefersReducedMotion() {
  const editor = (0, import_editor.useMaybeEditor)();
  const animationSpeed = (0, import_editor.useValue)("animationSpeed", () => editor?.user.getAnimationSpeed(), [
    editor
  ]);
  const [prefersReducedMotion, setPrefersReducedMotion] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    if (animationSpeed !== void 0) {
      setPrefersReducedMotion(animationSpeed === 0 ? true : false);
      return;
    }
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => {
      setPrefersReducedMotion(mql.matches);
    };
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [animationSpeed]);
  return prefersReducedMotion;
}
//# sourceMappingURL=usePrefersReducedMotion.js.map
