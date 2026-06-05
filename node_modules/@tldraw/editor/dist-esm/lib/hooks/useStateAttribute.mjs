import { react } from "@tldraw/state";
import { useLayoutEffect } from "react";
import { useEditor } from "./useEditor.mjs";
function useStateAttribute() {
  const editor = useEditor();
  useLayoutEffect(() => {
    return react("stateAttribute", () => {
      const container = editor.getContainer();
      const instanceState = editor.getInstanceState();
      container.setAttribute("data-state", editor.getPath());
      container.setAttribute("data-coarse", String(instanceState.isCoarsePointer));
    });
  }, [editor]);
}
export {
  useStateAttribute
};
//# sourceMappingURL=useStateAttribute.mjs.map
