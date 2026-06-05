"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var layout_exports = {};
__export(layout_exports, {
  TldrawUiColumn: () => TldrawUiColumn,
  TldrawUiGrid: () => TldrawUiGrid,
  TldrawUiOrientationProvider: () => TldrawUiOrientationProvider,
  TldrawUiRow: () => TldrawUiRow,
  useTldrawUiOrientation: () => useTldrawUiOrientation
});
module.exports = __toCommonJS(layout_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_classnames = __toESM(require("classnames"), 1);
var import_radix_ui = require("radix-ui");
var import_react = require("react");
const TldrawUiOrientationContext = (0, import_react.createContext)({
  orientation: "horizontal",
  tooltipSide: "bottom"
});
function TldrawUiOrientationProvider({
  children,
  orientation,
  tooltipSide
}) {
  const prevContext = useTldrawUiOrientation();
  const tooltipSideToUse = tooltipSide ?? (orientation === prevContext.orientation ? prevContext.tooltipSide : orientation === "horizontal" ? "bottom" : "right");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TldrawUiOrientationContext.Provider, { value: { orientation, tooltipSide: tooltipSideToUse }, children });
}
function useTldrawUiOrientation() {
  return (0, import_react.useContext)(TldrawUiOrientationContext);
}
const TldrawUiRow = (0, import_react.forwardRef)(
  ({ asChild, className, tooltipSide, ...props }, ref) => {
    const Component = asChild ? import_radix_ui.Slot.Root : "div";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TldrawUiOrientationProvider, { orientation: "horizontal", tooltipSide, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, { ref, className: (0, import_classnames.default)("tlui-row", className), ...props }) });
  }
);
const TldrawUiColumn = (0, import_react.forwardRef)(
  ({ asChild, className, tooltipSide, ...props }, ref) => {
    const Component = asChild ? import_radix_ui.Slot.Root : "div";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TldrawUiOrientationProvider, { orientation: "vertical", tooltipSide, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, { ref, className: (0, import_classnames.default)("tlui-column", className), ...props }) });
  }
);
const TldrawUiGrid = (0, import_react.forwardRef)(
  ({ asChild, className, tooltipSide, ...props }, ref) => {
    const Component = asChild ? import_radix_ui.Slot.Root : "div";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TldrawUiOrientationProvider, { orientation: "horizontal", tooltipSide, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, { ref, className: (0, import_classnames.default)("tlui-grid", className), ...props }) });
  }
);
//# sourceMappingURL=layout.js.map
