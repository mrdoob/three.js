"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.RGBELoader = void 0;

var RGBELoader = function RGBELoader(manager) {
  DataTextureLoader.call(this, manager);
  this.type = THREE.UnsignedByteType;
};

THREE.RGBELoader = RGBELoader;
RGBELoader.prototype = Object.assign(Object.create(THREE.DataTextureLoader.prototype), {
  constructor: RGBELoader,
  parse: function parse(buffer) {
    var RGBE_RETURN_FAILURE = -1,
        rgbe_read_error = 1,
        rgbe_write_error = 2,
        rgbe_format_error = 3,
        rgbe_memory_error = 4,
        rgbe_error = function rgbe_error(rgbe_error_code, msg) {
      switch (rgbe_error_code) {
        case rgbe_read_error:
          console.error("RGBELoader Read Error: " + (msg || ''));
          break;

        case rgbe_write_error:
          console.error("RGBELoader Write Error: " + (msg || ''));
          break;

        case rgbe_format_error:
          console.error("RGBELoader Bad File Format: " + (msg || ''));
          break;

        default:
        case rgbe_memory_error:
          console.error("RGBELoader: Error: " + (msg || ''));
      }

      return RGBE_RETURN_FAILURE;
    },
        RGBE_VALID_PROGRAMTYPE = 1,
        RGBE_VALID_FORMAT = 2,
        RGBE_VALID_DIMENSIONS = 4,
        NEWLINE = "\n",
        fgets = function fgets(buffer, lineLimit, consume) {
      lineLimit = !lineLimit ? 1024 : lineLimit;
      var p = buffer.pos,
          i = -1,
          len = 0,
          s = '',
          chunkSize = 128,
          chunk = String.fromCharCode.apply(null, new Uint16Array(buffer.subarray(p, p + chunkSize)));

      while (0 > (i = chunk.indexOf(NEWLINE)) && len < lineLimit && p < buffer.byteLength) {
        s += chunk;
        len += chunk.length;
        p += chunkSize;
        chunk += String.fromCharCode.apply(null, new Uint16Array(buffer.subarray(p, p + chunkSize)));
      }

      if (-1 < i) {
        if (false !== consume) buffer.pos += len + i + 1;
        return s + chunk.slice(0, i);
      }

      return false;
    },
        RGBE_ReadHeader = function RGBE_ReadHeader(buffer) {
      var line,
          match,
          magic_token_re = /^#\?(\S+)$/,
          gamma_re = /^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,
          exposure_re = /^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,
          format_re = /^\s*FORMAT=(\S+)\s*$/,
          dimensions_re = /^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,
          header = {
        valid: 0,
        string: '',
        comments: '',
        programtype: 'RGBE',
        format: '',
        gamma: 1.0,
        exposure: 1.0,
        width: 0,
        height: 0
      };

      if (buffer.pos >= buffer.byteLength || !(line = fgets(buffer))) {
        return rgbe_error(rgbe_read_error, "no header found");
      }

      if (!(match = line.match(magic_token_re))) {
        return rgbe_error(rgbe_format_error, "bad initial token");
      }

      header.valid |= RGBE_VALID_PROGRAMTYPE;
      header.programtype = match[1];
      header.string += line + "\n";

      while (true) {
        line = fgets(buffer);
        if (false === line) break;
        header.string += line + "\n";

        if ('#' === line.charAt(0)) {
          header.comments += line + "\n";
          continue;
        }

        if (match = line.match(gamma_re)) {
          header.gamma = parseFloat(match[1], 10);
        }

        if (match = line.match(exposure_re)) {
          header.exposure = parseFloat(match[1], 10);
        }

        if (match = line.match(format_re)) {
          header.valid |= RGBE_VALID_FORMAT;
          header.format = match[1];
        }

        if (match = line.match(dimensions_re)) {
          header.valid |= RGBE_VALID_DIMENSIONS;
          header.height = parseInt(match[1], 10);
          header.width = parseInt(match[2], 10);
        }

        if (header.valid & RGBE_VALID_FORMAT && header.valid & RGBE_VALID_DIMENSIONS) break;
      }

      if (!(header.valid & RGBE_VALID_FORMAT)) {
        return rgbe_error(rgbe_format_error, "missing format specifier");
      }

      if (!(header.valid & RGBE_VALID_DIMENSIONS)) {
        return rgbe_error(rgbe_format_error, "missing image size specifier");
      }

      return header;
    },
        RGBE_ReadPixels_RLE = function RGBE_ReadPixels_RLE(buffer, w, h) {
      var data_rgba,
          offset,
          pos,
          count,
          byteValue,
          scanline_buffer,
          ptr,
          ptr_end,
          i,
          l,
          off,
          isEncodedRun,
          scanline_width = w,
          num_scanlines = h,
          rgbeStart;

      if (scanline_width < 8 || scanline_width > 0x7fff || 2 !== buffer[0] || 2 !== buffer[1] || buffer[2] & 0x80) {
        return new Uint8Array(buffer);
      }

      if (scanline_width !== (buffer[2] << 8 | buffer[3])) {
        return rgbe_error(rgbe_format_error, "wrong scanline width");
      }

      data_rgba = new Uint8Array(4 * w * h);

      if (!data_rgba.length) {
        return rgbe_error(rgbe_memory_error, "unable to allocate buffer space");
      }

      offset = 0;
      pos = 0;
      ptr_end = 4 * scanline_width;
      rgbeStart = new Uint8Array(4);
      scanline_buffer = new Uint8Array(ptr_end);

      while (num_scanlines > 0 && pos < buffer.byteLength) {
        if (pos + 4 > buffer.byteLength) {
          return rgbe_error(rgbe_read_error);
        }

        rgbeStart[0] = buffer[pos++];
        rgbeStart[1] = buffer[pos++];
        rgbeStart[2] = buffer[pos++];
        rgbeStart[3] = buffer[pos++];

        if (2 != rgbeStart[0] || 2 != rgbeStart[1] || (rgbeStart[2] << 8 | rgbeStart[3]) != scanline_width) {
          return rgbe_error(rgbe_format_error, "bad rgbe scanline format");
        }

        ptr = 0;

        while (ptr < ptr_end && pos < buffer.byteLength) {
          count = buffer[pos++];
          isEncodedRun = count > 128;
          if (isEncodedRun) count -= 128;

          if (0 === count || ptr + count > ptr_end) {
            return rgbe_error(rgbe_format_error, "bad scanline data");
          }

          if (isEncodedRun) {
            byteValue = buffer[pos++];

            for (i = 0; i < count; i++) {
              scanline_buffer[ptr++] = byteValue;
            }
          } else {
            scanline_buffer.set(buffer.subarray(pos, pos + count), ptr);
            ptr += count;
            pos += count;
          }
        }

        l = scanline_width;

        for (i = 0; i < l; i++) {
          off = 0;
          data_rgba[offset] = scanline_buffer[i + off];
          off += scanline_width;
          data_rgba[offset + 1] = scanline_buffer[i + off];
          off += scanline_width;
          data_rgba[offset + 2] = scanline_buffer[i + off];
          off += scanline_width;
          data_rgba[offset + 3] = scanline_buffer[i + off];
          offset += 4;
        }

        num_scanlines--;
      }

      return data_rgba;
    };

    var RGBEByteToRGBFloat = function RGBEByteToRGBFloat(sourceArray, sourceOffset, destArray, destOffset) {
      var e = sourceArray[sourceOffset + 3];
      var scale = Math.pow(2.0, e - 128.0) / 255.0;
      destArray[destOffset + 0] = sourceArray[sourceOffset + 0] * scale;
      destArray[destOffset + 1] = sourceArray[sourceOffset + 1] * scale;
      destArray[destOffset + 2] = sourceArray[sourceOffset + 2] * scale;
    };

    var RGBEByteToRGBHalf = function () {
      var floatView = new Float32Array(1);
      var int32View = new Int32Array(floatView.buffer);

      function toHalf(val) {
        floatView[0] = val;
        var x = int32View[0];
        var bits = x >> 16 & 0x8000;
        var m = x >> 12 & 0x07ff;
        var e = x >> 23 & 0xff;
        if (e < 103) return bits;

        if (e > 142) {
          bits |= 0x7c00;
          bits |= (e == 255 ? 0 : 1) && x & 0x007fffff;
          return bits;
        }

        if (e < 113) {
          m |= 0x0800;
          bits |= (m >> 114 - e) + (m >> 113 - e & 1);
          return bits;
        }

        bits |= e - 112 << 10 | m >> 1;
        bits += m & 1;
        return bits;
      }

      return function (sourceArray, sourceOffset, destArray, destOffset) {
        var e = sourceArray[sourceOffset + 3];
        var scale = Math.pow(2.0, e - 128.0) / 255.0;
        destArray[destOffset + 0] = toHalf(sourceArray[sourceOffset + 0] * scale);
        destArray[destOffset + 1] = toHalf(sourceArray[sourceOffset + 1] * scale);
        destArray[destOffset + 2] = toHalf(sourceArray[sourceOffset + 2] * scale);
      };
    }();

    var byteArray = new Uint8Array(buffer);
    byteArray.pos = 0;
    var rgbe_header_info = RGBE_ReadHeader(byteArray);

    if (RGBE_RETURN_FAILURE !== rgbe_header_info) {
      var w = rgbe_header_info.width,
          h = rgbe_header_info.height,
          image_rgba_data = RGBE_ReadPixels_RLE(byteArray.subarray(byteArray.pos), w, h);

      if (RGBE_RETURN_FAILURE !== image_rgba_data) {
        switch (this.type) {
          case UnsignedByteType:
            var data = image_rgba_data;
            var format = THREE.RGBEFormat;
            var type = UnsignedByteType;
            break;

          case FloatType:
            var numElements = image_rgba_data.length / 4 * 3;
            var floatArray = new Float32Array(numElements);

            for (var j = 0; j < numElements; j++) {
              RGBEByteToRGBFloat(image_rgba_data, j * 4, floatArray, j * 3);
            }

            var data = floatArray;
            var format = THREE.RGBFormat;
            var type = FloatType;
            break;

          case HalfFloatType:
            var numElements = image_rgba_data.length / 4 * 3;
            var halfArray = new Uint16Array(numElements);

            for (var j = 0; j < numElements; j++) {
              RGBEByteToRGBHalf(image_rgba_data, j * 4, halfArray, j * 3);
            }

            var data = halfArray;
            var format = RGBFormat;
            var type = HalfFloatType;
            break;

          default:
            console.error('THREE.RGBELoader: unsupported type: ', this.type);
            break;
        }

        return {
          width: w,
          height: h,
          data: data,
          header: rgbe_header_info.string,
          gamma: rgbe_header_info.gamma,
          exposure: rgbe_header_info.exposure,
          format: format,
          type: type
        };
      }
    }

    return null;
  },
  setDataType: function setDataType(value) {
    this.type = value;
    return this;
  },
  load: function load(url, onLoad, onProgress, onError) {
    function onLoadCallback(texture, texData) {
      switch (texture.type) {
        case UnsignedByteType:
          texture.encoding = THREE.RGBEEncoding;
          texture.minFilter = THREE.NearestFilter;
          texture.magFilter = NearestFilter;
          texture.generateMipmaps = false;
          texture.flipY = true;
          break;

        case FloatType:
          texture.encoding = THREE.LinearEncoding;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = LinearFilter;
          texture.generateMipmaps = false;
          texture.flipY = true;
          break;

        case HalfFloatType:
          texture.encoding = LinearEncoding;
          texture.minFilter = LinearFilter;
          texture.magFilter = LinearFilter;
          texture.generateMipmaps = false;
          texture.flipY = true;
          break;
      }

      if (onLoad) onLoad(texture, texData);
    }

    return DataTextureLoader.prototype.load.call(this, url, onLoadCallback, onProgress, onError);
  }
});