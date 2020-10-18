"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.KTX2Loader = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var DFDModel = {
  ETC1S: 163,
  UASTC: 166
};
var DFDChannel = {
  ETC1S: {
    RGB: 0,
    RRR: 3,
    GGG: 4,
    AAA: 15
  },
  UASTC: {
    RGB: 0,
    RGBA: 3,
    RRR: 4,
    RRRG: 5
  }
};

var KTX2Loader = /*#__PURE__*/function (_CompressedTextureLoa) {
  _inherits(KTX2Loader, _CompressedTextureLoa);

  var _super = _createSuper(KTX2Loader);

  function KTX2Loader(manager) {
    var _this;

    _classCallCheck(this, KTX2Loader);

    _this = _super.call(this, manager);
    _this.basisModule = null;
    _this.basisModulePending = null;
    _this.transcoderConfig = {};
    return _this;
  }

  _createClass(KTX2Loader, [{
    key: "detectSupport",
    value: function detectSupport(renderer) {
      this.transcoderConfig = {
        astcSupported: renderer.extensions.has('WEBGL_compressed_texture_astc'),
        etc1Supported: renderer.extensions.has('WEBGL_compressed_texture_etc1'),
        etc2Supported: renderer.extensions.has('WEBGL_compressed_texture_etc'),
        dxtSupported: renderer.extensions.has('WEBGL_compressed_texture_s3tc'),
        bptcSupported: renderer.extensions.has('EXT_texture_compression_bptc'),
        pvrtcSupported: renderer.extensions.has('WEBGL_compressed_texture_pvrtc') || renderer.extensions.has('WEBKIT_WEBGL_compressed_texture_pvrtc')
      };
      return this;
    }
  }, {
    key: "initModule",
    value: function initModule() {
      if (this.basisModulePending) {
        return;
      }

      var scope = this;
      scope.basisModulePending = new Promise(function (resolve) {
        MSC_TRANSCODER().then(function (basisModule) {
          scope.basisModule = basisModule;
          basisModule.initTranscoders();
          resolve();
        });
      });
    }
  }, {
    key: "load",
    value: function load(url, onLoad, onProgress, onError) {
      var scope = this;
      var texture = new CompressedTexture();
      var bufferPending = new Promise(function (resolve, reject) {
        new THREE.FileLoader(scope.manager).setPath(scope.path).setResponseType('arraybuffer').load(url, resolve, onProgress, reject);
      });
      this.initModule();
      Promise.all([bufferPending, this.basisModulePending]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 1),
            buffer = _ref2[0];

        scope.parse(buffer, function (_texture) {
          texture.copy(_texture);
          texture.needsUpdate = true;
          if (onLoad) onLoad(texture);
        }, onError);
      });
      return texture;
    }
  }, {
    key: "parse",
    value: function parse(buffer, onLoad, onError) {
      var BasisLzEtc1sImageTranscoder = this.basisModule.BasisLzEtc1sImageTranscoder;
      var UastcImageTranscoder = this.basisModule.UastcImageTranscoder;
      var TextureFormat = this.basisModule.TextureFormat;
      var ktx = new KTX2Container(this.basisModule, buffer);
      var transcoder = ktx.getTexFormat() === TextureFormat.UASTC4x4 ? new UastcImageTranscoder() : new BasisLzEtc1sImageTranscoder();
      ktx.initMipmaps(transcoder, this.transcoderConfig).then(function () {
        var texture = new CompressedTexture(ktx.mipmaps, ktx.getWidth(), ktx.getHeight(), ktx.transcodedFormat, UnsignedByteType);
        texture.encoding = ktx.getEncoding();
        texture.premultiplyAlpha = ktx.getPremultiplyAlpha();
        texture.minFilter = ktx.mipmaps.length === 1 ? LinearFilter : THREE.LinearMipmapLinearFilter;
        texture.magFilter = LinearFilter;
        onLoad(texture);
      })["catch"](onError);
      return this;
    }
  }]);

  return KTX2Loader;
}(CompressedTextureLoader);

THREE.KTX2Loader = KTX2Loader;

var KTX2Container = /*#__PURE__*/function () {
  function KTX2Container(basisModule, arrayBuffer) {
    _classCallCheck(this, KTX2Container);

    this.basisModule = basisModule;
    this.arrayBuffer = arrayBuffer;
    this.zstd = new THREE.ZSTDDecoder();
    this.zstd.init();
    this.mipmaps = null;
    this.transcodedFormat = null;
    var idByteLength = 12;
    var id = new Uint8Array(this.arrayBuffer, 0, idByteLength);

    if (id[0] !== 0xAB || id[1] !== 0x4B || id[2] !== 0x54 || id[3] !== 0x58 || id[4] !== 0x20 || id[5] !== 0x32 || id[6] !== 0x30 || id[7] !== 0xBB || id[8] !== 0x0D || id[9] !== 0x0A || id[10] !== 0x1A || id[11] !== 0x0A) {
      throw new Error('THREE.KTX2Loader: Missing KTX 2.0 identifier.');
    }

    var littleEndian = true;
    var headerByteLength = 17 * Uint32Array.BYTES_PER_ELEMENT;
    var headerReader = new KTX2BufferReader(this.arrayBuffer, idByteLength, headerByteLength, littleEndian);
    this.header = {
      vkFormat: headerReader.nextUint32(),
      typeSize: headerReader.nextUint32(),
      pixelWidth: headerReader.nextUint32(),
      pixelHeight: headerReader.nextUint32(),
      pixelDepth: headerReader.nextUint32(),
      arrayElementCount: headerReader.nextUint32(),
      faceCount: headerReader.nextUint32(),
      levelCount: headerReader.nextUint32(),
      supercompressionScheme: headerReader.nextUint32(),
      dfdByteOffset: headerReader.nextUint32(),
      dfdByteLength: headerReader.nextUint32(),
      kvdByteOffset: headerReader.nextUint32(),
      kvdByteLength: headerReader.nextUint32(),
      sgdByteOffset: headerReader.nextUint64(),
      sgdByteLength: headerReader.nextUint64()
    };

    if (this.header.pixelDepth > 0) {
      throw new Error('THREE.KTX2Loader: Only 2D textures are currently supported.');
    }

    if (this.header.arrayElementCount > 1) {
      throw new Error('THREE.KTX2Loader: Array textures are not currently supported.');
    }

    if (this.header.faceCount > 1) {
      throw new Error('THREE.KTX2Loader: Cube textures are not currently supported.');
    }

    var levelByteLength = this.header.levelCount * 3 * 8;
    var levelReader = new KTX2BufferReader(this.arrayBuffer, idByteLength + headerByteLength, levelByteLength, littleEndian);
    this.levels = [];

    for (var i = 0; i < this.header.levelCount; i++) {
      this.levels.push({
        byteOffset: levelReader.nextUint64(),
        byteLength: levelReader.nextUint64(),
        uncompressedByteLength: levelReader.nextUint64()
      });
    }

    var dfdReader = new KTX2BufferReader(this.arrayBuffer, this.header.dfdByteOffset, this.header.dfdByteLength, littleEndian);
    var sampleStart = 6;
    var sampleWords = 4;
    this.dfd = {
      vendorId: dfdReader.skip(4).nextUint16(),
      versionNumber: dfdReader.skip(2).nextUint16(),
      descriptorBlockSize: dfdReader.nextUint16(),
      colorModel: dfdReader.nextUint8(),
      colorPrimaries: dfdReader.nextUint8(),
      transferFunction: dfdReader.nextUint8(),
      flags: dfdReader.nextUint8(),
      texelBlockDimension: {
        x: dfdReader.nextUint8() + 1,
        y: dfdReader.nextUint8() + 1,
        z: dfdReader.nextUint8() + 1,
        w: dfdReader.nextUint8() + 1
      },
      bytesPlane0: dfdReader.nextUint8(),
      numSamples: 0,
      samples: []
    };
    this.dfd.numSamples = (this.dfd.descriptorBlockSize / 4 - sampleStart) / sampleWords;
    dfdReader.skip(7);

    for (var i = 0; i < this.dfd.numSamples; i++) {
      this.dfd.samples[i] = {
        channelID: dfdReader.skip(3).nextUint8()
      };
      dfdReader.skip(12);
    }

    if (this.header.vkFormat !== 0x00 && !(this.header.supercompressionScheme === 1 || this.dfd.colorModel === DFDModel.UASTC)) {
      throw new Error('THREE.KTX2Loader: Only Basis Universal supercompression is currently supported.');
    }

    this.kvd = {};
    this.sgd = {};
    if (this.header.sgdByteLength <= 0) return;
    var sgdReader = new KTX2BufferReader(this.arrayBuffer, this.header.sgdByteOffset, this.header.sgdByteLength, littleEndian);
    this.sgd.endpointCount = sgdReader.nextUint16();
    this.sgd.selectorCount = sgdReader.nextUint16();
    this.sgd.endpointsByteLength = sgdReader.nextUint32();
    this.sgd.selectorsByteLength = sgdReader.nextUint32();
    this.sgd.tablesByteLength = sgdReader.nextUint32();
    this.sgd.extendedByteLength = sgdReader.nextUint32();
    this.sgd.imageDescs = [];
    this.sgd.endpointsData = null;
    this.sgd.selectorsData = null;
    this.sgd.tablesData = null;
    this.sgd.extendedData = null;

    for (var i = 0; i < this.header.levelCount; i++) {
      this.sgd.imageDescs.push({
        imageFlags: sgdReader.nextUint32(),
        rgbSliceByteOffset: sgdReader.nextUint32(),
        rgbSliceByteLength: sgdReader.nextUint32(),
        alphaSliceByteOffset: sgdReader.nextUint32(),
        alphaSliceByteLength: sgdReader.nextUint32()
      });
    }

    var endpointsByteOffset = this.header.sgdByteOffset + sgdReader.offset;
    var selectorsByteOffset = endpointsByteOffset + this.sgd.endpointsByteLength;
    var tablesByteOffset = selectorsByteOffset + this.sgd.selectorsByteLength;
    var extendedByteOffset = tablesByteOffset + this.sgd.tablesByteLength;
    this.sgd.endpointsData = new Uint8Array(this.arrayBuffer, endpointsByteOffset, this.sgd.endpointsByteLength);
    this.sgd.selectorsData = new Uint8Array(this.arrayBuffer, selectorsByteOffset, this.sgd.selectorsByteLength);
    this.sgd.tablesData = new Uint8Array(this.arrayBuffer, tablesByteOffset, this.sgd.tablesByteLength);
    this.sgd.extendedData = new Uint8Array(this.arrayBuffer, extendedByteOffset, this.sgd.extendedByteLength);
  }

  _createClass(KTX2Container, [{
    key: "initMipmaps",
    value: function () {
      var _initMipmaps = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(transcoder, config) {
        var TranscodeTarget, TextureFormat, ImageInfo, scope, mipmaps, width, height, texFormat, hasAlpha, isVideo, pvrtcTranscodable, numEndpoints, numSelectors, endpoints, selectors, tables, targetFormat, imageDescIndex, level, levelWidth, levelHeight, numImagesInLevel, imageOffsetInLevel, imageInfo, levelByteLength, levelUncompressedByteLength, imageIndex, result, encodedData, imageDesc, levelData;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.zstd.init();

              case 2:
                TranscodeTarget = this.basisModule.TranscodeTarget;
                TextureFormat = this.basisModule.TextureFormat;
                ImageInfo = this.basisModule.ImageInfo;
                scope = this;
                mipmaps = [];
                width = this.getWidth();
                height = this.getHeight();
                texFormat = this.getTexFormat();
                hasAlpha = this.getAlpha();
                isVideo = false;
                pvrtcTranscodable = THREE.MathUtils.isPowerOfTwo(width) && MathUtils.isPowerOfTwo(height);

                if (texFormat === TextureFormat.ETC1S) {
                  numEndpoints = this.sgd.endpointCount;
                  numSelectors = this.sgd.selectorCount;
                  endpoints = this.sgd.endpointsData;
                  selectors = this.sgd.selectorsData;
                  tables = this.sgd.tablesData;
                  transcoder.decodePalettes(numEndpoints, endpoints, numSelectors, selectors);
                  transcoder.decodeTables(tables);
                }

                if (config.astcSupported) {
                  targetFormat = TranscodeTarget.ASTC_4x4_RGBA;
                  this.transcodedFormat = THREE.RGBA_ASTC_4x4_Format;
                } else if (config.bptcSupported && texFormat === TextureFormat.UASTC4x4) {
                  targetFormat = TranscodeTarget.BC7_M5_RGBA;
                  this.transcodedFormat = THREE.RGBA_BPTC_Format;
                } else if (config.dxtSupported) {
                  targetFormat = hasAlpha ? TranscodeTarget.BC3_RGBA : TranscodeTarget.BC1_RGB;
                  this.transcodedFormat = hasAlpha ? RGBA_S3TC_DXT5_Format : THREE.RGB_S3TC_DXT1_Format;
                } else if (config.pvrtcSupported && pvrtcTranscodable) {
                  targetFormat = hasAlpha ? TranscodeTarget.PVRTC1_4_RGBA : TranscodeTarget.PVRTC1_4_RGB;
                  this.transcodedFormat = hasAlpha ? RGBA_PVRTC_4BPPV1_Format : THREE.RGB_PVRTC_4BPPV1_Format;
                } else if (config.etc2Supported) {
                  targetFormat = hasAlpha ? TranscodeTarget.ETC2_RGBA : TranscodeTarget.ETC1_RGB;
                  this.transcodedFormat = hasAlpha ? RGBA_ETC2_EAC_Format : THREE.RGB_ETC2_Format;
                } else if (config.etc1Supported) {
                  targetFormat = TranscodeTarget.ETC1_RGB;
                  this.transcodedFormat = THREE.RGB_ETC1_Format;
                } else {
                  console.warn('THREE.KTX2Loader: No suitable compressed texture format found. Decoding to RGBA32.');
                  targetFormat = TranscodeTarget.RGBA32;
                  this.transcodedFormat = THREE.RGBAFormat;
                }

                if (this.basisModule.isFormatSupported(targetFormat, texFormat)) {
                  _context.next = 17;
                  break;
                }

                throw new Error('THREE.KTX2Loader: Selected texture format not supported by current transcoder build.');

              case 17:
                imageDescIndex = 0;
                level = 0;

              case 19:
                if (!(level < this.header.levelCount)) {
                  _context.next = 42;
                  break;
                }

                levelWidth = Math.ceil(width / Math.pow(2, level));
                levelHeight = Math.ceil(height / Math.pow(2, level));
                numImagesInLevel = 1;
                imageOffsetInLevel = 0;
                imageInfo = new ImageInfo(texFormat, levelWidth, levelHeight, level);
                levelByteLength = this.levels[level].byteLength;
                levelUncompressedByteLength = this.levels[level].uncompressedByteLength;
                imageIndex = 0;

              case 28:
                if (!(imageIndex < numImagesInLevel)) {
                  _context.next = 39;
                  break;
                }

                if (texFormat === TextureFormat.UASTC4x4) {
                  imageInfo.flags = 0;
                  imageInfo.rgbByteOffset = 0;
                  imageInfo.rgbByteLength = levelUncompressedByteLength;
                  imageInfo.alphaByteOffset = 0;
                  imageInfo.alphaByteLength = 0;
                  encodedData = new Uint8Array(this.arrayBuffer, this.levels[level].byteOffset + imageOffsetInLevel, levelByteLength);

                  if (this.header.supercompressionScheme === 2) {
                    encodedData = this.zstd.decode(encodedData, levelUncompressedByteLength);
                  }

                  result = transcoder.transcodeImage(targetFormat, encodedData, imageInfo, 0, hasAlpha, isVideo);
                } else {
                  imageDesc = this.sgd.imageDescs[imageDescIndex++];
                  imageInfo.flags = imageDesc.imageFlags;
                  imageInfo.rgbByteOffset = 0;
                  imageInfo.rgbByteLength = imageDesc.rgbSliceByteLength;
                  imageInfo.alphaByteOffset = imageDesc.alphaSliceByteOffset > 0 ? imageDesc.rgbSliceByteLength : 0;
                  imageInfo.alphaByteLength = imageDesc.alphaSliceByteLength;
                  encodedData = new Uint8Array(this.arrayBuffer, this.levels[level].byteOffset + imageDesc.rgbSliceByteOffset, imageDesc.rgbSliceByteLength + imageDesc.alphaSliceByteLength);
                  result = transcoder.transcodeImage(targetFormat, encodedData, imageInfo, 0, isVideo);
                }

                if (!(result.transcodedImage === undefined)) {
                  _context.next = 32;
                  break;
                }

                throw new Error('THREE.KTX2Loader: Unable to transcode image.');

              case 32:
                levelData = result.transcodedImage.get_typed_memory_view().slice();
                result.transcodedImage["delete"]();
                mipmaps.push({
                  data: levelData,
                  width: levelWidth,
                  height: levelHeight
                });
                imageOffsetInLevel += levelByteLength;

              case 36:
                imageIndex++;
                _context.next = 28;
                break;

              case 39:
                level++;
                _context.next = 19;
                break;

              case 42:
                scope.mipmaps = mipmaps;

              case 43:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function initMipmaps(_x, _x2) {
        return _initMipmaps.apply(this, arguments);
      }

      return initMipmaps;
    }()
  }, {
    key: "getWidth",
    value: function getWidth() {
      return this.header.pixelWidth;
    }
  }, {
    key: "getHeight",
    value: function getHeight() {
      return this.header.pixelHeight;
    }
  }, {
    key: "getEncoding",
    value: function getEncoding() {
      return this.dfd.transferFunction === 2 ? sRGBEncoding : THREE.LinearEncoding;
    }
  }, {
    key: "getTexFormat",
    value: function getTexFormat() {
      var TextureFormat = this.basisModule.TextureFormat;
      return this.dfd.colorModel === DFDModel.UASTC ? TextureFormat.UASTC4x4 : TextureFormat.ETC1S;
    }
  }, {
    key: "getAlpha",
    value: function getAlpha() {
      var TextureFormat = this.basisModule.TextureFormat;

      if (this.getTexFormat() === TextureFormat.UASTC4x4) {
        if ((this.dfd.samples[0].channelID & 0xF) === DFDChannel.UASTC.RGBA) {
          return true;
        }

        return false;
      }

      if (this.dfd.numSamples === 2 && (this.dfd.samples[1].channelID & 0xF) === DFDChannel.ETC1S.AAA) {
        return true;
      }

      return false;
    }
  }, {
    key: "getPremultiplyAlpha",
    value: function getPremultiplyAlpha() {
      return !!(this.dfd.flags & 1);
    }
  }]);

  return KTX2Container;
}();

var KTX2BufferReader = /*#__PURE__*/function () {
  function KTX2BufferReader(arrayBuffer, byteOffset, byteLength, littleEndian) {
    _classCallCheck(this, KTX2BufferReader);

    this.dataView = new DataView(arrayBuffer, byteOffset, byteLength);
    this.littleEndian = littleEndian;
    this.offset = 0;
  }

  _createClass(KTX2BufferReader, [{
    key: "nextUint8",
    value: function nextUint8() {
      var value = this.dataView.getUint8(this.offset, this.littleEndian);
      this.offset += 1;
      return value;
    }
  }, {
    key: "nextUint16",
    value: function nextUint16() {
      var value = this.dataView.getUint16(this.offset, this.littleEndian);
      this.offset += 2;
      return value;
    }
  }, {
    key: "nextUint32",
    value: function nextUint32() {
      var value = this.dataView.getUint32(this.offset, this.littleEndian);
      this.offset += 4;
      return value;
    }
  }, {
    key: "nextUint64",
    value: function nextUint64() {
      var left = this.dataView.getUint32(this.offset, this.littleEndian);
      var right = this.dataView.getUint32(this.offset + 4, this.littleEndian);
      var value = this.littleEndian ? left + Math.pow(2, 32) * right : Math.pow(2, 32) * left + right;

      if (!Number.isSafeInteger(value)) {
        console.warn('THREE.KTX2Loader: ' + value + ' exceeds MAX_SAFE_INTEGER. Precision may be lost.');
      }

      this.offset += 8;
      return value;
    }
  }, {
    key: "skip",
    value: function skip(bytes) {
      this.offset += bytes;
      return this;
    }
  }]);

  return KTX2BufferReader;
}();