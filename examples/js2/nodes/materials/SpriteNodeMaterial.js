"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.SpriteNodeMaterial = SpriteNodeMaterial;

function SpriteNodeMaterial() {
  var node = new SpriteNode();
  NodeMaterial.call(this, node, node);
  this.type = "SpriteNodeMaterial";
}

SpriteNodeMaterial.prototype = Object.create(THREE.NodeMaterial.prototype);
SpriteNodeMaterial.prototype.constructor = SpriteNodeMaterial;
NodeUtils.addShortcuts(SpriteNodeMaterial.prototype, 'fragment', ['color', 'alpha', 'mask', 'position', 'spherical']);