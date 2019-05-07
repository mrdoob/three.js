Title: Three.js WebVR - Look to Select
Description: How to implement Look to Select.

**NOTE: The examples on this page require a VR capable
device. Without one they won't work. See [previous article](threejs-webvr.html)
as to why**

In the [previous article](threejs-webvr.html) we went over
a very simple WebVR example using three.js and we discussed
the various kinds of VR systems.

The simplest and possibly most common is the Google Cardboard style of VR which
is basically a phone put into a $5 - $50 face mask. This kind of VR has no
controller so people have to come up with creative solutions for allowing user
input.

The most common solution is "look to select" where if the
user points their head at something for a moment it gets
selected.

Let's implement "look to select"! We'll start with
[an example from the previous article](threejs-webvr.html)
and to do it we'll add the `PickHelper` we made in
[the article on picking](threejs-picking). Here it is.

```js
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

For an explanation of that code [see the article on picking](threejs-picking.html).

To use it we just need to create an instance and call it in our render loop

```js
+const pickHelper = new PickHelper();

...
function render(time) {
  time *= 0.001;

  ...

+  // 0, 0 is the center of the view in normalized coordinates.
+  pickHelper.pick({x: 0, y: 0}, scene, camera, time);
```

In the original picking example we converted the mouse coordinates
from CSS pixels into normalized coordinates that go from -1 to +1
across the canvas.

In this case though we will always pick where the camera is
facing which is the center of the screen so we pass in `0` for
both `x` and `y` which is the center in normalized coordinates.

And with that objects will flash when we look at them

{{{example url="../threejs-webvr-look-to-select.html" }}}

Typically we don't want selection to be immediate. Instead we require the user
to keep the camera on the thing they want to select for a few moments to give them
a chance not to select something by accident.

To do that we need some kind of meter or gauge or some way
to convey that the user must keep looking and for how long.

One easy way we could do that is to make a 2 color texture
and use a texture offset to slide the texture across a model.

Let's do this by itself to see it work before we add it to
the WebVR example.

First we make an `OrthographicCamera`

```js
const left = -2;    // Use values for left
const right = 2;    // right, top and bottom
const top = 1;      // that match the default
const bottom = -1;  // canvas size.
const near = -1;
const far = 1;
const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
```

And of course update it if the canvas changes size

```js
function render(time) {
  time *= 0.001;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    const aspect = canvas.clientWidth / canvas.clientHeight;
+    camera.left = -aspect;
+    camera.right = aspect;
    camera.updateProjectionMatrix();
  }
  ...
```

We now have a camera that shows 2 units above and below the center and aspect units
left and right.

Next let's make a 2 color texture. We'll use a `DataTexture`
which we've used a few [other](threejs-indexed-textures.html) 
[places](threejs-post-processing-3dlut.html).

```js
function makeDataTexture(data, width, height) {
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
}

const cursorColors = new Uint8Array([
  64, 64, 64, 64,       // dark gray
  255, 255, 255, 255,   // white
]);
const cursorTexture = makeDataTexture(cursorColors, 2, 1);
```

We'll then use that texture on a `TorusBufferGeometry`

```js
const ringRadius = 0.4;
const tubeRadius = 0.1;
const tubeSegments = 4;
const ringSegments = 64;
const cursorGeometry = new THREE.TorusBufferGeometry(
    ringRadius, tubeRadius, tubeSegments, ringSegments);

const cursorMaterial = new THREE.MeshBasicMaterial({
  color: 'white',
  map: cursorTexture,
  transparent: true,
  blending: THREE.CustomBlending,
  blendSrc: THREE.OneMinusDstColorFactor,
  blendDst: THREE.OneMinusSrcColorFactor,
});
const cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);
scene.add(cursor);
```

and then in `render` lets adjust the texture's offset

```js
function render(time) {
  time *= 0.001;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    camera.left = -aspect;
    camera.right = aspect;
    camera.updateProjectionMatrix();
  }

+  const fromStart = 0;
+  const fromEnd = 2;
+  const toStart = -0.5;
+  const toEnd = 0.5;
+  cursorTexture.offset.x = THREE.Math.mapLinear(
+      time % 2,
+      fromStart, fromEnd,
+      toStart, toEnd);

  renderer.render(scene, camera);
}
```

`THREE.Math.mapLinear` takes a value that goes between `fromStart` and `fromEnd`
and maps it to a value between `toStart` and `toEnd`. In the case above we're
taking `time % 2` which means a value that goes from 0 to 2 and maps
that to a value that goes from -0.5 to 0.5

[Textures](threejs-textures.html) are mapped to geometry using normalized texture coordinates
that go from 0 to 1. That means our 2x1 pixel image, set to the default
wrapping mode of `THREE.ClampToEdge`, if we adjust the
texture coordinates by -0.5 then the entire mesh will be the first color
and if we adjust the texture coordinates by +0.5 the entire mesh will
be the second color. In between with the filtering set to `THREE.NearestFilter`
we'll be able to move the transition between the 2 colors through the geometry.

Let's add a background texture while we're at it just like we
covered in [the article on backgrounds](threejs-backgrounds.html).
We'll just use a 2x2 set of colors but set the texture's repeat
settings to give us an 8x8 grid. This will give our cursor something
to be rendered over so we can check it against different colors.

```js
+const backgroundColors = new Uint8Array([
+    0,   0,   0, 255,  // black
+   90,  38,  38, 255,  // dark red
+  100, 175, 103, 255,  // medium green
+  255, 239, 151, 255,  // light yellow
+]);
+const backgroundTexture = makeDataTexture(backgroundColors, 2, 2);
+backgroundTexture.wrapS = THREE.RepeatWrapping;
+backgroundTexture.wrapT = THREE.RepeatWrapping;
+backgroundTexture.repeat.set(4, 4);

const scene = new THREE.Scene();
+scene.background = backgroundTexture;
```

Now if we run that you'll see we get a circle like gauge
and that we can set where the gauge is.

{{{example url="../threejs-webvr-look-to-select-selector.html" }}}

A few things to notice **and try**.

* We set the `cursorMaterial`'s `blending`, `blendSrc` and `blendDst`
  properties as follows

        blending: THREE.CustomBlending,
        blendSrc: THREE.OneMinusDstColorFactor,
        blendDst: THREE.OneMinusSrcColorFactor,

  This gives as an *inverse* type of effect. Comment out
  those 3 lines and you'll see the difference. I'm just guessing
  the inverse effect is best here as that way we can hopefully
  see the cursor regardless of the colors it is over.

* We use a `TorusBufferGeometry` and not a `RingBufferGeometry`

  For whatever reason the `RingBufferGeometry` uses a flat
  UV mapping scheme. Because of this if we use a `RingBufferGeometry`
  the texture slides horizontally across the ring instead of
  around it like it does above.

  Try it out, change the `TorusBufferGeometry` to a `RingBufferGeometry`
  (it's just commented out in the example above) and you'll see what I
  mean.

  The *proper* thing to do (for some definition of *proper*) would be
  to either use the `RingBufferGeometry` but fix the texture coordinates
  so they go around the ring. Or else, generate our own ring geometry.
  But, the torus works just fine. Placed directly in front of the camera
  with a `MeshBasicMaterial` it will look exactly like a ring and the
  texture coordinates go around the ring so it works for our needs.

Let's integrate it with our WebVR code above. 

```js
class PickHelper {
-  constructor() {
+  constructor(camera) {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
-    this.pickedObjectSavedColor = 0;

+    const cursorColors = new Uint8Array([
+      64, 64, 64, 64,       // dark gray
+      255, 255, 255, 255,   // white
+    ]);
+    this.cursorTexture = makeDataTexture(cursorColors, 2, 1);
+
+    const ringRadius = 0.4;
+    const tubeRadius = 0.1;
+    const tubeSegments = 4;
+    const ringSegments = 64;
+    const cursorGeometry = new THREE.TorusBufferGeometry(
+        ringRadius, tubeRadius, tubeSegments, ringSegments);
+
+    const cursorMaterial = new THREE.MeshBasicMaterial({
+      color: 'white',
+      map: this.cursorTexture,
+      transparent: true,
+      blending: THREE.CustomBlending,
+      blendSrc: THREE.OneMinusDstColorFactor,
+      blendDst: THREE.OneMinusSrcColorFactor,
+    });
+    const cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);
+    // add the cursor as a child of the camera
+    camera.add(cursor);
+    // and move it in front of the camera
+    cursor.position.z = -1;
+    const scale = 0.05;
+    cursor.scale.set(scale, scale, scale);
+    this.cursor = cursor;
+
+    this.selectTimer = 0;
+    this.selectDuration = 2;
+    this.lastTime = 0;
  }
  pick(normalizedPosition, scene, camera, time) {
+    const elapsedTime = time - this.lastTime;
+    this.lastTime = time;

-    // restore the color if there is a picked object
-    if (this.pickedObject) {
-      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
-      this.pickedObject = undefined;
-    }

+    const lastPickedObject = this.pickedObject;
+    this.pickedObject = undefined;

    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
-      // save its color
-      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
-      // set its emissive color to flashing red/yellow
-      this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
    }

+    // show the cursor only if it's hitting something
+    this.cursor.visible = this.pickedObject ? true : false;
+
+    let selected = false;
+
+    // if we're looking at the same object as before
+    // increment time select timer
+    if (this.pickedObject && lastPickedObject === this.pickedObject) {
+      this.selectTimer += elapsedTime;
+      if (this.selectTimer >= this.selectDuration) {
+        this.selectTimer = 0;
+        selected = true;
+      }
+    } else {
+      this.selectTimer = 0;
+    }
+
+    // set cursor material to show the timer state
+    const fromStart = 0;
+    const fromEnd = this.selectDuration;
+    const toStart = -0.5;
+    const toEnd = 0.5;
+    this.cursorTexture.offset.x = THREE.Math.mapLinear(
+        this.selectTimer,
+        fromStart, fromEnd,
+        toStart, toEnd);
+
+    return selected ? this.pickedObject : undefined;
  }
}
```

You can see the code above we added all the code to create
the cursor geometry, texture, and material and we added it
as a child of the camera so it will always be in front of
the camera. Note we need to add the camera to the scene
otherwise the cursor won't be rendered.

```js
+scene.add(camera);
```

We then check if the thing we're picking this time is the same as it was last
time. If so we add the elapsed time to a timer and if the timer reaches it's
limit we return the selected item.

Now let's use that to pick the cubes. As a simple example
we'll just change the background texture to match the
selected cube.

First let's change the code we had for loading a cubemap
into something a little more 
[D.R.Y.](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself).

```js
-{
-  const loader = new THREE.CubeTextureLoader();
-  const texture = loader.load([
-    'resources/images/grid-1024.png',
-    'resources/images/grid-1024.png',
-    'resources/images/grid-1024.png',
-    'resources/images/grid-1024.png',
-    'resources/images/grid-1024.png',
-    'resources/images/grid-1024.png',
-  ]);
-  scene.background = texture;
-}

+const loader = new THREE.CubeTextureLoader();
+function loadCubemap(url) {
+  return loader.load([url, url, url, url, url, url]);
+}
+scene.background = loadCubemap('resources/images/grid-1024.png');
```

Then we'll load 3 more cubemap textures, one for each cube. We'll
use a [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
so that we can associate a `Mesh` with a texture.

```js
-const cubes = [
-  makeInstance(geometry, 0x44aa88,  0),
-  makeInstance(geometry, 0x8844aa, -2),
-  makeInstance(geometry, 0xaa8844,  2),
-];
+const cubeToTextureMap = new Map();
+cubeToTextureMap.set(
+    makeInstance(geometry, 0x44aa88,  0), 
+    loadCubemap('resources/images/grid-cyan-1024.png'));
+cubeToTextureMap.set(
+    makeInstance(geometry, 0x8844aa, -2), 
+    loadCubemap('resources/images/grid-purple-1024.png'));
+cubeToTextureMap.set(
+    makeInstance(geometry, 0xaa8844,  2), 
+    loadCubemap('resources/images/grid-gold-1024.png'));
```

In `render` where we rotate the cubes we need to iterate over `cubeToTextureMap`
instead of `cubes`.

```js
-cubes.forEach((cube, ndx) => {
+let ndx = 0;
+cubeToTextureMap.forEach((texture, cube) => {
  const speed = 1 + ndx * .1;
  const rot = time * speed;
  cube.rotation.x = rot;
  cube.rotation.y = rot;
+  ++ndx;
});
```

And now we can use our new `PickHelper` implementation
to select one of the cubes and assign the associated background
texture.

```js
// 0, 0 is the center of the view in normalized coordinates.
-pickHelper.pick({x: 0, y: 0}, scene, camera, time);
+const selectedObject = pickHelper.pick({x: 0, y: 0}, scene, camera, time);
+if (selectedObject) {
+  scene.background = cubeToTextureMap.get(selectedObject);
+}
```

And with that we should have a pretty decent *look to select* implementation.

{{{example url="../threejs-webvr-look-to-select-w-cursor.html" }}}

I hope this example gave some ideas of how to implement a "look to select"
type of Google Cardboard level UX. Sliding textures using texture coordinates
offsets is also a commonly useful technique.
