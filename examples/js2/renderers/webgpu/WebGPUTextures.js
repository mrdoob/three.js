"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WebGPUTextures = /*#__PURE__*/function () {
  function WebGPUTextures(device, properties, info, glslang) {
    _classCallCheck(this, WebGPUTextures);

    this.device = device;
    this.properties = properties;
    this.info = info;
    this.glslang = glslang;
    this.defaultTexture = null;
    this.defaultCubeTexture = null;
    this.defaultSampler = null;
    this.samplerCache = new Map();
    this.utils = null;
  }

  _createClass(WebGPUTextures, [{
    key: "getDefaultSampler",
    value: function getDefaultSampler() {
      if (this.defaultSampler === null) {
        this.defaultSampler = this.device.createSampler({});
      }

      return this.defaultSampler;
    }
  }, {
    key: "getDefaultTexture",
    value: function getDefaultTexture() {
      if (this.defaultTexture === null) {
        var texture = new THREE.Texture();
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = NearestFilter;
        this.defaultTexture = this._createTexture(texture);
      }

      return this.defaultTexture;
    }
  }, {
    key: "getDefaultCubeTexture",
    value: function getDefaultCubeTexture() {
      if (this.defaultCubeTexture === null) {
        var texture = new THREE.CubeTexture();
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        this.defaultCubeTexture = this._createTexture(texture);
      }

      return this.defaultCubeTexture;
    }
  }, {
    key: "getTextureGPU",
    value: function getTextureGPU(texture) {
      var textureProperties = this.properties.get(texture);
      return textureProperties.textureGPU;
    }
  }, {
    key: "getSampler",
    value: function getSampler(texture) {
      var textureProperties = this.properties.get(texture);
      return textureProperties.samplerGPU;
    }
  }, {
    key: "updateTexture",
    value: function updateTexture(texture) {
      var forceUpdate = false;
      var textureProperties = this.properties.get(texture);

      if (texture.version > 0 && textureProperties.version !== texture.version) {
        var image = texture.image;

        if (image === undefined) {
          console.warn('THREE.WebGPURenderer: Texture marked for update but image is undefined.');
        } else if (image.complete === false) {
          console.warn('THREE.WebGPURenderer: Texture marked for update but image is incomplete.');
        } else {
          if (textureProperties.initialized === undefined) {
            textureProperties.initialized = true;
            var disposeCallback = onTextureDispose.bind(this);
            textureProperties.disposeCallback = disposeCallback;
            texture.addEventListener('dispose', disposeCallback);
            this.info.memory.textures++;
          }

          if (textureProperties.textureGPU !== undefined) {
            textureProperties.textureGPU.destroy();
          }

          textureProperties.textureGPU = this._createTexture(texture);
          textureProperties.version = texture.version;
          forceUpdate = true;
        }
      }

      if (textureProperties.initializedRTT === false) {
        textureProperties.initializedRTT = true;
        forceUpdate = true;
      }

      return forceUpdate;
    }
  }, {
    key: "updateSampler",
    value: function updateSampler(texture) {
      var array = [];
      array.push(texture.wrapS);
      array.push(texture.wrapT);
      array.push(texture.wrapR);
      array.push(texture.magFilter);
      array.push(texture.minFilter);
      array.push(texture.anisotropy);
      var key = array.join();
      var samplerGPU = this.samplerCache.get(key);

      if (samplerGPU === undefined) {
        samplerGPU = this.device.createSampler({
          addressModeU: this._convertAddressMode(texture.wrapS),
          addressModeV: this._convertAddressMode(texture.wrapT),
          addressModeW: this._convertAddressMode(texture.wrapR),
          magFilter: this._convertFilterMode(texture.magFilter),
          minFilter: this._convertFilterMode(texture.minFilter),
          mipmapFilter: this._convertFilterMode(texture.minFilter),
          maxAnisotropy: texture.anisotropy
        });
        this.samplerCache.set(key, samplerGPU);
      }

      var textureProperties = this.properties.get(texture);
      textureProperties.samplerGPU = samplerGPU;
    }
  }, {
    key: "initRenderTarget",
    value: function initRenderTarget(renderTarget) {
      var properties = this.properties;
      var renderTargetProperties = properties.get(renderTarget);

      if (renderTargetProperties.initialized === undefined) {
        var device = this.device;
        var width = renderTarget.width;
        var height = renderTarget.height;

        var colorTextureFormat = this._getFormat(renderTarget.texture);

        var colorTextureGPU = device.createTexture({
          size: {
            width: width,
            height: height,
            depth: 1
          },
          format: colorTextureFormat,
          usage: GPUTextureUsage.OUTPUT_ATTACHMENT | GPUTextureUsage.SAMPLED
        });
        this.info.memory.textures++;
        renderTargetProperties.colorTextureGPU = colorTextureGPU;
        renderTargetProperties.colorTextureFormat = colorTextureFormat;
        var textureProperties = properties.get(renderTarget.texture);
        textureProperties.textureGPU = colorTextureGPU;
        textureProperties.initializedRTT = false;

        if (renderTarget.depthBuffer === true) {
          var depthTextureFormat = THREE.GPUTextureFormat.Depth24PlusStencil8;
          var depthTextureGPU = device.createTexture({
            size: {
              width: width,
              height: height,
              depth: 1
            },
            format: depthTextureFormat,
            usage: GPUTextureUsage.OUTPUT_ATTACHMENT
          });
          this.info.memory.textures++;
          renderTargetProperties.depthTextureGPU = depthTextureGPU;
          renderTargetProperties.depthTextureFormat = depthTextureFormat;

          if (renderTarget.depthTexture !== null) {
            var depthTextureProperties = properties.get(renderTarget.depthTexture);
            depthTextureProperties.textureGPU = depthTextureGPU;
            depthTextureProperties.initializedRTT = false;
          }
        }

        var disposeCallback = onRenderTargetDispose.bind(this);
        renderTargetProperties.disposeCallback = disposeCallback;
        renderTarget.addEventListener('dispose', disposeCallback);
        renderTargetProperties.initialized = true;
      }
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.samplerCache.clear();
    }
  }, {
    key: "_convertAddressMode",
    value: function _convertAddressMode(value) {
      var addressMode = THREE.GPUAddressMode.ClampToEdge;

      if (value === RepeatWrapping) {
        addressMode = GPUAddressMode.Repeat;
      } else if (value === MirroredRepeatWrapping) {
        addressMode = GPUAddressMode.MirrorRepeat;
      }

      return addressMode;
    }
  }, {
    key: "_convertFilterMode",
    value: function _convertFilterMode(value) {
      var filterMode = THREE.GPUFilterMode.Linear;

      if (value === NearestFilter || value === NearestMipmapNearestFilter || value === NearestMipmapLinearFilter) {
        filterMode = GPUFilterMode.Nearest;
      }

      return filterMode;
    }
  }, {
    key: "_createTexture",
    value: function _createTexture(texture) {
      var _this = this;

      var device = this.device;
      var image = texture.image;

      var _this$_getSize = this._getSize(texture),
          width = _this$_getSize.width,
          height = _this$_getSize.height,
          depth = _this$_getSize.depth;

      var needsMipmaps = this._needsMipmaps(texture);

      var dimension = this._getDimension(texture);

      var mipLevelCount = this._getMipLevelCount(texture, width, height, needsMipmaps);

      var format = this._getFormat(texture);

      var usage = GPUTextureUsage.SAMPLED | GPUTextureUsage.COPY_DST;

      if (needsMipmaps === true) {
        usage |= GPUTextureUsage.OUTPUT_ATTACHMENT;
      }

      var textureGPUDescriptor = {
        size: {
          width: width,
          height: height,
          depth: depth
        },
        mipLevelCount: mipLevelCount,
        sampleCount: 1,
        dimension: dimension,
        format: format,
        usage: usage
      };
      var textureGPU = device.createTexture(textureGPUDescriptor);

      if (texture.isDataTexture || texture.isDataTexture2DArray || texture.isDataTexture3D) {
        this._copyBufferToTexture(image, format, textureGPU);

        if (needsMipmaps === true) this._generateMipmaps(textureGPU, textureGPUDescriptor);
      } else if (texture.isCompressedTexture) {
        this._copyCompressedBufferToTexture(texture.mipmaps, format, textureGPU);
      } else if (texture.isCubeTexture) {
        this._copyCubeMapToTexture(image, texture, textureGPU);
      } else {
        if (image !== undefined) {
          this._getImageBitmap(image, texture).then(function (imageBitmap) {
            _this._copyImageBitmapToTexture(imageBitmap, textureGPU);

            if (needsMipmaps === true) _this._generateMipmaps(textureGPU, textureGPUDescriptor);
          });
        }
      }

      return textureGPU;
    }
  }, {
    key: "_copyBufferToTexture",
    value: function _copyBufferToTexture(image, format, textureGPU) {
      var data = image.data;

      var bytesPerTexel = this._getBytesPerTexel(format);

      var bytesPerRow = Math.ceil(image.width * bytesPerTexel / 256) * 256;
      this.device.defaultQueue.writeTexture({
        texture: textureGPU,
        mipLevel: 0
      }, data, {
        offset: 0,
        bytesPerRow: bytesPerRow
      }, {
        width: image.width,
        height: image.height,
        depth: image.depth !== undefined ? image.depth : 1
      });
    }
  }, {
    key: "_copyCubeMapToTexture",
    value: function _copyCubeMapToTexture(images, texture, textureGPU) {
      var _this2 = this;

      var _loop = function _loop(i) {
        var image = images[i];

        _this2._getImageBitmap(image, texture).then(function (imageBitmap) {
          _this2._copyImageBitmapToTexture(imageBitmap, textureGPU, {
            x: 0,
            y: 0,
            z: i
          });
        });
      };

      for (var i = 0; i < images.length; i++) {
        _loop(i);
      }
    }
  }, {
    key: "_copyImageBitmapToTexture",
    value: function _copyImageBitmapToTexture(image, textureGPU) {
      var origin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
        x: 0,
        y: 0,
        z: 0
      };
      this.device.defaultQueue.copyImageBitmapToTexture({
        imageBitmap: image
      }, {
        texture: textureGPU,
        mipLevel: 0,
        origin: origin
      }, {
        width: image.width,
        height: image.height,
        depth: 1
      });
    }
  }, {
    key: "_copyCompressedBufferToTexture",
    value: function _copyCompressedBufferToTexture(mipmaps, format, textureGPU) {
      var blockData = this._getBlockData(format);

      for (var i = 0; i < mipmaps.length; i++) {
        var mipmap = mipmaps[i];
        var width = mipmap.width;
        var height = mipmap.height;
        var bytesPerRow = Math.ceil(width / blockData.width) * blockData.byteLength;
        this.device.defaultQueue.writeTexture({
          texture: textureGPU,
          mipLevel: i
        }, mipmap.data, {
          offset: 0,
          bytesPerRow: bytesPerRow
        }, {
          width: Math.ceil(width / blockData.width) * blockData.width,
          height: Math.ceil(height / blockData.width) * blockData.width,
          depth: 1
        });
      }
    }
  }, {
    key: "_generateMipmaps",
    value: function _generateMipmaps(textureGPU, textureGPUDescriptor) {
      if (this.utils === null) {
        this.utils = new THREE.WebGPUTextureUtils(this.device, this.glslang);
      }

      this.utils.generateMipmaps(textureGPU, textureGPUDescriptor);
    }
  }, {
    key: "_getBlockData",
    value: function _getBlockData(format) {
      if (format === GPUTextureFormat.BC1RGBAUnorm || format === GPUTextureFormat.BC1RGBAUnormSRGB) return {
        byteLength: 8,
        width: 4,
        height: 4
      };
      if (format === GPUTextureFormat.BC2RGBAUnorm || format === GPUTextureFormat.BC2RGBAUnormSRGB) return {
        byteLength: 16,
        width: 4,
        height: 4
      };
      if (format === GPUTextureFormat.BC3RGBAUnorm || format === GPUTextureFormat.BC3RGBAUnormSRGB) return {
        byteLength: 16,
        width: 4,
        height: 4
      };
      if (format === GPUTextureFormat.BC4RUnorm || format === GPUTextureFormat.BC4RSNorm) return {
        byteLength: 8,
        width: 4,
        height: 4
      };
      if (format === GPUTextureFormat.BC5RGUnorm || format === GPUTextureFormat.BC5RGSnorm) return {
        byteLength: 16,
        width: 4,
        height: 4
      };
      if (format === GPUTextureFormat.BC6HRGBUFloat || format === GPUTextureFormat.BC6HRGBFloat) return {
        byteLength: 16,
        width: 4,
        height: 4
      };
      if (format === GPUTextureFormat.BC7RGBAUnorm || format === GPUTextureFormat.BC7RGBAUnormSRGB) return {
        byteLength: 16,
        width: 4,
        height: 4
      };
    }
  }, {
    key: "_getBytesPerTexel",
    value: function _getBytesPerTexel(format) {
      if (format === GPUTextureFormat.R8Unorm) return 1;
      if (format === GPUTextureFormat.R16Float) return 2;
      if (format === GPUTextureFormat.RG8Unorm) return 2;
      if (format === GPUTextureFormat.RG16Float) return 4;
      if (format === GPUTextureFormat.R32Float) return 4;
      if (format === GPUTextureFormat.RGBA8Unorm || format === GPUTextureFormat.RGBA8UnormSRGB) return 4;
      if (format === GPUTextureFormat.RG32Float) return 8;
      if (format === GPUTextureFormat.RGBA16Float) return 8;
      if (format === GPUTextureFormat.RGBA32Float) return 16;
    }
  }, {
    key: "_getDimension",
    value: function _getDimension(texture) {
      var dimension;

      if (texture.isDataTexture3D) {
        dimension = THREE.GPUTextureDimension.ThreeD;
      } else {
        dimension = GPUTextureDimension.TwoD;
      }

      return dimension;
    }
  }, {
    key: "_getFormat",
    value: function _getFormat(texture) {
      var format = texture.format;
      var type = texture.type;
      var encoding = texture.encoding;
      var formatGPU;

      switch (format) {
        case RGBA_S3TC_DXT1_Format:
          formatGPU = encoding === sRGBEncoding ? GPUTextureFormat.BC1RGBAUnormSRGB : GPUTextureFormat.BC1RGBAUnorm;
          break;

        case RGBA_S3TC_DXT3_Format:
          formatGPU = encoding === sRGBEncoding ? GPUTextureFormat.BC2RGBAUnormSRGB : GPUTextureFormat.BC2RGBAUnorm;
          break;

        case RGBA_S3TC_DXT5_Format:
          formatGPU = encoding === sRGBEncoding ? GPUTextureFormat.BC3RGBAUnormSRGB : GPUTextureFormat.BC3RGBAUnorm;
          break;

        case RGBFormat:
        case RGBAFormat:
          switch (type) {
            case UnsignedByteType:
              formatGPU = encoding === sRGBEncoding ? GPUTextureFormat.RGBA8UnormSRGB : GPUTextureFormat.RGBA8Unorm;
              break;

            case HalfFloatType:
              formatGPU = GPUTextureFormat.RGBA16Float;
              break;

            case FloatType:
              formatGPU = GPUTextureFormat.RGBA32Float;
              break;

            default:
              console.error('WebGPURenderer: Unsupported texture type with RGBAFormat.', type);
          }

          break;

        case RedFormat:
          switch (type) {
            case UnsignedByteType:
              formatGPU = GPUTextureFormat.R8Unorm;
              break;

            case HalfFloatType:
              formatGPU = GPUTextureFormat.R16Float;
              break;

            case FloatType:
              formatGPU = GPUTextureFormat.R32Float;
              break;

            default:
              console.error('WebGPURenderer: Unsupported texture type with RedFormat.', type);
          }

          break;

        case RGFormat:
          switch (type) {
            case UnsignedByteType:
              formatGPU = GPUTextureFormat.RG8Unorm;
              break;

            case HalfFloatType:
              formatGPU = GPUTextureFormat.RG16Float;
              break;

            case FloatType:
              formatGPU = GPUTextureFormat.RG32Float;
              break;

            default:
              console.error('WebGPURenderer: Unsupported texture type with RGFormat.', type);
          }

          break;

        default:
          console.error('WebGPURenderer: Unsupported texture format.', format);
      }

      return formatGPU;
    }
  }, {
    key: "_getImageBitmap",
    value: function _getImageBitmap(image, texture) {
      var width = image.width;
      var height = image.height;

      if (typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement || typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement) {
        var options = {};
        options.imageOrientation = texture.flipY === true ? 'flipY' : 'none';
        options.premultiplyAlpha = texture.premultiplyAlpha === true ? 'premultiply' : 'default';
        return createImageBitmap(image, 0, 0, width, height, options);
      } else {
        return Promise.resolve(image);
      }
    }
  }, {
    key: "_getMipLevelCount",
    value: function _getMipLevelCount(texture, width, height, needsMipmaps) {
      var mipLevelCount;

      if (texture.isCompressedTexture) {
        mipLevelCount = texture.mipmaps.length;
      } else if (needsMipmaps === true) {
        mipLevelCount = Math.floor(Math.log2(Math.max(width, height))) + 1;
      } else {
        mipLevelCount = 1;
      }

      return mipLevelCount;
    }
  }, {
    key: "_getSize",
    value: function _getSize(texture) {
      var image = texture.image;
      var width, height, depth;

      if (texture.isCubeTexture) {
        width = image.length > 0 ? image[0].width : 1;
        height = image.length > 0 ? image[0].height : 1;
        depth = 6;
      } else if (image !== undefined) {
        width = image.width;
        height = image.height;
        depth = image.depth !== undefined ? image.depth : 1;
      } else {
        width = height = depth = 1;
      }

      return {
        width: width,
        height: height,
        depth: depth
      };
    }
  }, {
    key: "_needsMipmaps",
    value: function _needsMipmaps(texture) {
      return texture.isCompressedTexture !== true && texture.generateMipmaps === true && texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter;
    }
  }]);

  return WebGPUTextures;
}();

function onRenderTargetDispose(event) {
  var renderTarget = event.target;
  var properties = this.properties;
  var renderTargetProperties = properties.get(renderTarget);
  renderTarget.removeEventListener('dispose', renderTargetProperties.disposeCallback);
  renderTargetProperties.colorTextureGPU.destroy();
  properties.remove(renderTarget.texture);
  this.info.memory.textures--;

  if (renderTarget.depthBuffer === true) {
    renderTargetProperties.depthTextureGPU.destroy();
    this.info.memory.textures--;

    if (renderTarget.depthTexture !== null) {
      properties.remove(renderTarget.depthTexture);
    }
  }

  properties.remove(renderTarget);
}

function onTextureDispose(event) {
  var texture = event.target;
  var textureProperties = this.properties.get(texture);
  textureProperties.textureGPU.destroy();
  texture.removeEventListener('dispose', textureProperties.disposeCallback);
  this.properties.remove(texture);
  this.info.memory.textures--;
}

var _default = WebGPUTextures;
exports["default"] = _default;