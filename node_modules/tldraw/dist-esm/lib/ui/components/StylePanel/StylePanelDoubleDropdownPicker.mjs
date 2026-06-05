import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { tlmenus, useEditor } from "@tldraw/editor";
import * as React from "react";
import { useTranslation } from "../../hooks/useTranslation/useTranslation.mjs";
import { TldrawUiButtonIcon } from "../primitives/Button/TldrawUiButtonIcon.mjs";
import {
  TldrawUiPopover,
  TldrawUiPopoverContent,
  TldrawUiPopoverTrigger
} from "../primitives/TldrawUiPopover.mjs";
import { TldrawUiToolbar, TldrawUiToolbarButton } from "../primitives/TldrawUiToolbar.mjs";
import { TldrawUiMenuContextProvider } from "../primitives/menus/TldrawUiMenuContext.mjs";
import { useStylePanelContext } from "./StylePanelContext.mjs";
function StylePanelDoubleDropdownPickerInner(props) {
  const msg = useTranslation();
  return /* @__PURE__ */ jsxs("div", { className: "tlui-style-panel__double-select-picker", children: [
    /* @__PURE__ */ jsx("div", { title: msg(props.label), className: "tlui-style-panel__double-select-picker-label", children: msg(props.label) }),
    /* @__PURE__ */ jsx(TldrawUiToolbar, { orientation: "horizontal", label: msg(props.label), children: /* @__PURE__ */ jsx(StylePanelDoubleDropdownPickerInline, { ...props }) })
  ] });
}
function StylePanelDoubleDropdownPickerInlineInner(props) {
  const ctx = useStylePanelContext();
  const {
    uiTypeA,
    uiTypeB,
    labelA,
    labelB,
    itemsA,
    itemsB,
    styleA,
    styleB,
    valueA,
    valueB,
    onValueChange = ctx.onValueChange
  } = props;
  const editor = useEditor();
  const msg = useTranslation();
  const [isOpenA, setIsOpenA] = React.useState(false);
  const [isOpenB, setIsOpenB] = React.useState(false);
  const iconA = React.useMemo(
    () => itemsA.find((item) => valueA.type === "shared" && valueA.value === item.value)?.icon ?? "mixed",
    [itemsA, valueA]
  );
  const iconB = React.useMemo(
    () => itemsB.find((item) => valueB.type === "shared" && valueB.value === item.value)?.icon ?? "mixed",
    [itemsB, valueB]
  );
  if (valueA === void 0 && valueB === void 0) return null;
  const idA = `style panel ${uiTypeA} A`;
  const idB = `style panel ${uiTypeB} B`;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(TldrawUiPopover, { id: idA, open: isOpenA, onOpenChange: setIsOpenA, children: [
      /* @__PURE__ */ jsx(TldrawUiPopoverTrigger, { children: /* @__PURE__ */ jsx(
        TldrawUiToolbarButton,
        {
          type: "icon",
          "data-testid": `style.${uiTypeA}`,
          title: msg(labelA) + " \u2014 " + (valueA === null || valueA.type === "mixed" ? msg("style-panel.mixed") : msg(`${uiTypeA}-style.${valueA.value}`)),
          children: /* @__PURE__ */ jsx(TldrawUiButtonIcon, { icon: iconA, small: true, invertIcon: true })
        }
      ) }),
      /* @__PURE__ */ jsx(TldrawUiPopoverContent, { side: "left", align: "center", sideOffset: 80, alignOffset: 0, children: /* @__PURE__ */ jsx(TldrawUiToolbar, { orientation: "grid", label: msg(labelA), children: /* @__PURE__ */ jsx(TldrawUiMenuContextProvider, { type: "icons", sourceId: "style-panel", children: itemsA.map((item) => {
        return /* @__PURE__ */ jsx(
          TldrawUiToolbarButton,
          {
            "data-testid": `style.${uiTypeA}.${item.value}`,
            type: "icon",
            onClick: () => {
              onValueChange(styleA, item.value);
              tlmenus.deleteOpenMenu(idA, editor.contextId);
              setIsOpenA(false);
            },
            title: `${msg(labelA)} \u2014 ${msg(`${uiTypeA}-style.${item.value}`)}`,
            children: /* @__PURE__ */ jsx(TldrawUiButtonIcon, { icon: item.icon, invertIcon: true })
          },
          item.value
        );
      }) }) }) })
    ] }),
    /* @__PURE__ */ jsxs(TldrawUiPopover, { id: idB, open: isOpenB, onOpenChange: setIsOpenB, children: [
      /* @__PURE__ */ jsx(TldrawUiPopoverTrigger, { children: /* @__PURE__ */ jsx(
        TldrawUiToolbarButton,
        {
          type: "icon",
          "data-testid": `style.${uiTypeB}`,
          title: msg(labelB) + " \u2014 " + (valueB === null || valueB.type === "mixed" ? msg("style-panel.mixed") : msg(`${uiTypeB}-style.${valueB.value}`)),
          children: /* @__PURE__ */ jsx(TldrawUiButtonIcon, { icon: iconB, small: true })
        }
      ) }),
      /* @__PURE__ */ jsx(TldrawUiPopoverContent, { side: "left", align: "center", sideOffset: 116, alignOffset: 0, children: /* @__PURE__ */ jsx(TldrawUiToolbar, { orientation: "grid", label: msg(labelB), children: /* @__PURE__ */ jsx(TldrawUiMenuContextProvider, { type: "icons", sourceId: "style-panel", children: itemsB.map((item) => {
        return /* @__PURE__ */ jsx(
          TldrawUiToolbarButton,
          {
            type: "icon",
            title: `${msg(labelB)} \u2014 ${msg(`${uiTypeB}-style.${item.value}`)}`,
            "data-testid": `style.${uiTypeB}.${item.value}`,
            onClick: () => {
              onValueChange(styleB, item.value);
              tlmenus.deleteOpenMenu(idB, editor.contextId);
              setIsOpenB(false);
            },
            children: /* @__PURE__ */ jsx(TldrawUiButtonIcon, { icon: item.icon })
          },
          item.value
        );
      }) }) }) })
    ] })
  ] });
}
const StylePanelDoubleDropdownPicker = React.memo(StylePanelDoubleDropdownPickerInner);
const StylePanelDoubleDropdownPickerInline = React.memo(
  StylePanelDoubleDropdownPickerInlineInner
);
export {
  StylePanelDoubleDropdownPicker,
  StylePanelDoubleDropdownPickerInline
};
//# sourceMappingURL=StylePanelDoubleDropdownPicker.mjs.map
