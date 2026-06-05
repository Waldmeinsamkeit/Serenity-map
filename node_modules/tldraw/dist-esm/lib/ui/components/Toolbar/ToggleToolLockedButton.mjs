import { jsx } from "react/jsx-runtime";
import { useEditor, useValue } from "@tldraw/editor";
import classNames from "classnames";
import { PORTRAIT_BREAKPOINT } from "../../constants.mjs";
import { useActions } from "../../context/actions.mjs";
import { useBreakpoint } from "../../context/breakpoints.mjs";
import { useTranslation } from "../../hooks/useTranslation/useTranslation.mjs";
import { kbdStr } from "../../kbd-utils.mjs";
import { TldrawUiButton } from "../primitives/Button/TldrawUiButton.mjs";
import { TldrawUiButtonIcon } from "../primitives/Button/TldrawUiButtonIcon.mjs";
import { TldrawUiTooltip } from "../primitives/TldrawUiTooltip.mjs";
function ToggleToolLockedButton({ activeToolId }) {
  const editor = useEditor();
  const breakpoint = useBreakpoint();
  const msg = useTranslation();
  const actions = useActions();
  const isToolLocked = useValue("is tool locked", () => editor.getInstanceState().isToolLocked, [
    editor
  ]);
  const tool = useValue("current tool", () => editor.getCurrentTool(), [editor]);
  if (!activeToolId || !tool.isLockable) return null;
  const toggleLockAction = actions["toggle-tool-lock"];
  const tooltipContent = toggleLockAction?.kbd ? `${msg("action.toggle-tool-lock")} ${kbdStr(toggleLockAction.kbd)}` : msg("action.toggle-tool-lock");
  return /* @__PURE__ */ jsx(TldrawUiTooltip, { content: tooltipContent, children: /* @__PURE__ */ jsx(
    TldrawUiButton,
    {
      type: "normal",
      "data-testid": "tool-lock",
      className: classNames("tlui-main-toolbar__lock-button", {
        "tlui-main-toolbar__lock-button__mobile": breakpoint < PORTRAIT_BREAKPOINT.TABLET_SM
      }),
      onClick: () => editor.updateInstanceState({ isToolLocked: !isToolLocked }),
      children: /* @__PURE__ */ jsx(TldrawUiButtonIcon, { icon: isToolLocked ? "lock" : "unlock", small: true })
    }
  ) });
}
export {
  ToggleToolLockedButton
};
//# sourceMappingURL=ToggleToolLockedButton.mjs.map
