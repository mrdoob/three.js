import * as THREE from '../../build/three.module.js';
import {OrbitControls} from '../../examples/jsm/controls/OrbitControls.js';
import {threejsLessonUtils} from './threejs-lesson-utils.js';

{
  function makeCheckerTexture(repeats) {
    const data = new Uint8Array([
      0x88, 0x88, 0x88, 0xCC, 0xCC, 0xCC,
      0xCC, 0xCC, 0xCC, 0x88, 0x88, 0x88,
    ]);
    const width = 2;
    const height = 2;
    const texture = new THREE.DataTexture(data, width, height, THREE.RGBFormat);
    texture.needsUpdate = true;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeats / 2, repeats / 2);
    return texture;
  }

  const makeScene = function() {

    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});

    const sphereRadius = 3;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
    const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});

    const planeSize = 40;
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: makeCheckerTexture(planeSize),
      side: THREE.DoubleSide,
    });

    return function(renderInfo) {
      const {scene, camera, elem} = renderInfo;
      const controls = new OrbitControls(camera, elem);
      controls.enableDamping = true;
      controls.enablePanning = false;
      controls.enableKeys = false;
      scene.background = new THREE.Color('black');
      {
        const mesh = new THREE.Mesh(cubeGeo, cubeMat);
        mesh.position.set(cubeSize + 1, cubeSize / 2, -cubeSize - 1);
        scene.add(mesh);
      }
      {
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.position.set(-sphereRadius - 1, sphereRadius + 2, -sphereRadius + 1);
        scene.add(mesh);
      }
      {
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI * -.5;
        scene.add(mesh);
      }
      return {
        trackball: false,
        lights: false,
        update() {
          controls.update();
        },
      };
    };
  }();

  threejsLessonUtils.addDiagrams({
    directionalOnly: {
      create(props) {
        const {scene, renderInfo} = props;
        const result = makeScene(renderInfo);
        {
          const light = new THREE.DirectionalLight(0xFFFFFF, 1);
          light.position.set(5, 10, 0);
          scene.add(light);
        }
        {
          const light = new THREE.AmbientLight(0xFFFFFF, .6);
          scene.add(light);
        }
        return result;
      },
    },
    directionalPlusHemisphere: {
      create(props) {
        const {scene, renderInfo} = props;
        const result = makeScene(renderInfo);
        {
          const light = new THREE.DirectionalLight(0xFFFFFF, 1);
          light.position.set(5, 10, 0);
          scene.add(light);
        }
        {
          const skyColor = 0xB1E1FF;  // light blue
          const groundColor = 0xB97A20;  // brownish orange
          const intensity = .6;
          const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
          scene.add(light);
        }
        return result;
      },
    },
  });
}

