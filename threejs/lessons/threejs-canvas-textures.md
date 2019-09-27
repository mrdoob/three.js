Title: Three.js Canvas Textures
Description: How to use a canvas as a texture in Three.js
TOC: Using A Canvas for Dynamic Textures

This article continues from [the article on textures](threejs-textures.html).
If you haven't read that yet you should probably start there.

In [the previous article on textures](threejs-textures.html) we mostly used
image files for textures. Sometimes though we want to generate a texture
at runtime. One way to do this is to use a `CanvasTexture`.

A canvas texture takes a `<canvas>` as its input. If you don't know how to
draw with the 2D canvas API on a canvas [there's a good tutorial on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial).

Let's make a simple canvas program. Here's one that draws dots at random places in random colors.

```js
const ctx = document.createElement('canvas').getContext('2d');
document.body.appendChild(ctx.canvas);
ctx.canvas.width = 256;
ctx.canvas.height = 256;
ctx.fillStyle = '#FFF';
ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

function randInt(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min | 0;
}

function drawRandomDot() {
  ctx.fillStyle = `#${randInt(0x1000000).toString(16).padStart(6, '0')}`;
  ctx.beginPath();

  const x = randInt(256);
  const y = randInt(256);
  const radius = randInt(10, 64);
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function render() {
  drawRandomDot();
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
```

it's pretty straight forward.

{{{example url="../canvas-random-dots.html" }}}

Now let's use it to texture something. We'll start with the example of texturing
a cube from [the previous article](threejs-textures.html).
We'll remove the code that loads an image and instead use
our canvas by creating a `CanvasTexture` and passing it the canvas we created.

```js
const cubes = [];  // just an array we can use to rotate the cubes
-const loader = new THREE.TextureLoader();
-
+const ctx = document.createElement('canvas').getContext('2d');
+ctx.canvas.width = 256;
+ctx.canvas.height = 256;
+ctx.fillStyle = '#FFF';
+ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
+const texture = new THREE.CanvasTexture(ctx.canvas);

const material = new THREE.MeshBasicMaterial({
-  map: loader.load('resources/images/wall.jpg'),
+  map: texture,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cubes.push(cube);  // add to our list of cubes to rotate
```

And then call the code to draw a random dot in our render loop

```js
function render(time) {
  time *= 0.001;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

+  drawRandomDot();
+  texture.needsUpdate = true;

  cubes.forEach((cube, ndx) => {
    const speed = .2 + ndx * .1;
    const rot = time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
```

The only extra thing we need to do is set the `needsUpdate` property
of the `CanvasTexture` to tell three.js to update the texture with
the latest contents of the canvas.

And with that we have a canvas textured cube

{{{example url="../threejs-canvas-textured-cube.html" }}}

Note that if you want to use three.js to draw into the canvas you're
better off using a `RenderTarget` which is covered in [this article](threejs-rendertargets.html).

A common use case for canvas textures is to provide text in a scene.
For example if you wanted to put a person's name on their character's
badge you might use a canvas texture to texture the badge.

Let's make a scene with 3 people and give each person a badge
or label.

Let's take the example above and remove all the cube related
stuff. Then let's set the background to white and add two [lights](threejs-lights.html).

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color('white');
+
+function addLight(position) {
+  const color = 0xFFFFFF;
+  const intensity = 1;
+  const light = new THREE.DirectionalLight(color, intensity);
+  light.position.set(...position);
+  scene.add(light);
+  scene.add(light.target);
+}
+addLight([-3, 1, 1]);
+addLight([ 2, 1, .5]);
```

Let's make some code to make a label using canvas 2D

```js
+function makeLabelCanvas(size, name) {
+  const borderSize = 2;
+  const ctx = document.createElement('canvas').getContext('2d');
+  const font =  `${size}px bold sans-serif`;
+  ctx.font = font;
+  // measure how long the name will be
+  const doubleBorderSize = borderSize * 2;
+  const width = ctx.measureText(name).width + doubleBorderSize;
+  const height = size + doubleBorderSize;
+  ctx.canvas.width = width;
+  ctx.canvas.height = height;
+
+  // need to set font again after resizing canvas
+  ctx.font = font;
+  ctx.textBaseline = 'top';
+
+  ctx.fillStyle = 'blue';
+  ctx.fillRect(0, 0, width, height);
+  ctx.fillStyle = 'white';
+  ctx.fillText(name, borderSize, borderSize);
+
+  return ctx.canvas;
+}
```

Then we'll make simple people from a cylinder for the body, a sphere
for the head, and a plane for the label.

First let's make the shared geometry.

```js
+const bodyRadiusTop = .4;
+const bodyRadiusBottom = .2;
+const bodyHeight = 2;
+const bodyRadialSegments = 6;
+const bodyGeometry = new THREE.CylinderBufferGeometry(
+    bodyRadiusTop, bodyRadiusBottom, bodyHeight, bodyRadialSegments);
+
+const headRadius = bodyRadiusTop * 0.8;
+const headLonSegments = 12;
+const headLatSegments = 5;
+const headGeometry = new THREE.SphereBufferGeometry(
+    headRadius, headLonSegments, headLatSegments);
+
+const labelGeometry = new THREE.PlaneBufferGeometry(1, 1);
```

Then let's make a function to build a person from these
parts.

```js
+function makePerson(x, size, name, color) {
+  const canvas = makeLabelCanvas(size, name);
+  const texture = new THREE.CanvasTexture(canvas);
+  // because our canvas is likely not a power of 2
+  // in both dimensions set the filtering appropriately.
+  texture.minFilter = THREE.LinearFilter;
+  texture.wrapS = THREE.ClampToEdgeWrapping;
+  texture.wrapT = THREE.ClampToEdgeWrapping;
+
+  const labelMaterial = new THREE.MeshBasicMaterial({
+    map: texture,
+    side: THREE.DoubleSide,
+    transparent: true,
+  });
+  const bodyMaterial = new THREE.MeshPhongMaterial({
+    color,
+    flatShading: true,
+  });
+
+  const root = new THREE.Object3D();
+  root.position.x = x;
+
+  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
+  root.add(body);
+  body.position.y = bodyHeight / 2;
+
+  const head = new THREE.Mesh(headGeometry, bodyMaterial);
+  root.add(head);
+  head.position.y = bodyHeight + headRadius * 1.1;
+
+  const label = new THREE.Mesh(labelGeometry, labelMaterial);
+  root.add(label);
+  label.position.y = bodyHeight * 4 / 5;
+  label.position.z = bodyRadiusTop * 1.01;
+
+  // if units are meters then 0.01 here makes size
+  // of the label into centimeters.
+  const labelBaseScale = 0.01;
+  label.scale.x = canvas.width  * labelBaseScale;
+  label.scale.y = canvas.height * labelBaseScale;
+
+  scene.add(root);
+  return root;
+}
```

You can see above we put the body, head, and label on a root
`Object3D` and adjust their positions. This would let us move the
root object if we wanted to move the people. The body is 2 units
high. If 1 unit equals 1 meter then the code above tries to
make the label in centimeters so they will be size centimeters
tall and however wide is needed to fit the text.

We can then make people with labels

```js
+makePerson(-3, 32, 'Purple People Eater', 'purple');
+makePerson(-0, 32, 'Green Machine', 'green');
+makePerson(+3, 32, 'Red Menace', 'red');
```

What's left is to add some `OrbitControls` so we can move
the camera.

```html
<script src="resources/threejs/r108/three.min.js"></script>
+<script src="resources/threejs/r108/js/controls/OrbitControls.js"></script>
```

```js
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
-const far = 5;
+const far = 50;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
-camera.position.z = 2;
+camera.position.set(0, 2, 5);

+const controls = new THREE.OrbitControls(camera, canvas);
+controls.target.set(0, 2, 0);
+controls.update();
```

and we get simple labels.

{{{example url="../threejs-canvas-textured-labels.html" }}}

Some things to notice.

* If you zoom in the labels get pretty low-res.

There is no easy solution. There are more complex font
rendering techniques but I know of no plugin solutions.
Plus they will require the user download font data which
would be slow.

One solution is to increase the resolution of the labels.
Try setting the size passed into to double what it is now
and setting `labelBaseScale` to half what it currently is.

* The labels get longer the longer the name.

If you wanted to fix this you'd instead choose a fixed sized
label and then squish the text.

This is pretty easy. Pass in a base width and scale the text to fit that
width like this

```js
-function makeLabelCanvas(size, name) {
+function makeLabelCanvas(baseWidth, size, name) {
  const borderSize = 2;
  const ctx = document.createElement('canvas').getContext('2d');
  const font =  `${size}px bold sans-serif`;
  ctx.font = font;
  // measure how long the name will be
+  const textWidth = ctx.measureText(name).width;

  const doubleBorderSize = borderSize * 2;
-  const width = ctx.measureText(name).width + doubleBorderSize;
+  const width = baseWidth + doubleBorderSize;
  const height = size + doubleBorderSize;
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  // need to set font again after resizing canvas
  ctx.font = font;
-  ctx.textBaseline = 'top';
+  ctx.textBaseline = 'middle';
+  ctx.textAlign = 'center';

  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, width, height);

+  // scale to fit but don't stretch
+  const scaleFactor = Math.min(1, baseWidth / textWidth);
+  ctx.translate(width / 2, height / 2);
+  ctx.scale(scaleFactor, 1);
  ctx.fillStyle = 'white';
  ctx.fillText(name, borderSize, borderSize);

  return ctx.canvas;
}
```

Then we can pass in a width for the labels

```js
-function makePerson(x, size, name, color) {
-  const canvas = makeLabelCanvas(size, name);
+function makePerson(x, labelWidth, size, name, color) {
+  const canvas = makeLabelCanvas(labelWidth, size, name);

...

}

-makePerson(-3, 32, 'Purple People Eater', 'purple');
-makePerson(-0, 32, 'Green Machine', 'green');
-makePerson(+3, 32, 'Red Menace', 'red');
+makePerson(-3, 150, 32, 'Purple People Eater', 'purple');
+makePerson(-0, 150, 32, 'Green Machine', 'green');
+makePerson(+3, 150, 32, 'Red Menace', 'red');
```

and we get labels where the text is centered and scaled to fit

{{{example url="../threejs-canvas-textured-labels-scale-to-fit.html" }}}

Above we used a new canvas for each texture. Whether or not to use a 
canvas per texture is up to you. If you need to update them often then 
having one canvas per texture is probably the best option. If they are
rarely or never updated then you can choose to use a single canvas
for multiple textures by forcing three.js to use the texture.
Let's change the code above to do just that.

```js
+const ctx = document.createElement('canvas').getContext('2d');

function makeLabelCanvas(baseWidth, size, name) {
  const borderSize = 2;
-  const ctx = document.createElement('canvas').getContext('2d');
  const font =  `${size}px bold sans-serif`;

  ...

}

+const forceTextureInitialization = function() {
+  const material = new THREE.MeshBasicMaterial();
+  const geometry = new THREE.PlaneBufferGeometry();
+  const scene = new THREE.Scene();
+  scene.add(new THREE.Mesh(geometry, material));
+  const camera = new THREE.Camera();
+
+  return function forceTextureInitialization(texture) {
+    material.map = texture;
+    renderer.render(scene, camera);
+  };
+}();

function makePerson(x, labelWidth, size, name, color) {
  const canvas = makeLabelCanvas(labelWidth, size, name);
  const texture = new THREE.CanvasTexture(canvas);
  // because our canvas is likely not a power of 2
  // in both dimensions set the filtering appropriately.
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
+  forceTextureInitialization(texture);

  ...
```

{{{example url="../threejs-canvas-textured-labels-one-canvas.html" }}}

Another issue is that the labels don't always face the camera. If you're using 
labels as badges that's probably a good thing. If you're using labels to put
names over players in a 3D game maybe you want the labels to always face the camera.
We'll cover how to do that in [an article on billboards](threejs-billboards.html).

For labels in particular, [another solution is to use HTML](threejs-align-html-elements-to-3d.html).
The labels in this article are *inside the 3D world* which is good if you want them
to be hidden by other objects where as [HTML labels](threejs-align-html-elements-to-3d.html) are always on top.
