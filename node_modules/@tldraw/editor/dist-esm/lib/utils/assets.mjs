import { fetch } from "@tldraw/utils";
import { version } from "../../version.mjs";
async function dataUrlToFile(url, filename, mimeType) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return new File([buf], filename, { type: mimeType });
}
const CDN_BASE_URL = "https://cdn.tldraw.com";
function getDefaultCdnBaseUrl() {
  return `${CDN_BASE_URL}/${version}`;
}
export {
  dataUrlToFile,
  getDefaultCdnBaseUrl
};
//# sourceMappingURL=assets.mjs.map
