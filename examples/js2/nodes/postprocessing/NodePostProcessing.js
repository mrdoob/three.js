"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.NodePostProcessing = NodePostProcessing;

function NodePostProcessing(renderer, renderTarget) {
  if (renderTarget === undefined) {
    var parameters = {
      minFilter: THREE.LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat
    };
    var size = renderer.getDrawingBufferSize(new THREE.Vector2());
    renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, parameters);
  }

  this.renderer = renderer;
  this.renderTarget = renderTarget;
  this.output = new THREE.ScreenNode();
  this.material = new THREE.NodeMaterial();
  this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  this.scene = new THREE.Scene();
  this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material);
  this.quad.frustumCulled = false;
  this.scene.add(this.quad);
  this.needsUpdate = true;
}

NodePostProcessing.prototype = {
  constructor: NodePostProcessing,
  render: function render(scene, camera, frame) {
    if (this.needsUpdate) {
      this.material.dispose();
      this.material.fragment.value = this.output;
      this.material.build();

      if (this.material.uniforms.renderTexture) {
        this.material.uniforms.renderTexture.value = this.renderTarget.texture;
      }

      this.needsUpdate = false;
    }

    frame.setRenderer(this.renderer).setRenderTexture(this.renderTarget.texture);
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(scene, camera);
    frame.updateNode(this.material);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  },
  setPixelRatio: function setPixelRatio(value) {
    this.renderer.setPixelRatio(value);
    var size = this.renderer.getSize(new Vector2());
    this.setSize(size.width, size.height);
  },
  setSize: function setSize(width, height) {
    var pixelRatio = this.renderer.getPixelRatio();
    this.renderTarget.setSize(width * pixelRatio, height * pixelRatio);
    this.renderer.setSize(width, height);
  },
  copy: function copy(source) {
    this.output = source.output;
    return this;
  },
  toJSON: function toJSON(meta) {
    var isRootObject = meta === undefined || typeof meta === 'string';

    if (isRootObject) {
      meta = {
        nodes: {}
      };
    }

    if (meta && !meta.post) meta.post = {};

    if (!meta.post[this.uuid]) {
      var data = {};
      data.uuid = this.uuid;
      data.type = "NodePostProcessing";
      meta.post[this.uuid] = data;
      if (this.name !== "") data.name = this.name;
      if (JSON.stringify(this.userData) !== '{}') data.userData = this.userData;
      data.output = this.output.toJSON(meta).uuid;
    }

    meta.post = this.uuid;
    return meta;
  }
};