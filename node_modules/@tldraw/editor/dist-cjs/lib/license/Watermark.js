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
var Watermark_exports = {};
__export(Watermark_exports, {
  Watermark: () => Watermark
});
module.exports = __toCommonJS(Watermark_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_state_react = require("@tldraw/state-react");
var import_react = require("react");
var import_useCanvasEvents = require("../hooks/useCanvasEvents");
var import_useEditor = require("../hooks/useEditor");
var import_usePassThroughWheelEvents = require("../hooks/usePassThroughWheelEvents");
var import_dom = require("../utils/dom");
var import_runtime = require("../utils/runtime");
var import_watermarks = require("../watermarks");
var import_LicenseManager = require("./LicenseManager");
var import_LicenseProvider = require("./LicenseProvider");
var import_useLicenseManagerState = require("./useLicenseManagerState");
const WATERMARK_DESKTOP_LOCAL_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(import_watermarks.watermarkDesktopSvg)}`;
const WATERMARK_MOBILE_LOCAL_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(import_watermarks.watermarkMobileSvg)}`;
const Watermark = (0, import_react.memo)(function Watermark2() {
  const licenseManager = (0, import_LicenseProvider.useLicenseContext)();
  const editor = (0, import_useEditor.useEditor)();
  const isMobile = (0, import_state_react.useValue)("is mobile", () => editor.getViewportScreenBounds().width < 700, [
    editor
  ]);
  const licenseManagerState = (0, import_useLicenseManagerState.useLicenseManagerState)(licenseManager);
  if (!["licensed-with-watermark", "unlicensed"].includes(licenseManagerState)) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LicenseStyles, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      WatermarkInner,
      {
        src: isMobile ? WATERMARK_MOBILE_LOCAL_SRC : WATERMARK_DESKTOP_LOCAL_SRC,
        isUnlicensed: licenseManagerState === "unlicensed"
      }
    )
  ] });
});
const UnlicensedWatermark = (0, import_react.memo)(function UnlicensedWatermark2({
  isDebugMode,
  isMobile
}) {
  const editor = (0, import_useEditor.useEditor)();
  const events = (0, import_useCanvasEvents.useCanvasEvents)();
  const ref = (0, import_react.useRef)(null);
  (0, import_usePassThroughWheelEvents.usePassThroughWheelEvents)(ref);
  const url = "https://tldraw.dev/pricing?utm_source=sdk&utm_medium=organic&utm_campaign=watermark";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      ref,
      className: import_LicenseManager.LicenseManager.className,
      "data-debug": isDebugMode,
      "data-mobile": isMobile,
      "data-unlicensed": true,
      "data-testid": "tl-watermark-unlicensed",
      draggable: false,
      ...events,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          draggable: false,
          role: "button",
          onPointerDown: (e) => {
            editor.markEventAsHandled(e);
            (0, import_dom.preventDefault)(e);
          },
          title: "The tldraw SDK requires a license key to work in production. You can get a free 100-day trial license at tldraw.dev/pricing.",
          onClick: () => {
            import_runtime.runtime.openWindow(url, "_blank", true);
          },
          children: "Get a license for production"
        }
      )
    }
  );
});
const WatermarkInner = (0, import_react.memo)(function WatermarkInner2({
  src,
  isUnlicensed
}) {
  const editor = (0, import_useEditor.useEditor)();
  const isDebugMode = (0, import_state_react.useValue)("debug mode", () => editor.getInstanceState().isDebugMode, [editor]);
  const isMobile = (0, import_state_react.useValue)("is mobile", () => editor.getViewportScreenBounds().width < 700, [
    editor
  ]);
  const events = (0, import_useCanvasEvents.useCanvasEvents)();
  const ref = (0, import_react.useRef)(null);
  (0, import_usePassThroughWheelEvents.usePassThroughWheelEvents)(ref);
  const maskCss = `url('${src}') center 100% / 100% no-repeat`;
  const url = "https://tldraw.dev/?utm_source=sdk&utm_medium=organic&utm_campaign=watermark";
  if (isUnlicensed) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnlicensedWatermark, { isDebugMode, isMobile });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      ref,
      className: import_LicenseManager.LicenseManager.className,
      "data-debug": isDebugMode,
      "data-mobile": isMobile,
      "data-testid": "tl-watermark-licensed",
      draggable: false,
      ...events,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          draggable: false,
          role: "button",
          onPointerDown: (e) => {
            editor.markEventAsHandled(e);
            (0, import_dom.preventDefault)(e);
          },
          title: "Build infinite canvas applications with the tldraw SDK. Learn more at https://tldraw.dev.",
          onClick: () => {
            import_runtime.runtime.openWindow(url, "_blank");
          },
          style: { mask: maskCss, WebkitMask: maskCss }
        }
      )
    }
  );
});
const LicenseStyles = (0, import_react.memo)(function LicenseStyles2() {
  const editor = (0, import_useEditor.useEditor)();
  const className = import_LicenseManager.LicenseManager.className;
  const CSS = `
/* ------------------- SEE LICENSE -------------------
The tldraw watermark is part of tldraw's license. It is shown for unlicensed
or "licensed-with-watermark" users. By using this library, you agree to
preserve the watermark's behavior, keeping it visible, unobscured, and
available to user-interaction.

To remove the watermark, please purchase a license at tldraw.dev.
*/

.${className} {
	position: absolute;
	bottom: max(var(--tl-space-2), env(safe-area-inset-bottom));
	right: max(var(--tl-space-2), env(safe-area-inset-right));
	width: 96px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: var(--tl-layer-watermark) !important;
	background-color: color-mix(in srgb, var(--tl-color-background) 62%, transparent);
	opacity: 1;
	border-radius: 5px;
	pointer-events: all;
	padding: 2px;
	box-sizing: content-box;
}

.${className} > button {
	position: absolute;
	width: 96px;
	height: 32px;
	pointer-events: all;
	cursor: inherit;
	color: var(--tl-color-text);
	opacity: .38;
	border: 0;
	padding: 0;
	background-color: currentColor;
}

.${className}[data-debug='true'] {
	bottom: max(46px, env(safe-area-inset-bottom));
}

.${className}[data-mobile='true'] {
	border-radius: 4px 0px 0px 4px;
	right: max(-2px, calc(env(safe-area-inset-right) - 2px));
	width: 8px;
	height: 48px;
}

.${className}[data-mobile='true'] > button {
	width: 8px;
	height: 32px;
}

.${className}[data-unlicensed='true'] > button {
	font-size: 100px;
	position: absolute;
	pointer-events: all;
	cursor: pointer;
	color: var(--tl-color-text);
	opacity: 0.8;
	border: 0;
	padding: 0;
	background-color: transparent;
	font-size: 11px;
	font-weight: 600;
	text-align: center;
}

.${className}[data-mobile='true'][data-unlicensed='true'] > button {
	display: none;
}

@media (hover: hover) {
	.${className} > button {
		pointer-events: none;
	}

	.${className}:hover {
		background-color: var(--tl-color-background);
		transition: background-color 0.2s ease-in-out;
		transition-delay: 0.32s;
	}

	.${className}:hover > button {
		animation: ${className}_delayed_link 0.2s forwards ease-in-out;
		animation-delay: 0.32s;
	}

	.${className} > button:focus-visible {
		opacity: 1;
	}
}

@keyframes ${className}_delayed_link {
	0% {
		cursor: inherit;
		opacity: .38;
		pointer-events: none;
	}
	100% {
		cursor: pointer;
		opacity: 1;
		pointer-events: all;
	}
}`;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { nonce: editor.options.nonce, children: CSS });
});
//# sourceMappingURL=Watermark.js.map
