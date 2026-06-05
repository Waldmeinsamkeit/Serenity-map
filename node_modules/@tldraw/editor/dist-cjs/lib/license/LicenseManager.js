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
var LicenseManager_exports = {};
__export(LicenseManager_exports, {
  FLAGS: () => FLAGS,
  LicenseManager: () => LicenseManager,
  PROPERTIES: () => PROPERTIES,
  getLicenseState: () => getLicenseState
});
module.exports = __toCommonJS(LicenseManager_exports);
var import_state = require("@tldraw/state");
var import_version = require("../../version");
var import_assets = require("../utils/assets");
var import_licensing = require("../utils/licensing");
const GRACE_PERIOD_DAYS = 30;
const FLAGS = {
  // -- MUTUALLY EXCLUSIVE FLAGS
  // Annual means the license expires after a time period, usually 1 year.
  ANNUAL_LICENSE: 1,
  // Perpetual means the license never expires up to the max supported version.
  PERPETUAL_LICENSE: 1 << 1,
  // -- ADDITIVE FLAGS --
  // Internal means the license is for internal use only.
  INTERNAL_LICENSE: 1 << 2,
  // Watermark means the product is watermarked.
  WITH_WATERMARK: 1 << 3,
  // Evaluation means the license is for evaluation purposes only.
  EVALUATION_LICENSE: 1 << 4,
  // Native means the license is for native apps which switches
  // on special-case logic.
  NATIVE_LICENSE: 1 << 5
};
const HIGHEST_FLAG = Math.max(...Object.values(FLAGS));
const PROPERTIES = {
  ID: 0,
  HOSTS: 1,
  FLAGS: 2,
  EXPIRY_DATE: 3
};
const NUMBER_OF_KNOWN_PROPERTIES = Object.keys(PROPERTIES).length;
const LICENSE_EMAIL = "sales@tldraw.com";
const WATERMARK_TRACK_SRC = `${(0, import_assets.getDefaultCdnBaseUrl)()}/watermarks/watermark-track.svg`;
class LicenseManager {
  publicKey = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEHJh0uUfxHtCGyerXmmatE368Hd9rI6LH9oPDQihnaCryRFWEVeOvf9U/SPbyxX74LFyJs5tYeAHq5Nc0Ax25LQ";
  isDevelopment;
  isTest;
  isCryptoAvailable;
  state = (0, import_state.atom)("license state", "pending");
  verbose = true;
  constructor(licenseKey, testPublicKey) {
    this.isTest = process.env.NODE_ENV === "test";
    this.isDevelopment = this.getIsDevelopment();
    this.publicKey = testPublicKey || this.publicKey;
    this.isCryptoAvailable = !!crypto.subtle;
    this.getLicenseFromKey(licenseKey).then((result) => {
      const licenseState = getLicenseState(
        result,
        (messages) => this.outputMessages(messages),
        this.isDevelopment
      );
      this.maybeTrack(result, licenseState);
      this.state.set(licenseState);
    }).catch((error) => {
      console.error("License validation failed:", error);
      this.state.set("unlicensed");
    });
  }
  getIsDevelopment() {
    return !["https:", "vscode-webview:"].includes(window.location.protocol) || window.location.hostname === "localhost" || process.env.NODE_ENV !== "production";
  }
  getTrackType(result, licenseState) {
    if (licenseState === "unlicensed-production") {
      return "unlicensed";
    }
    if (this.isDevelopment) {
      return null;
    }
    if (!result.isLicenseParseable) {
      return null;
    }
    if (result.isEvaluationLicense) {
      return "evaluation";
    }
    if (licenseState === "licensed-with-watermark") {
      return "with_watermark";
    }
    return null;
  }
  maybeTrack(result, licenseState) {
    const trackType = this.getTrackType(result, licenseState);
    if (!trackType) {
      return;
    }
    const url = new URL(WATERMARK_TRACK_SRC);
    url.searchParams.set("version", import_version.version);
    url.searchParams.set("license_type", trackType);
    if ("license" in result) {
      url.searchParams.set("license_id", result.license.id);
      const sku = this.isFlagEnabled(result.license.flags, FLAGS.EVALUATION_LICENSE) ? "evaluation" : this.isFlagEnabled(result.license.flags, FLAGS.ANNUAL_LICENSE) ? "annual" : this.isFlagEnabled(result.license.flags, FLAGS.PERPETUAL_LICENSE) ? "perpetual" : "unknown";
      url.searchParams.set("sku", sku);
    }
    url.searchParams.set("url", window.location.href);
    if (process.env.NODE_ENV) {
      url.searchParams.set("environment", process.env.NODE_ENV);
    }
    fetch(url.toString());
  }
  async extractLicenseKey(licenseKey) {
    const [data, signature] = licenseKey.split(".");
    const [prefix, encodedData] = data.split("/");
    if (!prefix.startsWith("tldraw-")) {
      throw new Error(`Unsupported prefix '${prefix}'`);
    }
    const publicCryptoKey = await (0, import_licensing.importPublicKey)(this.publicKey);
    let isVerified;
    try {
      isVerified = await crypto.subtle.verify(
        {
          name: "ECDSA",
          hash: { name: "SHA-256" }
        },
        publicCryptoKey,
        new Uint8Array((0, import_licensing.str2ab)(atob(signature))),
        new Uint8Array((0, import_licensing.str2ab)(atob(encodedData)))
      );
    } catch (e) {
      console.error(e);
      throw new Error("Could not perform signature validation");
    }
    if (!isVerified) {
      throw new Error("Invalid signature");
    }
    let decodedData;
    try {
      decodedData = JSON.parse(atob(encodedData));
    } catch {
      throw new Error("Could not parse object");
    }
    if (decodedData.length > NUMBER_OF_KNOWN_PROPERTIES) {
      this.outputMessages([
        "License key contains some unknown properties.",
        "You may want to update tldraw packages to a newer version to get access to new functionality."
      ]);
    }
    return {
      id: decodedData[PROPERTIES.ID],
      hosts: decodedData[PROPERTIES.HOSTS],
      flags: decodedData[PROPERTIES.FLAGS],
      expiryDate: decodedData[PROPERTIES.EXPIRY_DATE]
    };
  }
  async getLicenseFromKey(licenseKey) {
    if (!licenseKey) {
      if (!this.isDevelopment) {
        this.outputNoLicenseKeyProvided();
      }
      return { isLicenseParseable: false, reason: "no-key-provided" };
    }
    if (this.isDevelopment && !this.isCryptoAvailable) {
      if (this.verbose) {
        console.log(
          "tldraw: you seem to be in a development environment that does not support crypto. License not verified."
        );
        console.log("You should check that this works in production separately.");
      }
      return { isLicenseParseable: false, reason: "has-key-development-mode" };
    }
    let cleanedLicenseKey = licenseKey.replace(/[\u200B-\u200D\uFEFF]/g, "");
    cleanedLicenseKey = cleanedLicenseKey.replace(/\r?\n|\r/g, "");
    try {
      const licenseInfo = await this.extractLicenseKey(cleanedLicenseKey);
      const expiryDate = new Date(licenseInfo.expiryDate);
      const isAnnualLicense = this.isFlagEnabled(licenseInfo.flags, FLAGS.ANNUAL_LICENSE);
      const isPerpetualLicense = this.isFlagEnabled(licenseInfo.flags, FLAGS.PERPETUAL_LICENSE);
      const isEvaluationLicense = this.isFlagEnabled(licenseInfo.flags, FLAGS.EVALUATION_LICENSE);
      const isAnnualLicenseExpired = isAnnualLicense && this.isAnnualLicenseExpired(expiryDate);
      const isPerpetualLicenseExpired = isPerpetualLicense && this.isPerpetualLicenseExpired(expiryDate);
      const daysSinceExpiry = isPerpetualLicense && !isPerpetualLicenseExpired ? 0 : this.getDaysSinceExpiry(expiryDate);
      const result = {
        license: licenseInfo,
        isLicenseParseable: true,
        isDevelopment: this.isDevelopment,
        isDomainValid: this.isDomainValid(licenseInfo),
        expiryDate,
        isAnnualLicense,
        isAnnualLicenseExpired,
        isPerpetualLicense,
        isPerpetualLicenseExpired,
        isInternalLicense: this.isFlagEnabled(licenseInfo.flags, FLAGS.INTERNAL_LICENSE),
        isNativeLicense: this.isNativeLicense(licenseInfo),
        isLicensedWithWatermark: this.isFlagEnabled(licenseInfo.flags, FLAGS.WITH_WATERMARK),
        isEvaluationLicense,
        isEvaluationLicenseExpired: isEvaluationLicense && this.isEvaluationLicenseExpired(expiryDate),
        daysSinceExpiry
      };
      this.outputLicenseInfoIfNeeded(result);
      return result;
    } catch (e) {
      this.outputInvalidLicenseKey(e.message);
      return { isLicenseParseable: false, reason: "invalid-license-key" };
    }
  }
  isDomainValid(licenseInfo) {
    const currentHostname = window.location.hostname.toLowerCase();
    return licenseInfo.hosts.some((host) => {
      const normalizedHostOrUrlRegex = host.toLowerCase().trim();
      if (normalizedHostOrUrlRegex === currentHostname || `www.${normalizedHostOrUrlRegex}` === currentHostname || normalizedHostOrUrlRegex === `www.${currentHostname}`) {
        return true;
      }
      if (host === "*") {
        return true;
      }
      if (this.isNativeLicense(licenseInfo)) {
        return new RegExp(normalizedHostOrUrlRegex).test(window.location.href);
      }
      if (host.includes("*")) {
        const globToRegex = new RegExp(host.replace(/\*/g, ".*?"));
        return globToRegex.test(currentHostname) || globToRegex.test(`www.${currentHostname}`);
      }
      if (window.location.protocol === "vscode-webview:") {
        const currentUrl = new URL(window.location.href);
        const extensionId = currentUrl.searchParams.get("extensionId");
        if (normalizedHostOrUrlRegex === extensionId) {
          return true;
        }
      }
      return false;
    });
  }
  isNativeLicense(licenseInfo) {
    return this.isFlagEnabled(licenseInfo.flags, FLAGS.NATIVE_LICENSE);
  }
  getExpirationDateWithoutGracePeriod(expiryDate) {
    return new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
  }
  getExpirationDateWithGracePeriod(expiryDate) {
    return new Date(
      expiryDate.getFullYear(),
      expiryDate.getMonth(),
      expiryDate.getDate() + GRACE_PERIOD_DAYS + 1
      // Add 1 day to include the expiration day
    );
  }
  isAnnualLicenseExpired(expiryDate) {
    const expiration = this.getExpirationDateWithGracePeriod(expiryDate);
    return /* @__PURE__ */ new Date() >= expiration;
  }
  isPerpetualLicenseExpired(expiryDate) {
    const expiration = this.getExpirationDateWithGracePeriod(expiryDate);
    const dates = {
      major: new Date(import_version.publishDates.major),
      minor: new Date(import_version.publishDates.minor)
    };
    return dates.major >= expiration || dates.minor >= expiration;
  }
  getDaysSinceExpiry(expiryDate) {
    const now = /* @__PURE__ */ new Date();
    const expiration = this.getExpirationDateWithoutGracePeriod(expiryDate);
    const diffTime = now.getTime() - expiration.getTime();
    const diffDays = Math.floor(diffTime / (1e3 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
  isEvaluationLicenseExpired(expiryDate) {
    const now = /* @__PURE__ */ new Date();
    const expiration = this.getExpirationDateWithoutGracePeriod(expiryDate);
    return now >= expiration;
  }
  isFlagEnabled(flags, flag) {
    return (flags & flag) === flag;
  }
  outputNoLicenseKeyProvided() {
  }
  outputInvalidLicenseKey(msg) {
    this.outputMessages(["Invalid tldraw license key", `Reason: ${msg}`]);
  }
  outputLicenseInfoIfNeeded(result) {
    if (result.license.flags >= HIGHEST_FLAG * 2) {
      this.outputMessages(
        [
          "Warning: This tldraw license contains some unknown flags.",
          "This will still work, however, you may want to update tldraw packages to a newer version to get access to new functionality."
        ],
        "warning"
      );
    }
  }
  outputMessages(messages, type = "error") {
    if (this.isTest) return;
    if (this.verbose) {
      this.outputDelimiter(type);
      for (const message of messages) {
        const bgColor = type === "warning" ? "orange" : "crimson";
        console.log(
          `%c${message}`,
          `color: white; background: ${bgColor}; padding: 2px; border-radius: 3px;`
        );
      }
      this.outputDelimiter(type);
    }
  }
  outputDelimiter(type = "error") {
    const bgColor = type === "warning" ? "orange" : "crimson";
    console.log(
      "%c-------------------------------------------------------------------",
      `color: white; background: ${bgColor}; padding: 2px; border-radius: 3px;`
    );
  }
  static className = "tl-watermark_SEE-LICENSE";
}
function getLicenseState(result, outputMessages, isDevelopment) {
  if (!result.isLicenseParseable) {
    if (isDevelopment) {
      return "unlicensed";
    }
    if (result.reason === "no-key-provided") {
      outputMessages([
        "No tldraw license key provided!",
        "A license is required for production deployments.",
        `Please reach out to ${LICENSE_EMAIL} to purchase a license.`
      ]);
    } else {
      outputMessages([
        "Invalid license key. tldraw requires a valid license for production use.",
        `Please reach out to ${LICENSE_EMAIL} to purchase a license.`
      ]);
    }
    return "unlicensed-production";
  }
  if (!result.isDomainValid && !result.isDevelopment) {
    outputMessages([
      "License key is not valid for this domain.",
      "A license is required for production deployments.",
      `Please reach out to ${LICENSE_EMAIL} to purchase a license.`
    ]);
    return "unlicensed-production";
  }
  if (result.isEvaluationLicense) {
    if (result.isEvaluationLicenseExpired) {
      outputMessages([
        "Your tldraw evaluation license has expired!",
        `Please reach out to ${LICENSE_EMAIL} to purchase a full license.`
      ]);
      return "expired";
    } else {
      return "licensed";
    }
  }
  if (result.isPerpetualLicenseExpired || result.isAnnualLicenseExpired) {
    outputMessages([
      "Your tldraw license has been expired for more than 30 days!",
      `Please reach out to ${LICENSE_EMAIL} to renew your license.`
    ]);
    return "expired";
  }
  const daysSinceExpiry = result.daysSinceExpiry;
  if (daysSinceExpiry > 0 && !result.isEvaluationLicense) {
    outputMessages([
      "Your tldraw license has expired.",
      `License expired ${daysSinceExpiry} days ago.`,
      `Please reach out to ${LICENSE_EMAIL} to renew your license.`
    ]);
    return "licensed";
  }
  if (result.isLicensedWithWatermark) {
    return "licensed-with-watermark";
  }
  return "licensed";
}
//# sourceMappingURL=LicenseManager.js.map
