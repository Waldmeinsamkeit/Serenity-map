import { createContext, useContext } from "react";
const EditorComponentsContext = createContext(null);
function useEditorComponents() {
  const components = useContext(EditorComponentsContext);
  if (!components) {
    throw new Error("useEditorComponents must be used inside of <EditorComponentsProvider />");
  }
  return components;
}
export {
  EditorComponentsContext,
  useEditorComponents
};
//# sourceMappingURL=EditorComponentsContext.mjs.map
