'use strict';

/* global threejsLessonUtils */

{
  function fogExample(scene, fog) {
    scene.fog = fog;
    const width = 4;
    const height = 3;
    const depth = 10;
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);
    const material = new THREE.MeshPhongMaterial({color: 'hsl(130,50%,50%)'});
    return new THREE.Mesh(geometry, material);
  }

  function houseScene(props, fogInHouse) {
    const {scene, camera} = props;
    camera.far = 200;
    const loader = new THREE.GLTFLoader();
    const settings = {
      shininess: 0,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
    };
    loader.load('../resources/models/simple_house_scene/scene.gltf', (gltf) => {
      const materials = new Set();
      gltf.scene.traverse((node) => {
        const material = node.material;
        if (material) {
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

    camera.fov = 30;
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
      obj3D: new THREE.Object3D(),
      update: (time) => {
        camera.lookAt(target[0] + Math.sin(time * .25) * .5, target[1], target[2]);
      },
    };

  }

  threejsLessonUtils.addDiagrams({
    fog: {
      create(props) {
        const {scene} = props;
        const color = 0xFFFFFF;
        const near = 12;
        const far = 18;
        return fogExample(scene, new THREE.Fog(color, near, far));
      },
    },
    fogExp2: {
      create(props) {
        const {scene} = props;
        const color = 0xFFFFFF;
        const density = 0.1;
        return fogExample(scene, new THREE.FogExp2(color, density));
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
