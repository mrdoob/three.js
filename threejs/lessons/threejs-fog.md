Title: Three.js Fog
Description: Fog in Three.js

This article is part of a series of articles about three.js. The
first article is [three.js fundamentals](threejs-fundamentals.html). If
you haven't read that yet and you're new to three.js you might want to
consider starting there. If you haven't read about cameras you might
want to start with [this article](threejs-cameras.html).

Fog in a 3D engine is generally a way of fading to a specific color
based on the distance from the camera. In three.js you add fog by
creating `Fog` or `FogExp2` object and setting it on the scene's
[`fog`](Scene.fog) property.

`Fog` lets you choose `near` and `far` settings which are distances
from the camera. Anything closer than `near` is unaffected by fog.
Anything further than `far` is completely the fog color. Parts between
`near` and `far` fade from their material color to the fog color.

There's also `FogExp2` which grows expotentially with distance from the camera.

To use either type of fog you create one and and assign it to the scene as in

```js
const scene = new THREE.Scene();
{
  const color = 0xFFFFFF;  // white
  const near = 10;
  const far = 100;
  scene.fog = new THREE.Fog(color, near, far);
}
```

or for `FogExp2` it would be

```js
const scene = new THREE.Scene();
{
  const color = 0xFFFFFF;
  const density = 0.1;
  scene.fog = new THREE.FogExp2(color, density);
}
```

`FogExp2` is closer to reality but `Fog` is used
more commonly since it lets you choose a place to apply
the fog so you can decide to show a clear scene
up to a certain distance and then fade out to some color
past that distance.

<div class="spread">
  <div>
    <div data-diagram="fog"></div>
    <div class="code">THREE.Fog</div>
  </div>
  <div>
    <div data-diagram="fogExp2"></div>
    <div class="code">THREE.FogExp2</div>
  </div>
</div>

It's important to note that the fog is applied to *things that are rendered*.
It is part of the calculation of each pixel of the color of the object.
What that means is if you want your scene to fade to a certain color you
need to set the fog **and** the background color to the same color.
The background color is set using the
[`scene.background`](Scene.background)
property. To pick a background color you attach a `THREE.Color` to it. For example

```js
scene.background = new THREE.Color('#F00');  // red
```

<div class="spread">
  <div>
    <div data-diagram="fogBlueBackgroundRed" class="border"></div>
    <div class="code">fog blue, background red</div>
  </div>
  <div>
    <div data-diagram="fogBlueBackgroundBlue" class="border"></div>
    <div class="code">fog blue, background blue</div>
  </div>
</div>

Here is one of our previous examples with fog added. The only addition
is right after setting up the scene we add the fog and set the scene's
backgound color

```js
const scene = new THREE.Scene();

+{
+  const near = 1;
+  const far = 2;
+  const color = 'lightblue';
+  scene.fog = new THREE.Fog(color, near, far);
+  scene.background = new THREE.Color(color);
+}
```

In the example below the camera's `near` is 0.1 and its `far` is 5.
The camera is at `z = 2`. The cubes are 1 unit large and at Z = 0.
This means with a fog setting of `near = 1` and `far = 2` the cubes
will fade out right around their center.

{{{example url="../threejs-fog.html" }}}

Let's add an interface so we can adjust the fog. Again we'll use
[dat.GUI](https://github.com/dataarts/dat.gui). dat.GUI takes
an object and a property and automagically makes an interface
for that type of property. We could just simply let it manipulate
the fog's `near` and `far` properties but it's invalid to have
`near` be greater than `far` so let's make a helper so dat.GUI
can manipulate a `near` and `far` property but we'll make sure `near`
is less than or equal to `far` and `far` is greater than or equal `near`.

```js
// We use this class to pass to dat.gui
// so when it manipulates near or far
// near is never > far and far is never < near
class FogGUIHelper {
  constructor(fog) {
    this.fog = fog;
  }
  get near() {
    return this.fog.near;
  }
  set near(v) {
    this.fog.near = v;
    this.fog.far = Math.max(this.fog.far, v);
  }
  get far() {
    return this.fog.far;
  }
  set far(v) {
    this.fog.far = v;
    this.fog.near = Math.min(this.fog.near, v);
  }
}
```

We can then add it like this

```js
{
  const near = 1;
  const far = 2;
  const color = 'lightblue';
  scene.fog = new THREE.Fog(color, near, far);
  scene.background = new THREE.Color(color);
+
+  const fogGUIHelper = new FogGUIHelper(scene.fog);
+  gui.add(fogGUIHelper, 'near', near, far).listen();
+  gui.add(fogGUIHelper, 'far', near, far).listen();
}
```

The `near` and `far` parameters set the minimum and maximum values
for adjusting the fog. They are set when we setup the camera.

The `.listen()` at the end of the last 2 lines tells dat.GUI to *listen*
for changes. That way when we change `near` because of an edit to `far`
or we change `far` in response to an edit to `near` dat.GUI will update
the other property's UI for us.

It might also be nice to be able to change the fog color but like was
mentioned above we need to keep both the fog color and the background
color in sync. So, let's add another *virtual* property to our helper
that will set both colors when dat.GUI manipulates it.

dat.GUI can manipulate colors in 4 ways, as a CSS 6 digit hex string (eg: `#112233`). As an hue, saturation, value, object (eg: `{h: 60, s: 1, v: }`).
As an RGB array (eg: `[255, 128, 64]`). Or, as an RGBA array (eg: `[127, 200, 75, 0.3]`).

It's easiest for our purpose to use the hex string version since that way
dat.GUI is only manipulating a single value. Fortunately `THREE.Color`
as a [`getHexString`](Color.getHexString) method
we get use to easily get such a string, we just have to prepend a '#' to the front.

```js
// We use this class to pass to dat.gui
// so when it manipulates near or far
// near is never > far and far is never < near
+// Also when dat.gui maniplates color we'll
+// update both the fog and background colors.
class FogGUIHelper {
*  constructor(fog, backgroundColor) {
    this.fog = fog;
+    this.backgroundColor = backgroundColor;
  }
  get near() {
    return this.fog.near;
  }
  set near(v) {
    this.fog.near = v;
    this.fog.far = Math.max(this.fog.far, v);
  }
  get far() {
    return this.fog.far;
  }
  set far(v) {
    this.fog.far = v;
    this.fog.near = Math.min(this.fog.near, v);
  }
+  get color() {
+    return `#${this.fog.color.getHexString()}`;
+  }
+  set color(hexString) {
+    this.fog.color.set(hexString);
+    this.backgroundColor.set(hexString);
+  }
}
```

We then call `gui.addColor` to add a color UI for our helper's virutal property.

```js
{
  const near = 1;
  const far = 2;
  const color = 'lightblue';
  scene.fog = new THREE.Fog(color, near, far);
  scene.background = new THREE.Color(color);

*  const fogGUIHelper = new FogGUIHelper(scene.fog, scene.background);
  gui.add(fogGUIHelper, 'near', near, far).listen();
  gui.add(fogGUIHelper, 'far', near, far).listen();
+  gui.addColor(fogGUIHelper, 'color');
}
```

{{{example url="../threejs-fog-gui.html" }}}

You can see setting `near` to like 1.9 and `far` to 2.0 gives
a very sharp transition between unfogged and completely fogged.
where as `near` = 1.1 and `far` = 2.9 should just about be
the smoothest given our cubes are spinning 2 units away from the camera.

One last thing, there is a boolean [`fog`](Material.fog)
property on a material for whether or not objects rendered
with that material are affected by fog. It defaults to `true`
for most materials. As an example of why you might want
to turn the fog off, imagine you're making a 3D vehicle
simulator with a view from the driver's seat or cockpit.
You probably want the fog off for everything inside the vehicle when
viewing from inside the vehicle.

A better example might be a house
and thick fog outside house. Let's say the fog is set to start
2 meters away (near = 2) and completely fogged out at 4 meters (far = 4).
Rooms are longer than 2 meters and the house is probably longer
than 4 meters so you need to set the materials for the inside
of the house to not apply fog otherwise when standing inside the
house looking outside the wall at the far end of the room will look
like it's in the fog.

<div class="spread">
  <div>
    <div data-diagram="fogHouseAll" style="height: 300px;" class="border"></div>
    <div class="code">fog: true, all</div>
  </div>
</div>

Notice the walls and ceiling at the far end of the room are getting fog applied.
By turning fog off on the materials for the house we can fix that issue.

<div class="spread">
  <div>
    <div data-diagram="fogHouseInsideNoFog" style="height: 300px;" class="border"></div>
    <div class="code">fog: true, only outside materials</div>
  </div>
</div>

<canvas id="c"></canvas>
<script src="../resources/threejs/r105/three.min.js"></script>
<script src="../resources/threejs/r105/js/controls/TrackballControls.js"></script>
<script src="../resources/threejs/r105/js/loaders/GLTFLoader.js"></script>
<script src="resources/threejs-lesson-utils.js"></script>
<script src="resources/threejs-fog.js"></script>
