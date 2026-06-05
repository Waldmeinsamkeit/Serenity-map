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
var TLDrawShape_exports = {};
__export(TLDrawShape_exports, {
  DrawShapeSegment: () => DrawShapeSegment,
  compressLegacySegments: () => compressLegacySegments,
  drawShapeMigrations: () => drawShapeMigrations,
  drawShapeProps: () => drawShapeProps,
  drawShapeVersions: () => Versions
});
module.exports = __toCommonJS(TLDrawShape_exports);
var import_validate = require("@tldraw/validate");
var import_b64Vecs = require("../misc/b64Vecs");
var import_TLShape = require("../records/TLShape");
var import_TLColorStyle = require("../styles/TLColorStyle");
var import_TLDashStyle = require("../styles/TLDashStyle");
var import_TLFillStyle = require("../styles/TLFillStyle");
var import_TLSizeStyle = require("../styles/TLSizeStyle");
const DrawShapeSegment = import_validate.T.object({
  type: import_validate.T.literalEnum("free", "straight"),
  path: import_validate.T.string
});
const drawShapeProps = {
  color: import_TLColorStyle.DefaultColorStyle,
  fill: import_TLFillStyle.DefaultFillStyle,
  dash: import_TLDashStyle.DefaultDashStyle,
  size: import_TLSizeStyle.DefaultSizeStyle,
  segments: import_validate.T.arrayOf(DrawShapeSegment),
  isComplete: import_validate.T.boolean,
  isClosed: import_validate.T.boolean,
  isPen: import_validate.T.boolean,
  scale: import_validate.T.nonZeroNumber,
  scaleX: import_validate.T.nonZeroFiniteNumber,
  scaleY: import_validate.T.nonZeroFiniteNumber
};
const Versions = (0, import_TLShape.createShapePropsMigrationIds)("draw", {
  AddInPen: 1,
  AddScale: 2,
  Base64: 3,
  LegacyPointsConversion: 4
});
const drawShapeMigrations = (0, import_TLShape.createShapePropsMigrationSequence)({
  sequence: [
    {
      id: Versions.AddInPen,
      up: (props) => {
        const { points } = props.segments[0];
        if (points.length === 0) {
          props.isPen = false;
          return;
        }
        let isPen = !(points[0].z === 0 || points[0].z === 0.5);
        if (points[1]) {
          isPen = isPen && !(points[1].z === 0 || points[1].z === 0.5);
        }
        props.isPen = isPen;
      },
      down: "retired"
    },
    {
      id: Versions.AddScale,
      up: (props) => {
        props.scale = 1;
      },
      down: (props) => {
        delete props.scale;
      }
    },
    {
      id: Versions.Base64,
      up: (props) => {
        props.segments = props.segments.map((segment) => {
          if (segment.path !== void 0) return segment;
          const { points, ...rest } = segment;
          const vecModels = Array.isArray(points) ? points : import_b64Vecs.b64Vecs._legacyDecodePoints(points);
          return {
            ...rest,
            path: import_b64Vecs.b64Vecs.encodePoints(vecModels)
          };
        });
        props.scaleX = props.scaleX ?? 1;
        props.scaleY = props.scaleY ?? 1;
      },
      down: (props) => {
        props.segments = props.segments.map((segment) => {
          const { path, ...rest } = segment;
          return {
            ...rest,
            points: import_b64Vecs.b64Vecs.decodePoints(path)
          };
        });
        delete props.scaleX;
        delete props.scaleY;
      }
    },
    {
      id: Versions.LegacyPointsConversion,
      up: (props) => {
        props.segments = props.segments.map((segment) => {
          if (segment.path !== void 0) return segment;
          const { points, ...rest } = segment;
          const vecModels = Array.isArray(points) ? points : import_b64Vecs.b64Vecs._legacyDecodePoints(points);
          return {
            ...rest,
            path: import_b64Vecs.b64Vecs.encodePoints(vecModels)
          };
        });
      },
      down: (_props) => {
      }
    }
  ]
});
function compressLegacySegments(segments) {
  return segments.map((segment) => ({
    type: segment.type,
    path: import_b64Vecs.b64Vecs.encodePoints(segment.points)
  }));
}
//# sourceMappingURL=TLDrawShape.js.map
