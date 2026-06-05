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
var png_exports = {};
__export(png_exports, {
  PngHelpers: () => PngHelpers
});
module.exports = __toCommonJS(png_exports);
/*!
 * MIT License: https://github.com/alexgorbatchev/crc/blob/master/LICENSE
 * Copyright: 2014 Alex Gorbatchev
 * Code: crc32, https://github.com/alexgorbatchev/crc/blob/master/src/calculators/crc32.ts
 */
let TABLE = [
  0,
  1996959894,
  3993919788,
  2567524794,
  124634137,
  1886057615,
  3915621685,
  2657392035,
  249268274,
  2044508324,
  3772115230,
  2547177864,
  162941995,
  2125561021,
  3887607047,
  2428444049,
  498536548,
  1789927666,
  4089016648,
  2227061214,
  450548861,
  1843258603,
  4107580753,
  2211677639,
  325883990,
  1684777152,
  4251122042,
  2321926636,
  335633487,
  1661365465,
  4195302755,
  2366115317,
  997073096,
  1281953886,
  3579855332,
  2724688242,
  1006888145,
  1258607687,
  3524101629,
  2768942443,
  901097722,
  1119000684,
  3686517206,
  2898065728,
  853044451,
  1172266101,
  3705015759,
  2882616665,
  651767980,
  1373503546,
  3369554304,
  3218104598,
  565507253,
  1454621731,
  3485111705,
  3099436303,
  671266974,
  1594198024,
  3322730930,
  2970347812,
  795835527,
  1483230225,
  3244367275,
  3060149565,
  1994146192,
  31158534,
  2563907772,
  4023717930,
  1907459465,
  112637215,
  2680153253,
  3904427059,
  2013776290,
  251722036,
  2517215374,
  3775830040,
  2137656763,
  141376813,
  2439277719,
  3865271297,
  1802195444,
  476864866,
  2238001368,
  4066508878,
  1812370925,
  453092731,
  2181625025,
  4111451223,
  1706088902,
  314042704,
  2344532202,
  4240017532,
  1658658271,
  366619977,
  2362670323,
  4224994405,
  1303535960,
  984961486,
  2747007092,
  3569037538,
  1256170817,
  1037604311,
  2765210733,
  3554079995,
  1131014506,
  879679996,
  2909243462,
  3663771856,
  1141124467,
  855842277,
  2852801631,
  3708648649,
  1342533948,
  654459306,
  3188396048,
  3373015174,
  1466479909,
  544179635,
  3110523913,
  3462522015,
  1591671054,
  702138776,
  2966460450,
  3352799412,
  1504918807,
  783551873,
  3082640443,
  3233442989,
  3988292384,
  2596254646,
  62317068,
  1957810842,
  3939845945,
  2647816111,
  81470997,
  1943803523,
  3814918930,
  2489596804,
  225274430,
  2053790376,
  3826175755,
  2466906013,
  167816743,
  2097651377,
  4027552580,
  2265490386,
  503444072,
  1762050814,
  4150417245,
  2154129355,
  426522225,
  1852507879,
  4275313526,
  2312317920,
  282753626,
  1742555852,
  4189708143,
  2394877945,
  397917763,
  1622183637,
  3604390888,
  2714866558,
  953729732,
  1340076626,
  3518719985,
  2797360999,
  1068828381,
  1219638859,
  3624741850,
  2936675148,
  906185462,
  1090812512,
  3747672003,
  2825379669,
  829329135,
  1181335161,
  3412177804,
  3160834842,
  628085408,
  1382605366,
  3423369109,
  3138078467,
  570562233,
  1426400815,
  3317316542,
  2998733608,
  733239954,
  1555261956,
  3268935591,
  3050360625,
  752459403,
  1541320221,
  2607071920,
  3965973030,
  1969922972,
  40735498,
  2617837225,
  3943577151,
  1913087877,
  83908371,
  2512341634,
  3803740692,
  2075208622,
  213261112,
  2463272603,
  3855990285,
  2094854071,
  198958881,
  2262029012,
  4057260610,
  1759359992,
  534414190,
  2176718541,
  4139329115,
  1873836001,
  414664567,
  2282248934,
  4279200368,
  1711684554,
  285281116,
  2405801727,
  4167216745,
  1634467795,
  376229701,
  2685067896,
  3608007406,
  1308918612,
  956543938,
  2808555105,
  3495958263,
  1231636301,
  1047427035,
  2932959818,
  3654703836,
  1088359270,
  936918e3,
  2847714899,
  3736837829,
  1202900863,
  817233897,
  3183342108,
  3401237130,
  1404277552,
  615818150,
  3134207493,
  3453421203,
  1423857449,
  601450431,
  3009837614,
  3294710456,
  1567103746,
  711928724,
  3020668471,
  3272380065,
  1510334235,
  755167117
];
if (typeof Int32Array !== "undefined") {
  TABLE = new Int32Array(TABLE);
}
const crc = (current, previous) => {
  let crc2 = previous === 0 ? 0 : ~~previous ^ -1;
  for (let index = 0; index < current.length; index++) {
    crc2 = TABLE[(crc2 ^ current[index]) & 255] ^ crc2 >>> 8;
  }
  return crc2 ^ -1;
};
const LEN_SIZE = 4;
const CRC_SIZE = 4;
class PngHelpers {
  /**
   * Checks if binary data at the specified offset contains a valid PNG file signature.
   * Validates the 8-byte PNG signature: 89 50 4E 47 0D 0A 1A 0A.
   *
   * @param view - DataView containing the binary data to check
   * @param offset - Byte offset where the PNG signature should start
   * @returns True if the data contains a valid PNG signature, false otherwise
   *
   * @example
   * ```ts
   * // Validate PNG from file upload
   * const file = event.target.files[0]
   * const buffer = await file.arrayBuffer()
   * const view = new DataView(buffer)
   *
   * if (PngHelpers.isPng(view, 0)) {
   *   console.log('Valid PNG file detected')
   *   // Process PNG file...
   * } else {
   *   console.error('Not a valid PNG file')
   * }
   * ```
   */
  static isPng(view, offset) {
    if (view.getUint8(offset + 0) === 137 && view.getUint8(offset + 1) === 80 && view.getUint8(offset + 2) === 78 && view.getUint8(offset + 3) === 71 && view.getUint8(offset + 4) === 13 && view.getUint8(offset + 5) === 10 && view.getUint8(offset + 6) === 26 && view.getUint8(offset + 7) === 10) {
      return true;
    }
    return false;
  }
  /**
   * Reads the 4-character chunk type identifier from a PNG chunk header.
   *
   * @param view - DataView containing the PNG data
   * @param offset - Byte offset of the chunk type field (after length field)
   * @returns 4-character string representing the chunk type (e.g., 'IHDR', 'IDAT', 'IEND')
   *
   * @example
   * ```ts
   * // Read chunk type from PNG header (after 8-byte signature)
   * const chunkType = PngHelpers.getChunkType(dataView, 8)
   * console.log(chunkType) // 'IHDR' (Image Header)
   *
   * // Read chunk type at a specific position during parsing
   * let offset = 8 // Skip PNG signature
   * const chunkLength = dataView.getUint32(offset)
   * const type = PngHelpers.getChunkType(dataView, offset + 4)
   * ```
   */
  static getChunkType(view, offset) {
    return [
      String.fromCharCode(view.getUint8(offset)),
      String.fromCharCode(view.getUint8(offset + 1)),
      String.fromCharCode(view.getUint8(offset + 2)),
      String.fromCharCode(view.getUint8(offset + 3))
    ].join("");
  }
  /**
   * Parses all chunks in a PNG file and returns their metadata.
   * Skips duplicate IDAT chunks but includes all other chunk types.
   *
   * @param view - DataView containing the complete PNG file data
   * @param offset - Starting byte offset (defaults to 0)
   * @returns Record mapping chunk types to their metadata (start position, data offset, and size)
   * @throws Error if the data is not a valid PNG file
   *
   * @example
   * ```ts
   * // Parse PNG structure for metadata extraction
   * const view = new DataView(await blob.arrayBuffer())
   * const chunks = PngHelpers.readChunks(view)
   *
   * // Check for specific chunks
   * const ihdrChunk = chunks['IHDR']
   * const physChunk = chunks['pHYs']
   *
   * if (physChunk) {
   *   console.log(`Found pixel density info at byte ${physChunk.start}`)
   * } else {
   *   console.log('No pixel density information found')
   * }
   * ```
   */
  static readChunks(view, offset = 0) {
    const chunks = {};
    if (!PngHelpers.isPng(view, offset)) {
      throw new Error("Not a PNG");
    }
    offset += 8;
    while (offset <= view.buffer.byteLength) {
      const start = offset;
      const len = view.getInt32(offset);
      offset += 4;
      const chunkType = PngHelpers.getChunkType(view, offset);
      if (chunkType === "IDAT" && chunks[chunkType]) {
        offset += len + LEN_SIZE + CRC_SIZE;
        continue;
      }
      if (chunkType === "IEND") {
        break;
      }
      chunks[chunkType] = {
        start,
        dataOffset: offset + 4,
        size: len
      };
      offset += len + LEN_SIZE + CRC_SIZE;
    }
    return chunks;
  }
  /**
   * Parses the pHYs (physical pixel dimensions) chunk data.
   * Reads pixels per unit for X and Y axes, and the unit specifier.
   *
   * @param view - DataView containing the PNG data
   * @param offset - Byte offset of the pHYs chunk data
   * @returns Object with ppux (pixels per unit X), ppuy (pixels per unit Y), and unit specifier
   *
   * @example
   * ```ts
   * // Extract pixel density information for DPI calculation
   * const physChunk = PngHelpers.findChunk(dataView, 'pHYs')
   * if (physChunk) {
   *   const physData = PngHelpers.parsePhys(dataView, physChunk.dataOffset)
   *
   *   if (physData.unit === 1) { // meters
   *     const dpiX = Math.round(physData.ppux * 0.0254)
   *     const dpiY = Math.round(physData.ppuy * 0.0254)
   *     console.log(`DPI: ${dpiX} x ${dpiY}`)
   *   }
   * }
   * ```
   */
  static parsePhys(view, offset) {
    return {
      ppux: view.getUint32(offset),
      ppuy: view.getUint32(offset + 4),
      unit: view.getUint8(offset + 8)
    };
  }
  /**
   * Finds a specific chunk type in the PNG file and returns its metadata.
   *
   * @param view - DataView containing the PNG file data
   * @param type - 4-character chunk type to search for (e.g., 'pHYs', 'IDAT')
   * @returns Chunk metadata object if found, undefined otherwise
   *
   * @example
   * ```ts
   * // Look for pixel density information in PNG
   * const physChunk = PngHelpers.findChunk(dataView, 'pHYs')
   * if (physChunk) {
   *   const physData = PngHelpers.parsePhys(dataView, physChunk.dataOffset)
   *   console.log(`Found pHYs chunk with ${physData.ppux} x ${physData.ppuy} pixels per unit`)
   * }
   *
   * // Check for text metadata
   * const textChunk = PngHelpers.findChunk(dataView, 'tEXt')
   * if (textChunk) {
   *   console.log(`Found text metadata at byte ${textChunk.start}`)
   * }
   * ```
   */
  static findChunk(view, type) {
    const chunks = PngHelpers.readChunks(view);
    return chunks[type];
  }
  /**
   * Adds or replaces a pHYs chunk in a PNG file to set pixel density for high-DPI displays.
   * The method determines insertion point by prioritizing IDAT chunk position over existing pHYs,
   * creates a properly formatted pHYs chunk with CRC validation, and returns a new Blob.
   *
   * @param view - DataView containing the original PNG file data
   * @param dpr - Device pixel ratio multiplier (defaults to 1)
   * @param options - Optional Blob constructor options for MIME type and other properties
   * @returns New Blob containing the PNG with updated pixel density information
   *
   * @example
   * ```ts
   * // Export PNG with proper pixel density for high-DPI displays
   * const canvas = document.createElement('canvas')
   * const ctx = canvas.getContext('2d')
   * // ... draw content to canvas ...
   *
   * canvas.toBlob(async (blob) => {
   *   if (blob) {
   *     const view = new DataView(await blob.arrayBuffer())
   *     // Create 2x DPI version for Retina displays
   *     const highDpiBlob = PngHelpers.setPhysChunk(view, 2, { type: 'image/png' })
   *     // Download or use the blob...
   *   }
   * }, 'image/png')
   * ```
   */
  static setPhysChunk(view, dpr = 1, options) {
    let offset = 46;
    let size = 0;
    const res1 = PngHelpers.findChunk(view, "pHYs");
    if (res1) {
      offset = res1.start;
      size = res1.size;
    }
    const res2 = PngHelpers.findChunk(view, "IDAT");
    if (res2) {
      offset = res2.start;
      size = 0;
    }
    const pHYsData = new ArrayBuffer(21);
    const pHYsDataView = new DataView(pHYsData);
    pHYsDataView.setUint32(0, 9);
    pHYsDataView.setUint8(4, "p".charCodeAt(0));
    pHYsDataView.setUint8(5, "H".charCodeAt(0));
    pHYsDataView.setUint8(6, "Y".charCodeAt(0));
    pHYsDataView.setUint8(7, "s".charCodeAt(0));
    const DPI_72 = 2835.5;
    pHYsDataView.setInt32(8, DPI_72 * dpr);
    pHYsDataView.setInt32(12, DPI_72 * dpr);
    pHYsDataView.setInt8(16, 1);
    const crcBit = new Uint8Array(pHYsData.slice(4, 17));
    pHYsDataView.setInt32(17, crc(crcBit));
    const startBuf = view.buffer.slice(0, offset);
    const endBuf = view.buffer.slice(offset + size);
    return new Blob([startBuf, pHYsData, endBuf], options);
  }
}
//# sourceMappingURL=png.js.map
