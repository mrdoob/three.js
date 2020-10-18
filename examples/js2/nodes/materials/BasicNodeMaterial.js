"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.BasicNodeMaterial = BasicNodeMaterial;

function BasicNodeMaterial() {
  var node = new BasicNode();
  NodeMaterial.call(this, node, node);
  this.type = "BasicNodeMaterial";
}

BasicNodeMaterial.prototype = Object.create(THREE.NodeMaterial.prototype);
BasicNodeMaterial.prototype.constructor = BasicNodeMaterial;
NodeUtils.addShortcuts(BasicNodeMaterial.prototype, 'fragment', ['color', 'alpha', 'mask', 'position']);