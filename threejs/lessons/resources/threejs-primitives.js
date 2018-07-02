'use strict';

function main() {

  const primitives = {
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
      create() {
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
        function klein(v, u, target) {
          u *= Math.PI;
          v *= 2 * Math.PI;
          u = u * 2;

          let x;
          let y;
          let z;

          if (u < Math.PI) {
              x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v);
              z = -8 * Math.sin(u) - 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
          } else {
              x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI);
              z = -8 * Math.sin(u);
          }

          y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v);

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

  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas: canvas, alpha: true});

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

  const renderFuncs = [
    ...[...document.querySelectorAll('[data-primitive]')].map(createPrimitiveDOM),
    ...[...document.querySelectorAll('[data-primitive-diagram]')].map(createPrimitiveDiagram),
  ];

  function createPrimitiveDOM(base) {
    const name = base.dataset.primitive;
    const info = primitives[name];
    if (!info) {
      throw new Error(`no primitive ${name}`);
    }

    const text = base.innerHTML;
    base.innerHTML = '';

    const elem = addDiv(base, 'shape');

    const right = addDiv(base, 'desc');
    addLink(right, name);
    if (info.nonBuffer !== false) {
      addElem(right, 'span', '', ', ');
      addLink(right, name.replace('Buffer', ''));
    }
    addDiv(right, '.note').innerHTML = text;

    return createPrimitive(elem, info);
  }

  function createPrimitiveDiagram(base) {
    const name = base.dataset.primitiveDiagram;
    const info = primitives[name];
    if (!info) {
      throw new Error(`no primitive ${name}`);
    }
    return createPrimitive(base, info);
  }

  function createPrimitive(elem, info) {
    const geometry = info.create();
    const promise = (geometry instanceof Promise) ? geometry : Promise.resolve(geometry);
    const scene = new THREE.Scene();

    const root = new THREE.Object3D();
    scene.add(root);

    scene.add(new THREE.HemisphereLight(0xaaaaaa, 0x444444));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-1, 2, 4);
    scene.add(light);

    const fov = 60;
    const aspect = 1;
    const zNear = 0.1;
    const zFar = 50;
    const camera = new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
    camera.position.z = 15;

    const controls = new THREE.TrackballControls(camera, elem);
    controls.noZoom = true;
    controls.noPan = true;

    promise.then((geometryInfo) => {
      if (geometryInfo instanceof THREE.BufferGeometry ||
          geometryInfo instanceof THREE.Geometry) {
        const geometry = geometryInfo;
        geometryInfo = {
          geometry,
        };
      }

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
    });

    let oldWidth = -1;
    let oldHeight = -1;

    function render(renderer, time) {
      root.rotation.x = time * .1;
      root.rotation.y = time * .11;

      const rect = elem.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top  > renderer.domElement.clientHeight ||
          rect.right  < 0 || rect.left > renderer.domElement.clientWidth) {
        return;
      }

      const width  = (rect.right - rect.left) * pixelRatio;
      const height = (rect.bottom - rect.top) * pixelRatio;
      const left   = rect.left * pixelRatio;
      const top    = rect.top * pixelRatio;

      if (width !== oldWidth || height !== oldHeight) {
        controls.handleResize();
      }
      controls.update();

      const aspect = width / height;
      const targetFov = THREE.Math.degToRad(60);
      const fov = aspect >= 1
        ? targetFov
        : (2 * Math.atan(Math.tan(targetFov * .5) / aspect));

      camera.fov = THREE.Math.radToDeg(fov);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();

      renderer.setViewport(left, top, width, height);
      renderer.setScissor(left, top, width, height);
      renderer.render(scene, camera);
    }

    return render;
  }

  const pixelRatio = 2;  // even on low-res we want hi-res rendering

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth * pixelRatio;
    const height = canvas.clientHeight * pixelRatio;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  // Three r93 needs to render at least once for some reason.
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();

  function render(time) {
    time *= 0.001;

    resizeRendererToDisplaySize(renderer);

    renderer.setScissorTest(false);

    // Three r93 needs to render at least once for some reason.
    renderer.render(scene, camera);

    renderer.setScissorTest(true);

    renderFuncs.forEach((fn) => {
      fn(renderer, time);
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();


