"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.StandardNodeMaterial = StandardNodeMaterial;

function StandardNodeMaterial() {
  var node = new StandardNode();
  NodeMaterial.call(this, node, node);
  this.type = "StandardNodeMaterial";
}

StandardNodeMaterial.prototype = Object.create(THREE.NodeMaterial.prototype);
StandardNodeMaterial.prototype.constructor = StandardNodeMaterial;
NodeUtils.addShortcuts(StandardNodeMaterial.prototype, 'fragment', ['color', 'alpha', 'roughness', 'metalness', 'reflectivity', 'clearcoat', 'clearcoatRoughness', 'clearcoatNormal', 'normal', 'emissive', 'ambient', 'light', 'shadow', 'ao', 'environment', 'mask', 'position', 'sheen']);