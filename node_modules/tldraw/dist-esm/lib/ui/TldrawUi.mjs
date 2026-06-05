import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { tlenv, useEditor, useReactor, useValue } from "@tldraw/editor";
import classNames from "classnames";
import React, { useMemo, useRef, useState } from "react";
import { SkipToMainContent } from "./components/A11y.mjs";
import { TldrawUiButton } from "./components/primitives/Button/TldrawUiButton.mjs";
import { TldrawUiButtonIcon } from "./components/primitives/Button/TldrawUiButtonIcon.mjs";
import { PORTRAIT_BREAKPOINT, PORTRAIT_BREAKPOINTS } from "./constants.mjs";
import {
  TldrawUiContextProvider
} from "./context/TldrawUiContextProvider.mjs";
import { useActions } from "./context/actions.mjs";
import { useBreakpoint } from "./context/breakpoints.mjs";
import { useTldrawUiComponents } from "./context/components.mjs";
import { useNativeClipboardEvents } from "./hooks/useClipboardEvents.mjs";
import { useEditorEvents } from "./hooks/useEditorEvents.mjs";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts.mjs";
import { useReadonly } from "./hooks/useReadonly.mjs";
import { useTranslation } from "./hooks/useTranslation/useTranslation.mjs";
const TldrawUi = React.memo(function TldrawUi2({
  renderDebugMenuItems,
  children,
  hideUi,
  components,
  ...rest
}) {
  return /* @__PURE__ */ jsx(TldrawUiContextProvider, { ...rest, components, children: /* @__PURE__ */ jsx(TldrawUiInner, { hideUi, renderDebugMenuItems, children }) });
});
const TldrawUiInner = React.memo(function TldrawUiInner2({
  children,
  hideUi,
  ...rest
}) {
  useKeyboardShortcuts();
  useNativeClipboardEvents();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    children,
    hideUi ? null : /* @__PURE__ */ jsx(TldrawUiContent, { ...rest })
  ] });
});
const TldrawUiContent = React.memo(function TldrawUI() {
  const editor = useEditor();
  const msg = useTranslation();
  const breakpoint = useBreakpoint();
  const isReadonlyMode = useReadonly();
  const isFocusMode = useValue("focus", () => editor.getInstanceState().isFocusMode, [editor]);
  const isDebugMode = useValue("debug", () => editor.getInstanceState().isDebugMode, [editor]);
  const {
    SharePanel,
    TopPanel,
    MenuPanel,
    StylePanel,
    Toolbar,
    HelpMenu,
    NavigationPanel,
    HelperButtons,
    DebugPanel,
    Toasts,
    Dialogs,
    A11y
  } = useTldrawUiComponents();
  useEditorEvents();
  const rIsEditingAnything = useRef(false);
  const rHidingTimeout = useRef(-1);
  const [hideToolbarWhileEditing, setHideToolbarWhileEditing] = useState(false);
  useReactor(
    "update hide toolbar while delayed",
    () => {
      const isMobileEnvironment = tlenv.isIos || tlenv.isAndroid;
      if (!isMobileEnvironment) return;
      const editingShape = editor.getEditingShapeId();
      if (editingShape === null) {
        if (rIsEditingAnything.current) {
          rIsEditingAnything.current = false;
          clearTimeout(rHidingTimeout.current);
          if (tlenv.isAndroid) {
            rHidingTimeout.current = editor.timers.setTimeout(() => {
              setHideToolbarWhileEditing(false);
            }, 150);
          } else {
            setHideToolbarWhileEditing(false);
          }
        }
        return;
      }
      if (!rIsEditingAnything.current) {
        rIsEditingAnything.current = true;
        clearTimeout(rHidingTimeout.current);
        setHideToolbarWhileEditing(true);
      }
    },
    []
  );
  const { "toggle-focus-mode": toggleFocus } = useActions();
  const { breakpointsAbove, breakpointsBelow } = useMemo(() => {
    const breakpointsAbove2 = [];
    const breakpointsBelow2 = [];
    for (let bp = 0; bp < PORTRAIT_BREAKPOINTS.length; bp++) {
      if (bp <= breakpoint) {
        breakpointsAbove2.push(bp);
      } else {
        breakpointsBelow2.push(bp);
      }
    }
    return { breakpointsAbove: breakpointsAbove2, breakpointsBelow: breakpointsBelow2 };
  }, [breakpoint]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: classNames("tlui-layout", {
        "tlui-layout__mobile": breakpoint < PORTRAIT_BREAKPOINT.TABLET_SM
      }),
      "data-iseditinganything": hideToolbarWhileEditing,
      "data-breakpoint": breakpoint,
      "data-breakpoints-above": breakpointsAbove.join(" "),
      "data-breakpoints-below": breakpointsBelow.join(" "),
      children: [
        /* @__PURE__ */ jsx(SkipToMainContent, {}),
        isFocusMode ? /* @__PURE__ */ jsx("div", { className: "tlui-layout__top", children: /* @__PURE__ */ jsx(
          TldrawUiButton,
          {
            type: "icon",
            className: "tlui-focus-button",
            title: msg("focus-mode.toggle-focus-mode"),
            onClick: () => toggleFocus.onSelect("menu"),
            children: /* @__PURE__ */ jsx(TldrawUiButtonIcon, { icon: "dot" })
          }
        ) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "tlui-layout__top", children: [
            /* @__PURE__ */ jsxs("div", { className: "tlui-layout__top__left", children: [
              MenuPanel && /* @__PURE__ */ jsx(MenuPanel, {}),
              HelperButtons && /* @__PURE__ */ jsx(HelperButtons, {})
            ] }),
            /* @__PURE__ */ jsx("div", { className: "tlui-layout__top__center", children: TopPanel && /* @__PURE__ */ jsx(TopPanel, {}) }),
            /* @__PURE__ */ jsxs("div", { className: "tlui-layout__top__right", children: [
              SharePanel && /* @__PURE__ */ jsx(SharePanel, {}),
              StylePanel && breakpoint >= PORTRAIT_BREAKPOINT.TABLET_SM && !isReadonlyMode && /* @__PURE__ */ jsx(StylePanel, {})
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "tlui-layout__bottom", children: [
            /* @__PURE__ */ jsxs("div", { className: "tlui-layout__bottom__main", children: [
              NavigationPanel && /* @__PURE__ */ jsx(NavigationPanel, {}),
              Toolbar && /* @__PURE__ */ jsx(Toolbar, {}),
              HelpMenu && /* @__PURE__ */ jsx(HelpMenu, {})
            ] }),
            isDebugMode && DebugPanel && /* @__PURE__ */ jsx(DebugPanel, {}),
            A11y && /* @__PURE__ */ jsx(A11y, {})
          ] })
        ] }),
        Toasts && /* @__PURE__ */ jsx(Toasts, {}),
        Dialogs && /* @__PURE__ */ jsx(Dialogs, {})
      ]
    }
  );
});
function TldrawUiInFrontOfTheCanvas() {
  const { RichTextToolbar, ImageToolbar, VideoToolbar, CursorChatBubble, FollowingIndicator } = useTldrawUiComponents();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    RichTextToolbar && /* @__PURE__ */ jsx(RichTextToolbar, {}),
    ImageToolbar && /* @__PURE__ */ jsx(ImageToolbar, {}),
    VideoToolbar && /* @__PURE__ */ jsx(VideoToolbar, {}),
    FollowingIndicator && /* @__PURE__ */ jsx(FollowingIndicator, {}),
    CursorChatBubble && /* @__PURE__ */ jsx(CursorChatBubble, {})
  ] });
}
export {
  TldrawUi,
  TldrawUiInFrontOfTheCanvas
};
//# sourceMappingURL=TldrawUi.mjs.map
