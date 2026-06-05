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
var TldrawUiToolbar_exports = {};
__export(TldrawUiToolbar_exports, {
  TldrawUiToolbar: () => TldrawUiToolbar,
  TldrawUiToolbarButton: () => TldrawUiToolbarButton,
  TldrawUiToolbarToggleGroup: () => TldrawUiToolbarToggleGroup,
  TldrawUiToolbarToggleItem: () => TldrawUiToolbarToggleItem
});
module.exports = __toCommonJS(TldrawUiToolbar_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_classnames = __toESM(require("classnames"), 1);
var import_radix_ui = require("radix-ui");
var import_react = __toESM(require("react"), 1);
var import_layout = require("./layout");
var import_TldrawUiTooltip = require("./TldrawUiTooltip");
const LayoutByOrientation = {
  horizontal: import_layout.TldrawUiRow,
  vertical: import_layout.TldrawUiColumn,
  grid: import_layout.TldrawUiGrid
};
const TldrawUiToolbar = import_react.default.forwardRef(
  ({
    children,
    className,
    label,
    orientation = "horizontal",
    tooltipSide,
    ...props
  }, ref) => {
    const Layout = LayoutByOrientation[orientation];
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layout, { asChild: true, tooltipSide, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_radix_ui.Toolbar.Root,
      {
        ref,
        ...props,
        className: (0, import_classnames.default)("tlui-toolbar", className),
        "aria-label": label,
        orientation: orientation === "grid" ? "horizontal" : orientation,
        children
      }
    ) });
  }
);
const TldrawUiToolbarButton = import_react.default.forwardRef(
  ({ asChild, children, type, isActive, tooltip, ...props }, ref) => {
    const button = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_radix_ui.Toolbar.Button,
      {
        ref,
        asChild,
        draggable: false,
        "data-isactive": isActive,
        ...props,
        "aria-label": props.title,
        title: void 0,
        className: (0, import_classnames.default)("tlui-button", `tlui-button__${type}`, props.className),
        children
      }
    );
    const tooltipContent = tooltip || props.title;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_TldrawUiTooltip.TldrawUiTooltip, { content: tooltipContent, children: button });
  }
);
const TldrawUiToolbarToggleGroup = ({
  children,
  className,
  type,
  asChild,
  ...props
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_radix_ui.Toolbar.ToggleGroup,
    {
      asChild,
      type,
      ...props,
      role: "radiogroup",
      className: (0, import_classnames.default)("tlui-toolbar-toggle-group", className),
      children
    }
  );
};
const TldrawUiToolbarToggleItem = ({
  children,
  className,
  type,
  value,
  tooltip,
  ...props
}) => {
  const toggleItem = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_radix_ui.Toolbar.ToggleItem,
    {
      ...props,
      title: void 0,
      className: (0, import_classnames.default)(
        "tlui-button",
        `tlui-button__${type}`,
        "tlui-toolbar-toggle-group-item",
        className
      ),
      value,
      children
    }
  );
  const tooltipContent = tooltip || props.title;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_TldrawUiTooltip.TldrawUiTooltip, { content: tooltipContent, children: toggleItem });
};
//# sourceMappingURL=TldrawUiToolbar.js.map
