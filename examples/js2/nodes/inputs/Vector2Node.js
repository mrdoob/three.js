"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.Vector2Node = Vector2Node;

function Vector2Node(x, y) {
  InputNode.call(this, 'v2');
  this.value = x instanceof Vector2 ? x : new Vector2(x, y);
}

Vector2Node.prototype = Object.create(THREE.InputNode.prototype);
Vector2Node.prototype.constructor = Vector2Node;
Vector2Node.prototype.nodeType = "Vector2";
NodeUtils.addShortcuts(Vector2Node.prototype, 'value', ['x', 'y']);

Vector2Node.prototype.generateReadonly = function (builder, output, uuid, type) {
  return builder.format("vec2( " + this.x + ", " + this.y + " )", type, output);
};

Vector2Node.prototype.copy = function (source) {
  InputNode.prototype.copy.call(this, source);
  this.value.copy(source);
  return this;
};

Vector2Node.prototype.toJSON = function (meta) {
  var data = this.getJSONNode(meta);

  if (!data) {
    data = this.createJSONNode(meta);
    data.x = this.x;
    data.y = this.y;
    if (this.readonly === true) data.readonly = true;
  }

  return data;
};