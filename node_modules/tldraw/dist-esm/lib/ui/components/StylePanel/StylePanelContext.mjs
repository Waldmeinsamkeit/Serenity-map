import { jsx } from "react/jsx-runtime";
import { useEditor, useValue } from "@tldraw/editor";
import { createContext, useCallback, useContext } from "react";
import { useUiEvents } from "../../context/events.mjs";
const StylePanelContext = createContext(null);
function StylePanelContextProvider({ children, styles }) {
  const editor = useEditor();
  const trackEvent = useUiEvents();
  const onHistoryMark = useCallback((id) => editor.markHistoryStoppingPoint(id), [editor]);
  const enhancedA11yMode = useValue("enhancedA11yMode", () => editor.user.getEnhancedA11yMode(), [
    editor
  ]);
  const onValueChange = useCallback(
    function(style, value) {
      editor.run(() => {
        if (editor.isIn("select")) {
          editor.setStyleForSelectedShapes(style, value);
        }
        editor.setStyleForNextShapes(style, value);
        editor.updateInstanceState({ isChangingStyle: true });
      });
      trackEvent("set-style", { source: "style-panel", id: style.id, value });
    },
    [editor, trackEvent]
  );
  return /* @__PURE__ */ jsx(
    StylePanelContext.Provider,
    {
      value: {
        styles,
        enhancedA11yMode,
        onHistoryMark,
        onValueChange
      },
      children
    }
  );
}
function useStylePanelContext() {
  const context = useContext(StylePanelContext);
  if (!context) {
    throw new Error("useStylePanelContext must be used within a StylePanelContextProvider");
  }
  return context;
}
export {
  StylePanelContextProvider,
  useStylePanelContext
};
//# sourceMappingURL=StylePanelContext.mjs.map
