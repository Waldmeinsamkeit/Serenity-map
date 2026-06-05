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
var TldrawUiSelect_exports = {};
__export(TldrawUiSelect_exports, {
  TldrawUiSelect: () => TldrawUiSelect,
  TldrawUiSelectContent: () => TldrawUiSelectContent,
  TldrawUiSelectItem: () => TldrawUiSelectItem,
  TldrawUiSelectTrigger: () => TldrawUiSelectTrigger,
  TldrawUiSelectValue: () => TldrawUiSelectValue
});
module.exports = __toCommonJS(TldrawUiSelect_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_editor = require("@tldraw/editor");
var import_classnames = __toESM(require("classnames"), 1);
var import_radix_ui = require("radix-ui");
var React = __toESM(require("react"), 1);
var import_useMenuIsOpen = require("../../hooks/useMenuIsOpen");
var import_TldrawUiIcon = require("./TldrawUiIcon");
function TldrawUiSelect({
  id,
  value,
  onValueChange,
  onOpenChange,
  disabled,
  className,
  children,
  "data-testid": dataTestId,
  "aria-label": ariaLabel
}) {
  const [open, handleOpenChange] = (0, import_useMenuIsOpen.useMenuIsOpen)(id, onOpenChange);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_radix_ui.Select.Root,
    {
      value,
      onValueChange,
      onOpenChange: handleOpenChange,
      open,
      disabled,
      dir: "ltr",
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          id,
          className: (0, import_classnames.default)("tlui-select", className),
          "data-testid": dataTestId,
          "aria-label": ariaLabel,
          children
        }
      )
    }
  );
}
const TldrawUiSelectTrigger = React.forwardRef(
  function TldrawUiSelectTrigger2({ children, className }, ref) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_radix_ui.Select.Trigger,
      {
        ref,
        className: (0, import_classnames.default)("tlui-button tlui-select__trigger", className),
        children: [
          children,
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_radix_ui.Select.Icon, { className: "tlui-select__chevron", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_TldrawUiIcon.TldrawUiIcon, { icon: "chevron-down", label: "", small: true }) })
        ]
      }
    );
  }
);
function TldrawUiSelectValue({ placeholder, icon, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_radix_ui.Select.Value, { placeholder, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "tlui-select__value", children: [
    icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_TldrawUiIcon.TldrawUiIcon, { icon, label: "", small: true }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "tlui-button__label", children })
  ] }) });
}
function TldrawUiSelectContent({
  children,
  side = "bottom",
  align = "start",
  className
}) {
  const container = (0, import_editor.useContainer)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_radix_ui.Select.Portal, { container, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_radix_ui.Select.Content,
    {
      className: (0, import_classnames.default)("tlui-menu tlui-select__content", className),
      position: "popper",
      side,
      align,
      sideOffset: 4,
      collisionPadding: 4,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_radix_ui.Select.Viewport, { className: "tlui-select__viewport", children })
    }
  ) });
}
function TldrawUiSelectItem({
  value,
  label,
  icon,
  disabled,
  className
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_radix_ui.Select.Item,
    {
      value,
      disabled,
      className: (0, import_classnames.default)(
        "tlui-button tlui-button__menu tlui-button__checkbox tlui-select__item",
        className
      ),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_TldrawUiIcon.TldrawUiIcon, { small: true, icon: "check", label: "", className: "tlui-select__item-indicator" }),
        icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_TldrawUiIcon.TldrawUiIcon, { icon, label: "", small: true }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_radix_ui.Select.ItemText, { className: "tlui-button__label", children: label })
      ]
    }
  );
}
//# sourceMappingURL=TldrawUiSelect.js.map
