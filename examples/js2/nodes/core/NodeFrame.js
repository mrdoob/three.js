"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.NodeFrame = NodeFrame;

function NodeFrame(time) {
  this.time = time !== undefined ? time : 0;
  this.id = 0;
}

NodeFrame.prototype = {
  constructor: NodeFrame,
  update: function update(delta) {
    ++this.id;
    this.time += delta;
    this.delta = delta;
    return this;
  },
  setRenderer: function setRenderer(renderer) {
    this.renderer = renderer;
    return this;
  },
  setRenderTexture: function setRenderTexture(renderTexture) {
    this.renderTexture = renderTexture;
    return this;
  },
  updateNode: function updateNode(node) {
    if (node.frameId === this.id) return this;
    node.updateFrame(this);
    node.frameId = this.id;
    return this;
  }
};