import { T } from "@tldraw/validate";
import { b64Vecs } from "../misc/b64Vecs.mjs";
import { createShapePropsMigrationIds, createShapePropsMigrationSequence } from "../records/TLShape.mjs";
import { DefaultColorStyle } from "../styles/TLColorStyle.mjs";
import { DefaultSizeStyle } from "../styles/TLSizeStyle.mjs";
import { DrawShapeSegment } from "./TLDrawShape.mjs";
const highlightShapeProps = {
  color: DefaultColorStyle,
  size: DefaultSizeStyle,
  segments: T.arrayOf(DrawShapeSegment),
  isComplete: T.boolean,
  isPen: T.boolean,
  scale: T.nonZeroNumber,
  scaleX: T.nonZeroFiniteNumber,
  scaleY: T.nonZeroFiniteNumber
};
const Versions = createShapePropsMigrationIds("highlight", {
  AddScale: 1,
  Base64: 2,
  LegacyPointsConversion: 3
});
const highlightShapeMigrations = createShapePropsMigrationSequence({
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
export {
  highlightShapeMigrations,
  highlightShapeProps,
  Versions as highlightShapeVersions
};
//# sourceMappingURL=TLHighlightShape.mjs.map
