import * as THREE from '../../resources/threejs/r112/build/three.module.js';
import {threejsLessonUtils} from './threejs-lesson-utils.js';

{
  const darkColors = {
    lines: '#DDD',
  };
  const lightColors = {
    lines: '#000',
  };

  const darkMatcher = window.matchMedia('(prefers-color-scheme: dark)');
  const isDarkMode = darkMatcher.matches;
  const colors = isDarkMode ? darkColors : lightColors;

  const diagrams = {
    BoxBufferGeometry: {
      create() {
        const width = 8;
        const height = 8;
        const depth = 8;
        const geometry = new THREE.BoxBufferGeometry(width, height, depth);
        return geometry;
      },
    },
    CircleBufferGeometry: {
      create() {
        const radius = 7;
        const segments = 24;
        const geometry = new THREE.CircleBufferGeometry(radius, segments);
        return geometry;
      },
    },
    ConeBufferGeometry: {
      create() {
        const radius = 6;
        const height = 8;
        const segments = 16;
        const geometry = new THREE.ConeBufferGeometry(radius, height, segments);
        return geometry;
      },
    },
    CylinderBufferGeometry: {
      create() {
        const radiusTop = 4;
        const radiusBottom = 4;
        const height = 8;
        const radialSegments = 12;
        const geometry = new THREE.CylinderBufferGeometry(radiusTop, radiusBottom, height, radialSegments);
        return geometry;
      },
    },
    DodecahedronBufferGeometry: {
      create() {
        const radius = 7;
        const geometry = new THREE.DodecahedronBufferGeometry(radius);
        return geometry;
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

        const geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
        return geometry;
      },
    },
    IcosahedronBufferGeometry: {
      create() {
        const radius = 7;
        const geometry = new THREE.IcosahedronBufferGeometry(radius);
        return geometry;
      },
    },
    LatheBufferGeometry: {
      create() {
        const points = [];
        for (let i = 0; i < 10; ++i) {
          points.push(new THREE.Vector2(Math.sin(i * 0.2) * 3 + 3, (i - 5) * .8));
        }
        const geometry = new THREE.LatheBufferGeometry(points);
        return geometry;
      },
    },
    OctahedronBufferGeometry: {
      create() {
        const radius = 7;
        const geometry = new THREE.OctahedronBufferGeometry(radius);
        return geometry;
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
        const geometry = new THREE.ParametricBufferGeometry(klein, slices, stacks);
        return geometry;
      },
    },
    PlaneBufferGeometry: {
      create() {
        const width = 9;
        const height = 9;
        const widthSegments = 2;
        const heightSegments = 2;
        const geometry = new THREE.PlaneBufferGeometry(width, height, widthSegments, heightSegments);
        return geometry;
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
        const geometry = new THREE.PolyhedronBufferGeometry(verticesOfCube, indicesOfFaces, radius, detail);
        return geometry;
      },
    },
    RingBufferGeometry: {
      create() {
        const innerRadius = 2;
        const outerRadius = 7;
        const segments = 18;
        const geometry = new THREE.RingBufferGeometry(innerRadius, outerRadius, segments);
        return geometry;
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
        const geometry = new THREE.ShapeBufferGeometry(shape);
        return geometry;
      },
    },
    SphereBufferGeometry: {
      create() {
        const radius = 7;
        const widthSegments = 12;
        const heightSegments = 8;
        const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
        return geometry;
      },
    },
    TetrahedronBufferGeometry: {
      create() {
        const radius = 7;
        const geometry = new THREE.TetrahedronBufferGeometry(radius);
        return geometry;
      },
    },
    TextBufferGeometry: {
      async create() {
        const loader = new THREE.FontLoader();
        // promisify font loading
        function loadFont(url) {
          return new Promise((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
          });
        }

        const font = await loadFont('/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json');
        return new THREE.TextBufferGeometry('three.js', {
          font: font,
          size: 3.0,
          height: .2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.15,
          bevelSize: .3,
          bevelSegments: 5,
        });
      },
    },
    TorusBufferGeometry: {
      create() {
        const radius = 5;
        const tubeRadius = 2;
        const radialSegments = 8;
        const tubularSegments = 24;
        const geometry = new THREE.TorusBufferGeometry(radius, tubeRadius, radialSegments, tubularSegments);
        return geometry;
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
        const geometry = new THREE.TorusKnotBufferGeometry(radius, tube, tubularSegments, radialSegments, p, q);
        return geometry;
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
        const geometry = new THREE.TubeBufferGeometry(path, tubularSegments, radius, radialSegments, closed);
        return geometry;
      },
    },
    EdgesGeometry: {
      create() {
        const width = 8;
        const height = 8;
        const depth = 8;
        const thresholdAngle = 15;
        const geometry = new THREE.EdgesGeometry(
            new THREE.BoxBufferGeometry(width, height, depth),
            thresholdAngle);
        return { lineGeometry: geometry };
      },
      nonBuffer: false,
    },
    WireframeGeometry: {
      create() {
        const width = 8;
        const height = 8;
        const depth = 8;
        const geometry = new THREE.WireframeGeometry(new THREE.BoxBufferGeometry(width, height, depth));
        return { lineGeometry: geometry };
      },
      nonBuffer: false,
    },
    Points: {
      create() {
        const radius = 7;
        const widthSegments = 12;
        const heightSegments = 8;
        const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
        const material = new THREE.PointsMaterial({
            color: 'red',
            size: 0.2,
        });
        const points = new THREE.Points(geometry, material);
        return {
          showLines: false,
          mesh: points,
        };
      },
    },
    PointsUniformSize: {
      create() {
        const radius = 7;
        const widthSegments = 12;
        const heightSegments = 8;
        const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
        const material = new THREE.PointsMaterial({
            color: 'red',
            size: 3 * window.devicePixelRatio,
            sizeAttenuation: false,
        });
        const points = new THREE.Points(geometry, material);
        return {
          showLines: false,
          mesh: points,
        };
      },
    },
    SphereBufferGeometryLow: {
      create() {
        const radius = 7;
        const widthSegments = 5;
        const heightSegments = 3;
        const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
        return geometry;
      },
    },
    SphereBufferGeometryMedium: {
      create() {
        const radius = 7;
        const widthSegments = 24;
        const heightSegments = 10;
        const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
        return geometry;
      },
    },
    SphereBufferGeometryHigh: {
      create() {
        const radius = 7;
        const widthSegments = 50;
        const heightSegments = 50;
        const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
        return geometry;
      },
    },
    SphereBufferGeometryLowSmooth: {
      create() {
        const radius = 7;
        const widthSegments = 5;
        const heightSegments = 3;
        const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
        return geometry;
      },
      showLines: false,
      flatShading: false,
    },
    SphereBufferGeometryMediumSmooth: {
      create() {
        const radius = 7;
        const widthSegments = 24;
        const heightSegments = 10;
        const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
        return geometry;
      },
      showLines: false,
      flatShading: false,
    },
    SphereBufferGeometryHighSmooth: {
      create() {
        const radius = 7;
        const widthSegments = 50;
        const heightSegments = 50;
        const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
        return geometry;
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
        const geometry = new THREE.PlaneBufferGeometry(width, height, widthSegments, heightSegments);
        return geometry;
      },
    },
    PlaneBufferGeometryHigh: {
      create() {
        const width = 9;
        const height = 9;
        const widthSegments = 10;
        const heightSegments = 10;
        const geometry = new THREE.PlaneBufferGeometry(width, height, widthSegments, heightSegments);
        return geometry;
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

    const rawLines = info.create.toString()
        .replace(/ +return geometry;\n/, '')
        .replace(/ +return { lineGeometry: geometry };\n/, '')
        .split(/\n/);
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

      if (geometry.mesh) {
        root.add(geometry.mesh);
      } else {
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
              color: geometryInfo.geometry ? 0xffffff : colors.lines,
              transparent: true,
              opacity: 0.5,
            }));
          lineMesh.position.copy(centerOffset);
          root.add(lineMesh);
        }
      }

      threejsLessonUtils.addDiagram(elem, {create: () => root});
    });
  }
}