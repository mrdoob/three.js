"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.PhongNodeMaterial = PhongNodeMaterial;

function PhongNodeMaterial() {
  var node = new PhongNode();
  NodeMaterial.call(this, node, node);
  this.type = "PhongNodeMaterial";
}

PhongNodeMaterial.prototype = Object.create(THREE.NodeMaterial.prototype);
PhongNodeMaterial.prototype.constructor = PhongNodeMaterial;
NodeUtils.addShortcuts(PhongNodeMaterial.prototype, 'fragment', ['color', 'alpha', 'specular', 'shininess', 'normal', 'emissive', 'ambient', 'light', 'shadow', 'ao', 'environment', 'environmentAlpha', 'mask', 'position']);