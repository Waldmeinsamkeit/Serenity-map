import { useEditor, useValue } from "@tldraw/editor";
function useEfficientZoomThreshold(threshold = 0.25) {
  const editor = useEditor();
  return useValue("efficient zoom threshold", () => editor.getEfficientZoomLevel() < threshold, [
    editor,
    threshold
  ]);
}
export {
  useEfficientZoomThreshold
};
//# sourceMappingURL=useEfficientZoomThreshold.mjs.map
