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
var useShapeCulling_exports = {};
__export(useShapeCulling_exports, {
  ShapeCullingProvider: () => ShapeCullingProvider,
  useShapeCulling: () => useShapeCulling
});
module.exports = __toCommonJS(useShapeCulling_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_react = require("react");
var import_dom = require("../utils/dom");
const ShapeCullingContext = (0, import_react.createContext)(null);
function ShapeCullingProvider({ children }) {
  const containersRef = (0, import_react.useRef)(/* @__PURE__ */ new Map());
  const register = (0, import_react.useCallback)(
    (id, container, bgContainer, isCulled) => {
      const display = isCulled ? "none" : "block";
      (0, import_dom.setStyleProperty)(container, "display", display);
      (0, import_dom.setStyleProperty)(bgContainer, "display", display);
      containersRef.current.set(id, {
        container,
        bgContainer,
        isCulled
      });
    },
    []
  );
  const unregister = (0, import_react.useCallback)((id) => {
    containersRef.current.delete(id);
  }, []);
  const updateCulling = (0, import_react.useCallback)((culledShapes) => {
    for (const [id, entry] of containersRef.current) {
      const shouldBeCulled = culledShapes.has(id);
      if (shouldBeCulled !== entry.isCulled) {
        const display = shouldBeCulled ? "none" : "block";
        (0, import_dom.setStyleProperty)(entry.container, "display", display);
        (0, import_dom.setStyleProperty)(entry.bgContainer, "display", display);
        entry.isCulled = shouldBeCulled;
      }
    }
  }, []);
  const value = (0, import_react.useMemo)(
    () => ({
      register,
      unregister,
      updateCulling
    }),
    [register, unregister, updateCulling]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShapeCullingContext.Provider, { value, children });
}
function useShapeCulling() {
  const context = (0, import_react.useContext)(ShapeCullingContext);
  if (!context) {
    throw new Error("useShapeCulling must be used within ShapeCullingProvider");
  }
  return context;
}
//# sourceMappingURL=useShapeCulling.js.map
