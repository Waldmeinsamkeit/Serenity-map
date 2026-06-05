import { jsx, jsxs } from "react/jsx-runtime";
import { tlmenus, useEditor } from "@tldraw/editor";
import * as React from "react";
import { useTranslation } from "../../hooks/useTranslation/useTranslation.mjs";
import { TldrawUiButtonIcon } from "../primitives/Button/TldrawUiButtonIcon.mjs";
import { TldrawUiButtonLabel } from "../primitives/Button/TldrawUiButtonLabel.mjs";
import {
  TldrawUiPopover,
  TldrawUiPopoverContent,
  TldrawUiPopoverTrigger
} from "../primitives/TldrawUiPopover.mjs";
import { TldrawUiToolbar, TldrawUiToolbarButton } from "../primitives/TldrawUiToolbar.mjs";
import { TldrawUiMenuContextProvider } from "../primitives/menus/TldrawUiMenuContext.mjs";
import { useStylePanelContext } from "./StylePanelContext.mjs";
function StylePanelDropdownPickerInner(props) {
  const msg = useTranslation();
  const toolbarLabel = props.label ? msg(props.label) : msg(`style-panel.${props.stylePanelType}`);
  return /* @__PURE__ */ jsx(TldrawUiToolbar, { label: toolbarLabel, children: /* @__PURE__ */ jsx(StylePanelDropdownPickerInline, { ...props }) });
}
function StylePanelDropdownPickerInlineInner(props) {
  const ctx = useStylePanelContext();
  const {
    id,
    label,
    uiType,
    stylePanelType,
    style,
    items,
    type,
    value,
    onValueChange = ctx.onValueChange,
    testIdType = uiType
  } = props;
  const msg = useTranslation();
  const editor = useEditor();
  const [isOpen, setIsOpen] = React.useState(false);
  const icon = React.useMemo(() => {
    if (value.type === "mixed") return "mixed";
    const match = items.find((item) => item.value === value.value)?.icon;
    return match ?? items[0]?.icon;
  }, [items, value]);
  const stylePanelName = msg(`style-panel.${stylePanelType}`);
  const titleStr = value.type === "mixed" ? msg("style-panel.mixed") : stylePanelName + " \u2014 " + msg(`${uiType}-style.${value.value}`);
  const labelStr = label ? msg(label) : "";
  const popoverId = `style panel ${id}`;
  return /* @__PURE__ */ jsxs(
    TldrawUiPopover,
    {
      id: popoverId,
      open: isOpen,
      onOpenChange: setIsOpen,
      className: "tlui-style-panel__dropdown-picker",
      children: [
        /* @__PURE__ */ jsx(TldrawUiPopoverTrigger, { children: /* @__PURE__ */ jsxs(
          TldrawUiToolbarButton,
          {
            type,
            "data-testid": `style.${testIdType}`,
            "data-direction": "left",
            title: titleStr,
            children: [
              labelStr && /* @__PURE__ */ jsx(TldrawUiButtonLabel, { children: labelStr }),
              /* @__PURE__ */ jsx(TldrawUiButtonIcon, { icon })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx(TldrawUiPopoverContent, { side: "left", align: "center", children: /* @__PURE__ */ jsx(TldrawUiToolbar, { orientation: items.length > 4 ? "grid" : "horizontal", label: labelStr, children: /* @__PURE__ */ jsx(TldrawUiMenuContextProvider, { type: "icons", sourceId: "style-panel", children: items.map((item) => {
          return /* @__PURE__ */ jsx(
            TldrawUiToolbarButton,
            {
              type: "icon",
              "data-testid": `style.${testIdType}.${item.value}`,
              title: stylePanelName + " \u2014 " + msg(`${uiType}-style.${item.value}`),
              isActive: icon === item.icon,
              onClick: () => {
                ctx.onHistoryMark("select style dropdown item");
                onValueChange(style, item.value);
                tlmenus.deleteOpenMenu(popoverId, editor.contextId);
                setIsOpen(false);
              },
              children: /* @__PURE__ */ jsx(TldrawUiButtonIcon, { icon: item.icon })
            },
            item.value
          );
        }) }) }) })
      ]
    }
  );
}
const StylePanelDropdownPicker = React.memo(StylePanelDropdownPickerInner);
const StylePanelDropdownPickerInline = React.memo(StylePanelDropdownPickerInlineInner);
export {
  StylePanelDropdownPicker,
  StylePanelDropdownPickerInline
};
//# sourceMappingURL=StylePanelDropdownPicker.mjs.map
