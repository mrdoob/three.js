"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.RoomEnvironment = RoomEnvironment;

function RoomEnvironment() {
  var scene = new THREE.Scene();
  var geometry = new THREE.BoxBufferGeometry();
  geometry.deleteAttribute('uv');
  var roomMaterial = new THREE.MeshStandardMaterial({
    side: BackSide
  });
  var boxMaterial = new MeshStandardMaterial();
  var mainLight = new THREE.PointLight(0xffffff, 5.0, 28, 2);
  mainLight.position.set(0.418, 16.199, 0.300);
  scene.add(mainLight);
  var room = new Mesh(geometry, roomMaterial);
  room.position.set(-0.757, 13.219, 0.717);
  room.scale.set(31.713, 28.305, 28.591);
  scene.add(room);
  var box1 = new Mesh(geometry, boxMaterial);
  box1.position.set(-10.906, 2.009, 1.846);
  box1.rotation.set(0, -0.195, 0);
  box1.scale.set(2.328, 7.905, 4.651);
  scene.add(box1);
  var box2 = new Mesh(geometry, boxMaterial);
  box2.position.set(-5.607, -0.754, -0.758);
  box2.rotation.set(0, 0.994, 0);
  box2.scale.set(1.970, 1.534, 3.955);
  scene.add(box2);
  var box3 = new Mesh(geometry, boxMaterial);
  box3.position.set(6.167, 0.857, 7.803);
  box3.rotation.set(0, 0.561, 0);
  box3.scale.set(3.927, 6.285, 3.687);
  scene.add(box3);
  var box4 = new Mesh(geometry, boxMaterial);
  box4.position.set(-2.017, 0.018, 6.124);
  box4.rotation.set(0, 0.333, 0);
  box4.scale.set(2.002, 4.566, 2.064);
  scene.add(box4);
  var box5 = new Mesh(geometry, boxMaterial);
  box5.position.set(2.291, -0.756, -2.621);
  box5.rotation.set(0, -0.286, 0);
  box5.scale.set(1.546, 1.552, 1.496);
  scene.add(box5);
  var box6 = new Mesh(geometry, boxMaterial);
  box6.position.set(-2.193, -0.369, -5.547);
  box6.rotation.set(0, 0.516, 0);
  box6.scale.set(3.875, 3.487, 2.986);
  scene.add(box6);
  var light1 = new Mesh(geometry, createAreaLightMaterial(50));
  light1.position.set(-16.116, 14.37, 8.208);
  light1.scale.set(0.1, 2.428, 2.739);
  scene.add(light1);
  var light2 = new Mesh(geometry, createAreaLightMaterial(50));
  light2.position.set(-16.109, 18.021, -8.207);
  light2.scale.set(0.1, 2.425, 2.751);
  scene.add(light2);
  var light3 = new Mesh(geometry, createAreaLightMaterial(17));
  light3.position.set(14.904, 12.198, -1.832);
  light3.scale.set(0.15, 4.265, 6.331);
  scene.add(light3);
  var light4 = new Mesh(geometry, createAreaLightMaterial(43));
  light4.position.set(-0.462, 8.89, 14.520);
  light4.scale.set(4.38, 5.441, 0.088);
  scene.add(light4);
  var light5 = new Mesh(geometry, createAreaLightMaterial(20));
  light5.position.set(3.235, 11.486, -12.541);
  light5.scale.set(2.5, 2.0, 0.1);
  scene.add(light5);
  var light6 = new Mesh(geometry, createAreaLightMaterial(100));
  light6.position.set(0.0, 20.0, 0.0);
  light6.scale.set(1.0, 0.1, 1.0);
  scene.add(light6);

  function createAreaLightMaterial(intensity) {
    var material = new THREE.MeshBasicMaterial();
    material.color.setScalar(intensity);
    return material;
  }

  return scene;
}