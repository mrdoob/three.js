"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.BasisTextureLoader = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var BasisTextureLoader = function BasisTextureLoader(manager) {
  Loader.call(this, manager);
  this.transcoderPath = '';
  this.transcoderBinary = null;
  this.transcoderPending = null;
  this.workerLimit = 4;
  this.workerPool = [];
  this.workerNextTaskID = 1;
  this.workerSourceURL = '';
  this.workerConfig = {
    format: null,
    astcSupported: false,
    bptcSupported: false,
    etcSupported: false,
    dxtSupported: false,
    pvrtcSupported: false
  };
};

THREE.BasisTextureLoader = BasisTextureLoader;
BasisTextureLoader.taskCache = new WeakMap();
BasisTextureLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
  constructor: BasisTextureLoader,
  setTranscoderPath: function setTranscoderPath(path) {
    this.transcoderPath = path;
    return this;
  },
  setWorkerLimit: function setWorkerLimit(workerLimit) {
    this.workerLimit = workerLimit;
    return this;
  },
  detectSupport: function detectSupport(renderer) {
    var config = this.workerConfig;
    config.astcSupported = renderer.extensions.has('WEBGL_compressed_texture_astc');
    config.bptcSupported = renderer.extensions.has('EXT_texture_compression_bptc');
    config.etcSupported = renderer.extensions.has('WEBGL_compressed_texture_etc1');
    config.dxtSupported = renderer.extensions.has('WEBGL_compressed_texture_s3tc');
    config.pvrtcSupported = renderer.extensions.has('WEBGL_compressed_texture_pvrtc') || renderer.extensions.has('WEBKIT_WEBGL_compressed_texture_pvrtc');

    if (config.astcSupported) {
      config.format = BasisTextureLoader.BASIS_FORMAT.cTFASTC_4x4;
    } else if (config.bptcSupported) {
      config.format = BasisTextureLoader.BASIS_FORMAT.cTFBC7_M5;
    } else if (config.dxtSupported) {
      config.format = BasisTextureLoader.BASIS_FORMAT.cTFBC3;
    } else if (config.pvrtcSupported) {
      config.format = BasisTextureLoader.BASIS_FORMAT.cTFPVRTC1_4_RGBA;
    } else if (config.etcSupported) {
      config.format = BasisTextureLoader.BASIS_FORMAT.cTFETC1;
    } else {
      throw new Error('THREE.BasisTextureLoader: No suitable compressed texture format found.');
    }

    return this;
  },
  load: function load(url, onLoad, onProgress, onError) {
    var _this = this;

    var loader = new THREE.FileLoader(this.manager);
    loader.setResponseType('arraybuffer');
    loader.setWithCredentials(this.withCredentials);
    loader.load(url, function (buffer) {
      if (BasisTextureLoader.taskCache.has(buffer)) {
        var cachedTask = BasisTextureLoader.taskCache.get(buffer);
        return cachedTask.promise.then(onLoad)["catch"](onError);
      }

      _this._createTexture(buffer, url).then(onLoad)["catch"](onError);
    }, onProgress, onError);
  },
  _createTexture: function _createTexture(buffer, url) {
    var _this2 = this;

    var worker;
    var taskID;
    var taskCost = buffer.byteLength;

    var texturePending = this._allocateWorker(taskCost).then(function (_worker) {
      worker = _worker;
      taskID = _this2.workerNextTaskID++;
      return new Promise(function (resolve, reject) {
        worker._callbacks[taskID] = {
          resolve: resolve,
          reject: reject
        };
        worker.postMessage({
          type: 'transcode',
          id: taskID,
          buffer: buffer
        }, [buffer]);
      });
    }).then(function (message) {
      var config = _this2.workerConfig;
      var width = message.width,
          height = message.height,
          mipmaps = message.mipmaps,
          format = message.format;
      var texture;

      switch (format) {
        case BasisTextureLoader.BASIS_FORMAT.cTFASTC_4x4:
          texture = new THREE.CompressedTexture(mipmaps, width, height, RGBA_ASTC_4x4_Format);
          break;

        case BasisTextureLoader.BASIS_FORMAT.cTFBC7_M5:
          texture = new CompressedTexture(mipmaps, width, height, RGBA_BPTC_Format);
          break;

        case BasisTextureLoader.BASIS_FORMAT.cTFBC1:
        case BasisTextureLoader.BASIS_FORMAT.cTFBC3:
          texture = new CompressedTexture(mipmaps, width, height, BasisTextureLoader.DXT_FORMAT_MAP[config.format], UnsignedByteType);
          break;

        case BasisTextureLoader.BASIS_FORMAT.cTFETC1:
          texture = new CompressedTexture(mipmaps, width, height, RGB_ETC1_Format);
          break;

        case BasisTextureLoader.BASIS_FORMAT.cTFPVRTC1_4_RGB:
          texture = new CompressedTexture(mipmaps, width, height, RGB_PVRTC_4BPPV1_Format);
          break;

        case BasisTextureLoader.BASIS_FORMAT.cTFPVRTC1_4_RGBA:
          texture = new CompressedTexture(mipmaps, width, height, RGBA_PVRTC_4BPPV1_Format);
          break;

        default:
          throw new Error('THREE.BasisTextureLoader: No supported format available.');
      }

      texture.minFilter = mipmaps.length === 1 ? LinearFilter : THREE.LinearMipmapLinearFilter;
      texture.magFilter = LinearFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
      return texture;
    });

    texturePending["catch"](function () {
      return true;
    }).then(function () {
      if (worker && taskID) {
        worker._taskLoad -= taskCost;
        delete worker._callbacks[taskID];
      }
    });
    BasisTextureLoader.taskCache.set(buffer, {
      url: url,
      promise: texturePending
    });
    return texturePending;
  },
  _initTranscoder: function _initTranscoder() {
    var _this3 = this;

    if (!this.transcoderPending) {
      var jsLoader = new FileLoader(this.manager);
      jsLoader.setPath(this.transcoderPath);
      jsLoader.setWithCredentials(this.withCredentials);
      var jsContent = new Promise(function (resolve, reject) {
        jsLoader.load('basis_transcoder.js', resolve, undefined, reject);
      });
      var binaryLoader = new FileLoader(this.manager);
      binaryLoader.setPath(this.transcoderPath);
      binaryLoader.setResponseType('arraybuffer');
      binaryLoader.setWithCredentials(this.withCredentials);
      var binaryContent = new Promise(function (resolve, reject) {
        binaryLoader.load('basis_transcoder.wasm', resolve, undefined, reject);
      });
      this.transcoderPending = Promise.all([jsContent, binaryContent]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            jsContent = _ref2[0],
            binaryContent = _ref2[1];

        var fn = BasisTextureLoader.BasisWorker.toString();
        var body = ['', jsContent, '', fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}'))].join('\n');
        _this3.workerSourceURL = URL.createObjectURL(new Blob([body]));
        _this3.transcoderBinary = binaryContent;
      });
    }

    return this.transcoderPending;
  },
  _allocateWorker: function _allocateWorker(taskCost) {
    var _this4 = this;

    return this._initTranscoder().then(function () {
      if (_this4.workerPool.length < _this4.workerLimit) {
        var worker = new Worker(_this4.workerSourceURL);
        worker._callbacks = {};
        worker._taskLoad = 0;
        worker.postMessage({
          type: 'init',
          config: _this4.workerConfig,
          transcoderBinary: _this4.transcoderBinary
        });

        worker.onmessage = function (e) {
          var message = e.data;

          switch (message.type) {
            case 'transcode':
              worker._callbacks[message.id].resolve(message);

              break;

            case 'error':
              worker._callbacks[message.id].reject(message);

              break;

            default:
              console.error('THREE.BasisTextureLoader: Unexpected message, "' + message.type + '"');
          }
        };

        _this4.workerPool.push(worker);
      } else {
        _this4.workerPool.sort(function (a, b) {
          return a._taskLoad > b._taskLoad ? -1 : 1;
        });
      }

      var worker = _this4.workerPool[_this4.workerPool.length - 1];
      worker._taskLoad += taskCost;
      return worker;
    });
  },
  dispose: function dispose() {
    for (var i = 0; i < this.workerPool.length; i++) {
      this.workerPool[i].terminate();
    }

    this.workerPool.length = 0;
    return this;
  }
});
BasisTextureLoader.BASIS_FORMAT = {
  cTFETC1: 0,
  cTFETC2: 1,
  cTFBC1: 2,
  cTFBC3: 3,
  cTFBC4: 4,
  cTFBC5: 5,
  cTFBC7_M6_OPAQUE_ONLY: 6,
  cTFBC7_M5: 7,
  cTFPVRTC1_4_RGB: 8,
  cTFPVRTC1_4_RGBA: 9,
  cTFASTC_4x4: 10,
  cTFATC_RGB: 11,
  cTFATC_RGBA_INTERPOLATED_ALPHA: 12,
  cTFRGBA32: 13,
  cTFRGB565: 14,
  cTFBGR565: 15,
  cTFRGBA4444: 16
};
BasisTextureLoader.DXT_FORMAT = {
  COMPRESSED_RGB_S3TC_DXT1_EXT: 0x83F0,
  COMPRESSED_RGBA_S3TC_DXT1_EXT: 0x83F1,
  COMPRESSED_RGBA_S3TC_DXT3_EXT: 0x83F2,
  COMPRESSED_RGBA_S3TC_DXT5_EXT: 0x83F3
};
BasisTextureLoader.DXT_FORMAT_MAP = {};
BasisTextureLoader.DXT_FORMAT_MAP[BasisTextureLoader.BASIS_FORMAT.cTFBC1] = BasisTextureLoader.DXT_FORMAT.COMPRESSED_RGB_S3TC_DXT1_EXT;
BasisTextureLoader.DXT_FORMAT_MAP[BasisTextureLoader.BASIS_FORMAT.cTFBC3] = BasisTextureLoader.DXT_FORMAT.COMPRESSED_RGBA_S3TC_DXT5_EXT;

BasisTextureLoader.BasisWorker = function () {
  var config;
  var transcoderPending;

  var _BasisFile;

  onmessage = function onmessage(e) {
    var message = e.data;

    switch (message.type) {
      case 'init':
        config = message.config;
        init(message.transcoderBinary);
        break;

      case 'transcode':
        transcoderPending.then(function () {
          try {
            var _transcode = transcode(message.buffer),
                width = _transcode.width,
                height = _transcode.height,
                hasAlpha = _transcode.hasAlpha,
                mipmaps = _transcode.mipmaps,
                format = _transcode.format;

            var buffers = [];

            for (var i = 0; i < mipmaps.length; ++i) {
              buffers.push(mipmaps[i].data.buffer);
            }

            self.postMessage({
              type: 'transcode',
              id: message.id,
              width: width,
              height: height,
              hasAlpha: hasAlpha,
              mipmaps: mipmaps,
              format: format
            }, buffers);
          } catch (error) {
            console.error(error);
            self.postMessage({
              type: 'error',
              id: message.id,
              error: error.message
            });
          }
        });
        break;
    }
  };

  function init(wasmBinary) {
    var BasisModule;
    transcoderPending = new Promise(function (resolve) {
      BasisModule = {
        wasmBinary: wasmBinary,
        onRuntimeInitialized: resolve
      };
      BASIS(BasisModule);
    }).then(function () {
      var _BasisModule = BasisModule,
          BasisFile = _BasisModule.BasisFile,
          initializeBasis = _BasisModule.initializeBasis;
      _BasisFile = BasisFile;
      initializeBasis();
    });
  }

  function transcode(buffer) {
    var basisFile = new _BasisFile(new Uint8Array(buffer));
    var width = basisFile.getImageWidth(0, 0);
    var height = basisFile.getImageHeight(0, 0);
    var levels = basisFile.getNumLevels(0);
    var hasAlpha = basisFile.getHasAlpha();

    function cleanup() {
      basisFile.close();
      basisFile["delete"]();
    }

    if (!hasAlpha) {
      switch (config.format) {
        case 9:
          config.format = 8;
          break;

        default:
          break;
      }
    }

    if (!width || !height || !levels) {
      cleanup();
      throw new Error('THREE.BasisTextureLoader:	Invalid .basis file');
    }

    if (!basisFile.startTranscoding()) {
      cleanup();
      throw new Error('THREE.BasisTextureLoader: .startTranscoding failed');
    }

    var mipmaps = [];

    for (var mip = 0; mip < levels; mip++) {
      var mipWidth = basisFile.getImageWidth(0, mip);
      var mipHeight = basisFile.getImageHeight(0, mip);
      var dst = new Uint8Array(basisFile.getImageTranscodedSizeInBytes(0, mip, config.format));
      var status = basisFile.transcodeImage(dst, 0, mip, config.format, 0, hasAlpha);

      if (!status) {
        cleanup();
        throw new Error('THREE.BasisTextureLoader: .transcodeImage failed.');
      }

      mipmaps.push({
        data: dst,
        width: mipWidth,
        height: mipHeight
      });
    }

    cleanup();
    return {
      width: width,
      height: height,
      hasAlpha: hasAlpha,
      mipmaps: mipmaps,
      format: config.format
    };
  }
};