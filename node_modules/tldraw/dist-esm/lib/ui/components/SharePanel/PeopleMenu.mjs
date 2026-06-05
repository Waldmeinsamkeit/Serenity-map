import { jsx, jsxs } from "react/jsx-runtime";
import { useContainer, useEditor, usePeerIds, useValue } from "@tldraw/editor";
import { Popover as _Popover } from "radix-ui";
import { PORTRAIT_BREAKPOINT } from "../../constants.mjs";
import { useBreakpoint } from "../../context/breakpoints.mjs";
import { useCollaborationStatus } from "../../hooks/useCollaborationStatus.mjs";
import { useMenuIsOpen } from "../../hooks/useMenuIsOpen.mjs";
import { useTranslation } from "../../hooks/useTranslation/useTranslation.mjs";
import { OfflineIndicator } from "../OfflineIndicator/OfflineIndicator.mjs";
import { PeopleMenuAvatar } from "./PeopleMenuAvatar.mjs";
import { PeopleMenuItem } from "./PeopleMenuItem.mjs";
import { PeopleMenuMore } from "./PeopleMenuMore.mjs";
import { UserPresenceEditor } from "./UserPresenceEditor.mjs";
function PeopleMenu({ children }) {
  const msg = useTranslation();
  const container = useContainer();
  const editor = useEditor();
  const userIds = usePeerIds();
  const userColor = useValue("user", () => editor.user.getColor(), [editor]);
  const userName = useValue("user", () => editor.user.getName(), [editor]);
  const [isOpen, onOpenChange] = useMenuIsOpen("people menu");
  const breakpoint = useBreakpoint();
  const maxAvatars = breakpoint <= PORTRAIT_BREAKPOINT.MOBILE_XS ? 1 : 5;
  const collaborationStatus = useCollaborationStatus();
  if (collaborationStatus === "offline") {
    return /* @__PURE__ */ jsx(OfflineIndicator, {});
  }
  if (!userIds.length) return null;
  return /* @__PURE__ */ jsxs(_Popover.Root, { onOpenChange, open: isOpen, children: [
    /* @__PURE__ */ jsx(_Popover.Trigger, { dir: "ltr", asChild: true, children: /* @__PURE__ */ jsx("button", { className: "tlui-people-menu__avatars-button", title: msg("people-menu.title"), children: /* @__PURE__ */ jsxs("div", { className: "tlui-people-menu__avatars", children: [
      userIds.slice(-maxAvatars).map((userId) => /* @__PURE__ */ jsx(PeopleMenuAvatar, { userId }, userId)),
      userIds.length > 0 && /* @__PURE__ */ jsx(
        "div",
        {
          className: "tlui-people-menu__avatar",
          style: {
            backgroundColor: userColor
          },
          children: userName?.[0] ?? ""
        }
      ),
      userIds.length > maxAvatars && /* @__PURE__ */ jsx(PeopleMenuMore, { count: userIds.length - maxAvatars })
    ] }) }) }),
    /* @__PURE__ */ jsx(_Popover.Portal, { container, children: /* @__PURE__ */ jsx(
      _Popover.Content,
      {
        dir: "ltr",
        className: "tlui-menu",
        side: "bottom",
        sideOffset: 2,
        collisionPadding: 4,
        children: /* @__PURE__ */ jsxs("div", { className: "tlui-people-menu__wrapper", children: [
          /* @__PURE__ */ jsx("div", { className: "tlui-people-menu__section", children: /* @__PURE__ */ jsx(UserPresenceEditor, {}) }),
          userIds.length > 0 && /* @__PURE__ */ jsx("div", { className: "tlui-people-menu__section", children: userIds.map((userId) => {
            return /* @__PURE__ */ jsx(PeopleMenuItem, { userId }, userId + "_presence");
          }) }),
          children
        ] })
      }
    ) })
  ] });
}
export {
  PeopleMenu
};
//# sourceMappingURL=PeopleMenu.mjs.map
