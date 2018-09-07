'use strict';

/* global THREE, threejsLessonUtils */

{
  const diagrams = {
    BoxBufferGeometry: {
      create() {
        const width = 8;
        const height = 8;
        const depth = 8;
        return new THREE.BoxBufferGeometry(width, height, depth);
      },
    },
    CircleBufferGeometry: {
      create() {
        const radius = 7;
        const segments = 24;
        return new THREE.CircleBufferGeometry(radius, segments);
      },
    },
    ConeBufferGeometry: {
      create() {
        const radius = 6;
        const height = 8;
        const segments = 16;
        return new THREE.ConeBufferGeometry(radius, height, segments);
      },
    },
    CylinderBufferGeometry: {
      create() {
        const radiusTop = 4;
        const radiusBottom = 4;
        const height = 8;
        const radialSegments = 12;
        return new THREE.CylinderBufferGeometry(radiusTop, radiusBottom, height, radialSegments);
      },
    },
    DodecahedronBufferGeometry: {
      create() {
        const radius = 7;
        return new THREE.DodecahedronBufferGeometry(radius);
      },
    },
    ExtrudeBufferGeometry: {
      create() {
        const shape = new THREE.Shape();
        const x = -2.5;
        const y = -5;
        shape.moveTo(x + 2.5, y + 2.5);
        shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
        shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
        shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
        shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
        shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
        shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

        const extrudeSettings = {
          steps: 2,
          depth: 2,
          bevelEnabled: true,
          bevelThickness: 1,
          bevelSize: 1,
          bevelSegments: 2,
        };

        return new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
      },
    },
    IcosahedronBufferGeometry: {
      create() {
        const radius = 7;
        return new THREE.IcosahedronBufferGeometry(radius);
      },
    },
    LatheBufferGeometry: {
      create() {
        const points = [];
        for (let i = 0; i < 10; ++i) {
          points.push(new THREE.Vector2(Math.sin(i * 0.2) * 3 + 3, (i - 5) * .8));
        }
        return new THREE.LatheBufferGeometry(points);
      },
    },
    OctahedronBufferGeometry: {
      create() {
        const radius = 7;
        return new THREE.OctahedronBufferGeometry(radius);
      },
    },
    ParametricBufferGeometry: {
      /*
      from: https://github.com/mrdoob/three.js/blob/b8d8a8625465bd634aa68e5846354d69f34d2ff5/examples/js/ParametricGeometries.js

      The MIT License

      Copyright © 2010-2018 three.js authors

      Permission is hereby granted, free of charge, to any person obtaining a copy
      of this software and associated documentation files (the "Software"), to deal
      in the Software without restriction, including without limitation the rights
      to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
      copies of the Software, and to permit persons to whom the Software is
      furnished to do so, subject to the following conditions:

      The above copyright notice and this permission notice shall be included in
      all copies or substantial portions of the Software.

      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
      OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
      THE SOFTWARE.

      */
      create() {
        // from: https://github.com/mrdoob/three.js/blob/b8d8a8625465bd634aa68e5846354d69f34d2ff5/examples/js/ParametricGeometries.js
        function klein(v, u, target) {
          u *= Math.PI;
          v *= 2 * Math.PI;
          u = u * 2;

          let x;
          let z;

          if (u < Math.PI) {
              x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v);
              z = -8 * Math.sin(u) - 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
          } else {
              x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI);
              z = -8 * Math.sin(u);
          }

          const y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v);

          target.set(x, y, z).multiplyScalar(0.75);
        }

        const slices = 25;
        const stacks = 25;
        return new THREE.ParametricBufferGeometry(klein, slices, stacks);
      },
    },
    PlaneBufferGeometry: {
      create() {
        const width = 9;
        const height = 9;
        const widthSegments = 2;
        const heightSegments = 2;
        return new THREE.PlaneBufferGeometry(width, height, widthSegments, heightSegments);
      },
    },
    PolyhedronBufferGeometry: {
      create() {
        const verticesOfCube = [
            -1, -1, -1,    1, -1, -1,    1,  1, -1,    -1,  1, -1,
            -1, -1,  1,    1, -1,  1,    1,  1,  1,    -1,  1,  1,
        ];
        const indicesOfFaces = [
            2, 1, 0,    0, 3, 2,
            0, 4, 7,    7, 3, 0,
            0, 1, 5,    5, 4, 0,
            1, 2, 6,    6, 5, 1,
            2, 3, 7,    7, 6, 2,
            4, 5, 6,    6, 7, 4,
        ];
        const radius = 7;
        const detail = 2;
        return new THREE.PolyhedronBufferGeometry(verticesOfCube, indicesOfFaces, radius, detail);
      },
    },
    RingBufferGeometry: {
      create() {
        const innerRadius = 2;
        const outerRadius = 7;
        const segments = 18;
        return new THREE.RingBufferGeometry(innerRadius, outerRadius, segments);
      },
    },
    ShapeBufferGeometry: {
      create() {
        const shape = new THREE.Shape();
        const x = -2.5;
        const y = -5;
        shape.moveTo(x + 2.5, y + 2.5);
        shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
        shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
        shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
        shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
        shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
        shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);
        return new THREE.ShapeBufferGeometry(shape);
      },
    },
    SphereBufferGeometry: {
      create() {
        const radius = 7;
        const widthSegments = 12;
        const heightSegments = 8;
        return new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
      },
    },
    TetrahedronBufferGeometry: {
      create() {
        const radius = 7;
        return new THREE.TetrahedronBufferGeometry(radius);
      },
    },
    TextBufferGeometry: {
      create() {
        return new Promise((resolve) => {
          const loader = new THREE.FontLoader();

          loader.load('../resources/threejs/fonts/helvetiker_regular.typeface.json', (font) => {
            resolve(new THREE.TextBufferGeometry('three.js', {
              font: font,
              size: 3.0,
              height: .2,
              curveSegments: 12,
              bevelEnabled: true,
              bevelThickness: 0.15,
              bevelSize: .3,
              bevelSegments: 5,
            }));
          });
        });
      },
    },
    TorusBufferGeometry: {
      create() {
        const radius = 5;
        const tubeRadius = 2;
        const radialSegments = 8;
        const tubularSegments = 24;
        return new THREE.TorusBufferGeometry(radius, tubeRadius, radialSegments, tubularSegments);
      },
    },
    TorusKnotBufferGeometry: {
      create() {
        const radius = 3.5;
        const tube = 1.5;
        const radialSegments = 8;
        const tubularSegments = 64;
        const p = 2;
        const q = 3;
        return new THREE.TorusKnotBufferGeometry(radius, tube, tubularSegments, radialSegments, p, q);
      },
    },
    TubeBufferGeometry: {
      create() {
        class CustomSinCurve extends THREE.Curve {
          constructor(scale) {
            super();
            this.scale = scale;
          }
          getPoint(t) {
            const tx = t * 3 - 1.5;
            const ty = Math.sin(2 * Math.PI * t);
            const tz = 0;
            return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
          }
        }

        const path = new CustomSinCurve(4);
        const tubularSegments = 20;
        const radius = 1;
        const radialSegments = 8;
        const closed = false;
        return new THREE.TubeBufferGeometry(path, tubularSegments, radius, radialSegments, closed);
      },
    },
    EdgesGeometry: {
      create() {
        const width = 8;
        const height = 8;
        const depth = 8;
        return {
          lineGeometry: new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(width, height, depth)),
        };
      },
      nonBuffer: false,
    },
    WireframeGeometry: {
      create() {
        const width = 8;
        const height = 8;
        const depth = 8;
        return {
          lineGeometry: new THREE.WireframeGeometry(new THREE.BoxBufferGeometry(width, height, depth)),
        };
      },
      nonBuffer: false,
    },
    SphereBufferGeometryLow: {
      create() {
        const radius = 7;
        const widthSegments = 5;
        const heightSegments = 3;
        return new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
      },
    },
    SphereBufferGeometryMedium: {
      create() {
        const radius = 7;
        const widthSegments = 24;
        const heightSegments = 10;
        return new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
      },
    },
    SphereBufferGeometryHigh: {
      create() {
        const radius = 7;
        const widthSegments = 50;
        const heightSegments = 50;
        return new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
      },
    },
    SphereBufferGeometryLowSmooth: {
      create() {
        const radius = 7;
        const widthSegments = 5;
        const heightSegments = 3;
        return new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
      },
      showLines: false,
      flatShading: false,
    },
    SphereBufferGeometryMediumSmooth: {
      create() {
        const radius = 7;
        const widthSegments = 24;
        const heightSegments = 10;
        return new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
      },
      showLines: false,
      flatShading: false,
    },
    SphereBufferGeometryHighSmooth: {
      create() {
        const radius = 7;
        const widthSegments = 50;
        const heightSegments = 50;
        return new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
      },
      showLines: false,
      flatShading: false,
    },
    PlaneBufferGeometryLow: {
      create() {
        const width = 9;
        const height = 9;
        const widthSegments = 1;
        const heightSegments = 1;
        return new THREE.PlaneBufferGeometry(width, height, widthSegments, heightSegments);
      },
    },
    PlaneBufferGeometryHigh: {
      create() {
        const width = 9;
        const height = 9;
        const widthSegments = 10;
        const heightSegments = 10;
        return new THREE.PlaneBufferGeometry(width, height, widthSegments, heightSegments);
      },
    },
  };

  function addLink(parent, name) {
    const a = document.createElement('a');
    a.href = `https://threejs.org/docs/#api/geometries/${name}`;
    const code = document.createElement('code');
    code.textContent = name;
    a.appendChild(code);
    parent.appendChild(a);
    return a;
  }

  function addElem(parent, type, className, text) {
    const elem = document.createElement(type);
    elem.className = className;
    if (text) {
      elem.textContent = text;
    }
    parent.appendChild(elem);
    return elem;
  }

  function addDiv(parent, className) {
    return addElem(parent, 'div', className);
  }

  [...document.querySelectorAll('[data-diagram]')].forEach(createDiagram);
  [...document.querySelectorAll('[data-primitive]')].forEach(createPrimitiveDOM);

  function createPrimitiveDOM(base) {
    const name = base.dataset.primitive;
    const info = diagrams[name];
    if (!info) {
      throw new Error(`no primitive ${name}`);
    }

    const text = base.innerHTML;
    base.innerHTML = '';

    const pair = addDiv(base, 'pair');
    const elem = addDiv(pair, 'shape');

    const right = addDiv(pair, 'desc');
    addLink(right, name);
    if (info.nonBuffer !== false) {
      addElem(right, 'span', '', ', ');
      addLink(right, name.replace('Buffer', ''));
    }
    addDiv(right, '.note').innerHTML = text;

    const rawLines = info.create.toString().replace('return new', 'const geometry = new').split(/\n/);
    const createRE = /^( *)[^ ]/;
    const m = createRE.exec(rawLines[1]);
    const prefixLen = m[1].length;
    const trimmedLines = rawLines.slice(1, rawLines.length - 1).map(line => line.substring(prefixLen));

    addElem(base, 'pre', 'prettyprint showmods', trimmedLines.join('\n'));

    return createLiveImage(elem, info);
  }

  function createDiagram(base) {
    const name = base.dataset.diagram;
    const info = diagrams[name];
    if (!info) {
      throw new Error(`no primitive ${name}`);
    }
    return createLiveImage(base, info);
  }

  function createLiveImage(elem, info) {
    const geometry = info.create();
    const promise = (geometry instanceof Promise) ? geometry : Promise.resolve(geometry);
    promise.then((geometryInfo) => {
      if (geometryInfo instanceof THREE.BufferGeometry ||
          geometryInfo instanceof THREE.Geometry) {
        const geometry = geometryInfo;
        geometryInfo = {
          geometry,
        };
      }

      const root = new THREE.Object3D();

      const boxGeometry = geometryInfo.geometry || geometryInfo.lineGeometry;
      boxGeometry.computeBoundingBox();
      const centerOffset = new THREE.Vector3();
      boxGeometry.boundingBox.getCenter(centerOffset).multiplyScalar(-1);

      if (geometryInfo.geometry) {
        const material = new THREE.MeshPhongMaterial({
          flatShading: info.flatShading === false ? false : true,
          side: THREE.DoubleSide,
        });
        material.color.setHSL(Math.random(), .5, .5);
        const mesh = new THREE.Mesh(geometryInfo.geometry, material);
        mesh.position.copy(centerOffset);
        root.add(mesh);
      }
      if (info.showLines !== false) {
        const lineMesh = new THREE.LineSegments(
          geometryInfo.lineGeometry || geometryInfo.geometry,
          new THREE.LineBasicMaterial({
            color: geometryInfo.geometry ? 0xffffff : 0x000000,
            transparent: true,
            opacity: 0.5,
          }));
        lineMesh.position.copy(centerOffset);
        root.add(lineMesh);
      }

      threejsLessonUtils.addDiagram(elem, {create: () => root});
    });
  }
}