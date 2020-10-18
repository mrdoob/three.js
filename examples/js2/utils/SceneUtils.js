"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.SceneUtils = void 0;
var SceneUtils = {
  createMeshesFromInstancedMesh: function createMeshesFromInstancedMesh(instancedMesh) {
    var group = new THREE.Group();
    var count = instancedMesh.count;
    var geometry = instancedMesh.geometry;
    var material = instancedMesh.material;

    for (var i = 0; i < count; i++) {
      var mesh = new THREE.Mesh(geometry, material);
      instancedMesh.getMatrixAt(i, mesh.matrix);
      mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
      group.add(mesh);
    }

    group.copy(instancedMesh);
    group.updateMatrixWorld();
    return group;
  },
  createMultiMaterialObject: function createMultiMaterialObject(geometry, materials) {
    var group = new Group();

    for (var i = 0, l = materials.length; i < l; i++) {
      group.add(new Mesh(geometry, materials[i]));
    }

    return group;
  },
  detach: function detach(child, parent, scene) {
    console.warn('THREE.SceneUtils: detach() has been deprecated. Use scene.attach( child ) instead.');
    scene.attach(child);
  },
  attach: function attach(child, scene, parent) {
    console.warn('THREE.SceneUtils: attach() has been deprecated. Use parent.attach( child ) instead.');
    parent.attach(child);
  }
};
THREE.SceneUtils = SceneUtils;