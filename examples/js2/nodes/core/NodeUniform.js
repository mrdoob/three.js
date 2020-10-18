"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.NodeUniform = NodeUniform;

function NodeUniform(params) {
  params = params || {};
  this.name = params.name;
  this.type = params.type;
  this.node = params.node;
  this.needsUpdate = params.needsUpdate;
}

Object.defineProperties(NodeUniform.prototype, {
  value: {
    get: function get() {
      return this.node.value;
    },
    set: function set(val) {
      this.node.value = val;
    }
  }
});