Title: Three.js Picking
Description: Selecting Objects with the Mouse in Three.js

*Picking* refers to the process of figuring out which object a user clicked on or touched. There are tons of ways to implement picking each with their tradeoffs. Let's go over the 2 most common.

Probably the most common way of *picking* is by doing raycasting which means to *cast* a ray from the mouse through the frustum of the scene and computing which objects that ray intersects. Conceptually it's very simple.

First we'd take the position of the mouse. We'd convert that into world space by applying the camera's projection and orientation. We'd compute a ray from the near plane of the camera's frustum to the far plane. Then, for every triangle of every object in the scene we'd check if that ray intersects that triangle. If your scene has 1000 objects and each object has 1000 triangles then 1 million triangles will need to be checked.

A few optimizations would include first checking if the ray intersects with an object's bounding sphere or bounding box, the sphere or box that contains the entire object. If the ray doesn't intersect one of those then we don't have to check the triangles of that object.

THREE.js provides a `RayCaster` class that does exactly this.

Let's make a scene with a 100 objects and try picking them. We'll
start with an example from [the article on responsive pages](three.js)

A few changes

We'll parent the camera to another object so we can spin that other object and the camera will move around the scene just like a selfie stick.

```
*const fov = 60;
const aspect = 2;  // the canvas default
const near = 0.1;
*const far = 200;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
*camera.position.z = 30;

const scene = new THREE.Scene();
+scene.background = new THREE.Color('white');

+// put the camera on a pole (parent it to an object)
+// so we can spin the pole to move the camera around the scene
+const cameraPole = new THREE.Object3D();
+scene.add(cameraPole);
+cameraPole.add(camera);
```

and in the `render` function we'll spin the camera pole.

```
cameraPole.rotation.y = time * .1;
```

Let's generate 100 cubes with random colors in random positions, orientations,
and scales.

```
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

function rand(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + (max - min) * Math.random();
}

function randomColor() {
  return `hsl(${rand(360) | 0}, ${rand(50, 100) | 0}%, 50%)`;
}

const numObjects = 100;
for (let i = 0; i < numObjects; ++i) {
  const material = new THREE.MeshPhongMaterial({
    color: randomColor(),
  });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
  cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
  cube.scale.set(rand(3, 6), rand(3, 6), rand(3, 6));
}
```

And finally let's pick.

Let's make a simple class to manage the picking

```
class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(normalizedPosition, scene, camera, time) {
    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
      // save its color
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
      // set its emissive color to flashing red/yellow
      this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
    }
  }
}
```

You can see we create a `RayCaster` and then we can call the `pick` function to cast a ray through the scene. If the ray hits something we change the color of the first thing it hits.

Of course we could call this function only when the user pressed the mouse *down* which is probaby usually what you want but for this example we'll pick every frame whatever is under the mouse. To do this we first need to track where the mouse
is

```
const pickPosition = {x: 0, y: 0};
clearPickPosition();

...

function setPickPosition(event) {
  pickPosition.x = (event.clientX / canvas.clientWidth ) *  2 - 1;
  pickPosition.y = (event.clientY / canvas.clientHeight) * -2 + 1;  // note we flip Y
}

function clearPickPosition() {
  // unlike the mouse which always has a position
  // if the user stops touching the screen we want
  // to stop picking. For now we just pick a value
  // unlikely to pick something
  pickPosition.x = -100000;
  pickPosition.y = -100000;
}

window.addEventListener('mousemove', setPickPosition);
window.addEventListener('mouseout', clearPickPosition);
window.addEventListener('mouseleave', clearPickPosition);
```

Notice we're recording a normalized mouse position. Reguardless of the size of the canvas we need a value that goes from -1 on the left to +1 on the right. Similarly we need a value that goes from -1 on the bottom to +1 on the top.

While we're at it lets support mobile as well

```
window.addEventListener('touchstart', (event) => {
  // prevent the window from scrolling
  event.preventDefault();
  setPickPosition(event.touches[0]);
}, {passive: false});

window.addEventListener('touchmove', (event) => {
  setPickPosition(event.touches[0]);
});

window.addEventListener('touchend', clearPickPosition);
```

And finally in our `render` function we call call the `PickHelper`'s `pick` function.

```
+const pickHelper = new PickHelper();

function render(time) {
  time *= 0.001;  // convert to seconds;

  ...

+  pickHelper.pick(pickPosition, scene, camera, time);

  renderer.render(scene, camera);

  ...
```

and here's the result

{{{example url="../threejs-picking-raycaster.html" }}}

This appears to work great and it probably does for many use cases
but there are several issues.

1. It's CPU based.

   JavaScript is going through each object and checking if the ray intersects
   that object's bounding box or bounding sphere. If it does then JavaScript
   has to go through each and every triangle in that object and check if the
   ray intersects the triangle.

   The good part of this is JavaScript can easily compute exactly where the
   ray intersected the triangle and provide us with that data. For example
   if you wanted to put a marker where the intersection happened.

   The bad part is that's a lot of work for the CPU to do. If you have
   objects with lots of triangles it might be slow.

2. It doesn't handle any strange shaders or displacements.

   If you have a shader that deforms or morphs the geometry JavaScript
   has no knowledge of that deformation and so will give the wrong answer.
   For example AFAIK you can't use this method with skinned objects.

3. It doesn't handle transparent holes.

As an example let's apply this texture to the cubes.

<div class="threejs_center"><img class="checkerboard" src="../resources/images/frame.png"></div>

We'll just make these changes

```
+const loader = new THREE.TextureLoader();
+const texture = loader.load('resources/images/frame.png');

const numObjects = 100;
for (let i = 0; i < numObjects; ++i) {
  const material = new THREE.MeshPhongMaterial({
    color: randomColor(),
    +map: texture,
    +transparent: true,
    +side: THREE.DoubleSide,
    +alphaTest: 0.1,
  });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  ...
```

And running that you should quickly see the issue

{{{example url="../threejs-picking-raycaster-transparency.html" }}}

Try to pick something through a box and you can't

<div class="threejs_center"><img src="resources/images/picking-transparent-issue.jpg" style="width: 635px;"></div>

This is because JavaScript can't easily look into the textures and materials and figure out if part of your object is really transparent or not.

A solution all of these issues is to use GPU based picking. Unfortunately while it is conceptually simple it is more complicated to use than the ray casting method above.

To do GPU picking we render each object in a unique color offscreen. We then look up the color of the pixel corresponding to the mouse position. The color tells us which object was picked.

This can solve issue 2 and 3 above. As for issue 1, speed, it really depends. Every object has to be drawn twice. Once to draw it for viewing and again to draw it for picking. It's possible with fancier solutions maybe both of those could be done at the same time but we're not going to try that.

One thing we can do though is since we're only going to be reading one pixel we can just setup the camera so only that one pixel is drawn. We can do this using `PerspectiveCamera.setViewOffset` which lets us tell THREE.js to compute a camera that just renders a smaller part of a larger rectangle. This should save some time.

To do this type of picking in THREE.js at the moment requires we create 2 scenes. One we will fill with our normal meshes. The other we'll fill with meshes
that use our picking material.

So, first create a second scene and make sure it clears to black.

```
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');
const pickingScene = new THREE.Scene();
pickingScene.background = new THREE.Color(0);
```

Then, for each cube we place in the main scene we make a corresponding "picking cube" at the same position as the original cube, put it in the `pickingScene`, and set it's material to something that will draw the object's id as its color. Also we keep a map of ids to objects so when we look up an id later we can map it back to its corresponding object.

```
const idToObject = {};
+const numObjects = 100;
for (let i = 0; i < numObjects; ++i) {
+  const id = i + 1;
  const material = new THREE.MeshPhongMaterial({
    color: randomColor(),
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    alphaTest: 0.1,
  });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
+  idToObject[id] = cube;

  cube.position.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
  cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
  cube.scale.set(rand(3, 6), rand(3, 6), rand(3, 6));

+  const pickingMaterial = new THREE.MeshPhongMaterial({
+    emissive: new THREE.Color(id),
+    color: new THREE.Color(0, 0, 0),
+    specular: new THREE.Color(0, 0, 0),
+    map: texture,
+    transparent: true,
+    side: THREE.DoubleSide,
+    alphaTest: 0.5,
+    blending: THREE.NoBlending,
+  });
+  const pickingCube = new THREE.Mesh(geometry, pickingMaterial);
+  pickingScene.add(pickingCube);
+  pickingCube.position.copy(cube.position);
+  pickingCube.rotation.copy(cube.rotation);
+  pickingCube.scale.copy(cube.scale);
}
```

Note that we are abusing the `MeshPhongMaterial` here. By setting its `emissive` to our id and the `color` and `specular` to 0 that will end up rendering the id only where the texture's alpha is greater than `alphaTest`. We also need to set `blending` to `NoBlending` so that the id is not multiplied by alpha.

Note that abusing the `MeshPhongMaterial` might not be the best solution as it will still calculate all our lights when drawing the picking scene even though we don't need those calculations. A more optimized solution would make a custom shader that just writes the id where the texture's alpha is greater than `alphaTest`.

Because we're picking from pixels instead of ray casting we can change the code that sets the pick position to just use pixels.

```
function setPickPosition(event) {
-  pickPosition.x = (event.clientX / canvas.clientWidth ) *  2 - 1;
-  pickPosition.y = (event.clientY / canvas.clientHeight) * -2 + 1;  // note we flip Y
+  pickPosition.x = event.clientX;
+  pickPosition.y = event.clientY;
}
```

Then let's change the `PickHelper` into a `GPUPickHelper`

```
-class PickHelper {
+class GPUPickHelper {
  constructor() {
-    this.raycaster = new THREE.Raycaster();
+    // create a 1x1 pixel render target
+    this.pickingTexture = new THREE.WebGLRenderTarget(1, 1);
+    this.pixelBuffer = new Uint8Array(4);
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(cssPosition, scene, camera, time) {
+    const {pickingTexture, pixelBuffer} = this;

    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

+    // set the view offset to represent just a single pixel under the mouse
+    const pixelRatio = renderer.getPixelRatio();
+    camera.setViewOffset(
+        renderer.context.drawingBufferWidth,   // full width
+        renderer.context.drawingBufferHeight,  // full top
+        cssPosition.x * pixelRatio | 0,        // rect x
+        cssPosition.y * pixelRatio | 0,        // rect y
+        1,                                     // rect width
+        1,                                     // rect height
+    );
+    // render the scene
+    renderer.render(scene, camera, pickingTexture);
+    // clear the view offset so rendering returns to normal
+    camera.clearViewOffset();
+    //read the pixel
+    renderer.readRenderTargetPixels(
+        pickingTexture,
+        0,   // x
+        0,   // y
+        1,   // width
+        1,   // height
+        pixelBuffer);
+
+    const id =
+        (pixelBuffer[0] << 16) |
+        (pixelBuffer[1] <<  8) |
+        (pixelBuffer[2]      );

-    // cast a ray through the frustum
-    this.raycaster.setFromCamera(normalizedPosition, camera);
-    // get the list of objects the ray intersected
-    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
-    if (intersectedObjects.length) {
-      // pick the first object. It's the closest one
-      this.pickedObject = intersectedObjects[0].object;

+    const intersectedObject = idToObject[id];
+    if (intersectedObject) {
+      // pick the first object. It's the closest one
+      this.pickedObject = intersectedObject;
      // save its color
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
      // set its emissive color to flashing red/yellow
      this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
    }
  }
}
```

Then we just need to use it

```
-const pickHelper = new PickHelper();
+const pickHelper = new GPUPickHelper();
```

and pass it the `pickScene` instead of the `scene`.

```
-  pickHelper.pick(pickPosition, scene, camera, time);
+  pickHelper.pick(pickPosition, pickScene, camera, time);
```

And now it should let you pick through the transparent parts

{{{example url="../threejs-picking-gpu.html" }}}

I hope that gives some idea of how to implement picking. In a future article maybe we can cover how to manipulate objects with the mouse.