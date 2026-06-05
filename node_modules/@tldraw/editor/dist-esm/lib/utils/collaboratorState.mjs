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
export {
  getCollaboratorStateFromElapsedTime,
  shouldShowCollaborator
};
//# sourceMappingURL=collaboratorState.mjs.map
