import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { react } from "@tldraw/state";
import { useQuickReactor, useStateTracking } from "@tldraw/state-react";
import { memo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useEditorComponents } from "../hooks/EditorComponentsContext.mjs";
import { useEditor } from "../hooks/useEditor.mjs";
import { useShapeCulling } from "../hooks/useShapeCulling.mjs";
import { Mat } from "../primitives/Mat.mjs";
import { areShapesContentEqual } from "../utils/areShapesContentEqual.mjs";
import { setStyleProperty } from "../utils/dom.mjs";
import { OptionalErrorBoundary } from "./ErrorBoundary.mjs";
const Shape = memo(function Shape2({
  id,
  shape,
  util,
  index,
  backgroundIndex,
  opacity
}) {
  const editor = useEditor();
  const { ShapeErrorFallback, ShapeWrapper } = useEditorComponents();
  const containerRef = useRef(null);
  const bgContainerRef = useRef(null);
  useEffect(() => {
    return react("load fonts", () => {
      const fonts = editor.fonts.getShapeFontFaces(id);
      editor.fonts.requestFonts(fonts);
    });
  }, [editor, id]);
  const memoizedStuffRef = useRef({
    transform: "",
    clipPath: "none",
    width: 0,
    height: 0,
    x: 0,
    y: 0
  });
  useQuickReactor(
    "set shape stuff",
    () => {
      const shape2 = editor.getShape(id);
      if (!shape2) return;
      const prev = memoizedStuffRef.current;
      const clipPath = editor.getShapeClipPath(id) ?? "none";
      if (clipPath !== prev.clipPath) {
        setStyleProperty(containerRef.current, "clip-path", clipPath);
        setStyleProperty(bgContainerRef.current, "clip-path", clipPath);
        prev.clipPath = clipPath;
      }
      const pageTransform = editor.getShapePageTransform(id);
      const transform = Mat.toCssString(pageTransform);
      const bounds = editor.getShapeGeometry(shape2).bounds;
      if (transform !== prev.transform) {
        setStyleProperty(containerRef.current, "transform", transform);
        setStyleProperty(bgContainerRef.current, "transform", transform);
        prev.transform = transform;
      }
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);
      if (width !== prev.width || height !== prev.height) {
        setStyleProperty(containerRef.current, "width", width + "px");
        setStyleProperty(containerRef.current, "height", height + "px");
        setStyleProperty(bgContainerRef.current, "width", width + "px");
        setStyleProperty(bgContainerRef.current, "height", height + "px");
        prev.width = width;
        prev.height = height;
      }
    },
    [editor]
  );
  useLayoutEffect(() => {
    const container = containerRef.current;
    const bgContainer = bgContainerRef.current;
    setStyleProperty(container, "opacity", opacity);
    setStyleProperty(bgContainer, "opacity", opacity);
    setStyleProperty(container, "z-index", index);
    setStyleProperty(bgContainer, "z-index", backgroundIndex);
  }, [opacity, index, backgroundIndex]);
  const { register, unregister } = useShapeCulling();
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const isCulled = editor.getCulledShapes().has(id);
    register(id, container, bgContainerRef.current, isCulled);
    return () => {
      unregister(id);
    };
  }, [editor, id, register, unregister]);
  const annotateError = useCallback(
    (error) => editor.annotateError(error, { origin: "shape", willCrashApp: false }),
    [editor]
  );
  if (!shape || !ShapeWrapper) return null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    util.backgroundComponent && /* @__PURE__ */ jsx(ShapeWrapper, { ref: bgContainerRef, shape, isBackground: true, children: /* @__PURE__ */ jsx(OptionalErrorBoundary, { fallback: ShapeErrorFallback, onError: annotateError, children: /* @__PURE__ */ jsx(InnerShapeBackground, { shape, util }) }) }),
    /* @__PURE__ */ jsx(ShapeWrapper, { ref: containerRef, shape, isBackground: false, children: /* @__PURE__ */ jsx(OptionalErrorBoundary, { fallback: ShapeErrorFallback, onError: annotateError, children: /* @__PURE__ */ jsx(InnerShape, { shape, util }) }) })
  ] });
});
const InnerShape = memo(
  function InnerShape2({ shape, util }) {
    return useStateTracking(
      "InnerShape:" + shape.type,
      () => (
        // always fetch the latest shape from the store even if the props/meta have not changed, to avoid
        // calling the render method with stale data.
        (util.component(util.editor.store.unsafeGetWithoutCapture(shape.id)))
      ),
      [util, shape.id]
    );
  },
  (prev, next) => areShapesContentEqual(prev.shape, next.shape) && prev.util === next.util
);
const InnerShapeBackground = memo(
  function InnerShapeBackground2({
    shape,
    util
  }) {
    return useStateTracking(
      "InnerShape:" + shape.type,
      () => (
        // always fetch the latest shape from the store even if the props/meta have not changed, to avoid
        // calling the render method with stale data.
        (util.backgroundComponent?.(util.editor.store.unsafeGetWithoutCapture(shape.id)))
      ),
      [util, shape.id]
    );
  },
  (prev, next) => prev.shape.props === next.shape.props && prev.shape.meta === next.shape.meta && prev.util === next.util
);
export {
  InnerShape,
  InnerShapeBackground,
  Shape
};
//# sourceMappingURL=Shape.mjs.map
