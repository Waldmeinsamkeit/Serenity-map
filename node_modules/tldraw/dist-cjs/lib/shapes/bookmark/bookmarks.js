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
var bookmarks_exports = {};
__export(bookmarks_exports, {
  BOOKMARK_HEIGHT: () => BOOKMARK_HEIGHT,
  BOOKMARK_JUST_URL_HEIGHT: () => BOOKMARK_JUST_URL_HEIGHT,
  BOOKMARK_WIDTH: () => BOOKMARK_WIDTH,
  createBookmarkFromUrl: () => createBookmarkFromUrl,
  getBookmarkHeight: () => getBookmarkHeight,
  getHumanReadableAddress: () => getHumanReadableAddress,
  setBookmarkHeight: () => setBookmarkHeight,
  updateBookmarkAssetOnUrlChange: () => updateBookmarkAssetOnUrlChange
});
module.exports = __toCommonJS(bookmarks_exports);
var import_editor = require("@tldraw/editor");
const BOOKMARK_WIDTH = 300;
const BOOKMARK_HEIGHT = 320;
const BOOKMARK_JUST_URL_HEIGHT = 46;
const SHORT_BOOKMARK_HEIGHT = 101;
function getBookmarkHeight(editor, assetId) {
  const asset = assetId ? editor.getAsset(assetId) : null;
  if (asset) {
    if (!asset.props.image) {
      if (!asset.props.title) {
        return BOOKMARK_JUST_URL_HEIGHT;
      } else {
        return SHORT_BOOKMARK_HEIGHT;
      }
    }
  }
  return BOOKMARK_HEIGHT;
}
function setBookmarkHeight(editor, shape) {
  return {
    ...shape,
    props: { ...shape.props, h: getBookmarkHeight(editor, shape.props.assetId) }
  };
}
const getHumanReadableAddress = (url) => {
  try {
    const objUrl = new URL(url);
    return objUrl.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};
function updateBookmarkAssetOnUrlChange(editor, shape) {
  const { url } = shape.props;
  const assetId = import_editor.AssetRecordType.createId((0, import_editor.getHashForString)(url));
  if (editor.getAsset(assetId)) {
    if (shape.props.assetId !== assetId) {
      editor.updateShapes([
        {
          id: shape.id,
          type: shape.type,
          props: { assetId }
        }
      ]);
    }
  } else {
    editor.updateShapes([
      {
        id: shape.id,
        type: shape.type,
        props: { assetId: null }
      }
    ]);
    createBookmarkAssetOnUrlChange(editor, shape);
  }
}
const createBookmarkAssetOnUrlChange = (0, import_editor.debounce)(async (editor, shape) => {
  if (editor.isDisposed) return;
  const { url } = shape.props;
  const asset = await editor.getAssetForExternalContent({ type: "url", url });
  if (!asset) {
    return;
  }
  editor.run(() => {
    editor.createAssets([asset]);
    editor.updateShapes([
      {
        id: shape.id,
        type: shape.type,
        props: { assetId: asset.id }
      }
    ]);
  });
}, 500);
async function createBookmarkFromUrl(editor, {
  url,
  center = editor.getViewportPageBounds().center
}) {
  try {
    const asset = await editor.getAssetForExternalContent({ type: "url", url });
    const shapeId = (0, import_editor.createShapeId)();
    const shapePartial = {
      id: shapeId,
      type: "bookmark",
      x: center.x - BOOKMARK_WIDTH / 2,
      y: center.y - BOOKMARK_HEIGHT / 2,
      rotation: 0,
      opacity: 1,
      props: {
        url,
        assetId: asset?.id || null,
        w: BOOKMARK_WIDTH,
        h: getBookmarkHeight(editor, asset?.id)
      }
    };
    editor.run(() => {
      if (asset) {
        editor.createAssets([asset]);
      }
      editor.createShapes([shapePartial]);
    });
    const createdShape = editor.getShape(shapeId);
    return import_editor.Result.ok(createdShape);
  } catch (error) {
    return import_editor.Result.err(error instanceof Error ? error.message : "Failed to create bookmark");
  }
}
//# sourceMappingURL=bookmarks.js.map
