"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.MDDLoader = void 0;

var MDDLoader = function MDDLoader(manager) {
  Loader.call(this, manager);
};

THREE.MDDLoader = MDDLoader;
MDDLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
  constructor: MDDLoader,
  load: function load(url, onLoad, onProgress, onError) {
    var scope = this;
    var loader = new THREE.FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setResponseType('arraybuffer');
    loader.load(url, function (data) {
      onLoad(scope.parse(data));
    }, onProgress, onError);
  },
  parse: function parse(data) {
    var view = new DataView(data);
    var totalFrames = view.getUint32(0);
    var totalPoints = view.getUint32(4);
    var offset = 8;
    var times = new Float32Array(totalFrames);
    var values = new Float32Array(totalFrames * totalFrames).fill(0);

    for (var i = 0; i < totalFrames; i++) {
      times[i] = view.getFloat32(offset);
      offset += 4;
      values[totalFrames * i + i] = 1;
    }

    var track = new THREE.NumberKeyframeTrack('.morphTargetInfluences', times, values);
    var clip = new THREE.AnimationClip('default', times[times.length - 1], [track]);
    var morphTargets = [];

    for (var i = 0; i < totalFrames; i++) {
      var morphTarget = new Float32Array(totalPoints * 3);

      for (var j = 0; j < totalPoints; j++) {
        var stride = j * 3;
        morphTarget[stride + 0] = view.getFloat32(offset);
        offset += 4;
        morphTarget[stride + 1] = view.getFloat32(offset);
        offset += 4;
        morphTarget[stride + 2] = view.getFloat32(offset);
        offset += 4;
      }

      var attribute = new THREE.BufferAttribute(morphTarget, 3);
      attribute.name = 'morph_' + i;
      morphTargets.push(attribute);
    }

    return {
      morphTargets: morphTargets,
      clip: clip
    };
  }
});