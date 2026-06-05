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
var TLHighlightShape_exports = {};
__export(TLHighlightShape_exports, {
  highlightShapeMigrations: () => highlightShapeMigrations,
  highlightShapeProps: () => highlightShapeProps,
  highlightShapeVersions: () => Versions
});
module.exports = __toCommonJS(TLHighlightShape_exports);
var import_validate = require("@tldraw/validate");
var import_b64Vecs = require("../misc/b64Vecs");
var import_TLShape = require("../records/TLShape");
var import_TLColorStyle = require("../styles/TLColorStyle");
var import_TLSizeStyle = require("../styles/TLSizeStyle");
var import_TLDrawShape = require("./TLDrawShape");
const highlightShapeProps = {
  color: import_TLColorStyle.DefaultColorStyle,
  size: import_TLSizeStyle.DefaultSizeStyle,
  segments: import_validate.T.arrayOf(import_TLDrawShape.DrawShapeSegment),
  isComplete: import_validate.T.boolean,
  isPen: import_validate.T.boolean,
  scale: import_validate.T.nonZeroNumber,
  scaleX: import_validate.T.nonZeroFiniteNumber,
  scaleY: import_validate.T.nonZeroFiniteNumber
};
const Versions = (0, import_TLShape.createShapePropsMigrationIds)("highlight", {
  AddScale: 1,
  Base64: 2,
  LegacyPointsConversion: 3
});
const highlightShapeMigrations = (0, import_TLShape.createShapePropsMigrationSequence)({
  sequence: [
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
//# sourceMappingURL=TLHighlightShape.js.map
