import { jsx } from "react/jsx-runtime";
import { useEditor, usePresence, useValue } from "@tldraw/editor";
function DefaultFollowingIndicator() {
  const editor = useEditor();
  const followingUserId = useValue("follow", () => editor.getInstanceState().followingUserId, [
    editor
  ]);
  if (!followingUserId) return null;
  return /* @__PURE__ */ jsx(FollowingIndicatorInner, { userId: followingUserId });
}
function FollowingIndicatorInner({ userId }) {
  const presence = usePresence(userId);
  if (!presence) return null;
  return /* @__PURE__ */ jsx("div", { className: "tlui-following-indicator", style: { borderColor: presence.color } });
}
export {
  DefaultFollowingIndicator
};
//# sourceMappingURL=DefaultFollowingIndicator.mjs.map
