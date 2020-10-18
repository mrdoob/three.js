"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.UVTransformNode = UVTransformNode;

function UVTransformNode(uv, position) {
  ExpressionNode.call(this, "( uvTransform * vec3( uvNode, 1 ) ).xy", "vec2");
  this.uv = uv || new THREE.UVNode();
  this.position = position || new THREE.Matrix3Node();
}

UVTransformNode.prototype = Object.create(THREE.ExpressionNode.prototype);
UVTransformNode.prototype.constructor = UVTransformNode;
UVTransformNode.prototype.nodeType = "UVTransform";

UVTransformNode.prototype.generate = function (builder, output) {
  this.keywords["uvNode"] = this.uv;
  this.keywords["uvTransform"] = this.position;
  return ExpressionNode.prototype.generate.call(this, builder, output);
};

UVTransformNode.prototype.setUvTransform = function (tx, ty, sx, sy, rotation, cx, cy) {
  cx = cx !== undefined ? cx : .5;
  cy = cy !== undefined ? cy : .5;
  this.position.value.setUvTransform(tx, ty, sx, sy, rotation, cx, cy);
};

UVTransformNode.prototype.copy = function (source) {
  ExpressionNode.prototype.copy.call(this, source);
  this.uv = source.uv;
  this.position = source.position;
  return this;
};

UVTransformNode.prototype.toJSON = function (meta) {
  var data = this.getJSONNode(meta);

  if (!data) {
    data = this.createJSONNode(meta);
    data.uv = this.uv.toJSON(meta).uuid;
    data.position = this.position.toJSON(meta).uuid;
  }

  return data;
};