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
  });
}
