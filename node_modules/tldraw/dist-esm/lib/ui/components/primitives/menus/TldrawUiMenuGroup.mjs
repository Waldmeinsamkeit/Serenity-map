import { jsx, jsxs } from "react/jsx-runtime";
import classNames from "classnames";
import { unwrapLabel } from "../../../context/actions.mjs";
import { useTranslation } from "../../../hooks/useTranslation/useTranslation.mjs";
import { TldrawUiColumn, TldrawUiGrid, TldrawUiRow, useTldrawUiOrientation } from "../layout.mjs";
import { TldrawUiDropdownMenuGroup } from "../TldrawUiDropdownMenu.mjs";
import { useTldrawUiMenuContext } from "./TldrawUiMenuContext.mjs";
function TldrawUiMenuGroup({ id, label, className, children }) {
  const menu = useTldrawUiMenuContext();
  const { orientation } = useTldrawUiOrientation();
  const msg = useTranslation();
  const labelToUse = unwrapLabel(label, menu.type);
  const labelStr = labelToUse ? msg(labelToUse) : void 0;
  switch (menu.type) {
    case "menu": {
      return /* @__PURE__ */ jsx(
        TldrawUiDropdownMenuGroup,
        {
          className,
          "data-testid": `${menu.sourceId}-group.${id}`,
          children
        }
      );
    }
    case "context-menu": {
      return /* @__PURE__ */ jsx(
        "div",
        {
          dir: "ltr",
          className: classNames("tlui-menu__group", className),
          "data-testid": `${menu.sourceId}-group.${id}`,
          children
        }
      );
    }
    case "keyboard-shortcuts": {
      return /* @__PURE__ */ jsxs("div", { className: "tlui-shortcuts-dialog__group", "data-testid": `${menu.sourceId}-group.${id}`, children: [
        /* @__PURE__ */ jsx("h2", { className: "tlui-shortcuts-dialog__group__title", children: labelStr }),
        /* @__PURE__ */ jsx("div", { className: "tlui-shortcuts-dialog__group__content", children })
      ] });
    }
    case "toolbar": {
      const Layout = orientation === "horizontal" ? TldrawUiRow : TldrawUiColumn;
      return /* @__PURE__ */ jsx(Layout, { className: "tlui-main-toolbar__group", "data-testid": `${menu.sourceId}-group.${id}`, children });
    }
    case "toolbar-overflow": {
      return /* @__PURE__ */ jsx(
        TldrawUiGrid,
        {
          className: "tlui-main-toolbar__group",
          "data-testid": `${menu.sourceId}-group.${id}`,
          children
        }
      );
    }
    default: {
      return children;
    }
  }
}
export {
  TldrawUiMenuGroup
};
//# sourceMappingURL=TldrawUiMenuGroup.mjs.map
