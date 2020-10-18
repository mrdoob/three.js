"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.MeshStandardNodeMaterial = MeshStandardNodeMaterial;

function MeshStandardNodeMaterial() {
  var node = new MeshStandardNode();
  NodeMaterial.call(this, node, node);
  this.type = "MeshStandardNodeMaterial";
}

MeshStandardNodeMaterial.prototype = Object.create(THREE.NodeMaterial.prototype);
MeshStandardNodeMaterial.prototype.constructor = MeshStandardNodeMaterial;
NodeUtils.addShortcuts(MeshStandardNodeMaterial.prototype, 'properties', ["color", "roughness", "metalness", "map", "normalMap", "normalScale", "metalnessMap", "roughnessMap", "envMap"]);