import { assert, useMaybeEditor } from "@tldraw/editor";
import { useCallback } from "react";
import { exportAs } from "../../utils/export/exportAs.mjs";
import { useToasts } from "../context/toasts.mjs";
import { useTranslation } from "./useTranslation/useTranslation.mjs";
function useExportAs() {
  const editor = useMaybeEditor();
  const { addToast } = useToasts();
  const msg = useTranslation();
  return useCallback(
    (ids, opts = {}) => {
      assert(editor, "useExportAs: editor is required");
      const { format = "png", name, scale = 1 } = opts;
      exportAs(editor, ids, {
        format,
        name,
        scale
      }).catch((e) => {
        console.error(e.message);
        addToast({
          id: "export-fail",
          title: msg("toast.error.export-fail.title"),
          description: msg("toast.error.export-fail.desc"),
          severity: "error"
        });
      });
    },
    [editor, addToast, msg]
  );
}
export {
  useExportAs
};
//# sourceMappingURL=useExportAs.mjs.map
