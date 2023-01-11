import * as THREE from 'three';
import {GLTFLoader} from '../../examples/jsm/loaders/GLTFLoader.js';
import {threejsLessonUtils} from './threejs-lesson-utils.js';

{
  const darkColors = {
    background: '#333',
  };
  const lightColors = {
    background: '#FFF',
  };
  const darkMatcher = window.matchMedia('(prefers-color-scheme: dark)');

  function fogExample(scene, fog, update) {
    scene.fog = fog;
    const width = 4;
    const height = 3;
    const depth = 10;
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshPhongMaterial({color: 'hsl(130,50%,50%)'});
    return {
      obj3D: new THREE.Mesh(geometry, material),
      update,
    };
  }

  function houseScene(props, fogInHouse) {
    const {scene, camera} = props;
    scene.background = new THREE.Color('#FFF');
    camera.far = 200;
    const loader = new GLTFLoader();
    const settings = {
      shininess: 0,
      roughness: 1,
      metalness: 0,
    };
    loader.load('/manual/examples/resources/models/simple_house_scene/scene.gltf', (gltf) => {
      const hackGeometry = new THREE.CircleGeometry(0.5, 32);
      const box = new THREE.Box3();
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      const materials = new Set();
      gltf.scene.traverse((node) => {
        const material = node.material;
        if (material) {
          // hack in the bottom of the trees since I don't have
          // the model file
          if (node.name === 'mesh_11' || node.name === 'mesh_6') {
            node.updateWorldMatrix(true, false);
            box.setFromObject(node);
            box.getSize(size);
            box.getCenter(center);
            const hackMesh = new THREE.Mesh(hackGeometry, node.material);
            scene.add(hackMesh);
            hackMesh.position.copy(center);
            hackMesh.rotation.x = Math.PI * 0.5;
            hackMesh.position.y -= size.y / 2;
            hackMesh.scale.set(size.x, size.z, 1);
          }
          (Array.isArray(material) ? material : [material]).forEach((material) => {
            if (!materials.has(material)) {
              materials.add(material);
              for (const [key, value] of Object.entries(settings)) {
                if (material[key] !== undefined) {
                  material[key] = value;
                }
              }
              if (!fogInHouse && material.name.startsWith('fogless')) {
                material.fog = false;
              }
            }
          });
        }
      });
      scene.add(gltf.scene);
    });

    camera.fov = 45;
    camera.position.set(0.4, 1, 1.7);
    camera.lookAt(1, 1, 0.7);

    const color = 0xFFFFFF;
    const near = 1.5;
    const far = 5;
    scene.fog = new THREE.Fog(color, near, far);

    const light = new THREE.PointLight(0xFFFFFF, 1);
    light.position.copy(camera.position);
    light.position.y += 0.2;
    scene.add(light);

    const target = [1, 1, 0.7];
    return {
      trackball: false,
      obj3D: new THREE.Object3D(),
      update: (time) => {
        camera.lookAt(target[0] + Math.sin(time * .25) * .5, target[1], target[2]);
      },
    };
  }

  function createLightDarkFogUpdater(fog) {
    return function() {
      const isDarkMode = darkMatcher.matches;
      const colors = isDarkMode ? darkColors : lightColors;
      fog.color.set(colors.background);
    };
  }

  threejsLessonUtils.addDiagrams({
    fog: {
      create(props) {
        const {scene} = props;
        const color = 0xFFFFFF;
        const near = 12;
        const far = 18;
        const fog = new THREE.Fog(color, near, far);
        return fogExample(scene, fog, createLightDarkFogUpdater(fog));
      },
    },
    fogExp2: {
      create(props) {
        const {scene} = props;
        const color = 0xFFFFFF;
        const density = 0.1;
        const fog = new THREE.FogExp2(color, density);
        return fogExample(scene, fog, createLightDarkFogUpdater(fog));
      },
    },
    fogBlueBackgroundRed: {
      create(props) {
        const {scene} = props;
        scene.background = new THREE.Color('#F00');
        const color = '#00F';
        const near = 12;
        const far = 18;
        return fogExample(scene, new THREE.Fog(color, near, far));
      },
    },
    fogBlueBackgroundBlue: {
      create(props) {
        const {scene} = props;
        scene.background = new THREE.Color('#00F');
        const color = '#00F';
        const near = 12;
        const far = 18;
        return fogExample(scene, new THREE.Fog(color, near, far));
      },
    },
    fogHouseAll: {
      create(props) {
        return houseScene(props, true);
      },
    },
    fogHouseInsideNoFog: {
      create(props) {
        return houseScene(props, false);
      },
    },
  });
}
