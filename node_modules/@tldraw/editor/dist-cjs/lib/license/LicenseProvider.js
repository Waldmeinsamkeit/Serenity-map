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
var LicenseProvider_exports = {};
__export(LicenseProvider_exports, {
  LICENSE_TIMEOUT: () => LICENSE_TIMEOUT,
  LicenseContext: () => LicenseContext,
  LicenseProvider: () => LicenseProvider,
  useLicenseContext: () => useLicenseContext
});
module.exports = __toCommonJS(LicenseProvider_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_state_react = require("@tldraw/state-react");
var import_react = require("react");
var import_LicenseManager = require("./LicenseManager");
const import_meta = {};
const LicenseContext = (0, import_react.createContext)({});
const useLicenseContext = () => (0, import_react.useContext)(LicenseContext);
function shouldHideEditorAfterDelay(licenseState) {
  return licenseState === "expired" || licenseState === "unlicensed-production";
}
const LICENSE_TIMEOUT = 5e3;
function LicenseProvider({
  licenseKey = getLicenseKeyFromEnv() ?? void 0,
  children
}) {
  const [licenseManager] = (0, import_react.useState)(() => new import_LicenseManager.LicenseManager(licenseKey));
  const licenseState = (0, import_state_react.useValue)(licenseManager.state);
  const [showEditor, setShowEditor] = (0, import_react.useState)(true);
  (0, import_react.useEffect)(() => {
    if (shouldHideEditorAfterDelay(licenseState) && showEditor) {
      const timer = setTimeout(() => {
        setShowEditor(false);
      }, LICENSE_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [licenseState, showEditor]);
  if (shouldHideEditorAfterDelay(licenseState) && !showEditor) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LicenseGate, {});
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LicenseContext.Provider, { value: licenseManager, children });
}
function LicenseGate() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { "data-testid": "tl-license-expired", style: { display: "none" } });
}
let envLicenseKey = void 0;
function getLicenseKeyFromEnv() {
  if (envLicenseKey !== void 0) {
    return envLicenseKey;
  }
  envLicenseKey = getEnv(() => process.env.TLDRAW_LICENSE_KEY) || getEnv(() => process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY) || getEnv(() => process.env.REACT_APP_TLDRAW_LICENSE_KEY) || getEnv(() => process.env.GATSBY_TLDRAW_LICENSE_KEY) || getEnv(() => process.env.VITE_TLDRAW_LICENSE_KEY) || getEnv(() => process.env.PUBLIC_TLDRAW_LICENSE_KEY) || getEnv(() => import_meta.env.TLDRAW_LICENSE_KEY) || getEnv(() => import_meta.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY) || getEnv(() => import_meta.env.REACT_APP_TLDRAW_LICENSE_KEY) || getEnv(() => import_meta.env.GATSBY_TLDRAW_LICENSE_KEY) || getEnv(() => import_meta.env.VITE_TLDRAW_LICENSE_KEY) || getEnv(() => import_meta.env.PUBLIC_TLDRAW_LICENSE_KEY) || null;
  return envLicenseKey;
}
function getEnv(cb) {
  try {
    return cb();
  } catch {
    return void 0;
  }
}
//# sourceMappingURL=LicenseProvider.js.map
