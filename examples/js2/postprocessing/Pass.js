"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.Pass = Pass;

function Pass() {
  this.enabled = true;
  this.needsSwap = true;
  this.clear = false;
  this.renderToScreen = false;
}

Object.assign(Pass.prototype, {
  setSize: function setSize() {},
  render: function render() {
    console.error('THREE.Pass: .render() must be implemented in derived pass.');
  }
});

Pass.FullScreenQuad = function () {
  var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  var geometry = new THREE.PlaneBufferGeometry(2, 2);

  var FullScreenQuad = function FullScreenQuad(material) {
    this._mesh = new THREE.Mesh(geometry, material);
  };

  Object.defineProperty(FullScreenQuad.prototype, 'material', {
    get: function get() {
      return this._mesh.material;
    },
    set: function set(value) {
      this._mesh.material = value;
    }
  });
  Object.assign(FullScreenQuad.prototype, {
    dispose: function dispose() {
      this._mesh.geometry.dispose();
    },
    render: function render(renderer) {
      renderer.render(this._mesh, camera);
    }
  });
  return FullScreenQuad;
}();