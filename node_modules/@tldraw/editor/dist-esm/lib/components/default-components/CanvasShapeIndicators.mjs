import { jsx } from "react/jsx-runtime";
import { useComputed, useQuickReactor } from "@tldraw/state-react";
import { createComputedCache } from "@tldraw/store";
import { dedupe } from "@tldraw/utils";
import { memo, useEffect, useRef } from "react";
import { useEditor } from "../../hooks/useEditor.mjs";
import { useIsDarkMode } from "../../hooks/useIsDarkMode.mjs";
import { useActivePeerIds$ } from "../../hooks/usePeerIds.mjs";
function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
function collaboratorIndicatorsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].color !== b[i].color) return false;
    if (!arraysEqual(a[i].shapeIds, b[i].shapeIds)) return false;
  }
  return true;
}
function renderDataEqual(a, b) {
  return setsEqual(a.idsToDisplay, b.idsToDisplay) && setsEqual(a.renderingShapeIds, b.renderingShapeIds) && arraysEqual(a.hintingShapeIds, b.hintingShapeIds) && collaboratorIndicatorsEqual(a.collaboratorIndicators, b.collaboratorIndicators);
}
const indicatorPathCache = createComputedCache(
  "indicatorPath",
  (editor, shape) => {
    const util = editor.getShapeUtil(shape);
    return util.getIndicatorPath(shape);
  }
);
const getIndicatorPath = (editor, shape) => {
  return indicatorPathCache.get(editor, shape.id);
};
function renderShapeIndicator(ctx, editor, shapeId, renderingShapeIds) {
  if (!renderingShapeIds.has(shapeId)) return false;
  const shape = editor.getShape(shapeId);
  if (!shape || shape.isLocked) return false;
  const pageTransform = editor.getShapePageTransform(shape);
  if (!pageTransform) return false;
  const indicatorPath = getIndicatorPath(editor, shape);
  if (!indicatorPath) return false;
  ctx.save();
  ctx.transform(
    pageTransform.a,
    pageTransform.b,
    pageTransform.c,
    pageTransform.d,
    pageTransform.e,
    pageTransform.f
  );
  renderIndicatorPath(ctx, indicatorPath);
  ctx.restore();
  return true;
}
function renderIndicatorPath(ctx, indicatorPath) {
  if (indicatorPath instanceof Path2D) {
    ctx.stroke(indicatorPath);
  } else {
    const { path, clipPath, additionalPaths } = indicatorPath;
    if (clipPath) {
      ctx.save();
      ctx.clip(clipPath, "evenodd");
      ctx.stroke(path);
      ctx.restore();
    } else {
      ctx.stroke(path);
    }
    if (additionalPaths) {
      for (const additionalPath of additionalPaths) {
        ctx.stroke(additionalPath);
      }
    }
  }
}
const CanvasShapeIndicators = memo(function CanvasShapeIndicators2() {
  const editor = useEditor();
  const canvasRef = useRef(null);
  const rSelectedColor = useRef(null);
  const isDarkMode = useIsDarkMode();
  useEffect(() => {
    const timer = editor.timers.setTimeout(() => {
      rSelectedColor.current = null;
    }, 0);
    return () => clearTimeout(timer);
  }, [isDarkMode, editor]);
  const activePeerIds$ = useActivePeerIds$();
  const $renderData = useComputed(
    "indicator render data",
    () => {
      const renderingShapeIds = new Set(editor.getRenderingShapes().map((s) => s.id));
      const idsToDisplay = /* @__PURE__ */ new Set();
      const instanceState = editor.getInstanceState();
      const isChangingStyle = instanceState.isChangingStyle;
      const isIdleOrEditing = editor.isInAny("select.idle", "select.editing_shape");
      const isInSelectState = editor.isInAny(
        "select.brushing",
        "select.scribble_brushing",
        "select.pointing_shape",
        "select.pointing_selection",
        "select.pointing_handle"
      );
      if (!isChangingStyle && (isIdleOrEditing || isInSelectState)) {
        for (const id of editor.getSelectedShapeIds()) {
          idsToDisplay.add(id);
        }
        if (isIdleOrEditing && instanceState.isHoveringCanvas && !instanceState.isCoarsePointer) {
          const hovered = editor.getHoveredShapeId();
          if (hovered) idsToDisplay.add(hovered);
        }
      }
      const hintingShapeIds = dedupe(editor.getHintingShapeIds());
      const collaboratorIndicators = [];
      const currentPageId = editor.getCurrentPageId();
      const activePeerIds = activePeerIds$.get();
      const collaborators = editor.getCollaborators();
      for (const peerId of activePeerIds.values()) {
        const presence = collaborators.find((c) => c.userId === peerId);
        if (!presence || presence.currentPageId !== currentPageId) continue;
        const visibleShapeIds = presence.selectedShapeIds.filter(
          (id) => renderingShapeIds.has(id) && !editor.isShapeHidden(id)
        );
        if (visibleShapeIds.length > 0) {
          collaboratorIndicators.push({
            color: presence.color,
            shapeIds: visibleShapeIds
          });
        }
      }
      return {
        idsToDisplay,
        renderingShapeIds,
        hintingShapeIds,
        collaboratorIndicators
      };
    },
    { isEqual: renderDataEqual },
    [editor, activePeerIds$]
  );
  useQuickReactor(
    "canvas indicators render",
    () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { idsToDisplay, renderingShapeIds, hintingShapeIds, collaboratorIndicators } = $renderData.get();
      const { w, h } = editor.getViewportScreenBounds();
      const dpr = window.devicePixelRatio || 1;
      const { x: cx, y: cy, z: zoom } = editor.getCamera();
      const canvasWidth = Math.ceil(w * dpr);
      const canvasHeight = Math.ceil(h * dpr);
      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
      ctx.resetTransform();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      ctx.scale(zoom, zoom);
      ctx.translate(cx, cy);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 1.5 / zoom;
      for (const collaborator of collaboratorIndicators) {
        ctx.strokeStyle = collaborator.color;
        ctx.globalAlpha = 0.7;
        for (const shapeId of collaborator.shapeIds) {
          renderShapeIndicator(ctx, editor, shapeId, renderingShapeIds);
        }
      }
      ctx.globalAlpha = 1;
      if (!rSelectedColor.current) {
        rSelectedColor.current = getComputedStyle(canvas).getPropertyValue("--tl-color-selected");
      }
      ctx.strokeStyle = rSelectedColor.current;
      ctx.lineWidth = 1.5 / zoom;
      for (const shapeId of idsToDisplay) {
        renderShapeIndicator(ctx, editor, shapeId, renderingShapeIds);
      }
      if (hintingShapeIds.length > 0) {
        ctx.lineWidth = 2.5 / zoom;
        for (const shapeId of hintingShapeIds) {
          renderShapeIndicator(ctx, editor, shapeId, renderingShapeIds);
        }
      }
    },
    [editor, $renderData]
  );
  return /* @__PURE__ */ jsx("canvas", { ref: canvasRef, className: "tl-canvas-indicators" });
});
export {
  CanvasShapeIndicators
};
//# sourceMappingURL=CanvasShapeIndicators.mjs.map
