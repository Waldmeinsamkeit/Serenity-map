import { jsx } from "react/jsx-runtime";
import {
  useEditor,
  usePassThroughWheelEvents,
  useValue
} from "@tldraw/editor";
import classNames from "classnames";
import { memo, useCallback, useEffect, useRef } from "react";
import { useRelevantStyles } from "../../hooks/useRelevantStyles.mjs";
import { DefaultStylePanelContent } from "./DefaultStylePanelContent.mjs";
import { StylePanelContextProvider } from "./StylePanelContext.mjs";
const DefaultStylePanel = memo(function DefaultStylePanel2({
  isMobile,
  styles,
  children
}) {
  const editor = useEditor();
  const enhancedA11yMode = useValue("enhancedA11yMode", () => editor.user.getEnhancedA11yMode(), [
    editor
  ]);
  const ref = useRef(null);
  usePassThroughWheelEvents(ref);
  const handlePointerOut = useCallback(() => {
    if (!isMobile) {
      editor.updateInstanceState({ isChangingStyle: false });
    }
  }, [editor, isMobile]);
  const defaultStyles = useRelevantStyles();
  if (styles === void 0) {
    styles = defaultStyles;
  }
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && ref.current?.contains(document.activeElement)) {
        event.stopPropagation();
        editor.getContainer().focus();
      }
    }
    const stylePanelContainerEl = ref.current;
    stylePanelContainerEl?.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      stylePanelContainerEl?.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [editor]);
  return styles && /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      "data-testid": "style.panel",
      className: classNames("tlui-style-panel", { "tlui-style-panel__wrapper": !isMobile }),
      "data-ismobile": isMobile,
      "data-enhanced-a11y-mode": enhancedA11yMode,
      onPointerLeave: handlePointerOut,
      children: /* @__PURE__ */ jsx(StylePanelContextProvider, { styles, children: children ?? /* @__PURE__ */ jsx(DefaultStylePanelContent, {}) })
    }
  );
});
export {
  DefaultStylePanel
};
//# sourceMappingURL=DefaultStylePanel.mjs.map
