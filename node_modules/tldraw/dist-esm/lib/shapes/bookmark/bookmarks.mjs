import {
  AssetRecordType,
  Result,
  createShapeId,
  debounce,
  getHashForString
} from "@tldraw/editor";
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
  const assetId = AssetRecordType.createId(getHashForString(url));
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
const createBookmarkAssetOnUrlChange = debounce(async (editor, shape) => {
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
    const shapeId = createShapeId();
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
    return Result.ok(createdShape);
  } catch (error) {
    return Result.err(error instanceof Error ? error.message : "Failed to create bookmark");
  }
}
export {
  BOOKMARK_HEIGHT,
  BOOKMARK_JUST_URL_HEIGHT,
  BOOKMARK_WIDTH,
  createBookmarkFromUrl,
  getBookmarkHeight,
  getHumanReadableAddress,
  setBookmarkHeight,
  updateBookmarkAssetOnUrlChange
};
//# sourceMappingURL=bookmarks.mjs.map
