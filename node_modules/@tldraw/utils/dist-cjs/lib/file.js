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
var file_exports = {};
__export(file_exports, {
  FileHelpers: () => FileHelpers
});
module.exports = __toCommonJS(file_exports);
var import_network = require("./network");
class FileHelpers {
  /**
   * Converts a URL to an ArrayBuffer by fetching the resource.
   *
   * Fetches the resource at the given URL and returns its content as an ArrayBuffer.
   * This is useful for loading binary data like images, videos, or other file types.
   *
   * @param url - The URL of the file to fetch
   * @returns Promise that resolves to the file content as an ArrayBuffer
   * @example
   * ```ts
   * const buffer = await FileHelpers.urlToArrayBuffer('https://example.com/image.png')
   * console.log(buffer.byteLength) // Size of the file in bytes
   * ```
   * @public
   */
  static async urlToArrayBuffer(url) {
    const response = await (0, import_network.fetch)(url);
    return await response.arrayBuffer();
  }
  /**
   * Converts a URL to a Blob by fetching the resource.
   *
   * Fetches the resource at the given URL and returns its content as a Blob object.
   * Blobs are useful for handling file data in web applications.
   *
   * @param url - The URL of the file to fetch
   * @returns Promise that resolves to the file content as a Blob
   * @example
   * ```ts
   * const blob = await FileHelpers.urlToBlob('https://example.com/document.pdf')
   * console.log(blob.type) // 'application/pdf'
   * console.log(blob.size) // Size in bytes
   * ```
   * @public
   */
  static async urlToBlob(url) {
    const response = await (0, import_network.fetch)(url);
    return await response.blob();
  }
  /**
   * Converts a URL to a data URL by fetching the resource.
   *
   * Fetches the resource at the given URL and converts it to a base64-encoded data URL.
   * If the URL is already a data URL, it returns the URL unchanged. This is useful for embedding
   * resources directly in HTML or CSS.
   *
   * @param url - The URL of the file to convert, or an existing data URL
   * @returns Promise that resolves to a data URL string
   * @example
   * ```ts
   * const dataUrl = await FileHelpers.urlToDataUrl('https://example.com/image.jpg')
   * // Returns: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...'
   *
   * const existing = await FileHelpers.urlToDataUrl('data:text/plain;base64,SGVsbG8=')
   * // Returns the same data URL unchanged
   * ```
   * @public
   */
  static async urlToDataUrl(url) {
    if (url.startsWith("data:")) return url;
    const blob = await FileHelpers.urlToBlob(url);
    return await FileHelpers.blobToDataUrl(blob);
  }
  /**
   * Convert a Blob to a base64 encoded data URL.
   *
   * Converts a Blob object to a base64-encoded data URL using the FileReader API.
   * This is useful for displaying images or embedding file content directly in HTML.
   *
   * @param file - The Blob object to convert
   * @returns Promise that resolves to a base64-encoded data URL string
   * @example
   * ```ts
   * const blob = new Blob(['Hello World'], { type: 'text/plain' })
   * const dataUrl = await FileHelpers.blobToDataUrl(blob)
   * // Returns: 'data:text/plain;base64,SGVsbG8gV29ybGQ='
   *
   * // With an image file
   * const imageDataUrl = await FileHelpers.blobToDataUrl(myImageFile)
   * // Can be used directly in img src attribute
   * ```
   * @public
   */
  static async blobToDataUrl(file) {
    return await new Promise((resolve, reject) => {
      if (file) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.onabort = (error) => reject(error);
        reader.readAsDataURL(file);
      }
    });
  }
  /**
   * Convert a Blob to a unicode text string.
   *
   * Reads the content of a Blob object as a UTF-8 text string using the FileReader API.
   * This is useful for reading text files or extracting text content from blobs.
   *
   * @param file - The Blob object to convert to text
   * @returns Promise that resolves to the text content as a string
   * @example
   * ```ts
   * const textBlob = new Blob(['Hello World'], { type: 'text/plain' })
   * const text = await FileHelpers.blobToText(textBlob)
   * console.log(text) // 'Hello World'
   *
   * // With a text file from user input
   * const content = await FileHelpers.blobToText(myTextFile)
   * console.log(content) // File content as string
   * ```
   * @public
   */
  static async blobToText(file) {
    return await new Promise((resolve, reject) => {
      if (file) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.onabort = (error) => reject(error);
        reader.readAsText(file);
      }
    });
  }
  static rewriteMimeType(blob, newMimeType) {
    if (blob.type === newMimeType) return blob;
    if (blob instanceof File) {
      return new File([blob], blob.name, { type: newMimeType });
    }
    return new Blob([blob], { type: newMimeType });
  }
}
//# sourceMappingURL=file.js.map
