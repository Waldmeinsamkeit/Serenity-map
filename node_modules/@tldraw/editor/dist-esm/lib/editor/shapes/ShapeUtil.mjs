import { EMPTY_ARRAY } from "@tldraw/state";
class ShapeUtil {
  constructor(editor) {
    this.editor = editor;
  }
  /** Configure this shape utils {@link ShapeUtil.options | `options`}. */
  static configure(options) {
    return class extends this {
      // @ts-expect-error
      options = { ...this.options, ...options };
    };
  }
  /**
   * Options for this shape util. If you're implementing a custom shape util, you can override
   * this to provide customization options for your shape. If using an existing shape util, you
   * can customizing this by calling {@link ShapeUtil.configure}.
   */
  options = {};
  /**
   * Props allow you to define the shape's properties in a way that the editor can understand.
   * This has two main uses:
   *
   * 1. Validation. Shapes will be validated using these props to stop bad data from being saved.
   * 2. Styles. Each {@link @tldraw/tlschema#StyleProp} in the props can be set on many shapes at
   *    once, and will be remembered from one shape to the next.
   *
   * @example
   * ```tsx
   * import {T, TLBaseShape, TLDefaultColorStyle, DefaultColorStyle, ShapeUtil} from 'tldraw'
   *
   * type MyShape = TLBaseShape<'mine', {
   *      color: TLDefaultColorStyle,
   *      text: string,
   * }>
   *
   * class MyShapeUtil extends ShapeUtil<MyShape> {
   *     static props = {
   *         // we use tldraw's built-in color style:
   *         color: DefaultColorStyle,
   *         // validate that the text prop is a string:
   *         text: T.string,
   *     }
   * }
   * ```
   */
  static props;
  /**
   * Migrations allow you to make changes to a shape's props over time. Read the
   * {@link https://www.tldraw.dev/docs/persistence#Shape-props-migrations | shape prop migrations}
   * guide for more information.
   */
  static migrations;
  /**
   * The type of the shape util, which should match the shape's type.
   *
   * @public
   */
  static type;
  /**
   * Whether to use the legacy React-based indicator rendering.
   *
   * Override this to return `false` if your shape implements {@link ShapeUtil.getIndicatorPath}
   * for canvas-based indicator rendering.
   *
   * @returns `true` to use SVG indicators (default), `false` to use canvas indicators.
   * @public
   */
  useLegacyIndicator() {
    return true;
  }
  /**
   * Get a Path2D for rendering the shape's indicator on the canvas.
   *
   * When implemented, this is used instead of {@link ShapeUtil.indicator} for more
   * efficient canvas-based indicator rendering. Shapes that return `undefined` will
   * fall back to SVG-based rendering via {@link ShapeUtil.indicator}.
   *
   * For complex indicators that need clipping (e.g., arrows with labels), return an
   * object with `path`, `clipPath`, and `additionalPaths` properties.
   *
   * @param shape - The shape.
   * @returns A Path2D to stroke, or an object with clipping info, or undefined to use SVG fallback.
   * @public
   */
  getIndicatorPath(shape) {
    return void 0;
  }
  /**
   * Get the font faces that should be rendered in the document in order for this shape to render
   * correctly.
   *
   * @param shape - The shape.
   * @public
   */
  getFontFaces(shape) {
    return EMPTY_ARRAY;
  }
  /**
   * Whether the shape can be snapped to by another shape.
   *
   * @param shape - The shape.
   * @public
   */
  canSnap(shape) {
    return true;
  }
  /**
   * Whether the shape can be tabbed to.
   *
   * @param shape - The shape.
   * @public
   */
  canTabTo(shape) {
    return true;
  }
  /**
   * Whether the shape can be scrolled while editing.
   *
   * @public
   */
  canScroll(shape) {
    return false;
  }
  /**
   * Whether the shape can be bound to. See {@link TLShapeUtilCanBindOpts} for details.
   *
   * @public
   */
  canBind(_opts) {
    return true;
  }
  /**
   * Whether the shape can be double clicked to edit.
   *
   * @public
   */
  canEdit(shape, info) {
    return false;
  }
  /**
   * Whether the shape can be resized.
   *
   * @public
   */
  canResize(shape) {
    return true;
  }
  /**
   * When the shape is resized, whether the shape's children should also be resized.
   *
   * @public
   */
  canResizeChildren(shape) {
    return true;
  }
  /**
   * Whether the shape can be edited in read-only mode.
   *
   * @public
   */
  canEditInReadonly(shape) {
    return false;
  }
  /**
   * Whether the shape can be edited while locked or while an ancestor is locked.
   *
   * @public
   */
  canEditWhileLocked(shape) {
    return false;
  }
  /**
   * Whether the shape can be cropped.
   *
   * @public
   */
  canCrop(shape) {
    return false;
  }
  /**
   * Whether the shape can participate in layout functions such as alignment or distribution.
   *
   * @param shape - The shape.
   * @param info - Additional context information: the type of action causing the layout and the
   * @public
   *
   * @public
   */
  canBeLaidOut(shape, info) {
    return true;
  }
  /**
   * Whether this shape can be culled. By default, shapes are culled for
   * performance reasons when they are outside of the viewport. Culled shapes are still rendered
   * to the DOM, but have their `display` property set to `none`.
   *
   * @param shape - The shape.
   */
  canCull(shape) {
    return true;
  }
  /**
   * Does this shape provide a background for its children? If this is true,
   * then any children with a `renderBackground` method will have their
   * backgrounds rendered _above_ this shape. Otherwise, the children's
   * backgrounds will be rendered above either the next ancestor that provides
   * a background, or the canvas background.
   *
   * @internal
   */
  providesBackgroundForChildren(shape) {
    return false;
  }
  /**
   * Whether the shape should hide its resize handles when selected.
   *
   * @public
   */
  hideResizeHandles(shape) {
    return false;
  }
  /**
   * Whether the shape should hide its rotation handles when selected.
   *
   * @public
   */
  hideRotateHandle(shape) {
    return false;
  }
  /**
   * Whether the shape should hide its selection bounds background when selected.
   *
   * @public
   */
  hideSelectionBoundsBg(shape) {
    return false;
  }
  /**
   * Whether the shape should hide its selection bounds foreground when selected.
   *
   * @public
   */
  hideSelectionBoundsFg(shape) {
    return false;
  }
  /**
   * Whether the shape's aspect ratio is locked.
   *
   * @public
   */
  isAspectRatioLocked(shape) {
    return false;
  }
  /**
   * By default, the bounds of an image export are the bounds of all the shapes it contains, plus
   * some padding. If an export includes a shape where `isExportBoundsContainer` is true, then the
   * padding is skipped _if the bounds of that shape contains all the other shapes_. This is
   * useful in cases like annotating on top of an image, where you usually want to avoid extra
   * padding around the image if you don't need it.
   *
   * @param shape - The shape to check
   * @returns True if this shape should be treated as an export bounds container
   */
  isExportBoundsContainer(shape) {
    return false;
  }
  /**
   * Get whether the shape can receive children of a given type.
   *
   * @param shape - The shape.
   * @param type - The shape type.
   * @public
   */
  canReceiveNewChildrenOfType(shape, _type) {
    return false;
  }
  /** @internal */
  expandSelectionOutlinePx(shape) {
    return 0;
  }
  /**
   * Return elements to be added to the \<defs\> section of the canvases SVG context. This can be
   * used to define SVG content (e.g. patterns & masks) that can be referred to by ID from svg
   * elements returned by `component`.
   *
   * Each def should have a unique `key`. If multiple defs from different shapes all have the same
   * key, only one will be used.
   */
  getCanvasSvgDefs() {
    return [];
  }
  /**
   * Get the geometry to use when snapping to this this shape in translate/resize operations. See
   * {@link BoundsSnapGeometry} for details.
   */
  getBoundsSnapGeometry(shape) {
    return {};
  }
  /**
   * Get the geometry to use when snapping handles to this shape. See {@link HandleSnapGeometry}
   * for details.
   */
  getHandleSnapGeometry(shape) {
    return {};
  }
  getText(shape) {
    return void 0;
  }
  getAriaDescriptor(shape) {
    return void 0;
  }
}
export {
  ShapeUtil
};
//# sourceMappingURL=ShapeUtil.mjs.map
