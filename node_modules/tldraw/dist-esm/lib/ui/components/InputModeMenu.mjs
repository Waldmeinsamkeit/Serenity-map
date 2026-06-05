import { jsx, jsxs } from "react/jsx-runtime";
import { useEditor, useValue } from "@tldraw/editor";
import { useUiEvents } from "../context/events.mjs";
import { ToggleInvertZoomItem } from "./menu-items.mjs";
import { TldrawUiMenuCheckboxItem } from "./primitives/menus/TldrawUiMenuCheckboxItem.mjs";
import { TldrawUiMenuGroup } from "./primitives/menus/TldrawUiMenuGroup.mjs";
import { TldrawUiMenuSubmenu } from "./primitives/menus/TldrawUiMenuSubmenu.mjs";
const MODES = ["auto", "trackpad", "mouse"];
function InputModeMenu() {
  const editor = useEditor();
  const trackEvent = useUiEvents();
  const inputMode = useValue("inputMode", () => editor.user.getUserPreferences().inputMode, [
    editor
  ]);
  const wheelBehavior = useValue("wheelBehavior", () => editor.getCameraOptions().wheelBehavior, [
    editor
  ]);
  const isModeChecked = (mode) => {
    if (mode === "auto") {
      return inputMode === null;
    }
    return inputMode === mode;
  };
  const getLabel = (mode, wheelBehavior2) => {
    if (mode === "auto") {
      return `action.toggle-auto-${wheelBehavior2}`;
    }
    return mode === "trackpad" ? "action.toggle-trackpad" : "action.toggle-mouse";
  };
  return /* @__PURE__ */ jsxs(TldrawUiMenuSubmenu, { id: "help menu input-mode", label: "menu.input-device", children: [
    /* @__PURE__ */ jsx(TldrawUiMenuGroup, { id: "peripheral-mode", children: MODES.map((mode) => /* @__PURE__ */ jsx(
      TldrawUiMenuCheckboxItem,
      {
        id: `peripheral-mode-${mode}`,
        label: getLabel(mode, wheelBehavior),
        checked: isModeChecked(mode),
        readonlyOk: true,
        onSelect: () => {
          trackEvent("input-mode", { source: "menu", value: mode });
          switch (mode) {
            case "auto":
              editor.user.updateUserPreferences({ inputMode: null });
              break;
            case "trackpad":
              editor.user.updateUserPreferences({ inputMode: "trackpad" });
              break;
            case "mouse":
              editor.user.updateUserPreferences({ inputMode: "mouse" });
              break;
          }
        }
      },
      mode
    )) }),
    /* @__PURE__ */ jsx(TldrawUiMenuGroup, { id: "invert-zoom-group", children: /* @__PURE__ */ jsx(ToggleInvertZoomItem, {}) })
  ] });
}
export {
  InputModeMenu
};
//# sourceMappingURL=InputModeMenu.mjs.map
