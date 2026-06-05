import { jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import { setStyleProperty } from "../utils/dom.mjs";
const ShapeCullingContext = createContext(null);
function ShapeCullingProvider({ children }) {
  const containersRef = useRef(/* @__PURE__ */ new Map());
  const register = useCallback(
    (id, container, bgContainer, isCulled) => {
      const display = isCulled ? "none" : "block";
      setStyleProperty(container, "display", display);
      setStyleProperty(bgContainer, "display", display);
      containersRef.current.set(id, {
        container,
        bgContainer,
        isCulled
      });
    },
    []
  );
  const unregister = useCallback((id) => {
    containersRef.current.delete(id);
  }, []);
  const updateCulling = useCallback((culledShapes) => {
    for (const [id, entry] of containersRef.current) {
      const shouldBeCulled = culledShapes.has(id);
      if (shouldBeCulled !== entry.isCulled) {
        const display = shouldBeCulled ? "none" : "block";
        setStyleProperty(entry.container, "display", display);
        setStyleProperty(entry.bgContainer, "display", display);
        entry.isCulled = shouldBeCulled;
      }
    }
  }, []);
  const value = useMemo(
    () => ({
      register,
      unregister,
      updateCulling
    }),
    [register, unregister, updateCulling]
  );
  return /* @__PURE__ */ jsx(ShapeCullingContext.Provider, { value, children });
}
function useShapeCulling() {
  const context = useContext(ShapeCullingContext);
  if (!context) {
    throw new Error("useShapeCulling must be used within ShapeCullingProvider");
  }
  return context;
}
export {
  ShapeCullingProvider,
  useShapeCulling
};
//# sourceMappingURL=useShapeCulling.mjs.map
