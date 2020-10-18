"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.DDSLoader = void 0;

var DDSLoader = function DDSLoader(manager) {
  CompressedTextureLoader.call(this, manager);
};

THREE.DDSLoader = DDSLoader;
DDSLoader.prototype = Object.assign(Object.create(THREE.CompressedTextureLoader.prototype), {
  constructor: DDSLoader,
  parse: function parse(buffer, loadMipmaps) {
    var dds = {
      mipmaps: [],
      width: 0,
      height: 0,
      format: null,
      mipmapCount: 1
    };
    var DDS_MAGIC = 0x20534444;
    var DDSD_MIPMAPCOUNT = 0x20000;
    var DDSCAPS2_CUBEMAP = 0x200;
    var DDSCAPS2_CUBEMAP_POSITIVEX = 0x400;
    var DDSCAPS2_CUBEMAP_NEGATIVEX = 0x800;
    var DDSCAPS2_CUBEMAP_POSITIVEY = 0x1000;
    var DDSCAPS2_CUBEMAP_NEGATIVEY = 0x2000;
    var DDSCAPS2_CUBEMAP_POSITIVEZ = 0x4000;
    var DDSCAPS2_CUBEMAP_NEGATIVEZ = 0x8000;
    var DDPF_FOURCC = 0x4;

    function fourCCToInt32(value) {
      return value.charCodeAt(0) + (value.charCodeAt(1) << 8) + (value.charCodeAt(2) << 16) + (value.charCodeAt(3) << 24);
    }

    function int32ToFourCC(value) {
      return String.fromCharCode(value & 0xff, value >> 8 & 0xff, value >> 16 & 0xff, value >> 24 & 0xff);
    }

    function loadARGBMip(buffer, dataOffset, width, height) {
      var dataLength = width * height * 4;
      var srcBuffer = new Uint8Array(buffer, dataOffset, dataLength);
      var byteArray = new Uint8Array(dataLength);
      var dst = 0;
      var src = 0;

      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          var b = srcBuffer[src];
          src++;
          var g = srcBuffer[src];
          src++;
          var r = srcBuffer[src];
          src++;
          var a = srcBuffer[src];
          src++;
          byteArray[dst] = r;
          dst++;
          byteArray[dst] = g;
          dst++;
          byteArray[dst] = b;
          dst++;
          byteArray[dst] = a;
          dst++;
        }
      }

      return byteArray;
    }

    var FOURCC_DXT1 = fourCCToInt32("DXT1");
    var FOURCC_DXT3 = fourCCToInt32("DXT3");
    var FOURCC_DXT5 = fourCCToInt32("DXT5");
    var FOURCC_ETC1 = fourCCToInt32("ETC1");
    var headerLengthInt = 31;
    var off_magic = 0;
    var off_size = 1;
    var off_flags = 2;
    var off_height = 3;
    var off_width = 4;
    var off_mipmapCount = 7;
    var off_pfFlags = 20;
    var off_pfFourCC = 21;
    var off_RGBBitCount = 22;
    var off_RBitMask = 23;
    var off_GBitMask = 24;
    var off_BBitMask = 25;
    var off_ABitMask = 26;
    var off_caps2 = 28;
    var header = new Int32Array(buffer, 0, headerLengthInt);

    if (header[off_magic] !== DDS_MAGIC) {
      console.error('THREE.DDSLoader.parse: Invalid magic number in DDS header.');
      return dds;
    }

    if (!header[off_pfFlags] & DDPF_FOURCC) {
      console.error('THREE.DDSLoader.parse: Unsupported format, must contain a FourCC code.');
      return dds;
    }

    var blockBytes;
    var fourCC = header[off_pfFourCC];
    var isRGBAUncompressed = false;

    switch (fourCC) {
      case FOURCC_DXT1:
        blockBytes = 8;
        dds.format = THREE.RGB_S3TC_DXT1_Format;
        break;

      case FOURCC_DXT3:
        blockBytes = 16;
        dds.format = THREE.RGBA_S3TC_DXT3_Format;
        break;

      case FOURCC_DXT5:
        blockBytes = 16;
        dds.format = THREE.RGBA_S3TC_DXT5_Format;
        break;

      case FOURCC_ETC1:
        blockBytes = 8;
        dds.format = THREE.RGB_ETC1_Format;
        break;

      default:
        if (header[off_RGBBitCount] === 32 && header[off_RBitMask] & 0xff0000 && header[off_GBitMask] & 0xff00 && header[off_BBitMask] & 0xff && header[off_ABitMask] & 0xff000000) {
          isRGBAUncompressed = true;
          blockBytes = 64;
          dds.format = THREE.RGBAFormat;
        } else {
          console.error('THREE.DDSLoader.parse: Unsupported FourCC code ', int32ToFourCC(fourCC));
          return dds;
        }

    }

    dds.mipmapCount = 1;

    if (header[off_flags] & DDSD_MIPMAPCOUNT && loadMipmaps !== false) {
      dds.mipmapCount = Math.max(1, header[off_mipmapCount]);
    }

    var caps2 = header[off_caps2];
    dds.isCubemap = caps2 & DDSCAPS2_CUBEMAP ? true : false;

    if (dds.isCubemap && (!(caps2 & DDSCAPS2_CUBEMAP_POSITIVEX) || !(caps2 & DDSCAPS2_CUBEMAP_NEGATIVEX) || !(caps2 & DDSCAPS2_CUBEMAP_POSITIVEY) || !(caps2 & DDSCAPS2_CUBEMAP_NEGATIVEY) || !(caps2 & DDSCAPS2_CUBEMAP_POSITIVEZ) || !(caps2 & DDSCAPS2_CUBEMAP_NEGATIVEZ))) {
      console.error('THREE.DDSLoader.parse: Incomplete cubemap faces');
      return dds;
    }

    dds.width = header[off_width];
    dds.height = header[off_height];
    var dataOffset = header[off_size] + 4;
    var faces = dds.isCubemap ? 6 : 1;

    for (var face = 0; face < faces; face++) {
      var width = dds.width;
      var height = dds.height;

      for (var i = 0; i < dds.mipmapCount; i++) {
        if (isRGBAUncompressed) {
          var byteArray = loadARGBMip(buffer, dataOffset, width, height);
          var dataLength = byteArray.length;
        } else {
          var dataLength = Math.max(4, width) / 4 * Math.max(4, height) / 4 * blockBytes;
          var byteArray = new Uint8Array(buffer, dataOffset, dataLength);
        }

        var mipmap = {
          "data": byteArray,
          "width": width,
          "height": height
        };
        dds.mipmaps.push(mipmap);
        dataOffset += dataLength;
        width = Math.max(width >> 1, 1);
        height = Math.max(height >> 1, 1);
      }
    }

    return dds;
  }
});