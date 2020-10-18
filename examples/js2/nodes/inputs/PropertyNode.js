"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.PropertyNode = PropertyNode;

function PropertyNode(object, property, type) {
  InputNode.call(this, type);
  this.object = object;
  this.property = property;
}

PropertyNode.prototype = Object.create(THREE.InputNode.prototype);
PropertyNode.prototype.constructor = PropertyNode;
PropertyNode.prototype.nodeType = "Property";
Object.defineProperties(PropertyNode.prototype, {
  value: {
    get: function get() {
      return this.object[this.property];
    },
    set: function set(val) {
      this.object[this.property] = val;
    }
  }
});

PropertyNode.prototype.toJSON = function (meta) {
  var data = this.getJSONNode(meta);

  if (!data) {
    data = this.createJSONNode(meta);
    data.value = this.value;
    data.property = this.property;
  }

  return data;
};