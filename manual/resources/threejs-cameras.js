import * as THREE from '../../build/three.module.js';
import {threejsLessonUtils} from './threejs-lesson-utils.js';

{
  function addShape(color, geometry) {
    const material = new THREE.MeshPhongMaterial({color});
    return new THREE.Mesh(geometry, material);
  }

  threejsLessonUtils.addDiagrams({
    shapeCube: {
      create() {
        const width = 8;
        const height = 8;
        const depth = 8;
        return addShape('hsl(150,100%,40%)', new THREE.BoxGeometry(width, height, depth));
      },
    },
    shapeCone: {
      create() {
        const radius = 6;
        const height = 8;
        const segments = 24;
        return addShape('hsl(160,100%,40%)', new THREE.ConeGeometry(radius, height, segments));
      },
    },
    shapeCylinder: {
      create() {
        const radiusTop = 4;
        const radiusBottom = 4;
        const height = 8;
        const radialSegments = 24;
        return addShape('hsl(170,100%,40%)', new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments));
      },
    },
    shapeSphere: {
      create() {
        const radius = 5;
        const widthSegments = 24;
        const heightSegments = 16;
        return addShape('hsl(180,100%,40%)', new THREE.SphereGeometry(radius, widthSegments, heightSegments));
      },
    },
    shapeFrustum: {
      create() {
        const width = 8;
        const height = 8;
        const depth = 8;
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const perspMat = new THREE.Matrix4();
        perspMat.makePerspective(-3, 3, -3, 3, 4, 12);
        const inMat = new THREE.Matrix4();
        inMat.makeTranslation(0, 0, 8);

        const mat = new THREE.Matrix4();
        mat.multiply(perspMat);
        mat.multiply(inMat);

        geometry.applyMatrix4(mat);
        geometry.computeBoundingBox();
        geometry.center();
        geometry.scale(3, 3, 3);
        geometry.rotateY(Math.PI);
        geometry.computeVertexNormals();

        return addShape('hsl(190,100%,40%)', geometry);
      },
    },
  });
}