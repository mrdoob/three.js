Title: Three.js Lights
Description: Setting up Lights

This article is part of a series of articles about three.js. The
first article is [three.js fundamentals](threejs-fundamentals.html). If
you haven't read that yet and you're new to three.js you might want to
consider starting there. The 
[previous article was about textures](threejs-textures.html).

Let go over how to use the various kinds of lights in three.

Starting with one of our previous samples let's update the camera.
We'll set the field of view to 45 degrees, the far plane to 100 units,
and we'll move the camera 10 units up and 20 units back from the origin

```js
*const fov = 45;
const aspect = 2;  // the canvas default
const near = 0.1;
*const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
+camera.position.set(0, 10, 20);
```

Next let's add `OrbitControls`. `OrbitControls` let the user spin
or *orbit* the camera around some point. The `OrbitControls` are
an optional feature of three.js so first we need to include them
in our page

```html
<script src="resources/threejs/r103/three.min.js"></script>
+<script src="resources/threejs/r103/js/controls/OrbitControls.js"></script>
```

Then we can use them. We pass the `OrbitControls` a camera to 
control and the DOM element to use to get input events

```js
const controls = new THREE.OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();
```

We also set the target to orbit around to 5 units above the origin
and then call `controls.update` so the controls will use the new
target.

Next up let's make some things to light up. First we'll make ground
plane. We'll apply a tiny 2x2 pixel checkerboard texture that looks
like this

<div class="threejs_center">
  <img src="../resources/images/checker.png" class="border" style="
    image-rendering: pixelated;
    width: 128px;
  ">
</div>

First we load the texture, set it to repeating, set the filtering to
nearest, and set how many times we want it to repeat. Since the
texture is a 2x2 pixel checkerboard, by repeating and setting the
repeat to half the size of the plane each check on the checkerboard
will be exactly 1 unit large;

```js
const planeSize = 40;

const loader = new THREE.TextureLoader();
const texture = loader.load('resources/images/checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);
```

We then make a plane geometry, a material for the plane, and mesh
to insert it in the scene. Planes default to being in the XY plane
but the ground is in the XZ plane so we rotate it.

```js
const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshPhongMaterial({
  map: texture,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.rotation.x = Math.PI * -.5;
scene.add(mesh);
```

Let's add a cube and a sphere so we have 3 things to light including the plane

```js
{
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereBufferGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}
```

Now that we have a scene to light up let's add lights!

## `AmbientLight`

First let's make an `AmbientLight`

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);
```

Let's also make it so we can adjust the light's parameters.
We'll use [dat.GUI](https://github.com/dataarts/dat.gui) again. 
To be able to adjust the color via dat.GUI we need a small helper
that presents a property to dat.GUI that looks like a CSS hex color string
(eg: `#FF8844`). Our helper will get the color from a named property,
convert it to a hex string to offer to dat.GUI. When dat.GUI tries
to set the helper's property we'll assign the result back to the light's
color. 

Here's the helper:

```js
class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}
```

And here's our code setting up dat.GUI

```js
const gui = new dat.GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
```

And here's the result

{{{example url="../threejs-lights-ambient.html" }}}

Click and drag in the scene to *orbit* the camera.

Notice there is no defintion. The shapes are flat. The `AmbientLight` effectively
just multiply's the material's color by the light's color times the
intensity.

    color = materialColor * light.color * light.intensity;

That's it. It has no direction. 
This style of ambient lighting is actually not all that
useful as lighting as it's 100% even so other than changing the color
of everything in the scene it doesn't look much like *lighting*.
What it does help with is making the darks not too dark.

## `HemisphereLight`

Let's switch the code the a `HemisphereLight`. A `HemisphereLight`
takes a sky color and a ground color and just multplies the
material's color between those 2 colors. The sky color if the
surface of the object is pointing up and the ground color if
the surface of the object is pointing down.

Here's the new code

```js
-const color = 0xFFFFFF;
+const skyColor = 0xB1E1FF;  // light blue
+const groundColor = 0xB97A20;  // brownish orange
const intensity = 1;
-const light = new THREE.AmbientLight(color, intensity);
+const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
scene.add(light);
```

Let's also update the dat.GUI code to edit both colors

```js
const gui = new dat.GUI();
-gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
+gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
+gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
gui.add(light, 'intensity', 0, 2, 0.01);
```

The result:

{{{example url="../threejs-lights-hemisphere.html" }}}

Notice again there is almost no defintion, everything looks kind
of flat. The `HemisphereLight` used in combination with another light
can help give a nice kind of influence of the color of the sky
and ground. In that way it's best used in combination with some
other light or a substitute for an `AmbientLight`.

## `DirectionalLight`

Let's switch the code to a `DirectionalLight`.
A `DirectionalLight` is often used to represent the sun.

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 10, 0);
light.target.position.set(-5, 0, 0);
scene.add(light);
scene.add(light.target);
```

Notice that we had to add the `light` and the `light.target`
to the scene. A three.js `DirectionalLight` will shine
in the direction of its target.

Let's make it so we can move the target by adding it to
our GUI.

```js
const gui = new dat.GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
gui.add(light.target.position, 'x', -10, 10);
gui.add(light.target.position, 'z', -10, 10);
gui.add(light.target.position, 'y', 0, 10);
```

{{{example url="../threejs-lights-directional.html" }}}

It's kind of hard to see what's going on. Three.js has a bunch
of helper objects we can add to our scene to help visualize
invisible parts of a scene. In this case we'll use the
`DirectionalLightHelper` which will draw a plane, to represent
the light, and a line from the light to the target. We just
pass it the light and add itd add it to the scene.

```js
const helper = new THREE.DirectionalLightHelper(light);
scene.add(helper);
```

While we're at it lets make it so we can set both the position
of the light and the target. To do this we'll make a function
that given a `Vector3` will adjust its `x`, `y`, and `z` properties
using `dat.GUI`.

```js
function makeXYZGUI(gui, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name);
  folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
  folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
  folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
  folder.open();
}
```

Note that we need to call the helper's `update` function
anytime we change something so the helper knows to update
itself. As such we pass in an `onChangeFn` function to
get called anytime dat.GUI updates a value.

Then we can use that for both the light's position
and the target's position like this

```js
+function updateLight{
+  light.target.updateMatrixWorld();
+  helper.update();
+}
+updateLight();

const gui = new dat.GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);

+makeXYZGUI(gui, light.position, 'position', updateLight);
+makeXYZGUI(gui, light.target.position, 'target', updateLight);
```

Now we can move the light, and its target

{{{example url="../threejs-lights-directional-w-helper.html" }}}

Orbit the camera and it gets easier to see. The plane
represents a `DirectionalLight` because a directional
light computes light comming in one direction. There is no
*point* the light comes from, it's an infinite plane of light
shooting out parallel rays of light.

## `PointLight`

A `PointLight` is a light that sits at a point and shoots light
in all directions from that point. Let's change the code.

```js
const color = 0xFFFFFF;
const intensity = 1;
-const light = new THREE.DirectionalLight(color, intensity);
+const light = new THREE.PointLight(color, intensity);
light.position.set(0, 10, 0);
-light.target.position.set(-5, 0, 0);
scene.add(light);
-scene.add(light.target);
```

Let's also switch to a `PointLightHelper`

```js
-const helper = new THREE.DirectionalLightHelper(light);
+const helper = new THREE.PointLightHelper(light);
scene.add(helper);
```

and as there is no target the `onChange` function can be simpler.

```js
function updateLight{
-  light.target.updateMatrixWorld();
  helper.update();
}
-updateLight();
```

Note that at some level a `PointLightHelper` has no um, point.
It just draws a small wireframe diamond. It could just as easily
be any shape you want, just add a mesh to the light itself.

A `PointLight` has the added property of [`distance`](PointLight.distance).
If the `distance` is 0 then the `PointLight` shines to
infinity. If the `distance` is greater than 0 then the light shines
its full intensity at the light and fades to no influnce at `distance`
units away from the light.

Let's setup the GUI so we can adjust the distance.

```js
const gui = new dat.GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
+gui.add(light, 'distance', 0, 40).onChange(updateLight);

makeXYZGUI(gui, light.position, 'position', updateLight);
-makeXYZGUI(gui, light.target.position, 'target', updateLight);
```

And now try it out.

{{{example url="../threejs-lights-point.html" }}}

Notice when `distance` is > 0 how the light fades out.

## `SpotLight`

Spotlights are affectively a point light with a cone
attached where the light only shines inside the cone.
There's actually 2 cones. An outer cone and an inner
cone. Between the inner cone and the outer cone the
light fades from full intensity to zero.

To use a `SpotLight` we need a target just like
the directional light. The light's cone will
open toward the target.

Modifying our `DirectionalLight` with helper from above

```js
const color = 0xFFFFFF;
const intensity = 1;
-const light = new THREE.DirectionalLight(color, intensity);
+const light = new THREE.SpotLight(color, intensity);
scene.add(light);
scene.add(light.target);

-const helper = new THREE.DirectionalLightHelper(light);
+const helper = new THREE.SpotLightHelper(light);
scene.add(helper);
```

The spotlight's cone's angle is set with the [`angle`](Spotlight.angle)
property in radians. We'll use our `DegRadHelper` from the 
[texture article](threejs-textures.html) to present a UI in
degrees.

```js
gui.add(new DegRadHelper(light, 'angle'), 'value', 0, 90).name('angle').onChange(updateLight);
```

The inner cone is defined by setting the [`penumbra`](SpotLight.penumbra) property
as a percentage from the outer cone. In other words when `penumbra` is 0 then the
inner code is the same size (0 = no difference) from the outer cone. When the
`penumbra` is 1 then the light fades starting in the center of the cone to the
outer cone. When `penumbra` is .5 then the light fades starting from 50% between
the center of the outer cone.

```js
gui.add(light, 'penumbra', 0, 1, 0.01);
```

{{{example url="../threejs-lights-spot-w-helper.html" }}}

Notice with the default `penumbra` of 0 the spotlight has a very sharp edge
where as as you adjust the `penumbra` toward 1 edge blurs.

It might be hard to see the *cone* of the spotlight. The reason is it's
below the ground. Shorten the distance to around 5 and you'll see the open
end of the cone.

## `RectAreaLight`

There's one more type of light, the `RectAreaLight`, which represents
exactly what it sounds like, a rectangular area of light like a long
fluorescent light or maybe a frosted sky light in a ceiling.

The `RectAreaLight` only works with the `MeshStandardMaterai` and the
`MeshPhysicalMaterial` so let's change all our materials to `MeshStandardMaterial`

```js
  ...

  const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
-  const planeMat = new THREE.MeshPhongMaterial({
+  const planeMat = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -.5;
  scene.add(mesh);
}
{
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
- const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
+ const cubeMat = new THREE.MeshStandardMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereBufferGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
-  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
+ const sphereMat = new THREE.MeshStandardMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}
```

To use the `RectAreaLight` we need to include some extra three.js optional data

```html
<script src="resources/threejs/r103/three.min.js"></script>
+<script src="resources/threejs/r103/js/lights/RectAreaLightUniformsLib.js"></script>
```

If you forget the data the light will still work but it will look funny so
be sure to remember to include the extra data.

Now we can create the light

```js
const color = 0xFFFFFF;
*const intensity = 5;
+const width = 12;
+const height = 4;
*const light = new THREE.RectAreaLight(color, intensity, width, height);
light.position.set(0, 10, 0);
+light.rotation.x = THREE.Math.degToRad(-90);
scene.add(light);

*const helper = new THREE.RectAreaLightHelper(light);
*light.add(helper);
```

One thing to notice is that unlike the `DirectionalLight` and the `SpotLight` the
`RectAreaLight` does not use a target. It just uses its rotation. Another thing
to notice is the helper needs to be a child of the light. It is not a child of the
scene like other helpers.

Let's also adjust the GUI. We'll make it so we can rotate the light and adjust
its `width` and `height`

```js
const gui = new dat.GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 10, 0.01);
gui.add(light, 'width', 0, 20).onChange(updateLight);
gui.add(light, 'height', 0, 20).onChange(updateLight);
gui.add(new DegRadHelper(light.rotation, 'x'), 'value', -180, 180).name('x rotation').onChange(updateLight);
gui.add(new DegRadHelper(light.rotation, 'y'), 'value', -180, 180).name('y rotation').onChange(updateLight);
gui.add(new DegRadHelper(light.rotation, 'z'), 'value', -180, 180).name('z rotation').onChange(updateLight);

makeXYZGUI(gui, light.position, 'position', updateLight);
```

And here is that.

{{{example url="../threejs-lights-rectarea.html" }}}

One thing we didn't cover is that there is a setting on the `WebGLRenderer`
called `physicallyCorrectLights`. It effects how light falls off as distance from light.
It only affects `PointLight` and `SpotLight`. `RectAreaLight` does this automatically.

For lights though the basic idea is you don't set a distance for them to fade out, 
and you don't set `intensity`. Instead you set the [`power`](PointLight.power) of 
the light in lumens and then three.js will use physics calculations like real lights. 
The units of three.js in this case are meters and a 60w light bulb would have 
around 800 lumens. There's also a [`decay`](PointLight.decay) property. It should
be set to `2` for realistic decay.

Let's test that.

First we'll turn on physically correct lights

```js
const renderer = new THREE.WebGLRenderer({canvas: canvas});
+renderer.physicallyCorrectLights = true;
```

Then we'll set the `power` to 800 lumens, the `decay` to 2, and
the `distance` to `Infinity`.

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.PointLight(color, intensity);
light.power = 800;
light.decay = 2;
light.distance = Infinity;
```

and we'll add gui so we can change the `power` and `decay`

```js
const gui = new dat.GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'decay', 0, 4, 0.01);
gui.add(light, 'power', 0, 2000);
```

{{{example url="../threejs-lights-point-physically-correct.html" }}}

It's important to note each light you add to scene slows down how fast
three.js renders the scene so you should always try to use as few as
possible to achieve your goals. 

Next up let's go over [dealing with cameras](threejs-cameras.html).

<canvas id="c"></canvas>
<script src="../resources/threejs/r103/three.min.js"></script>
<script src="../resources/threejs/r103/js/controls/OrbitControls.js"></script>
<script src="resources/threejs-lesson-utils.js"></script>
<script src="resources/threejs-lights.js"></script>
