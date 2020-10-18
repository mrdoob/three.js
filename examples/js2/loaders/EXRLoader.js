"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.EXRLoader = void 0;

var EXRLoader = function EXRLoader(manager) {
  DataTextureLoader.call(this, manager);
  this.type = THREE.FloatType;
};

THREE.EXRLoader = EXRLoader;
EXRLoader.prototype = Object.assign(Object.create(THREE.DataTextureLoader.prototype), {
  constructor: EXRLoader,
  parse: function parse(buffer) {
    var USHORT_RANGE = 1 << 16;
    var BITMAP_SIZE = USHORT_RANGE >> 3;
    var HUF_ENCBITS = 16;
    var HUF_DECBITS = 14;
    var HUF_ENCSIZE = (1 << HUF_ENCBITS) + 1;
    var HUF_DECSIZE = 1 << HUF_DECBITS;
    var HUF_DECMASK = HUF_DECSIZE - 1;
    var NBITS = 16;
    var A_OFFSET = 1 << NBITS - 1;
    var MOD_MASK = (1 << NBITS) - 1;
    var SHORT_ZEROCODE_RUN = 59;
    var LONG_ZEROCODE_RUN = 63;
    var SHORTEST_LONG_RUN = 2 + LONG_ZEROCODE_RUN - SHORT_ZEROCODE_RUN;
    var ULONG_SIZE = 8;
    var FLOAT32_SIZE = 4;
    var INT32_SIZE = 4;
    var INT16_SIZE = 2;
    var INT8_SIZE = 1;
    var STATIC_HUFFMAN = 0;
    var DEFLATE = 1;
    var UNKNOWN = 0;
    var LOSSY_DCT = 1;
    var RLE = 2;
    var logBase = Math.pow(2.7182818, 2.2);
    var tmpDataView = new DataView(new ArrayBuffer(8));

    function frexp(value) {
      if (value === 0) return [value, 0];
      tmpDataView.setFloat64(0, value);
      var bits = tmpDataView.getUint32(0) >>> 20 & 0x7FF;

      if (bits === 0) {
        tmpDataView.setFloat64(0, value * Math.pow(2, 64));
        bits = (tmpDataView.getUint32(0) >>> 20 & 0x7FF) - 64;
      }

      var exponent = bits - 1022;
      var mantissa = ldexp(value, -exponent);
      return [mantissa, exponent];
    }

    function ldexp(mantissa, exponent) {
      var steps = Math.min(3, Math.ceil(Math.abs(exponent) / 1023));
      var result = mantissa;

      for (var i = 0; i < steps; i++) {
        result *= Math.pow(2, Math.floor((exponent + i) / steps));
      }

      return result;
    }

    function reverseLutFromBitmap(bitmap, lut) {
      var k = 0;

      for (var i = 0; i < USHORT_RANGE; ++i) {
        if (i == 0 || bitmap[i >> 3] & 1 << (i & 7)) {
          lut[k++] = i;
        }
      }

      var n = k - 1;

      while (k < USHORT_RANGE) {
        lut[k++] = 0;
      }

      return n;
    }

    function hufClearDecTable(hdec) {
      for (var i = 0; i < HUF_DECSIZE; i++) {
        hdec[i] = {};
        hdec[i].len = 0;
        hdec[i].lit = 0;
        hdec[i].p = null;
      }
    }

    var getBitsReturn = {
      l: 0,
      c: 0,
      lc: 0
    };

    function getBits(nBits, c, lc, uInt8Array, inOffset) {
      while (lc < nBits) {
        c = c << 8 | parseUint8Array(uInt8Array, inOffset);
        lc += 8;
      }

      lc -= nBits;
      getBitsReturn.l = c >> lc & (1 << nBits) - 1;
      getBitsReturn.c = c;
      getBitsReturn.lc = lc;
    }

    var hufTableBuffer = new Array(59);

    function hufCanonicalCodeTable(hcode) {
      for (var i = 0; i <= 58; ++i) {
        hufTableBuffer[i] = 0;
      }

      for (var i = 0; i < HUF_ENCSIZE; ++i) {
        hufTableBuffer[hcode[i]] += 1;
      }

      var c = 0;

      for (var i = 58; i > 0; --i) {
        var nc = c + hufTableBuffer[i] >> 1;
        hufTableBuffer[i] = c;
        c = nc;
      }

      for (var i = 0; i < HUF_ENCSIZE; ++i) {
        var l = hcode[i];
        if (l > 0) hcode[i] = l | hufTableBuffer[l]++ << 6;
      }
    }

    function hufUnpackEncTable(uInt8Array, inDataView, inOffset, ni, im, iM, hcode) {
      var p = inOffset;
      var c = 0;
      var lc = 0;

      for (; im <= iM; im++) {
        if (p.value - inOffset.value > ni) return false;
        getBits(6, c, lc, uInt8Array, p);
        var l = getBitsReturn.l;
        c = getBitsReturn.c;
        lc = getBitsReturn.lc;
        hcode[im] = l;

        if (l == LONG_ZEROCODE_RUN) {
          if (p.value - inOffset.value > ni) {
            throw 'Something wrong with hufUnpackEncTable';
          }

          getBits(8, c, lc, uInt8Array, p);
          var zerun = getBitsReturn.l + SHORTEST_LONG_RUN;
          c = getBitsReturn.c;
          lc = getBitsReturn.lc;

          if (im + zerun > iM + 1) {
            throw 'Something wrong with hufUnpackEncTable';
          }

          while (zerun--) {
            hcode[im++] = 0;
          }

          im--;
        } else if (l >= SHORT_ZEROCODE_RUN) {
          var zerun = l - SHORT_ZEROCODE_RUN + 2;

          if (im + zerun > iM + 1) {
            throw 'Something wrong with hufUnpackEncTable';
          }

          while (zerun--) {
            hcode[im++] = 0;
          }

          im--;
        }
      }

      hufCanonicalCodeTable(hcode);
    }

    function hufLength(code) {
      return code & 63;
    }

    function hufCode(code) {
      return code >> 6;
    }

    function hufBuildDecTable(hcode, im, iM, hdecod) {
      for (; im <= iM; im++) {
        var c = hufCode(hcode[im]);
        var l = hufLength(hcode[im]);

        if (c >> l) {
          throw 'Invalid table entry';
        }

        if (l > HUF_DECBITS) {
          var pl = hdecod[c >> l - HUF_DECBITS];

          if (pl.len) {
            throw 'Invalid table entry';
          }

          pl.lit++;

          if (pl.p) {
            var p = pl.p;
            pl.p = new Array(pl.lit);

            for (var i = 0; i < pl.lit - 1; ++i) {
              pl.p[i] = p[i];
            }
          } else {
            pl.p = new Array(1);
          }

          pl.p[pl.lit - 1] = im;
        } else if (l) {
          var plOffset = 0;

          for (var i = 1 << HUF_DECBITS - l; i > 0; i--) {
            var pl = hdecod[(c << HUF_DECBITS - l) + plOffset];

            if (pl.len || pl.p) {
              throw 'Invalid table entry';
            }

            pl.len = l;
            pl.lit = im;
            plOffset++;
          }
        }
      }

      return true;
    }

    var getCharReturn = {
      c: 0,
      lc: 0
    };

    function getChar(c, lc, uInt8Array, inOffset) {
      c = c << 8 | parseUint8Array(uInt8Array, inOffset);
      lc += 8;
      getCharReturn.c = c;
      getCharReturn.lc = lc;
    }

    var getCodeReturn = {
      c: 0,
      lc: 0
    };

    function getCode(po, rlc, c, lc, uInt8Array, inDataView, inOffset, outBuffer, outBufferOffset, outBufferEndOffset) {
      if (po == rlc) {
        if (lc < 8) {
          getChar(c, lc, uInt8Array, inOffset);
          c = getCharReturn.c;
          lc = getCharReturn.lc;
        }

        lc -= 8;
        var cs = c >> lc;
        var cs = new Uint8Array([cs])[0];

        if (outBufferOffset.value + cs > outBufferEndOffset) {
          return false;
        }

        var s = outBuffer[outBufferOffset.value - 1];

        while (cs-- > 0) {
          outBuffer[outBufferOffset.value++] = s;
        }
      } else if (outBufferOffset.value < outBufferEndOffset) {
        outBuffer[outBufferOffset.value++] = po;
      } else {
        return false;
      }

      getCodeReturn.c = c;
      getCodeReturn.lc = lc;
    }

    function UInt16(value) {
      return value & 0xFFFF;
    }

    function Int16(value) {
      var ref = UInt16(value);
      return ref > 0x7FFF ? ref - 0x10000 : ref;
    }

    var wdec14Return = {
      a: 0,
      b: 0
    };

    function wdec14(l, h) {
      var ls = Int16(l);
      var hs = Int16(h);
      var hi = hs;
      var ai = ls + (hi & 1) + (hi >> 1);
      var as = ai;
      var bs = ai - hi;
      wdec14Return.a = as;
      wdec14Return.b = bs;
    }

    function wdec16(l, h) {
      var m = UInt16(l);
      var d = UInt16(h);
      var bb = m - (d >> 1) & MOD_MASK;
      var aa = d + bb - A_OFFSET & MOD_MASK;
      wdec14Return.a = aa;
      wdec14Return.b = bb;
    }

    function wav2Decode(buffer, j, nx, ox, ny, oy, mx) {
      var w14 = mx < 1 << 14;
      var n = nx > ny ? ny : nx;
      var p = 1;
      var p2;

      while (p <= n) {
        p <<= 1;
      }

      p >>= 1;
      p2 = p;
      p >>= 1;

      while (p >= 1) {
        var py = 0;
        var ey = py + oy * (ny - p2);
        var oy1 = oy * p;
        var oy2 = oy * p2;
        var ox1 = ox * p;
        var ox2 = ox * p2;
        var i00, i01, i10, i11;

        for (; py <= ey; py += oy2) {
          var px = py;
          var ex = py + ox * (nx - p2);

          for (; px <= ex; px += ox2) {
            var p01 = px + ox1;
            var p10 = px + oy1;
            var p11 = p10 + ox1;

            if (w14) {
              wdec14(buffer[px + j], buffer[p10 + j]);
              i00 = wdec14Return.a;
              i10 = wdec14Return.b;
              wdec14(buffer[p01 + j], buffer[p11 + j]);
              i01 = wdec14Return.a;
              i11 = wdec14Return.b;
              wdec14(i00, i01);
              buffer[px + j] = wdec14Return.a;
              buffer[p01 + j] = wdec14Return.b;
              wdec14(i10, i11);
              buffer[p10 + j] = wdec14Return.a;
              buffer[p11 + j] = wdec14Return.b;
            } else {
              wdec16(buffer[px + j], buffer[p10 + j]);
              i00 = wdec14Return.a;
              i10 = wdec14Return.b;
              wdec16(buffer[p01 + j], buffer[p11 + j]);
              i01 = wdec14Return.a;
              i11 = wdec14Return.b;
              wdec16(i00, i01);
              buffer[px + j] = wdec14Return.a;
              buffer[p01 + j] = wdec14Return.b;
              wdec16(i10, i11);
              buffer[p10 + j] = wdec14Return.a;
              buffer[p11 + j] = wdec14Return.b;
            }
          }

          if (nx & p) {
            var p10 = px + oy1;
            if (w14) wdec14(buffer[px + j], buffer[p10 + j]);else wdec16(buffer[px + j], buffer[p10 + j]);
            i00 = wdec14Return.a;
            buffer[p10 + j] = wdec14Return.b;
            buffer[px + j] = i00;
          }
        }

        if (ny & p) {
          var px = py;
          var ex = py + ox * (nx - p2);

          for (; px <= ex; px += ox2) {
            var p01 = px + ox1;
            if (w14) wdec14(buffer[px + j], buffer[p01 + j]);else wdec16(buffer[px + j], buffer[p01 + j]);
            i00 = wdec14Return.a;
            buffer[p01 + j] = wdec14Return.b;
            buffer[px + j] = i00;
          }
        }

        p2 = p;
        p >>= 1;
      }

      return py;
    }

    function hufDecode(encodingTable, decodingTable, uInt8Array, inDataView, inOffset, ni, rlc, no, outBuffer, outOffset) {
      var c = 0;
      var lc = 0;
      var outBufferEndOffset = no;
      var inOffsetEnd = Math.trunc(inOffset.value + (ni + 7) / 8);

      while (inOffset.value < inOffsetEnd) {
        getChar(c, lc, uInt8Array, inOffset);
        c = getCharReturn.c;
        lc = getCharReturn.lc;

        while (lc >= HUF_DECBITS) {
          var index = c >> lc - HUF_DECBITS & HUF_DECMASK;
          var pl = decodingTable[index];

          if (pl.len) {
            lc -= pl.len;
            getCode(pl.lit, rlc, c, lc, uInt8Array, inDataView, inOffset, outBuffer, outOffset, outBufferEndOffset);
            c = getCodeReturn.c;
            lc = getCodeReturn.lc;
          } else {
            if (!pl.p) {
              throw 'hufDecode issues';
            }

            var j;

            for (j = 0; j < pl.lit; j++) {
              var l = hufLength(encodingTable[pl.p[j]]);

              while (lc < l && inOffset.value < inOffsetEnd) {
                getChar(c, lc, uInt8Array, inOffset);
                c = getCharReturn.c;
                lc = getCharReturn.lc;
              }

              if (lc >= l) {
                if (hufCode(encodingTable[pl.p[j]]) == (c >> lc - l & (1 << l) - 1)) {
                  lc -= l;
                  getCode(pl.p[j], rlc, c, lc, uInt8Array, inDataView, inOffset, outBuffer, outOffset, outBufferEndOffset);
                  c = getCodeReturn.c;
                  lc = getCodeReturn.lc;
                  break;
                }
              }
            }

            if (j == pl.lit) {
              throw 'hufDecode issues';
            }
          }
        }
      }

      var i = 8 - ni & 7;
      c >>= i;
      lc -= i;

      while (lc > 0) {
        var pl = decodingTable[c << HUF_DECBITS - lc & HUF_DECMASK];

        if (pl.len) {
          lc -= pl.len;
          getCode(pl.lit, rlc, c, lc, uInt8Array, inDataView, inOffset, outBuffer, outOffset, outBufferEndOffset);
          c = getCodeReturn.c;
          lc = getCodeReturn.lc;
        } else {
          throw 'hufDecode issues';
        }
      }

      return true;
    }

    function hufUncompress(uInt8Array, inDataView, inOffset, nCompressed, outBuffer, nRaw) {
      var outOffset = {
        value: 0
      };
      var initialInOffset = inOffset.value;
      var im = parseUint32(inDataView, inOffset);
      var iM = parseUint32(inDataView, inOffset);
      inOffset.value += 4;
      var nBits = parseUint32(inDataView, inOffset);
      inOffset.value += 4;

      if (im < 0 || im >= HUF_ENCSIZE || iM < 0 || iM >= HUF_ENCSIZE) {
        throw 'Something wrong with HUF_ENCSIZE';
      }

      var freq = new Array(HUF_ENCSIZE);
      var hdec = new Array(HUF_DECSIZE);
      hufClearDecTable(hdec);
      var ni = nCompressed - (inOffset.value - initialInOffset);
      hufUnpackEncTable(uInt8Array, inDataView, inOffset, ni, im, iM, freq);

      if (nBits > 8 * (nCompressed - (inOffset.value - initialInOffset))) {
        throw 'Something wrong with hufUncompress';
      }

      hufBuildDecTable(freq, im, iM, hdec);
      hufDecode(freq, hdec, uInt8Array, inDataView, inOffset, nBits, iM, nRaw, outBuffer, outOffset);
    }

    function applyLut(lut, data, nData) {
      for (var i = 0; i < nData; ++i) {
        data[i] = lut[data[i]];
      }
    }

    function predictor(source) {
      for (var t = 1; t < source.length; t++) {
        var d = source[t - 1] + source[t] - 128;
        source[t] = d;
      }
    }

    function interleaveScalar(source, out) {
      var t1 = 0;
      var t2 = Math.floor((source.length + 1) / 2);
      var s = 0;
      var stop = source.length - 1;

      while (true) {
        if (s > stop) break;
        out[s++] = source[t1++];
        if (s > stop) break;
        out[s++] = source[t2++];
      }
    }

    function decodeRunLength(source) {
      var size = source.byteLength;
      var out = new Array();
      var p = 0;
      var reader = new DataView(source);

      while (size > 0) {
        var l = reader.getInt8(p++);

        if (l < 0) {
          var count = -l;
          size -= count + 1;

          for (var i = 0; i < count; i++) {
            out.push(reader.getUint8(p++));
          }
        } else {
          var count = l;
          size -= 2;
          var value = reader.getUint8(p++);

          for (var i = 0; i < count + 1; i++) {
            out.push(value);
          }
        }
      }

      return out;
    }

    function lossyDctDecode(cscSet, rowPtrs, channelData, acBuffer, dcBuffer, outBuffer) {
      var dataView = new DataView(outBuffer.buffer);
      var width = channelData[cscSet.idx[0]].width;
      var height = channelData[cscSet.idx[0]].height;
      var numComp = 3;
      var numFullBlocksX = Math.floor(width / 8.0);
      var numBlocksX = Math.ceil(width / 8.0);
      var numBlocksY = Math.ceil(height / 8.0);
      var leftoverX = width - (numBlocksX - 1) * 8;
      var leftoverY = height - (numBlocksY - 1) * 8;
      var currAcComp = {
        value: 0
      };
      var currDcComp = new Array(numComp);
      var dctData = new Array(numComp);
      var halfZigBlock = new Array(numComp);
      var rowBlock = new Array(numComp);
      var rowOffsets = new Array(numComp);

      for (var _comp = 0; _comp < numComp; ++_comp) {
        rowOffsets[_comp] = rowPtrs[cscSet.idx[_comp]];
        currDcComp[_comp] = _comp < 1 ? 0 : currDcComp[_comp - 1] + numBlocksX * numBlocksY;
        dctData[_comp] = new Float32Array(64);
        halfZigBlock[_comp] = new Uint16Array(64);
        rowBlock[_comp] = new Uint16Array(numBlocksX * 64);
      }

      for (var blocky = 0; blocky < numBlocksY; ++blocky) {
        var maxY = 8;
        if (blocky == numBlocksY - 1) maxY = leftoverY;
        var maxX = 8;

        for (var blockx = 0; blockx < numBlocksX; ++blockx) {
          if (blockx == numBlocksX - 1) maxX = leftoverX;

          for (var _comp2 = 0; _comp2 < numComp; ++_comp2) {
            halfZigBlock[_comp2].fill(0);

            halfZigBlock[_comp2][0] = dcBuffer[currDcComp[_comp2]++];
            unRleAC(currAcComp, acBuffer, halfZigBlock[_comp2]);
            unZigZag(halfZigBlock[_comp2], dctData[_comp2]);
            dctInverse(dctData[_comp2]);
          }

          if (numComp == 3) {
            csc709Inverse(dctData);
          }

          for (var _comp3 = 0; _comp3 < numComp; ++_comp3) {
            convertToHalf(dctData[_comp3], rowBlock[_comp3], blockx * 64);
          }
        }

        var _offset = 0;

        for (var _comp4 = 0; _comp4 < numComp; ++_comp4) {
          var _type = channelData[cscSet.idx[_comp4]].type;

          for (var _y = 8 * blocky; _y < 8 * blocky + maxY; ++_y) {
            _offset = rowOffsets[_comp4][_y];

            for (var _blockx = 0; _blockx < numFullBlocksX; ++_blockx) {
              var src = _blockx * 64 + (_y & 0x7) * 8;
              dataView.setUint16(_offset + 0 * INT16_SIZE * _type, rowBlock[_comp4][src + 0], true);
              dataView.setUint16(_offset + 1 * INT16_SIZE * _type, rowBlock[_comp4][src + 1], true);
              dataView.setUint16(_offset + 2 * INT16_SIZE * _type, rowBlock[_comp4][src + 2], true);
              dataView.setUint16(_offset + 3 * INT16_SIZE * _type, rowBlock[_comp4][src + 3], true);
              dataView.setUint16(_offset + 4 * INT16_SIZE * _type, rowBlock[_comp4][src + 4], true);
              dataView.setUint16(_offset + 5 * INT16_SIZE * _type, rowBlock[_comp4][src + 5], true);
              dataView.setUint16(_offset + 6 * INT16_SIZE * _type, rowBlock[_comp4][src + 6], true);
              dataView.setUint16(_offset + 7 * INT16_SIZE * _type, rowBlock[_comp4][src + 7], true);
              _offset += 8 * INT16_SIZE * _type;
            }
          }

          if (numFullBlocksX != numBlocksX) {
            for (var _y2 = 8 * blocky; _y2 < 8 * blocky + maxY; ++_y2) {
              var _offset2 = rowOffsets[_comp4][_y2] + 8 * numFullBlocksX * INT16_SIZE * _type;

              var _src = numFullBlocksX * 64 + (_y2 & 0x7) * 8;

              for (var _x = 0; _x < maxX; ++_x) {
                dataView.setUint16(_offset2 + _x * INT16_SIZE * _type, rowBlock[_comp4][_src + _x], true);
              }
            }
          }
        }
      }

      var halfRow = new Uint16Array(width);
      var dataView = new DataView(outBuffer.buffer);

      for (var comp = 0; comp < numComp; ++comp) {
        channelData[cscSet.idx[comp]].decoded = true;
        var type = channelData[cscSet.idx[comp]].type;
        if (channelData[comp].type != 2) continue;

        for (var y = 0; y < height; ++y) {
          var _offset3 = rowOffsets[comp][y];

          for (var x = 0; x < width; ++x) {
            halfRow[x] = dataView.getUint16(_offset3 + x * INT16_SIZE * type, true);
          }

          for (var x = 0; x < width; ++x) {
            dataView.setFloat32(_offset3 + x * INT16_SIZE * type, decodeFloat16(halfRow[x]), true);
          }
        }
      }
    }

    function unRleAC(currAcComp, acBuffer, halfZigBlock) {
      var acValue;
      var dctComp = 1;

      while (dctComp < 64) {
        acValue = acBuffer[currAcComp.value];

        if (acValue == 0xff00) {
          dctComp = 64;
        } else if (acValue >> 8 == 0xff) {
          dctComp += acValue & 0xff;
        } else {
          halfZigBlock[dctComp] = acValue;
          dctComp++;
        }

        currAcComp.value++;
      }
    }

    function unZigZag(src, dst) {
      dst[0] = decodeFloat16(src[0]);
      dst[1] = decodeFloat16(src[1]);
      dst[2] = decodeFloat16(src[5]);
      dst[3] = decodeFloat16(src[6]);
      dst[4] = decodeFloat16(src[14]);
      dst[5] = decodeFloat16(src[15]);
      dst[6] = decodeFloat16(src[27]);
      dst[7] = decodeFloat16(src[28]);
      dst[8] = decodeFloat16(src[2]);
      dst[9] = decodeFloat16(src[4]);
      dst[10] = decodeFloat16(src[7]);
      dst[11] = decodeFloat16(src[13]);
      dst[12] = decodeFloat16(src[16]);
      dst[13] = decodeFloat16(src[26]);
      dst[14] = decodeFloat16(src[29]);
      dst[15] = decodeFloat16(src[42]);
      dst[16] = decodeFloat16(src[3]);
      dst[17] = decodeFloat16(src[8]);
      dst[18] = decodeFloat16(src[12]);
      dst[19] = decodeFloat16(src[17]);
      dst[20] = decodeFloat16(src[25]);
      dst[21] = decodeFloat16(src[30]);
      dst[22] = decodeFloat16(src[41]);
      dst[23] = decodeFloat16(src[43]);
      dst[24] = decodeFloat16(src[9]);
      dst[25] = decodeFloat16(src[11]);
      dst[26] = decodeFloat16(src[18]);
      dst[27] = decodeFloat16(src[24]);
      dst[28] = decodeFloat16(src[31]);
      dst[29] = decodeFloat16(src[40]);
      dst[30] = decodeFloat16(src[44]);
      dst[31] = decodeFloat16(src[53]);
      dst[32] = decodeFloat16(src[10]);
      dst[33] = decodeFloat16(src[19]);
      dst[34] = decodeFloat16(src[23]);
      dst[35] = decodeFloat16(src[32]);
      dst[36] = decodeFloat16(src[39]);
      dst[37] = decodeFloat16(src[45]);
      dst[38] = decodeFloat16(src[52]);
      dst[39] = decodeFloat16(src[54]);
      dst[40] = decodeFloat16(src[20]);
      dst[41] = decodeFloat16(src[22]);
      dst[42] = decodeFloat16(src[33]);
      dst[43] = decodeFloat16(src[38]);
      dst[44] = decodeFloat16(src[46]);
      dst[45] = decodeFloat16(src[51]);
      dst[46] = decodeFloat16(src[55]);
      dst[47] = decodeFloat16(src[60]);
      dst[48] = decodeFloat16(src[21]);
      dst[49] = decodeFloat16(src[34]);
      dst[50] = decodeFloat16(src[37]);
      dst[51] = decodeFloat16(src[47]);
      dst[52] = decodeFloat16(src[50]);
      dst[53] = decodeFloat16(src[56]);
      dst[54] = decodeFloat16(src[59]);
      dst[55] = decodeFloat16(src[61]);
      dst[56] = decodeFloat16(src[35]);
      dst[57] = decodeFloat16(src[36]);
      dst[58] = decodeFloat16(src[48]);
      dst[59] = decodeFloat16(src[49]);
      dst[60] = decodeFloat16(src[57]);
      dst[61] = decodeFloat16(src[58]);
      dst[62] = decodeFloat16(src[62]);
      dst[63] = decodeFloat16(src[63]);
    }

    function dctInverse(data) {
      var a = 0.5 * Math.cos(3.14159 / 4.0);
      var b = 0.5 * Math.cos(3.14159 / 16.0);
      var c = 0.5 * Math.cos(3.14159 / 8.0);
      var d = 0.5 * Math.cos(3.0 * 3.14159 / 16.0);
      var e = 0.5 * Math.cos(5.0 * 3.14159 / 16.0);
      var f = 0.5 * Math.cos(3.0 * 3.14159 / 8.0);
      var g = 0.5 * Math.cos(7.0 * 3.14159 / 16.0);
      var alpha = new Array(4);
      var beta = new Array(4);
      var theta = new Array(4);
      var gamma = new Array(4);

      for (var row = 0; row < 8; ++row) {
        var rowPtr = row * 8;
        alpha[0] = c * data[rowPtr + 2];
        alpha[1] = f * data[rowPtr + 2];
        alpha[2] = c * data[rowPtr + 6];
        alpha[3] = f * data[rowPtr + 6];
        beta[0] = b * data[rowPtr + 1] + d * data[rowPtr + 3] + e * data[rowPtr + 5] + g * data[rowPtr + 7];
        beta[1] = d * data[rowPtr + 1] - g * data[rowPtr + 3] - b * data[rowPtr + 5] - e * data[rowPtr + 7];
        beta[2] = e * data[rowPtr + 1] - b * data[rowPtr + 3] + g * data[rowPtr + 5] + d * data[rowPtr + 7];
        beta[3] = g * data[rowPtr + 1] - e * data[rowPtr + 3] + d * data[rowPtr + 5] - b * data[rowPtr + 7];
        theta[0] = a * (data[rowPtr + 0] + data[rowPtr + 4]);
        theta[3] = a * (data[rowPtr + 0] - data[rowPtr + 4]);
        theta[1] = alpha[0] + alpha[3];
        theta[2] = alpha[1] - alpha[2];
        gamma[0] = theta[0] + theta[1];
        gamma[1] = theta[3] + theta[2];
        gamma[2] = theta[3] - theta[2];
        gamma[3] = theta[0] - theta[1];
        data[rowPtr + 0] = gamma[0] + beta[0];
        data[rowPtr + 1] = gamma[1] + beta[1];
        data[rowPtr + 2] = gamma[2] + beta[2];
        data[rowPtr + 3] = gamma[3] + beta[3];
        data[rowPtr + 4] = gamma[3] - beta[3];
        data[rowPtr + 5] = gamma[2] - beta[2];
        data[rowPtr + 6] = gamma[1] - beta[1];
        data[rowPtr + 7] = gamma[0] - beta[0];
      }

      for (var column = 0; column < 8; ++column) {
        alpha[0] = c * data[16 + column];
        alpha[1] = f * data[16 + column];
        alpha[2] = c * data[48 + column];
        alpha[3] = f * data[48 + column];
        beta[0] = b * data[8 + column] + d * data[24 + column] + e * data[40 + column] + g * data[56 + column];
        beta[1] = d * data[8 + column] - g * data[24 + column] - b * data[40 + column] - e * data[56 + column];
        beta[2] = e * data[8 + column] - b * data[24 + column] + g * data[40 + column] + d * data[56 + column];
        beta[3] = g * data[8 + column] - e * data[24 + column] + d * data[40 + column] - b * data[56 + column];
        theta[0] = a * (data[column] + data[32 + column]);
        theta[3] = a * (data[column] - data[32 + column]);
        theta[1] = alpha[0] + alpha[3];
        theta[2] = alpha[1] - alpha[2];
        gamma[0] = theta[0] + theta[1];
        gamma[1] = theta[3] + theta[2];
        gamma[2] = theta[3] - theta[2];
        gamma[3] = theta[0] - theta[1];
        data[0 + column] = gamma[0] + beta[0];
        data[8 + column] = gamma[1] + beta[1];
        data[16 + column] = gamma[2] + beta[2];
        data[24 + column] = gamma[3] + beta[3];
        data[32 + column] = gamma[3] - beta[3];
        data[40 + column] = gamma[2] - beta[2];
        data[48 + column] = gamma[1] - beta[1];
        data[56 + column] = gamma[0] - beta[0];
      }
    }

    function csc709Inverse(data) {
      for (var i = 0; i < 64; ++i) {
        var y = data[0][i];
        var cb = data[1][i];
        var cr = data[2][i];
        data[0][i] = y + 1.5747 * cr;
        data[1][i] = y - 0.1873 * cb - 0.4682 * cr;
        data[2][i] = y + 1.8556 * cb;
      }
    }

    function convertToHalf(src, dst, idx) {
      for (var i = 0; i < 64; ++i) {
        dst[idx + i] = encodeFloat16(toLinear(src[i]));
      }
    }

    function toLinear(_float) {
      if (_float <= 1) {
        return Math.sign(_float) * Math.pow(Math.abs(_float), 2.2);
      } else {
        return Math.sign(_float) * Math.pow(logBase, Math.abs(_float) - 1.0);
      }
    }

    function uncompressRAW(info) {
      return new DataView(info.array.buffer, info.offset.value, info.size);
    }

    function uncompressRLE(info) {
      var compressed = info.viewer.buffer.slice(info.offset.value, info.offset.value + info.size);
      var rawBuffer = new Uint8Array(decodeRunLength(compressed));
      var tmpBuffer = new Uint8Array(rawBuffer.length);
      predictor(rawBuffer);
      interleaveScalar(rawBuffer, tmpBuffer);
      return new DataView(tmpBuffer.buffer);
    }

    function uncompressZIP(info) {
      var compressed = info.array.slice(info.offset.value, info.offset.value + info.size);

      if (typeof Inflate === 'undefined') {
        console.error('THREE.EXRLoader: External library Inflate.min.js required, obtain or import from https://github.com/imaya/zlib.js');
      }

      var inflate = new Inflate(compressed, {
        resize: true,
        verify: true
      });
      var rawBuffer = new Uint8Array(inflate.decompress().buffer);
      var tmpBuffer = new Uint8Array(rawBuffer.length);
      predictor(rawBuffer);
      interleaveScalar(rawBuffer, tmpBuffer);
      return new DataView(tmpBuffer.buffer);
    }

    function uncompressPIZ(info) {
      var inDataView = info.viewer;
      var inOffset = {
        value: info.offset.value
      };
      var tmpBufSize = info.width * scanlineBlockSize * (EXRHeader.channels.length * info.type);
      var outBuffer = new Uint16Array(tmpBufSize);
      var bitmap = new Uint8Array(BITMAP_SIZE);
      var outBufferEnd = 0;
      var pizChannelData = new Array(info.channels);

      for (var i = 0; i < info.channels; i++) {
        pizChannelData[i] = {};
        pizChannelData[i]['start'] = outBufferEnd;
        pizChannelData[i]['end'] = pizChannelData[i]['start'];
        pizChannelData[i]['nx'] = info.width;
        pizChannelData[i]['ny'] = info.lines;
        pizChannelData[i]['size'] = info.type;
        outBufferEnd += pizChannelData[i].nx * pizChannelData[i].ny * pizChannelData[i].size;
      }

      var minNonZero = parseUint16(inDataView, inOffset);
      var maxNonZero = parseUint16(inDataView, inOffset);

      if (maxNonZero >= BITMAP_SIZE) {
        throw 'Something is wrong with PIZ_COMPRESSION BITMAP_SIZE';
      }

      if (minNonZero <= maxNonZero) {
        for (var i = 0; i < maxNonZero - minNonZero + 1; i++) {
          bitmap[i + minNonZero] = parseUint8(inDataView, inOffset);
        }
      }

      var lut = new Uint16Array(USHORT_RANGE);
      var maxValue = reverseLutFromBitmap(bitmap, lut);
      var length = parseUint32(inDataView, inOffset);
      hufUncompress(info.array, inDataView, inOffset, length, outBuffer, outBufferEnd);

      for (var i = 0; i < info.channels; ++i) {
        var cd = pizChannelData[i];

        for (var j = 0; j < pizChannelData[i].size; ++j) {
          wav2Decode(outBuffer, cd.start + j, cd.nx, cd.size, cd.ny, cd.nx * cd.size, maxValue);
        }
      }

      applyLut(lut, outBuffer, outBufferEnd);
      var tmpOffset = 0;
      var tmpBuffer = new Uint8Array(outBuffer.buffer.byteLength);

      for (var y = 0; y < info.lines; y++) {
        for (var c = 0; c < info.channels; c++) {
          var cd = pizChannelData[c];
          var n = cd.nx * cd.size;
          var cp = new Uint8Array(outBuffer.buffer, cd.end * INT16_SIZE, n * INT16_SIZE);
          tmpBuffer.set(cp, tmpOffset);
          tmpOffset += n * INT16_SIZE;
          cd.end += n;
        }
      }

      return new DataView(tmpBuffer.buffer);
    }

    function uncompressPXR(info) {
      var compressed = info.array.slice(info.offset.value, info.offset.value + info.size);

      if (typeof Inflate === 'undefined') {
        console.error('THREE.EXRLoader: External library Inflate.min.js required, obtain or import from https://github.com/imaya/zlib.js');
      }

      var inflate = new Inflate(compressed, {
        resize: true,
        verify: true
      });
      var rawBuffer = new Uint8Array(inflate.decompress().buffer);
      var sz = info.lines * info.channels * info.width;
      var tmpBuffer = info.type == 1 ? new Uint16Array(sz) : new Uint32Array(sz);
      var tmpBufferEnd = 0;
      var writePtr = 0;
      var ptr = new Array(4);

      for (var y = 0; y < info.lines; y++) {
        for (var c = 0; c < info.channels; c++) {
          var pixel = 0;

          switch (info.type) {
            case 1:
              ptr[0] = tmpBufferEnd;
              ptr[1] = ptr[0] + info.width;
              tmpBufferEnd = ptr[1] + info.width;

              for (var j = 0; j < info.width; ++j) {
                var diff = rawBuffer[ptr[0]++] << 8 | rawBuffer[ptr[1]++];
                pixel += diff;
                tmpBuffer[writePtr] = pixel;
                writePtr++;
              }

              break;

            case 2:
              ptr[0] = tmpBufferEnd;
              ptr[1] = ptr[0] + info.width;
              ptr[2] = ptr[1] + info.width;
              tmpBufferEnd = ptr[2] + info.width;

              for (var _j = 0; _j < info.width; ++_j) {
                var _diff = rawBuffer[ptr[0]++] << 24 | rawBuffer[ptr[1]++] << 16 | rawBuffer[ptr[2]++] << 8;

                pixel += _diff;
                tmpBuffer[writePtr] = pixel;
                writePtr++;
              }

              break;
          }
        }
      }

      return new DataView(tmpBuffer.buffer);
    }

    function uncompressDWA(info) {
      var inDataView = info.viewer;
      var inOffset = {
        value: info.offset.value
      };
      var outBuffer = new Uint8Array(info.width * info.lines * (EXRHeader.channels.length * info.type * INT16_SIZE));
      var dwaHeader = {
        version: parseInt64(inDataView, inOffset),
        unknownUncompressedSize: parseInt64(inDataView, inOffset),
        unknownCompressedSize: parseInt64(inDataView, inOffset),
        acCompressedSize: parseInt64(inDataView, inOffset),
        dcCompressedSize: parseInt64(inDataView, inOffset),
        rleCompressedSize: parseInt64(inDataView, inOffset),
        rleUncompressedSize: parseInt64(inDataView, inOffset),
        rleRawSize: parseInt64(inDataView, inOffset),
        totalAcUncompressedCount: parseInt64(inDataView, inOffset),
        totalDcUncompressedCount: parseInt64(inDataView, inOffset),
        acCompression: parseInt64(inDataView, inOffset)
      };
      if (dwaHeader.version < 2) throw 'EXRLoader.parse: ' + EXRHeader.compression + ' version ' + dwaHeader.version + ' is unsupported';
      var channelRules = new Array();
      var ruleSize = parseUint16(inDataView, inOffset) - INT16_SIZE;

      while (ruleSize > 0) {
        var name = parseNullTerminatedString(inDataView.buffer, inOffset);
        var value = parseUint8(inDataView, inOffset);
        var compression = value >> 2 & 3;
        var csc = (value >> 4) - 1;
        var index = new Int8Array([csc])[0];
        var type = parseUint8(inDataView, inOffset);
        channelRules.push({
          name: name,
          index: index,
          type: type,
          compression: compression
        });
        ruleSize -= name.length + 3;
      }

      var channels = EXRHeader.channels;
      var channelData = new Array(info.channels);

      for (var i = 0; i < info.channels; ++i) {
        var cd = channelData[i] = {};
        var channel = channels[i];
        cd.name = channel.name;
        cd.compression = UNKNOWN;
        cd.decoded = false;
        cd.type = channel.pixelType;
        cd.pLinear = channel.pLinear;
        cd.width = info.width;
        cd.height = info.lines;
      }

      var cscSet = {
        idx: new Array(3)
      };

      for (var offset = 0; offset < info.channels; ++offset) {
        var cd = channelData[offset];

        for (var i = 0; i < channelRules.length; ++i) {
          var rule = channelRules[i];

          if (cd.name == rule.name) {
            cd.compression = rule.compression;

            if (rule.index >= 0) {
              cscSet.idx[rule.index] = offset;
            }

            cd.offset = offset;
          }
        }
      }

      if (dwaHeader.acCompressedSize > 0) {
        switch (dwaHeader.acCompression) {
          case STATIC_HUFFMAN:
            var acBuffer = new Uint16Array(dwaHeader.totalAcUncompressedCount);
            hufUncompress(info.array, inDataView, inOffset, dwaHeader.acCompressedSize, acBuffer, dwaHeader.totalAcUncompressedCount);
            break;

          case DEFLATE:
            var compressed = info.array.slice(inOffset.value, inOffset.value + dwaHeader.totalAcUncompressedCount);
            var inflate = new Inflate(compressed, {
              resize: true,
              verify: true
            });
            var acBuffer = new Uint16Array(inflate.decompress().buffer);
            inOffset.value += dwaHeader.totalAcUncompressedCount;
            break;
        }
      }

      if (dwaHeader.dcCompressedSize > 0) {
        var zlibInfo = {
          array: info.array,
          offset: inOffset,
          size: dwaHeader.dcCompressedSize
        };
        var dcBuffer = new Uint16Array(uncompressZIP(zlibInfo).buffer);
        inOffset.value += dwaHeader.dcCompressedSize;
      }

      if (dwaHeader.rleRawSize > 0) {
        var compressed = info.array.slice(inOffset.value, inOffset.value + dwaHeader.rleCompressedSize);
        var inflate = new Inflate(compressed, {
          resize: true,
          verify: true
        });
        var rleBuffer = decodeRunLength(inflate.decompress().buffer);
        inOffset.value += dwaHeader.rleCompressedSize;
      }

      var outBufferEnd = 0;
      var rowOffsets = new Array(channelData.length);

      for (var i = 0; i < rowOffsets.length; ++i) {
        rowOffsets[i] = new Array();
      }

      for (var y = 0; y < info.lines; ++y) {
        for (var chan = 0; chan < channelData.length; ++chan) {
          rowOffsets[chan].push(outBufferEnd);
          outBufferEnd += channelData[chan].width * info.type * INT16_SIZE;
        }
      }

      lossyDctDecode(cscSet, rowOffsets, channelData, acBuffer, dcBuffer, outBuffer);

      for (var i = 0; i < channelData.length; ++i) {
        var cd = channelData[i];
        if (cd.decoded) continue;

        switch (cd.compression) {
          case RLE:
            var row = 0;
            var rleOffset = 0;

            for (var y = 0; y < info.lines; ++y) {
              var rowOffsetBytes = rowOffsets[i][row];

              for (var x = 0; x < cd.width; ++x) {
                for (var _byte = 0; _byte < INT16_SIZE * cd.type; ++_byte) {
                  outBuffer[rowOffsetBytes++] = rleBuffer[rleOffset + _byte * cd.width * cd.height];
                }

                rleOffset++;
              }

              row++;
            }

            break;

          case LOSSY_DCT:
          default:
            throw 'EXRLoader.parse: unsupported channel compression';
        }
      }

      return new DataView(outBuffer.buffer);
    }

    function parseNullTerminatedString(buffer, offset) {
      var uintBuffer = new Uint8Array(buffer);
      var endOffset = 0;

      while (uintBuffer[offset.value + endOffset] != 0) {
        endOffset += 1;
      }

      var stringValue = new TextDecoder().decode(uintBuffer.slice(offset.value, offset.value + endOffset));
      offset.value = offset.value + endOffset + 1;
      return stringValue;
    }

    function parseFixedLengthString(buffer, offset, size) {
      var stringValue = new TextDecoder().decode(new Uint8Array(buffer).slice(offset.value, offset.value + size));
      offset.value = offset.value + size;
      return stringValue;
    }

    function parseUlong(dataView, offset) {
      var uLong = dataView.getUint32(0, true);
      offset.value = offset.value + ULONG_SIZE;
      return uLong;
    }

    function parseRational(dataView, offset) {
      var x = parseInt32(dataView, offset);
      var y = parseUint32(dataView, offset);
      return [x, y];
    }

    function parseTimecode(dataView, offset) {
      var x = parseUint32(dataView, offset);
      var y = parseUint32(dataView, offset);
      return [x, y];
    }

    function parseInt32(dataView, offset) {
      var Int32 = dataView.getInt32(offset.value, true);
      offset.value = offset.value + INT32_SIZE;
      return Int32;
    }

    function parseUint32(dataView, offset) {
      var Uint32 = dataView.getUint32(offset.value, true);
      offset.value = offset.value + INT32_SIZE;
      return Uint32;
    }

    function parseUint8Array(uInt8Array, offset) {
      var Uint8 = uInt8Array[offset.value];
      offset.value = offset.value + INT8_SIZE;
      return Uint8;
    }

    function parseUint8(dataView, offset) {
      var Uint8 = dataView.getUint8(offset.value);
      offset.value = offset.value + INT8_SIZE;
      return Uint8;
    }

    function parseInt64(dataView, offset) {
      var _int = Number(dataView.getBigInt64(offset.value, true));

      offset.value += ULONG_SIZE;
      return _int;
    }

    function parseFloat32(dataView, offset) {
      var _float2 = dataView.getFloat32(offset.value, true);

      offset.value += FLOAT32_SIZE;
      return _float2;
    }

    function decodeFloat32(dataView, offset) {
      return encodeFloat16(parseFloat32(dataView, offset));
    }

    function decodeFloat16(binary) {
      var exponent = (binary & 0x7C00) >> 10,
          fraction = binary & 0x03FF;
      return (binary >> 15 ? -1 : 1) * (exponent ? exponent === 0x1F ? fraction ? NaN : Infinity : Math.pow(2, exponent - 15) * (1 + fraction / 0x400) : 6.103515625e-5 * (fraction / 0x400));
    }

    function encodeFloat16(val) {
      tmpDataView.setFloat32(0, val);
      var x = tmpDataView.getInt32(0);
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

    function parseUint16(dataView, offset) {
      var Uint16 = dataView.getUint16(offset.value, true);
      offset.value += INT16_SIZE;
      return Uint16;
    }

    function parseFloat16(buffer, offset) {
      return decodeFloat16(parseUint16(buffer, offset));
    }

    function parseChlist(dataView, buffer, offset, size) {
      var startOffset = offset.value;
      var channels = [];

      while (offset.value < startOffset + size - 1) {
        var name = parseNullTerminatedString(buffer, offset);
        var pixelType = parseInt32(dataView, offset);
        var pLinear = parseUint8(dataView, offset);
        offset.value += 3;
        var xSampling = parseInt32(dataView, offset);
        var ySampling = parseInt32(dataView, offset);
        channels.push({
          name: name,
          pixelType: pixelType,
          pLinear: pLinear,
          xSampling: xSampling,
          ySampling: ySampling
        });
      }

      offset.value += 1;
      return channels;
    }

    function parseChromaticities(dataView, offset) {
      var redX = parseFloat32(dataView, offset);
      var redY = parseFloat32(dataView, offset);
      var greenX = parseFloat32(dataView, offset);
      var greenY = parseFloat32(dataView, offset);
      var blueX = parseFloat32(dataView, offset);
      var blueY = parseFloat32(dataView, offset);
      var whiteX = parseFloat32(dataView, offset);
      var whiteY = parseFloat32(dataView, offset);
      return {
        redX: redX,
        redY: redY,
        greenX: greenX,
        greenY: greenY,
        blueX: blueX,
        blueY: blueY,
        whiteX: whiteX,
        whiteY: whiteY
      };
    }

    function parseCompression(dataView, offset) {
      var compressionCodes = ['NO_COMPRESSION', 'RLE_COMPRESSION', 'ZIPS_COMPRESSION', 'ZIP_COMPRESSION', 'PIZ_COMPRESSION', 'PXR24_COMPRESSION', 'B44_COMPRESSION', 'B44A_COMPRESSION', 'DWAA_COMPRESSION', 'DWAB_COMPRESSION'];
      var compression = parseUint8(dataView, offset);
      return compressionCodes[compression];
    }

    function parseBox2i(dataView, offset) {
      var xMin = parseUint32(dataView, offset);
      var yMin = parseUint32(dataView, offset);
      var xMax = parseUint32(dataView, offset);
      var yMax = parseUint32(dataView, offset);
      return {
        xMin: xMin,
        yMin: yMin,
        xMax: xMax,
        yMax: yMax
      };
    }

    function parseLineOrder(dataView, offset) {
      var lineOrders = ['INCREASING_Y'];
      var lineOrder = parseUint8(dataView, offset);
      return lineOrders[lineOrder];
    }

    function parseV2f(dataView, offset) {
      var x = parseFloat32(dataView, offset);
      var y = parseFloat32(dataView, offset);
      return [x, y];
    }

    function parseV3f(dataView, offset) {
      var x = parseFloat32(dataView, offset);
      var y = parseFloat32(dataView, offset);
      var z = parseFloat32(dataView, offset);
      return [x, y, z];
    }

    function parseValue(dataView, buffer, offset, type, size) {
      if (type === 'string' || type === 'stringvector' || type === 'iccProfile') {
        return parseFixedLengthString(buffer, offset, size);
      } else if (type === 'chlist') {
        return parseChlist(dataView, buffer, offset, size);
      } else if (type === 'chromaticities') {
        return parseChromaticities(dataView, offset);
      } else if (type === 'compression') {
        return parseCompression(dataView, offset);
      } else if (type === 'box2i') {
        return parseBox2i(dataView, offset);
      } else if (type === 'lineOrder') {
        return parseLineOrder(dataView, offset);
      } else if (type === 'float') {
        return parseFloat32(dataView, offset);
      } else if (type === 'v2f') {
        return parseV2f(dataView, offset);
      } else if (type === 'v3f') {
        return parseV3f(dataView, offset);
      } else if (type === 'int') {
        return parseInt32(dataView, offset);
      } else if (type === 'rational') {
        return parseRational(dataView, offset);
      } else if (type === 'timecode') {
        return parseTimecode(dataView, offset);
      } else if (type === 'preview') {
        offset.value += size;
        return 'skipped';
      } else {
        offset.value += size;
        return undefined;
      }
    }

    var bufferDataView = new DataView(buffer);
    var uInt8Array = new Uint8Array(buffer);
    var EXRHeader = {};
    bufferDataView.getUint32(0, true);
    bufferDataView.getUint8(4, true);
    bufferDataView.getUint8(5, true);
    var offset = {
      value: 8
    };
    var keepReading = true;

    while (keepReading) {
      var attributeName = parseNullTerminatedString(buffer, offset);

      if (attributeName == 0) {
        keepReading = false;
      } else {
        var attributeType = parseNullTerminatedString(buffer, offset);
        var attributeSize = parseUint32(bufferDataView, offset);
        var attributeValue = parseValue(bufferDataView, buffer, offset, attributeType, attributeSize);

        if (attributeValue === undefined) {
          console.warn("EXRLoader.parse: skipped unknown header attribute type '".concat(attributeType, "'."));
        } else {
          EXRHeader[attributeName] = attributeValue;
        }
      }
    }

    var dataWindowHeight = EXRHeader.dataWindow.yMax + 1;
    var uncompress;
    var scanlineBlockSize;

    switch (EXRHeader.compression) {
      case 'NO_COMPRESSION':
        scanlineBlockSize = 1;
        uncompress = uncompressRAW;
        break;

      case 'RLE_COMPRESSION':
        scanlineBlockSize = 1;
        uncompress = uncompressRLE;
        break;

      case 'ZIPS_COMPRESSION':
        scanlineBlockSize = 1;
        uncompress = uncompressZIP;
        break;

      case 'ZIP_COMPRESSION':
        scanlineBlockSize = 16;
        uncompress = uncompressZIP;
        break;

      case 'PIZ_COMPRESSION':
        scanlineBlockSize = 32;
        uncompress = uncompressPIZ;
        break;

      case 'PXR24_COMPRESSION':
        scanlineBlockSize = 16;
        uncompress = uncompressPXR;
        break;

      case 'DWAA_COMPRESSION':
        scanlineBlockSize = 32;
        uncompress = uncompressDWA;
        break;

      case 'DWAB_COMPRESSION':
        scanlineBlockSize = 256;
        uncompress = uncompressDWA;
        break;

      default:
        throw 'EXRLoader.parse: ' + EXRHeader.compression + ' is unsupported';
    }

    var size_t;
    var getValue;
    var pixelType = EXRHeader.channels[0].pixelType;

    if (pixelType === 1) {
      switch (this.type) {
        case UnsignedByteType:
        case FloatType:
          getValue = parseFloat16;
          size_t = INT16_SIZE;
          break;

        case HalfFloatType:
          getValue = parseUint16;
          size_t = INT16_SIZE;
          break;
      }
    } else if (pixelType === 2) {
      switch (this.type) {
        case UnsignedByteType:
        case FloatType:
          getValue = parseFloat32;
          size_t = FLOAT32_SIZE;
          break;

        case HalfFloatType:
          getValue = decodeFloat32;
          size_t = FLOAT32_SIZE;
      }
    } else {
      throw 'EXRLoader.parse: unsupported pixelType ' + pixelType + ' for ' + EXRHeader.compression + '.';
    }

    var numBlocks = dataWindowHeight / scanlineBlockSize;

    for (var i = 0; i < numBlocks; i++) {
      parseUlong(bufferDataView, offset);
    }

    var width = EXRHeader.dataWindow.xMax - EXRHeader.dataWindow.xMin + 1;
    var height = EXRHeader.dataWindow.yMax - EXRHeader.dataWindow.yMin + 1;
    var numChannels = 4;
    var size = width * height * numChannels;

    switch (this.type) {
      case UnsignedByteType:
      case FloatType:
        var byteArray = new Float32Array(size);

        if (EXRHeader.channels.length < numChannels) {
          byteArray.fill(1, 0, size);
        }

        break;

      case HalfFloatType:
        var byteArray = new Uint16Array(size);

        if (EXRHeader.channels.length < numChannels) {
          byteArray.fill(0x3C00, 0, size);
        }

        break;

      default:
        console.error('THREE.EXRLoader: unsupported type: ', this.type);
        break;
    }

    var channelOffsets = {
      R: 0,
      G: 1,
      B: 2,
      A: 3
    };
    var compressionInfo = {
      size: 0,
      width: width,
      lines: scanlineBlockSize,
      offset: offset,
      array: uInt8Array,
      viewer: bufferDataView,
      type: pixelType,
      channels: EXRHeader.channels.length
    };
    var line;
    var size;
    var viewer;
    var tmpOffset = {
      value: 0
    };

    for (var scanlineBlockIdx = 0; scanlineBlockIdx < height / scanlineBlockSize; scanlineBlockIdx++) {
      line = parseUint32(bufferDataView, offset);
      size = parseUint32(bufferDataView, offset);
      compressionInfo.lines = line + scanlineBlockSize > height ? height - line : scanlineBlockSize;
      compressionInfo.offset = offset;
      compressionInfo.size = size;
      viewer = uncompress(compressionInfo);
      offset.value += size;

      for (var line_y = 0; line_y < scanlineBlockSize; line_y++) {
        var true_y = line_y + scanlineBlockIdx * scanlineBlockSize;
        if (true_y >= height) break;

        for (var channelID = 0; channelID < EXRHeader.channels.length; channelID++) {
          var cOff = channelOffsets[EXRHeader.channels[channelID].name];

          for (var x = 0; x < width; x++) {
            var idx = line_y * (EXRHeader.channels.length * width) + channelID * width + x;
            tmpOffset.value = idx * size_t;
            var val = getValue(viewer, tmpOffset);
            byteArray[(height - 1 - true_y) * (width * numChannels) + x * numChannels + cOff] = val;
          }
        }
      }
    }

    if (this.type === UnsignedByteType) {
      var v, _i;

      var _size = byteArray.length;
      var RGBEArray = new Uint8Array(_size);

      for (var h = 0; h < height; ++h) {
        for (var w = 0; w < width; ++w) {
          _i = h * width * 4 + w * 4;
          var red = byteArray[_i];
          var green = byteArray[_i + 1];
          var blue = byteArray[_i + 2];
          v = red > green ? red : green;
          v = blue > v ? blue : v;

          if (v < 1e-32) {
            RGBEArray[_i] = RGBEArray[_i + 1] = RGBEArray[_i + 2] = RGBEArray[_i + 3] = 0;
          } else {
            var res = frexp(v);
            v = res[0] * 256 / v;
            RGBEArray[_i] = red * v;
            RGBEArray[_i + 1] = green * v;
            RGBEArray[_i + 2] = blue * v;
            RGBEArray[_i + 3] = res[1] + 128;
          }
        }
      }

      byteArray = RGBEArray;
    }

    var format = this.type === UnsignedByteType ? RGBEFormat : numChannels === 4 ? RGBAFormat : THREE.RGBFormat;
    return {
      header: EXRHeader,
      width: width,
      height: height,
      data: byteArray,
      format: format,
      type: this.type
    };
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
          texture.flipY = false;
          break;

        case FloatType:
        case HalfFloatType:
          texture.encoding = THREE.LinearEncoding;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = LinearFilter;
          texture.generateMipmaps = false;
          texture.flipY = false;
          break;
      }

      if (onLoad) onLoad(texture, texData);
    }

    return DataTextureLoader.prototype.load.call(this, url, onLoadCallback, onProgress, onError);
  }
});