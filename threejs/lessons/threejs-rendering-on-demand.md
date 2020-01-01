Title: Three.js Rendering on Demand
Description: How to use less energy.
TOC: Rendering On Demand

The topic might be obvious to many people but just in case ... most Three.js
examples render continuously. In other words they setup a
`requestAnimationFrame` loop or "*rAF loop*" something like this

```js
function render() {
  ...
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
```

For something that animates this makes sense but what about for something that
does not animate? In that case rendering continuously is a waste of the devices
power and if the user is on portable device it wastes the user's battery. 

The most obvious way to solve this is to render once at the start and then
render only when something changes. Changes include textures or models finally
loading, data arriving from some external source, the user adjusting a setting
or the camera or giving other relevant input.

Let's take an example from [the article on responsiveness](threejs-responsive.html)
and modify it to render on demand.

First we'll add in the `OrbitControls` so there is something that could change
that we can render in response to.

```js
import * as THREE from './resources/three/r112/build/three.module.js';
+import {OrbitControls} from './resources/threejs/r112/examples/jsm/controls/OrbitControls.js';
```

and set them up

```js
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

+const controls = new OrbitControls(camera, canvas);
+controls.target.set(0, 0, 0);
+controls.update();
```

Since we won't be animating the cubes anymore we no longer need to keep track of them

```js
-const cubes = [
-  makeInstance(geometry, 0x44aa88,  0),
-  makeInstance(geometry, 0x8844aa, -2),
-  makeInstance(geometry, 0xaa8844,  2),
-];
+makeInstance(geometry, 0x44aa88,  0);
+makeInstance(geometry, 0x8844aa, -2);
+makeInstance(geometry, 0xaa8844,  2);
```

We can remove the code to animate the cubes and the calls to `requestAnimationFrame`

```js
-function render(time) {
-  time *= 0.001;
+function render() {

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

-  cubes.forEach((cube, ndx) => {
-    const speed = 1 + ndx * .1;
-    const rot = time * speed;
-    cube.rotation.x = rot;
-    cube.rotation.y = rot;
-  });

  renderer.render(scene, camera);

-  requestAnimationFrame(render);
}

-requestAnimationFrame(render);
```

then we need to render once

```js
render();
```

We need to render anytime the `OrbitControls` change the camera settings.
Fortunately the `OrbitControls` dispatch a `change` event anytime something
changes.

```js
controls.addEventListener('change', render);
```

We also need to handle the case where the user resizes the window. That was
handled automatically before since we were rendering continuously but now what
we are not we need to render when the window changes size.

```js
window.addEventListener('resize', render);
```

And with that we get something that renders on demand.

{{{example url="../threejs-render-on-demand.html" }}}

The `OrbitControls` have options to add a kind of inertia to make them feel less
stiff. We can enable this by setting the `enableDamping` property to true.

```js
controls.enableDamping = true;
```

With `enableDamping` on we need to call `controls.update` in our render function
so that the `OrbitControls` can continue to give us new camera settings as they
smooth out the movement. But, that means we can't call `render` directly from
the `change` event because we'll end up in an infinite loop. The controls will
send us a `change` event and call `render`, `render` will call `controls.update`.
`controls.update` will send another `change` event.

We can fix that by using `requestAnimationFrame` to call `render` but we need to
make sure we only ask for a new frame if one has not already been requested
which we can do by keeping a variable that tracks if we've already requested a frame.

```js
+let renderRequested = false;

function render() {
+  renderRequested = false;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}
render();

+function requestRenderIfNotRequested() {
+  if (!renderRequested) {
+    renderRequested = true;
+    requestAnimationFrame(render);
+  }
+}

-controls.addEventListener('change', render);
+controls.addEventListener('change', requestRenderIfNotRequested);
```

We should probably also use `requestRenderIfNotRequested` for resizing as well

```js
-window.addEventListener('resize', render);
+window.addEventListener('resize', requestRenderIfNotRequested);
```

It might be hard to see the difference. Try clicking on the example below and
use the arrow keys to move around or dragging to spin. Then try clicking on the
example above and do the same thing and you should be able to tell the
difference. The one above snaps when you press an arrow key or drag, the one
below slides.

{{{example url="../threejs-render-on-demand-w-damping.html" }}}

Let's also add a simple dat.GUI GUI and make its changes render on demand.

```js
import * as THREE from './resources/three/r112/build/three.module.js';
import {OrbitControls} from './resources/threejs/r112/examples/jsm/controls/OrbitControls.js';
+import {GUI} from '../3rdparty/dat.gui.module.js';
```

Let's allow setting the color and x scale of each cube. To be able to set the
color we'll use the `ColorGUIHelper` we created in the [article on
lights](threejs-lights.html).

First we need to create a GUI

```js
const gui = new GUI();
```

and then for each cube we'll create a folder and add 2 controls, one for
`material.color` and another for `cube.scale.x`.

```js
function makeInstance(geometry, color, x) {
  const material = new THREE.MeshPhongMaterial({color});

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.x = x;

+  const folder = gui.addFolder(`Cube${x}`);
+  folder.addColor(new ColorGUIHelper(material, 'color'), 'value')
+      .name('color')
+      .onChange(requestRenderIfNotRequested);
+  folder.add(cube.scale, 'x', .1, 1.5)
+      .name('scale x')
+      .onChange(requestRenderIfNotRequested);
+  folder.open();

  return cube;
}
```

You can see above dat.GUI controls have an `onChange` method that you can pass a
callback to be called when the GUI changes a value. In our case we just need it
to call `requestRenderIfNotRequested`. The call to `folder.open` makes the
folder start expanded.

{{{example url="../threejs-render-on-demand-w-gui.html" }}}

I hope this gives some idea of how to make three.js render on demand instead of
continuously. Apps/pages that render three.js on demand are not as common as
most pages using three.js are either games or 3D animated art but examples of
pages that might be better rendering on demand would be say a map viewer, a 3d
editor, a 3d graph generator, a product catalog, etc...
