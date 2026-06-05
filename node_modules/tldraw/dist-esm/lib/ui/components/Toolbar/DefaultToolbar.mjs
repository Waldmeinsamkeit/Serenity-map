import { jsx, jsxs } from "react/jsx-runtime";
import { useEditor, usePassThroughWheelEvents, useValue } from "@tldraw/editor";
import classNames from "classnames";
import { memo, useRef } from "react";
import { PORTRAIT_BREAKPOINT } from "../../constants.mjs";
import { useBreakpoint } from "../../context/breakpoints.mjs";
import { useTldrawUiComponents } from "../../context/components.mjs";
import { useReadonly } from "../../hooks/useReadonly.mjs";
import { useTranslation } from "../../hooks/useTranslation/useTranslation.mjs";
import { MobileStylePanel } from "../MobileStylePanel.mjs";
import { TldrawUiOrientationProvider } from "../primitives/layout.mjs";
import { TldrawUiToolbar } from "../primitives/TldrawUiToolbar.mjs";
import { DefaultToolbarContent } from "./DefaultToolbarContent.mjs";
import { OverflowingToolbar } from "./OverflowingToolbar.mjs";
import { ToggleToolLockedButton } from "./ToggleToolLockedButton.mjs";
const DefaultToolbar = memo(function DefaultToolbar2({
  children,
  orientation = "horizontal",
  minItems = 4,
  minSizePx = 310,
  maxItems = 8,
  maxSizePx = 470
}) {
  const editor = useEditor();
  const msg = useTranslation();
  const breakpoint = useBreakpoint();
  const isReadonlyMode = useReadonly();
  const activeToolId = useValue("current tool id", () => editor.getCurrentToolId(), [editor]);
  const ref = useRef(null);
  usePassThroughWheelEvents(ref);
  const { ActionsMenu, QuickActions } = useTldrawUiComponents();
  const showQuickActions = editor.options.actionShortcutsLocation === "menu" ? false : editor.options.actionShortcutsLocation === "toolbar" ? true : breakpoint < PORTRAIT_BREAKPOINT.TABLET;
  return /* @__PURE__ */ jsx(
    TldrawUiOrientationProvider,
    {
      orientation,
      tooltipSide: orientation === "horizontal" ? "top" : "right",
      children: /* @__PURE__ */ jsx(
        "div",
        {
          ref,
          className: classNames("tlui-main-toolbar", `tlui-main-toolbar--${orientation}`),
          children: /* @__PURE__ */ jsxs("div", { className: "tlui-main-toolbar__inner", children: [
            /* @__PURE__ */ jsxs("div", { className: "tlui-main-toolbar__left", children: [
              !isReadonlyMode && /* @__PURE__ */ jsxs("div", { className: "tlui-main-toolbar__extras", children: [
                showQuickActions && /* @__PURE__ */ jsxs(
                  TldrawUiToolbar,
                  {
                    orientation,
                    className: "tlui-main-toolbar__extras__controls",
                    label: msg("actions-menu.title"),
                    children: [
                      QuickActions && /* @__PURE__ */ jsx(QuickActions, {}),
                      ActionsMenu && /* @__PURE__ */ jsx(ActionsMenu, {})
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(ToggleToolLockedButton, { activeToolId })
              ] }),
              /* @__PURE__ */ jsx(
                OverflowingToolbar,
                {
                  orientation,
                  sizingParentClassName: "tlui-main-toolbar",
                  minItems,
                  maxItems,
                  minSizePx,
                  maxSizePx,
                  children: children ?? /* @__PURE__ */ jsx(DefaultToolbarContent, {})
                }
              )
            ] }),
            breakpoint < PORTRAIT_BREAKPOINT.TABLET_SM && !isReadonlyMode && /* @__PURE__ */ jsx("div", { className: "tlui-main-toolbar__tools tlui-main-toolbar__mobile-style-panel", children: /* @__PURE__ */ jsx(MobileStylePanel, {}) })
          ] })
        }
      )
    }
  );
});
export {
  DefaultToolbar
};
//# sourceMappingURL=DefaultToolbar.mjs.map
