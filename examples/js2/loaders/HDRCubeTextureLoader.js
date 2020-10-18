"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.HDRCubeTextureLoader = void 0;

var HDRCubeTextureLoader = function HDRCubeTextureLoader(manager) {
  Loader.call(this, manager);
  this.hdrLoader = new THREE.RGBELoader();
  this.type = THREE.UnsignedByteType;
};

THREE.HDRCubeTextureLoader = HDRCubeTextureLoader;
HDRCubeTextureLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
  constructor: HDRCubeTextureLoader,
  load: function load(urls, onLoad, onProgress, onError) {
    if (!Array.isArray(urls)) {
      console.warn('THREE.HDRCubeTextureLoader signature has changed. Use .setDataType() instead.');
      this.setDataType(urls);
      urls = onLoad;
      onLoad = onProgress;
      onProgress = onError;
      onError = arguments[4];
    }

    var texture = new THREE.CubeTexture();
    texture.type = this.type;

    switch (texture.type) {
      case UnsignedByteType:
        texture.encoding = THREE.RGBEEncoding;
        texture.format = THREE.RGBAFormat;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = NearestFilter;
        texture.generateMipmaps = false;
        break;

      case FloatType:
        texture.encoding = THREE.LinearEncoding;
        texture.format = THREE.RGBFormat;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = false;
        break;

      case HalfFloatType:
        texture.encoding = LinearEncoding;
        texture.format = RGBFormat;
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = false;
        break;
    }

    var scope = this;
    var loaded = 0;

    function loadHDRData(i, onLoad, onProgress, onError) {
      new THREE.FileLoader(scope.manager).setPath(scope.path).setResponseType('arraybuffer').setWithCredentials(scope.withCredentials).load(urls[i], function (buffer) {
        loaded++;
        var texData = scope.hdrLoader.parse(buffer);
        if (!texData) return;

        if (texData.data !== undefined) {
          var dataTexture = new THREE.DataTexture(texData.data, texData.width, texData.height);
          dataTexture.type = texture.type;
          dataTexture.encoding = texture.encoding;
          dataTexture.format = texture.format;
          dataTexture.minFilter = texture.minFilter;
          dataTexture.magFilter = texture.magFilter;
          dataTexture.generateMipmaps = texture.generateMipmaps;
          texture.images[i] = dataTexture;
        }

        if (loaded === 6) {
          texture.needsUpdate = true;
          if (onLoad) onLoad(texture);
        }
      }, onProgress, onError);
    }

    for (var i = 0; i < urls.length; i++) {
      loadHDRData(i, onLoad, onProgress, onError);
    }

    return texture;
  },
  setDataType: function setDataType(value) {
    this.type = value;
    this.hdrLoader.setDataType(value);
    return this;
  }
});