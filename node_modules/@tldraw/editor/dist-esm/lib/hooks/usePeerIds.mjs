import { useAtom, useComputed, useValue } from "@tldraw/state-react";
import { useEffect } from "react";
import {
  getCollaboratorStateFromElapsedTime,
  shouldShowCollaborator
} from "../utils/collaboratorState.mjs";
import { uniq } from "../utils/uniq.mjs";
import { useEditor } from "./useEditor.mjs";
function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}
function usePeerIds() {
  const editor = useEditor();
  const $userIds = useComputed(
    "userIds",
    () => uniq(editor.getCollaborators().map((p) => p.userId)).sort(),
    { isEqual: (a, b) => a.join(",") === b.join?.(",") },
    [editor]
  );
  return useValue($userIds);
}
function useActivePeerIds$() {
  const $time = useAtom("peerIdsTime", Date.now());
  const editor = useEditor();
  useEffect(() => {
    const interval = editor.timers.setInterval(() => {
      $time.set(Date.now());
    }, editor.options.collaboratorCheckIntervalMs);
    return () => clearInterval(interval);
  }, [editor, $time]);
  return useComputed(
    "activePeerIds",
    () => {
      const now = $time.get();
      return new Set(
        editor.getCollaborators().filter((p) => {
          const elapsed = Math.max(0, now - (p.lastActivityTimestamp ?? Infinity));
          const state = getCollaboratorStateFromElapsedTime(editor, elapsed);
          return shouldShowCollaborator(editor, p, state);
        }).map((p) => p.userId)
      );
    },
    { isEqual: setsEqual },
    [editor]
  );
}
export {
  useActivePeerIds$,
  usePeerIds
};
//# sourceMappingURL=usePeerIds.mjs.map
