import { jsx } from "react/jsx-runtime";
import { useValue } from "@tldraw/state-react";
import { createContext, useContext, useEffect, useState } from "react";
import { LicenseManager } from "./LicenseManager.mjs";
const LicenseContext = createContext({});
const useLicenseContext = () => useContext(LicenseContext);
function shouldHideEditorAfterDelay(licenseState) {
  return licenseState === "expired" || licenseState === "unlicensed-production";
}
const LICENSE_TIMEOUT = 5e3;
function LicenseProvider({
  licenseKey = getLicenseKeyFromEnv() ?? void 0,
  children
}) {
  const [licenseManager] = useState(() => new LicenseManager(licenseKey));
  const licenseState = useValue(licenseManager.state);
  const [showEditor, setShowEditor] = useState(true);
  useEffect(() => {
    if (shouldHideEditorAfterDelay(licenseState) && showEditor) {
      const timer = setTimeout(() => {
        setShowEditor(false);
      }, LICENSE_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [licenseState, showEditor]);
  if (shouldHideEditorAfterDelay(licenseState) && !showEditor) {
    return /* @__PURE__ */ jsx(LicenseGate, {});
  }
  return /* @__PURE__ */ jsx(LicenseContext.Provider, { value: licenseManager, children });
}
function LicenseGate() {
  return /* @__PURE__ */ jsx("div", { "data-testid": "tl-license-expired", style: { display: "none" } });
}
let envLicenseKey = void 0;
function getLicenseKeyFromEnv() {
  if (envLicenseKey !== void 0) {
    return envLicenseKey;
  }
  envLicenseKey = getEnv(() => process.env.TLDRAW_LICENSE_KEY) || getEnv(() => process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY) || getEnv(() => process.env.REACT_APP_TLDRAW_LICENSE_KEY) || getEnv(() => process.env.GATSBY_TLDRAW_LICENSE_KEY) || getEnv(() => process.env.VITE_TLDRAW_LICENSE_KEY) || getEnv(() => process.env.PUBLIC_TLDRAW_LICENSE_KEY) || getEnv(() => import.meta.env.TLDRAW_LICENSE_KEY) || getEnv(() => import.meta.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY) || getEnv(() => import.meta.env.REACT_APP_TLDRAW_LICENSE_KEY) || getEnv(() => import.meta.env.GATSBY_TLDRAW_LICENSE_KEY) || getEnv(() => import.meta.env.VITE_TLDRAW_LICENSE_KEY) || getEnv(() => import.meta.env.PUBLIC_TLDRAW_LICENSE_KEY) || null;
  return envLicenseKey;
}
function getEnv(cb) {
  try {
    return cb();
  } catch {
    return void 0;
  }
}
export {
  LICENSE_TIMEOUT,
  LicenseContext,
  LicenseProvider,
  useLicenseContext
};
//# sourceMappingURL=LicenseProvider.mjs.map
