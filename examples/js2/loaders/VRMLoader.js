"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.VRMLoader = void 0;

var VRMLoader = function () {
  function VRMLoader(manager) {
    if (GLTFLoader === undefined) {
      throw new Error('THREE.VRMLoader: Import GLTFLoader.');
    }

    Loader.call(this, manager);
    this.gltfLoader = new GLTFLoader(this.manager);
  }

  VRMLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
    constructor: VRMLoader,
    load: function load(url, onLoad, onProgress, onError) {
      var scope = this;
      this.gltfLoader.load(url, function (gltf) {
        try {
          scope.parse(gltf, onLoad);
        } catch (e) {
          if (onError) {
            onError(e);
          } else {
            console.error(e);
          }

          scope.manager.itemError(url);
        }
      }, onProgress, onError);
    },
    setDRACOLoader: function setDRACOLoader(dracoLoader) {
      this.gltfLoader.setDRACOLoader(dracoLoader);
      return this;
    },
    parse: function parse(gltf, onLoad) {
      onLoad(gltf);
    }
  });
  return VRMLoader;
}();

THREE.VRMLoader = VRMLoader;