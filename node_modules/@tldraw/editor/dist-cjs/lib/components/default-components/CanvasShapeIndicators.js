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
var CanvasShapeIndicators_exports = {};
__export(CanvasShapeIndicators_exports, {
  CanvasShapeIndicators: () => CanvasShapeIndicators
});
module.exports = __toCommonJS(CanvasShapeIndicators_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_state_react = require("@tldraw/state-react");
var import_store = require("@tldraw/store");
var import_utils = require("@tldraw/utils");
var import_react = require("react");
var import_useEditor = require("../../hooks/useEditor");
var import_useIsDarkMode = require("../../hooks/useIsDarkMode");
var import_usePeerIds = require("../../hooks/usePeerIds");
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
const indicatorPathCache = (0, import_store.createComputedCache)(
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
const CanvasShapeIndicators = (0, import_react.memo)(function CanvasShapeIndicators2() {
  const editor = (0, import_useEditor.useEditor)();
  const canvasRef = (0, import_react.useRef)(null);
  const rSelectedColor = (0, import_react.useRef)(null);
  const isDarkMode = (0, import_useIsDarkMode.useIsDarkMode)();
  (0, import_react.useEffect)(() => {
    const timer = editor.timers.setTimeout(() => {
      rSelectedColor.current = null;
    }, 0);
    return () => clearTimeout(timer);
  }, [isDarkMode, editor]);
  const activePeerIds$ = (0, import_usePeerIds.useActivePeerIds$)();
  const $renderData = (0, import_state_react.useComputed)(
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
      const hintingShapeIds = (0, import_utils.dedupe)(editor.getHintingShapeIds());
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
  (0, import_state_react.useQuickReactor)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", { ref: canvasRef, className: "tl-canvas-indicators" });
});
//# sourceMappingURL=CanvasShapeIndicators.js.map
