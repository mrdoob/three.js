'use strict';

window.threejsLessonUtils = {
  init() {
    if (this.renderer) {
      return;
    }
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas: canvas, alpha: true});
    this.pixelRatio = Math.max(2, window.devicePixelRatio);

    this.renderer = renderer;
    this.renderFuncs = [];

    const resizeRendererToDisplaySize = (renderer) => {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth * this.pixelRatio;
      const height = canvas.clientHeight * this.pixelRatio;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    };

    // Three r93 needs to render at least once for some reason.
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();

    const render = (time) => {
      time *= 0.001;

      resizeRendererToDisplaySize(renderer);

      renderer.setScissorTest(false);

      // Three r93 needs to render at least once for some reason.
      renderer.render(scene, camera);

      renderer.setScissorTest(true);

      // maybe there is another way. Originally I used `position: fixed`
      // but the problem is if we can't render as fast as the browser
      // scrolls then our shapes lag. 1 or 2 frames of lag isn't too
      // horrible but iOS would often been 1/2 a second or worse.
      // By doing it this way the canvas will scroll which means the
      // worse that happens is part of the shapes scrolling on don't
      // get drawn for a few frames but the shapes that are on the screen
      // scroll perfectly.
      //
      // I'm using `transform` on the voodoo that it doesn't affect
      // layout as much as `top` since AFAIK setting `top` is in
      // the flow but `transform` is not though thinking about it
      // the given we're `position: absolute` maybe there's no difference?
      const transform = `translateY(${window.scrollY}px)`;
      renderer.domElement.style.transform = transform;

      this.renderFuncs.forEach((fn) => {
          fn(renderer, time);
      });

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  },
  addDiagrams(diagrams) {
    [...document.querySelectorAll('[data-diagram]')].forEach((elem) => {
      const name = elem.dataset.diagram;
      const info = diagrams[name];
      if (!info) {
        throw new Error(`no diagram: ${name}`);
      }
      this.addDiagram(elem, info);
    });
  },
  addDiagram(elem, info) {
    this.init();

    const scene = new THREE.Scene();
    const fov = 60;
    const aspect = 1;
    const zNear = 0.1;
    const zFar = 50;
    const camera = new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
    camera.position.z = 15;
    scene.add(camera);

    const obj3D = info.create({scene, camera});
    const promise = (obj3D instanceof Promise) ? obj3D : Promise.resolve(obj3D);

    const root = new THREE.Object3D();
    scene.add(root);

    const controls = new THREE.TrackballControls(camera, elem);
    controls.noZoom = true;
    controls.noPan = true;

    // add the lights as children of the camera.
    // this is because TrackbacllControls move the camera.
    // We really want to rotate the object itself but there's no
    // controls for that so we fake it by putting all the lights
    // on the camera so they move with it.
    camera.add(new THREE.HemisphereLight(0xaaaaaa, 0x444444, .5));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-1, 2, 4 - 15);
    camera.add(light);

    let updateFunction;

    promise.then((result) => {
      const info = result instanceof THREE.Object3D ? {
        obj3D: result,
      } : result;
      const { obj3D, update } = info;
      root.add(obj3D);
      updateFunction = update;
    });

    let oldWidth = -1;
    let oldHeight = -1;

    const render = (renderer, time) => {
      root.rotation.x = time * .1;
      root.rotation.y = time * .11;

      const rect = elem.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top  > renderer.domElement.clientHeight ||
          rect.right  < 0 || rect.left > renderer.domElement.clientWidth) {
        return;
      }

      const width  = (rect.right - rect.left) * this.pixelRatio;
      const height = (rect.bottom - rect.top) * this.pixelRatio;
      const left   = rect.left * this.pixelRatio;
      const top    = rect.top * this.pixelRatio;

      if (width !== oldWidth || height !== oldHeight) {
        oldWidth = width;
        oldHeight = height;
        controls.handleResize();
      }
      controls.update();

      if (updateFunction) {
        updateFunction(time);
      }

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
    };

    this.renderFuncs.push(render);
  },
};


