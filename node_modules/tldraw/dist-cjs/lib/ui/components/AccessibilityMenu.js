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
var AccessibilityMenu_exports = {};
__export(AccessibilityMenu_exports, {
  AccessibilityMenu: () => AccessibilityMenu
});
module.exports = __toCommonJS(AccessibilityMenu_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_menu_items = require("./menu-items");
var import_TldrawUiMenuGroup = require("./primitives/menus/TldrawUiMenuGroup");
var import_TldrawUiMenuSubmenu = require("./primitives/menus/TldrawUiMenuSubmenu");
function AccessibilityMenu() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_TldrawUiMenuSubmenu.TldrawUiMenuSubmenu, { id: "help menu accessibility", label: "menu.accessibility", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_TldrawUiMenuGroup.TldrawUiMenuGroup, { id: "accessibility", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_menu_items.ToggleReduceMotionItem, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_menu_items.ToggleKeyboardShortcutsItem, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_menu_items.ToggleEnhancedA11yModeItem, {})
  ] }) });
}
//# sourceMappingURL=AccessibilityMenu.js.map
