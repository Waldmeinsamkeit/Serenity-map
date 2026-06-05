import { jsx } from "react/jsx-runtime";
import { useTranslation } from "../../hooks/useTranslation/useTranslation.mjs";
import { TldrawUiIcon } from "../primitives/TldrawUiIcon.mjs";
import { TldrawUiTooltip } from "../primitives/TldrawUiTooltip.mjs";
function OfflineIndicator() {
  const msg = useTranslation();
  return /* @__PURE__ */ jsx(TldrawUiTooltip, { content: msg("status.offline"), children: /* @__PURE__ */ jsx("div", { className: "tlui-offline-indicator", children: /* @__PURE__ */ jsx(TldrawUiIcon, { icon: "status-offline", label: msg("status.offline"), small: true }) }) });
}
export {
  OfflineIndicator
};
//# sourceMappingURL=OfflineIndicator.mjs.map
