import { jsx, jsxs } from "react/jsx-runtime";
import {
  ToggleEnhancedA11yModeItem,
  ToggleKeyboardShortcutsItem,
  ToggleReduceMotionItem
} from "./menu-items.mjs";
import { TldrawUiMenuGroup } from "./primitives/menus/TldrawUiMenuGroup.mjs";
import { TldrawUiMenuSubmenu } from "./primitives/menus/TldrawUiMenuSubmenu.mjs";
function AccessibilityMenu() {
  return /* @__PURE__ */ jsx(TldrawUiMenuSubmenu, { id: "help menu accessibility", label: "menu.accessibility", children: /* @__PURE__ */ jsxs(TldrawUiMenuGroup, { id: "accessibility", children: [
    /* @__PURE__ */ jsx(ToggleReduceMotionItem, {}),
    /* @__PURE__ */ jsx(ToggleKeyboardShortcutsItem, {}),
    /* @__PURE__ */ jsx(ToggleEnhancedA11yModeItem, {})
  ] }) });
}
export {
  AccessibilityMenu
};
//# sourceMappingURL=AccessibilityMenu.mjs.map
