"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.ScreenNode = ScreenNode;

function ScreenNode(uv) {
  TextureNode.call(this, undefined, uv);
}

ScreenNode.prototype = Object.create(THREE.TextureNode.prototype);
ScreenNode.prototype.constructor = ScreenNode;
ScreenNode.prototype.nodeType = "Screen";

ScreenNode.prototype.getUnique = function () {
  return true;
};

ScreenNode.prototype.getTexture = function (builder, output) {
  return THREE.InputNode.prototype.generate.call(this, builder, output, this.getUuid(), 't', 'renderTexture');
};