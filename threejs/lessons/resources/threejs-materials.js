'use strict';

/* global threejsLessonUtils */

{
  function smoothOrFlat(flatShading, radius = 7) {
    const widthDivisions = 12;
    const heightDivisions = 9;
    const geometry = new THREE.SphereBufferGeometry(radius, widthDivisions, heightDivisions);
    const material = new THREE.MeshPhongMaterial({
      flatShading,
      color: 'hsl(300,50%,50%)',
    });
    return new THREE.Mesh(geometry, material);
  }

  function basicLambertPhongExample(MaterialCtor, lowPoly, params = {}) {
    const radius = 7;
    const widthDivisions = lowPoly ? 8 : 100;
    const heightDivisions = lowPoly ? 5 : 50;
    const geometry = new THREE.SphereBufferGeometry(radius, widthDivisions, heightDivisions);
    const material = new MaterialCtor(Object.assign({
      color: 'hsl(210,50%,50%)',
    }, params));
    return new THREE.Mesh(geometry, material);
  }

  function sideExample(side) {
    const base = new THREE.Object3D();
    const size = 6;
    const geometry = new THREE.PlaneBufferGeometry(size, size);
    [
      { position: [ -1, 0, 0], up: [0,  1, 0], },
      { position: [  1, 0, 0], up: [0, -1, 0], },
      { position: [ 0, -1, 0], up: [0, 0, -1], },
      { position: [ 0,  1, 0], up: [0, 0,  1], },
      { position: [ 0, 0, -1], up: [ 1, 0, 0], },
      { position: [ 0, 0,  1], up: [-1, 0, 0], },
    ].forEach((settings, ndx) => {
      const material = new THREE.MeshBasicMaterial({side});
      material.color.setHSL(ndx / 6, .5, .5);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.up.set(...settings.up);
      mesh.lookAt(...settings.position);
      mesh.position.set(...settings.position).multiplyScalar(size * .75);
      base.add(mesh);
    });
    return base;
  }

  threejsLessonUtils.addDiagrams({
    smoothShading: {
      create() {
        return smoothOrFlat(false);
      },
    },
    flatShading: {
      create() {
        return smoothOrFlat(true);
      },
    },
    MeshBasicMaterial: {
      create() {
        return basicLambertPhongExample(THREE.MeshBasicMaterial);
      },
    },
    MeshLambertMaterial: {
      create() {
        return basicLambertPhongExample(THREE.MeshLambertMaterial);
      },
    },
    MeshPhongMaterial: {
      create() {
        return basicLambertPhongExample(THREE.MeshPhongMaterial);
      },
    },
    MeshBasicMaterialLowPoly: {
      create() {
        return basicLambertPhongExample(THREE.MeshBasicMaterial, true);
      },
    },
    MeshLambertMaterialLowPoly: {
      create() {
        return basicLambertPhongExample(THREE.MeshLambertMaterial, true);
      },
    },
    MeshPhongMaterialLowPoly: {
      create() {
        return basicLambertPhongExample(THREE.MeshPhongMaterial, true);
      },
    },
    MeshPhongMaterialShininess0: {
      create() {
        return basicLambertPhongExample(THREE.MeshPhongMaterial, false, {
          color: 'red',
          shininess: 0,
        });
      },
    },
    MeshPhongMaterialShininess30: {
      create() {
        return basicLambertPhongExample(THREE.MeshPhongMaterial, false, {
          color: 'red',
          shininess: 30,
        });
      },
    },
    MeshPhongMaterialShininess150: {
      create() {
        return basicLambertPhongExample(THREE.MeshPhongMaterial, false, {
          color: 'red',
          shininess: 150,
        });
      },
    },
    MeshBasicMaterialCompare: {
      create() {
        return basicLambertPhongExample(THREE.MeshBasicMaterial, false, {
          color: 'purple',
        });
      },
    },
    MeshLambertMaterialCompare: {
      create() {
        return basicLambertPhongExample(THREE.MeshLambertMaterial, false, {
          color: 'black',
          emissive: 'purple',
        });
      },
    },
    MeshPhongMaterialCompare: {
      create() {
        return basicLambertPhongExample(THREE.MeshPhongMaterial, false, {
          color: 'black',
          emissive: 'purple',
          shininess: 0,
        });
      },
    },
    MeshToonMaterial: {
      create() {
        return basicLambertPhongExample(THREE.MeshToonMaterial);
      },
    },
    MeshDepthMaterial: {
      create(props) {
        const {camera} = props;
        const radius = 4;
        const tube = 1.5;
        const radialSegments = 8;
        const tubularSegments = 64;
        const p = 2;
        const q = 3;
        const geometry = new THREE.TorusKnotBufferGeometry(radius, tube, tubularSegments, radialSegments, p, q);
        const material = new THREE.MeshDepthMaterial();
        camera.near = 7;
        camera.far = 20;
        return new THREE.Mesh(geometry, material);
      },
    },
    MeshNormalMaterial: {
      create() {
        const radius = 4;
        const tube = 1.5;
        const radialSegments = 8;
        const tubularSegments = 64;
        const p = 2;
        const q = 3;
        const geometry = new THREE.TorusKnotBufferGeometry(radius, tube, tubularSegments, radialSegments, p, q);
        const material = new THREE.MeshNormalMaterial();
        return new THREE.Mesh(geometry, material);
      },
    },
    sideDefault: {
      create() {
        return sideExample(THREE.FrontSide);
      },
    },
    sideDouble: {
      create() {
        return sideExample(THREE.DoubleSide);
      },
    },
  });
}

