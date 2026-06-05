import { T } from "@tldraw/validate";
import { b64Vecs } from "../misc/b64Vecs.mjs";
import { createShapePropsMigrationIds, createShapePropsMigrationSequence } from "../records/TLShape.mjs";
import { DefaultColorStyle } from "../styles/TLColorStyle.mjs";
import { DefaultDashStyle } from "../styles/TLDashStyle.mjs";
import { DefaultFillStyle } from "../styles/TLFillStyle.mjs";
import { DefaultSizeStyle } from "../styles/TLSizeStyle.mjs";
const DrawShapeSegment = T.object({
  type: T.literalEnum("free", "straight"),
  path: T.string
});
const drawShapeProps = {
  color: DefaultColorStyle,
  fill: DefaultFillStyle,
  dash: DefaultDashStyle,
  size: DefaultSizeStyle,
  segments: T.arrayOf(DrawShapeSegment),
  isComplete: T.boolean,
  isClosed: T.boolean,
  isPen: T.boolean,
  scale: T.nonZeroNumber,
  scaleX: T.nonZeroFiniteNumber,
  scaleY: T.nonZeroFiniteNumber
};
const Versions = createShapePropsMigrationIds("draw", {
  AddInPen: 1,
  AddScale: 2,
  Base64: 3,
  LegacyPointsConversion: 4
});
const drawShapeMigrations = createShapePropsMigrationSequence({
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
          const vecModels = Array.isArray(points) ? points : b64Vecs._legacyDecodePoints(points);
          return {
            ...rest,
            path: b64Vecs.encodePoints(vecModels)
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
            points: b64Vecs.decodePoints(path)
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
          const vecModels = Array.isArray(points) ? points : b64Vecs._legacyDecodePoints(points);
          return {
            ...rest,
            path: b64Vecs.encodePoints(vecModels)
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
    path: b64Vecs.encodePoints(segment.points)
  }));
}
export {
  DrawShapeSegment,
  compressLegacySegments,
  drawShapeMigrations,
  drawShapeProps,
  Versions as drawShapeVersions
};
//# sourceMappingURL=TLDrawShape.mjs.map
