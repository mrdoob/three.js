"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.Matrix4Node = Matrix4Node;

function Matrix4Node(matrix) {
  InputNode.call(this, 'm4');
  this.value = matrix || new Matrix4();
}

Matrix4Node.prototype = Object.create(THREE.InputNode.prototype);
Matrix4Node.prototype.constructor = Matrix4Node;
Matrix4Node.prototype.nodeType = "Matrix4";
Object.defineProperties(Matrix4Node.prototype, {
  elements: {
    set: function set(val) {
      this.value.elements = val;
    },
    get: function get() {
      return this.value.elements;
    }
  }
});

Matrix4Node.prototype.generateReadonly = function (builder, output, uuid, type) {
  return builder.format("mat4( " + this.value.elements.join(", ") + " )", type, output);
};

Matrix4Node.prototype.copy = function (source) {
  InputNode.prototype.copy.call(this, source);
  this.scope.value.fromArray(source.elements);
  return this;
};

Matrix4Node.prototype.toJSON = function (meta) {
  var data = this.getJSONNode(meta);

  if (!data) {
    data = this.createJSONNode(meta);
    data.elements = this.value.elements.concat();
  }

  return data;
};