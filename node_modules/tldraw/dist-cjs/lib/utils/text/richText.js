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
var richText_exports = {};
__export(richText_exports, {
  KeyboardShiftEnterTweakExtension: () => KeyboardShiftEnterTweakExtension,
  defaultAddFontsFromNode: () => defaultAddFontsFromNode,
  isEmptyRichText: () => isEmptyRichText,
  renderHtmlFromRichText: () => renderHtmlFromRichText,
  renderHtmlFromRichTextForMeasurement: () => renderHtmlFromRichTextForMeasurement,
  renderPlaintextFromRichText: () => renderPlaintextFromRichText,
  renderRichTextFromHTML: () => renderRichTextFromHTML,
  tipTapDefaultExtensions: () => tipTapDefaultExtensions
});
module.exports = __toCommonJS(richText_exports);
var import_core = require("@tiptap/core");
var import_extension_code = require("@tiptap/extension-code");
var import_extension_highlight = require("@tiptap/extension-highlight");
var import_starter_kit = require("@tiptap/starter-kit");
var import_editor = require("@tldraw/editor");
var import_defaultFonts = require("../../shapes/shared/defaultFonts");
const KeyboardShiftEnterTweakExtension = import_core.Extension.create({
  name: "keyboardShiftEnterHandler",
  addKeyboardShortcuts() {
    return {
      // We don't support soft breaks, so we just use the default enter command.
      "Shift-Enter": ({ editor }) => editor.commands.enter()
    };
  }
});
import_extension_code.Code.config.excludes = void 0;
import_extension_highlight.Highlight.config.priority = 1100;
const tipTapDefaultExtensions = [
  import_starter_kit.StarterKit.configure({
    blockquote: false,
    codeBlock: false,
    horizontalRule: false,
    link: {
      openOnClick: false,
      autolink: true
    },
    // Prevent trailing paragraph insertion after lists (fixes #7641)
    trailingNode: {
      notAfter: ["paragraph", "bulletList", "orderedList", "listItem"]
    }
  }),
  import_extension_highlight.Highlight,
  KeyboardShiftEnterTweakExtension,
  // N.B. We disable the text direction core extension in RichTextArea,
  // but we add it back in again here in our own extensions list so that
  // people can omit/override it if they want to.
  import_core.extensions.TextDirection.configure({ direction: "auto" })
];
const htmlCache = new import_editor.WeakCache();
function renderHtmlFromRichText(editor, richText) {
  return htmlCache.get(richText, () => {
    const tipTapExtensions = editor.getTextOptions().tipTapConfig?.extensions ?? tipTapDefaultExtensions;
    const html = (0, import_core.generateHTML)(richText, tipTapExtensions);
    return html.replaceAll('<p dir="auto"></p>', "<p><br /></p>") ?? "";
  });
}
function renderHtmlFromRichTextForMeasurement(editor, richText) {
  const html = renderHtmlFromRichText(editor, richText);
  return `<div class="tl-rich-text">${html}</div>`;
}
const plainTextFromRichTextCache = new import_editor.WeakCache();
function isEmptyRichText(richText) {
  if (richText.content.length === 1) {
    if (!richText.content[0].content) return true;
  }
  return false;
}
function renderPlaintextFromRichText(editor, richText) {
  if (isEmptyRichText(richText)) return "";
  return plainTextFromRichTextCache.get(richText, () => {
    const tipTapExtensions = editor.getTextOptions().tipTapConfig?.extensions ?? tipTapDefaultExtensions;
    return (0, import_core.generateText)(richText, tipTapExtensions, {
      blockSeparator: "\n"
    });
  });
}
function renderRichTextFromHTML(editor, html) {
  const tipTapExtensions = editor.getTextOptions().tipTapConfig?.extensions ?? tipTapDefaultExtensions;
  return (0, import_core.generateJSON)(html, tipTapExtensions);
}
function defaultAddFontsFromNode(node, state, addFont) {
  for (const mark of node.marks) {
    if (mark.type.name === "bold" && state.weight !== "bold") {
      state = { ...state, weight: "bold" };
    }
    if (mark.type.name === "italic" && state.style !== "italic") {
      state = { ...state, style: "italic" };
    }
    if (mark.type.name === "code" && state.family !== "tldraw_mono") {
      state = { ...state, family: "tldraw_mono" };
    }
  }
  const fontsForFamily = (0, import_editor.getOwnProperty)(import_defaultFonts.DefaultFontFaces, state.family);
  if (!fontsForFamily) return state;
  const fontsForStyle = (0, import_editor.getOwnProperty)(fontsForFamily, state.style);
  if (!fontsForStyle) return state;
  const fontsForWeight = (0, import_editor.getOwnProperty)(fontsForStyle, state.weight);
  if (!fontsForWeight) return state;
  addFont(fontsForWeight);
  return state;
}
//# sourceMappingURL=richText.js.map
