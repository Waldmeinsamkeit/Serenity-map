import { unsafe__withoutCapture } from "@tldraw/state";
import { useReactor } from "@tldraw/state-react";
import { tlenvReactive } from "../globals/environment.mjs";
import { useEditor } from "./useEditor.mjs";
function useCoarsePointer() {
  const editor = useEditor();
  useReactor(
    "coarse pointer change",
    () => {
      const isCoarsePointer = tlenvReactive.get().isCoarsePointer;
      const isInstanceStateCoarsePointer = unsafe__withoutCapture(
        () => editor.getInstanceState().isCoarsePointer
      );
      if (isCoarsePointer === isInstanceStateCoarsePointer) return;
      editor.updateInstanceState({ isCoarsePointer });
    },
    [editor]
  );
}
export {
  useCoarsePointer
};
//# sourceMappingURL=useCoarsePointer.mjs.map
