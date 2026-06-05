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
var TLArrowShape_exports = {};
__export(TLArrowShape_exports, {
  ArrowShapeArrowheadEndStyle: () => ArrowShapeArrowheadEndStyle,
  ArrowShapeArrowheadStartStyle: () => ArrowShapeArrowheadStartStyle,
  ArrowShapeKindStyle: () => ArrowShapeKindStyle,
  arrowShapeMigrations: () => arrowShapeMigrations,
  arrowShapeProps: () => arrowShapeProps,
  arrowShapeVersions: () => arrowShapeVersions
});
module.exports = __toCommonJS(TLArrowShape_exports);
var import_store = require("@tldraw/store");
var import_utils = require("@tldraw/utils");
var import_validate = require("@tldraw/validate");
var import_TLRichText = require("../misc/TLRichText");
var import_geometry_types = require("../misc/geometry-types");
var import_TLBinding = require("../records/TLBinding");
var import_TLShape = require("../records/TLShape");
var import_recordsWithProps = require("../recordsWithProps");
var import_StyleProp = require("../styles/StyleProp");
var import_TLColorStyle = require("../styles/TLColorStyle");
var import_TLDashStyle = require("../styles/TLDashStyle");
var import_TLFillStyle = require("../styles/TLFillStyle");
var import_TLFontStyle = require("../styles/TLFontStyle");
var import_TLSizeStyle = require("../styles/TLSizeStyle");
const arrowKinds = ["arc", "elbow"];
const ArrowShapeKindStyle = import_StyleProp.StyleProp.defineEnum("tldraw:arrowKind", {
  defaultValue: "arc",
  values: arrowKinds
});
const arrowheadTypes = [
  "arrow",
  "triangle",
  "square",
  "dot",
  "pipe",
  "diamond",
  "inverted",
  "bar",
  "none"
];
const ArrowShapeArrowheadStartStyle = import_StyleProp.StyleProp.defineEnum("tldraw:arrowheadStart", {
  defaultValue: "none",
  values: arrowheadTypes
});
const ArrowShapeArrowheadEndStyle = import_StyleProp.StyleProp.defineEnum("tldraw:arrowheadEnd", {
  defaultValue: "arrow",
  values: arrowheadTypes
});
const arrowShapeProps = {
  kind: ArrowShapeKindStyle,
  labelColor: import_TLColorStyle.DefaultLabelColorStyle,
  color: import_TLColorStyle.DefaultColorStyle,
  fill: import_TLFillStyle.DefaultFillStyle,
  dash: import_TLDashStyle.DefaultDashStyle,
  size: import_TLSizeStyle.DefaultSizeStyle,
  arrowheadStart: ArrowShapeArrowheadStartStyle,
  arrowheadEnd: ArrowShapeArrowheadEndStyle,
  font: import_TLFontStyle.DefaultFontStyle,
  start: import_geometry_types.vecModelValidator,
  end: import_geometry_types.vecModelValidator,
  bend: import_validate.T.number,
  richText: import_TLRichText.richTextValidator,
  labelPosition: import_validate.T.number,
  scale: import_validate.T.nonZeroNumber,
  elbowMidPoint: import_validate.T.number
};
const arrowShapeVersions = (0, import_TLShape.createShapePropsMigrationIds)("arrow", {
  AddLabelColor: 1,
  AddIsPrecise: 2,
  AddLabelPosition: 3,
  ExtractBindings: 4,
  AddScale: 5,
  AddElbow: 6,
  AddRichText: 7,
  AddRichTextAttrs: 8
});
function propsMigration(migration) {
  return (0, import_recordsWithProps.createPropsMigration)("shape", "arrow", migration);
}
const arrowShapeMigrations = (0, import_store.createMigrationSequence)({
  sequenceId: "com.tldraw.shape.arrow",
  retroactive: false,
  sequence: [
    propsMigration({
      id: arrowShapeVersions.AddLabelColor,
      up: (props) => {
        props.labelColor = "black";
      },
      down: "retired"
    }),
    propsMigration({
      id: arrowShapeVersions.AddIsPrecise,
      up: ({ start, end }) => {
        if (start.type === "binding") {
          start.isPrecise = !(start.normalizedAnchor.x === 0.5 && start.normalizedAnchor.y === 0.5);
        }
        if (end.type === "binding") {
          end.isPrecise = !(end.normalizedAnchor.x === 0.5 && end.normalizedAnchor.y === 0.5);
        }
      },
      down: ({ start, end }) => {
        if (start.type === "binding") {
          if (!start.isPrecise) {
            start.normalizedAnchor = { x: 0.5, y: 0.5 };
          }
          delete start.isPrecise;
        }
        if (end.type === "binding") {
          if (!end.isPrecise) {
            end.normalizedAnchor = { x: 0.5, y: 0.5 };
          }
          delete end.isPrecise;
        }
      }
    }),
    propsMigration({
      id: arrowShapeVersions.AddLabelPosition,
      up: (props) => {
        props.labelPosition = 0.5;
      },
      down: (props) => {
        delete props.labelPosition;
      }
    }),
    {
      id: arrowShapeVersions.ExtractBindings,
      scope: "storage",
      up: (storage) => {
        const updates = [];
        for (const record of storage.values()) {
          if (record.typeName !== "shape" || record.type !== "arrow") continue;
          const arrow = record;
          const newArrow = (0, import_utils.structuredClone)(arrow);
          const { start, end } = arrow.props;
          if (start.type === "binding") {
            const id = (0, import_TLBinding.createBindingId)();
            const binding = {
              typeName: "binding",
              id,
              type: "arrow",
              fromId: arrow.id,
              toId: start.boundShapeId,
              meta: {},
              props: {
                terminal: "start",
                normalizedAnchor: start.normalizedAnchor,
                isExact: start.isExact,
                isPrecise: start.isPrecise
              }
            };
            updates.push([id, binding]);
            newArrow.props.start = { x: 0, y: 0 };
          } else {
            delete newArrow.props.start.type;
          }
          if (end.type === "binding") {
            const id = (0, import_TLBinding.createBindingId)();
            const binding = {
              typeName: "binding",
              id,
              type: "arrow",
              fromId: arrow.id,
              toId: end.boundShapeId,
              meta: {},
              props: {
                terminal: "end",
                normalizedAnchor: end.normalizedAnchor,
                isExact: end.isExact,
                isPrecise: end.isPrecise
              }
            };
            updates.push([id, binding]);
            newArrow.props.end = { x: 0, y: 0 };
          } else {
            delete newArrow.props.end.type;
          }
          updates.push([arrow.id, newArrow]);
        }
        for (const [id, record] of updates) {
          storage.set(id, record);
        }
      }
    },
    propsMigration({
      id: arrowShapeVersions.AddScale,
      up: (props) => {
        props.scale = 1;
      },
      down: (props) => {
        delete props.scale;
      }
    }),
    propsMigration({
      id: arrowShapeVersions.AddElbow,
      up: (props) => {
        props.kind = "arc";
        props.elbowMidPoint = 0.5;
      },
      down: (props) => {
        delete props.kind;
        delete props.elbowMidPoint;
      }
    }),
    propsMigration({
      id: arrowShapeVersions.AddRichText,
      up: (props) => {
        props.richText = (0, import_TLRichText.toRichText)(props.text);
        delete props.text;
      }
      // N.B. Explicitly no down state so that we force clients to update.
      // down: (props) => {
      // 	delete props.richText
      // },
    }),
    propsMigration({
      id: arrowShapeVersions.AddRichTextAttrs,
      up: (_props) => {
      },
      down: (props) => {
        if (props.richText && "attrs" in props.richText) {
          delete props.richText.attrs;
        }
      }
    })
  ]
});
//# sourceMappingURL=TLArrowShape.js.map
