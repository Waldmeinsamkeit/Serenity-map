import { jsx, jsxs } from "react/jsx-runtime";
import {
  DefaultColorStyle,
  getColorValue,
  getDefaultColorTheme,
  useEditor,
  useValue
} from "@tldraw/editor";
import { useCallback } from "react";
import { useTldrawUiComponents } from "../context/components.mjs";
import { useRelevantStyles } from "../hooks/useRelevantStyles.mjs";
import { useTranslation } from "../hooks/useTranslation/useTranslation.mjs";
import { TldrawUiButton } from "./primitives/Button/TldrawUiButton.mjs";
import { TldrawUiButtonIcon } from "./primitives/Button/TldrawUiButtonIcon.mjs";
import {
  TldrawUiPopover,
  TldrawUiPopoverContent,
  TldrawUiPopoverTrigger
} from "./primitives/TldrawUiPopover.mjs";
import { useTldrawUiOrientation } from "./primitives/layout.mjs";
function MobileStylePanel() {
  const editor = useEditor();
  const msg = useTranslation();
  const { orientation } = useTldrawUiOrientation();
  const relevantStyles = useRelevantStyles();
  const color = relevantStyles?.get(DefaultColorStyle);
  const theme = getDefaultColorTheme({ isDarkMode: editor.user.getIsDarkMode() });
  const currentColor = color?.type === "shared" ? getColorValue(theme, color.value, "solid") : getColorValue(theme, "black", "solid");
  const disableStylePanel = useValue(
    "disable style panel",
    () => editor.isInAny("hand", "zoom", "eraser", "laser"),
    [editor]
  );
  const handleStylesOpenChange = useCallback(
    (isOpen) => {
      if (!isOpen) {
        editor.updateInstanceState({ isChangingStyle: false });
      }
    },
    [editor]
  );
  const { StylePanel } = useTldrawUiComponents();
  if (!StylePanel) return null;
  return /* @__PURE__ */ jsxs(TldrawUiPopover, { id: "mobile style menu", onOpenChange: handleStylesOpenChange, children: [
    /* @__PURE__ */ jsx(TldrawUiPopoverTrigger, { children: /* @__PURE__ */ jsx(
      TldrawUiButton,
      {
        type: "tool",
        "data-testid": "mobile-styles.button",
        style: {
          color: disableStylePanel ? "var(--tl-color-muted-1)" : currentColor
        },
        title: msg("style-panel.title"),
        disabled: disableStylePanel,
        children: /* @__PURE__ */ jsx(
          TldrawUiButtonIcon,
          {
            icon: disableStylePanel ? "blob" : color?.type === "mixed" ? "mixed" : "blob"
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsx(TldrawUiPopoverContent, { side: orientation === "horizontal" ? "top" : "right", align: "end", children: StylePanel && /* @__PURE__ */ jsx(StylePanel, { isMobile: true }) })
  ] });
}
export {
  MobileStylePanel
};
//# sourceMappingURL=MobileStylePanel.mjs.map
