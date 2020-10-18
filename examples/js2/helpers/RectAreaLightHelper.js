"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.RectAreaLightHelper = RectAreaLightHelper;

function RectAreaLightHelper(light, color) {
  this.light = light;
  this.color = color;
  var positions = [1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0, 1, 1, 0];
  var geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();
  var material = new THREE.LineBasicMaterial({
    fog: false
  });
  Line.call(this, geometry, material);
  this.type = 'RectAreaLightHelper';
  var positions2 = [1, 1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0];
  var geometry2 = new BufferGeometry();
  geometry2.setAttribute('position', new Float32BufferAttribute(positions2, 3));
  geometry2.computeBoundingSphere();
  this.add(new THREE.Mesh(geometry2, new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    fog: false
  })));
  this.update();
}

RectAreaLightHelper.prototype = Object.create(Line.prototype);
RectAreaLightHelper.prototype.constructor = RectAreaLightHelper;

RectAreaLightHelper.prototype.update = function () {
  this.scale.set(0.5 * this.light.width, 0.5 * this.light.height, 1);

  if (this.color !== undefined) {
    this.material.color.set(this.color);
    this.children[0].material.color.set(this.color);
  } else {
    this.material.color.copy(this.light.color).multiplyScalar(this.light.intensity);
    var c = this.material.color;
    var max = Math.max(c.r, c.g, c.b);
    if (max > 1) c.multiplyScalar(1 / max);
    this.children[0].material.color.copy(this.material.color);
  }
};

RectAreaLightHelper.prototype.dispose = function () {
  this.geometry.dispose();
  this.material.dispose();
  this.children[0].geometry.dispose();
  this.children[0].material.dispose();
};