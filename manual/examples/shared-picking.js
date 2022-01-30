import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';

export const state = {
  width: 300,   // canvas default
  height: 150,  // canvas default
};

export const pickPosition = {x: 0, y: 0};

export function init(data) {  // eslint-disable-line no-unused-vars
  const {canvas} = data;
  const renderer = new THREE.WebGLRenderer({canvas});

  state.width = canvas.width;
  state.height = canvas.height;

  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 4;

  const scene = new THREE.Scene();

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({
      color,
    });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.x = x;

    return cube;
  }

  const cubes = [
    makeInstance(geometry, 0x44aa88, 0),
    makeInstance(geometry, 0x8844aa, -2),
    makeInstance(geometry, 0xaa8844, 2),
  ];

  class PickHelper {
    constructor() {
      this.raycaster = new THREE.Raycaster();
      this.pickedObject = null;
      this.pickedObjectSavedColor = 0;
    }
    pick(normalizedPosition, scene, camera, time) {
      // restore the color if there is a picked object
      if (this.pickedObject) {
        this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
        this.pickedObject = undefined;
      }

      // cast a ray through the frustum
      this.raycaster.setFromCamera(normalizedPosition, camera);
      // get the list of objects the ray intersected
      const intersectedObjects = this.raycaster.intersectObjects(scene.children);
      if (intersectedObjects.length) {
        // pick the first object. It's the closest one
        this.pickedObject = intersectedObjects[0].object;
        // save its color
        this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
        // set its emissive color to flashing red/yellow
        this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
      }
    }
  }

  const pickHelper = new PickHelper();

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = state.width;
    const height = state.height;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      camera.aspect = state.width / state.height;
      camera.updateProjectionMatrix();
    }

    cubes.forEach((cube, ndx) => {
      const speed = 1 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });

    pickHelper.pick(pickPosition, scene, camera, time);

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
