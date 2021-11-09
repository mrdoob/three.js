import * as THREE from '../../build/three.module.js';
import {threejsLessonUtils} from './threejs-lesson-utils.js';
import {GUI} from '../../examples/jsm/libs/lil-gui.module.min.js';

{
  class DegRadHelper {
    constructor(obj, prop) {
      this.obj = obj;
      this.prop = prop;
    }
    get value() {
      return THREE.MathUtils.radToDeg(this.obj[this.prop]);
    }
    set value(v) {
      this.obj[this.prop] = THREE.MathUtils.degToRad(v);
    }
  }

  function scaleCube(zOffset) {
    const root = new THREE.Object3D();

    const size = 3;
    const geometry = new THREE.BoxGeometry(size, size, size);
    geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, zOffset * size));
    const material = new THREE.MeshBasicMaterial({
      color: 'red',
    });
    const cube = new THREE.Mesh(geometry, material);
    root.add(cube);
    cube.add(new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({color: 'white'})));

    [[0, 0], [1, 0], [0, 1]].forEach((rot) => {
      const size = 10;
      const divisions = 10;
      const gridHelper = new THREE.GridHelper(size, divisions);
      root.add(gridHelper);
      gridHelper.rotation.x = rot[0] * Math.PI * .5;
      gridHelper.rotation.z = rot[1] * Math.PI * .5;
    });

    return {
      obj3D: root,
      update: (time) => {
        const s = THREE.MathUtils.lerp(0.5, 2, Math.sin(time) * .5 + .5);
        cube.scale.set(s, s, s);
      },
    };
  }

  threejsLessonUtils.addDiagrams({
    scaleCenter: {
      create() {
        return scaleCube(0);
      },
    },
    scalePositiveZ: {
      create() {
        return scaleCube(.5);
      },
    },
    lonLatPos: {
      create(info) {
        const {scene, camera, renderInfo} = info;
        const size = 10;
        const divisions = 10;
        const gridHelper = new THREE.GridHelper(size, divisions);
        scene.add(gridHelper);

        const geometry = new THREE.BoxGeometry(1, 1, 1);

        const lonHelper = new THREE.Object3D();
        scene.add(lonHelper);
        const latHelper = new THREE.Object3D();
        lonHelper.add(latHelper);
        const positionHelper = new THREE.Object3D();
        latHelper.add(positionHelper);

        {
          const lonMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 'green'}));
          lonMesh.scale.set(0.2, 1, 0.2);
          lonHelper.add(lonMesh);
        }
        {
          const latMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 'blue'}));
          latMesh.scale.set(1, 0.25, 0.25);
          latHelper.add(latMesh);
        }
        {
          const geometry = new THREE.SphereGeometry(0.1, 24, 12);
          const posMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 'red'}));
          posMesh.position.z = 1;
          positionHelper.add(posMesh);
        }

        camera.position.set(1, 1.5, 1.5);
        camera.lookAt(0, 0, 0);

        const gui = new GUI({autoPlace: false});
        renderInfo.elem.appendChild(gui.domElement);
        gui.add(new DegRadHelper(lonHelper.rotation, 'y'), 'value', -180, 180).name('lonHelper x rotation');
        gui.add(new DegRadHelper(latHelper.rotation, 'x'), 'value', -90, 90).name('latHelper y rotation');

        return {
          trackball: false,
        };
      },
    },
  });

}

