import * as THREE from '../../resources/threejs/r114/build/three.module.js';
import {threejsLessonUtils} from './threejs-lesson-utils.js';

{
  const loader = new THREE.TextureLoader();
  const texture = loader.load('../resources/images/star-light.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 1);

  function makeMesh(geometry) {
    const material = new THREE.MeshPhongMaterial({
      color: 'hsl(300,50%,50%)',
      side: THREE.DoubleSide,
      map: texture,
    });
    return new THREE.Mesh(geometry, material);
  }

  threejsLessonUtils.addDiagrams({
    geometryCylinder: {
      create() {
        const numSegments = 24;
        const geometry = new THREE.Geometry();
        const wrap = ndx => ndx % (numSegments * 2);
        for (let s = 0; s < numSegments; ++s) {
          const u = s / numSegments;
          const a = u * Math.PI * 2;
          const x = Math.sin(a);
          const z = Math.cos(a);
          geometry.vertices.push(new THREE.Vector3(x, -1, z));
          geometry.vertices.push(new THREE.Vector3(x,  1, z));

          // share the start and end positions
          const ndx = s * 2;
          geometry.faces.push(new THREE.Face3(ndx, wrap(ndx + 2), ndx + 1));
          geometry.faces.push(new THREE.Face3(ndx + 1, wrap(ndx + 2), wrap(ndx + 3)));

          const u2 = (s + 1) / numSegments;
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(u, 0),
            new THREE.Vector2(u2, 0),
            new THREE.Vector2(u, 1),
          ]);
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(u, 1),
            new THREE.Vector2(u2, 0),
            new THREE.Vector2(u2, 1),
          ]);
        }

        geometry.computeVertexNormals();
        geometry.scale(5, 5, 5);
        return makeMesh(geometry);
      },
    },
    bufferGeometryCylinder: {
      create() {
        const numSegments = 24;
        const positions = [];
        const uvs = [];
        for (let s = 0; s <= numSegments; ++s) {
          const u = s / numSegments;
          const a = u * Math.PI * 2;
          const x = Math.sin(a);
          const z = Math.cos(a);
          positions.push(x, -1, z);
          positions.push(x,  1, z);
          uvs.push(u, 0);
          uvs.push(u, 1);
        }

        const indices = [];
        for (let s = 0; s < numSegments; ++s) {
          const ndx = s * 2;
          indices.push(
            ndx, ndx + 2, ndx + 1,
            ndx + 1, ndx + 2, ndx + 3,
          );
        }

        const positionNumComponents = 3;
        const uvNumComponents = 2;
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
        geometry.setAttribute(
            'uv',
            new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));

        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        geometry.scale(5, 5, 5);
        return makeMesh(geometry);
      },
    },
  });

}