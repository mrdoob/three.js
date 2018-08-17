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
    let targetFOVDeg = 60;
    const aspect = 1;
    const zNear = 0.1;
    const zFar = 50;
    const camera = new THREE.PerspectiveCamera(targetFOVDeg, aspect, zNear, zFar);
    camera.position.z = 15;
    scene.add(camera);

    const root = new THREE.Object3D();
    scene.add(root);

    const renderInfo = {
      pixelRatio: this.pixelRatio,
      camera,
      scene,
      root,
      renderer: this.renderer,
      elem,
    };

    const obj3D = info.create({scene, camera, renderInfo});
    const promise = (obj3D instanceof Promise) ? obj3D : Promise.resolve(obj3D);

    const updateFunctions = [];
    const resizeFunctions = [];

    const settings = {
      lights: true,
      trackball: true,
      // resize(renderInfo) {
      // },
      // update(time, renderInfo) {
      // },
      render(renderInfo) {
        renderInfo.renderer.render(renderInfo.scene, renderInfo.camera);
      },
    };

    promise.then((result) => {
      const info = result instanceof THREE.Object3D ? {
        obj3D: result,
      } : result;
      if (info.obj3D) {
        root.add(info.obj3D);
      }
      if (info.update) {
        updateFunctions.push(info.update);
      }
      if (info.resize) {
        resizeFunctions.push(info.resize);
      }

      Object.assign(settings, info);
      targetFOVDeg = camera.fov;

      if (settings.trackball !== false) {
        const controls = new THREE.TrackballControls(camera, elem);
        controls.noZoom = true;
        controls.noPan = true;
        resizeFunctions.push(controls.handleResize.bind(controls));
        updateFunctions.push(controls.update.bind(controls));
      }

      // add the lights as children of the camera.
      // this is because TrackbacllControls move the camera.
      // We really want to rotate the object itself but there's no
      // controls for that so we fake it by putting all the lights
      // on the camera so they move with it.
      if (settings.lights !== false) {
        camera.add(new THREE.HemisphereLight(0xaaaaaa, 0x444444, .5));
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(-1, 2, 4 - 15);
        camera.add(light);
      }
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

      renderInfo.width = (rect.right - rect.left) * this.pixelRatio;
      renderInfo.height = (rect.bottom - rect.top) * this.pixelRatio;
      renderInfo.left = rect.left * this.pixelRatio;
      renderInfo.top = rect.top * this.pixelRatio;

      if (renderInfo.width !== oldWidth || renderInfo.height !== oldHeight) {
        oldWidth = renderInfo.width;
        oldHeight = renderInfo.height;
        resizeFunctions.forEach(fn => fn(renderInfo));
      }

      updateFunctions.forEach(fn => fn(time, renderInfo));

      const aspect = renderInfo.width / renderInfo.height;
      const fovDeg = aspect >= 1
        ? targetFOVDeg
        : THREE.Math.radToDeg(2 * Math.atan(Math.tan(THREE.Math.degToRad(targetFOVDeg) * .5) / aspect));

      camera.fov = fovDeg;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();

      renderer.setViewport(renderInfo.left, renderInfo.top, renderInfo.width, renderInfo.height);
      renderer.setScissor(renderInfo.left, renderInfo.top, renderInfo.width, renderInfo.height);

      settings.render(renderInfo);
    };

    this.renderFuncs.push(render);
  },
};


