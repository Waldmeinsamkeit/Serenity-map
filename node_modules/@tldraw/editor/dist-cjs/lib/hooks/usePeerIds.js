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
var usePeerIds_exports = {};
__export(usePeerIds_exports, {
  useActivePeerIds$: () => useActivePeerIds$,
  usePeerIds: () => usePeerIds
});
module.exports = __toCommonJS(usePeerIds_exports);
var import_state_react = require("@tldraw/state-react");
var import_react = require("react");
var import_collaboratorState = require("../utils/collaboratorState");
var import_uniq = require("../utils/uniq");
var import_useEditor = require("./useEditor");
function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}
function usePeerIds() {
  const editor = (0, import_useEditor.useEditor)();
  const $userIds = (0, import_state_react.useComputed)(
    "userIds",
    () => (0, import_uniq.uniq)(editor.getCollaborators().map((p) => p.userId)).sort(),
    { isEqual: (a, b) => a.join(",") === b.join?.(",") },
    [editor]
  );
  return (0, import_state_react.useValue)($userIds);
}
function useActivePeerIds$() {
  const $time = (0, import_state_react.useAtom)("peerIdsTime", Date.now());
  const editor = (0, import_useEditor.useEditor)();
  (0, import_react.useEffect)(() => {
    const interval = editor.timers.setInterval(() => {
      $time.set(Date.now());
    }, editor.options.collaboratorCheckIntervalMs);
    return () => clearInterval(interval);
  }, [editor, $time]);
  return (0, import_state_react.useComputed)(
    "activePeerIds",
    () => {
      const now = $time.get();
      return new Set(
        editor.getCollaborators().filter((p) => {
          const elapsed = Math.max(0, now - (p.lastActivityTimestamp ?? Infinity));
          const state = (0, import_collaboratorState.getCollaboratorStateFromElapsedTime)(editor, elapsed);
          return (0, import_collaboratorState.shouldShowCollaborator)(editor, p, state);
        }).map((p) => p.userId)
      );
    },
    { isEqual: setsEqual },
    [editor]
  );
}
//# sourceMappingURL=usePeerIds.js.map
