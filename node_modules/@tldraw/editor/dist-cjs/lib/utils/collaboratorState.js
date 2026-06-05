"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var collaboratorState_exports = {};
__export(collaboratorState_exports, {
  getCollaboratorStateFromElapsedTime: () => getCollaboratorStateFromElapsedTime,
  shouldShowCollaborator: () => shouldShowCollaborator
});
module.exports = __toCommonJS(collaboratorState_exports);
function getCollaboratorStateFromElapsedTime(editor, elapsed) {
  return elapsed > editor.options.collaboratorInactiveTimeoutMs ? "inactive" : elapsed > editor.options.collaboratorIdleTimeoutMs ? "idle" : "active";
}
function shouldShowCollaborator(editor, presence, state) {
  const { followingUserId, highlightedUserIds } = editor.getInstanceState();
  switch (state) {
    case "inactive":
      return followingUserId === presence.userId || highlightedUserIds.includes(presence.userId);
    case "idle":
      if (presence.followingUserId === editor.user.getId()) {
        return !!(presence.chatMessage || highlightedUserIds.includes(presence.userId));
      }
      return true;
    case "active":
      return true;
  }
}
//# sourceMappingURL=collaboratorState.js.map
