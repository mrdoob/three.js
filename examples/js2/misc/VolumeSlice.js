"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.VolumeSlice = void 0;

var VolumeSlice = function VolumeSlice(volume, index, axis) {
  var slice = this;
  this.volume = volume;
  index = index || 0;
  Object.defineProperty(this, 'index', {
    get: function get() {
      return index;
    },
    set: function set(value) {
      index = value;
      slice.geometryNeedsUpdate = true;
      return index;
    }
  });
  this.axis = axis || 'z';
  this.canvas = document.createElement('canvas');
  this.canvasBuffer = document.createElement('canvas');
  this.updateGeometry();
  var canvasMap = new THREE.Texture(this.canvas);
  canvasMap.minFilter = THREE.LinearFilter;
  canvasMap.wrapS = canvasMap.wrapT = THREE.ClampToEdgeWrapping;
  var material = new THREE.MeshBasicMaterial({
    map: canvasMap,
    side: THREE.DoubleSide,
    transparent: true
  });
  this.mesh = new Mesh(this.geometry, material);
  this.mesh.matrixAutoUpdate = false;
  this.geometryNeedsUpdate = true;
  this.repaint();
};

THREE.VolumeSlice = VolumeSlice;
VolumeSlice.prototype = {
  constructor: VolumeSlice,
  repaint: function repaint() {
    if (this.geometryNeedsUpdate) {
      this.updateGeometry();
    }

    var iLength = this.iLength,
        jLength = this.jLength,
        sliceAccess = this.sliceAccess,
        volume = this.volume,
        canvas = this.canvasBuffer,
        ctx = this.ctxBuffer;
    var imgData = ctx.getImageData(0, 0, iLength, jLength);
    var data = imgData.data;
    var volumeData = volume.data;
    var upperThreshold = volume.upperThreshold;
    var lowerThreshold = volume.lowerThreshold;
    var windowLow = volume.windowLow;
    var windowHigh = volume.windowHigh;
    var pixelCount = 0;

    if (volume.dataType === 'label') {
      for (var j = 0; j < jLength; j++) {
        for (var i = 0; i < iLength; i++) {
          var label = volumeData[sliceAccess(i, j)];
          label = label >= this.colorMap.length ? label % this.colorMap.length + 1 : label;
          var color = this.colorMap[label];
          data[4 * pixelCount] = color >> 24 & 0xff;
          data[4 * pixelCount + 1] = color >> 16 & 0xff;
          data[4 * pixelCount + 2] = color >> 8 & 0xff;
          data[4 * pixelCount + 3] = color & 0xff;
          pixelCount++;
        }
      }
    } else {
      for (var j = 0; j < jLength; j++) {
        for (var i = 0; i < iLength; i++) {
          var value = volumeData[sliceAccess(i, j)];
          var alpha = 0xff;
          alpha = upperThreshold >= value ? lowerThreshold <= value ? alpha : 0 : 0;
          value = Math.floor(255 * (value - windowLow) / (windowHigh - windowLow));
          value = value > 255 ? 255 : value < 0 ? 0 : value | 0;
          data[4 * pixelCount] = value;
          data[4 * pixelCount + 1] = value;
          data[4 * pixelCount + 2] = value;
          data[4 * pixelCount + 3] = alpha;
          pixelCount++;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    this.ctx.drawImage(canvas, 0, 0, iLength, jLength, 0, 0, this.canvas.width, this.canvas.height);
    this.mesh.material.map.needsUpdate = true;
  },
  updateGeometry: function updateGeometry() {
    var extracted = this.volume.extractPerpendicularPlane(this.axis, this.index);
    this.sliceAccess = extracted.sliceAccess;
    this.jLength = extracted.jLength;
    this.iLength = extracted.iLength;
    this.matrix = extracted.matrix;
    this.canvas.width = extracted.planeWidth;
    this.canvas.height = extracted.planeHeight;
    this.canvasBuffer.width = this.iLength;
    this.canvasBuffer.height = this.jLength;
    this.ctx = this.canvas.getContext('2d');
    this.ctxBuffer = this.canvasBuffer.getContext('2d');
    if (this.geometry) this.geometry.dispose();
    this.geometry = new THREE.PlaneBufferGeometry(extracted.planeWidth, extracted.planeHeight);

    if (this.mesh) {
      this.mesh.geometry = this.geometry;
      this.mesh.matrix.identity();
      this.mesh.applyMatrix4(this.matrix);
    }

    this.geometryNeedsUpdate = false;
  }
};