Title: Three.js Backgrounds and Skyboxes
Description: How to add a background in THREE.js

Most of the articles here use a solid color for a background.

Adding as static background can be as simple as setting some CSS. Taking
an example from [the article on making THREE.js responsive](../threejs-responsive.html)
we only need to change 2 things.

We need to add some CSS to our canvas to set its background to an image

```html
<style>
body {
    margin: 0;
}
#c {
    width: 100vw;
    height: 100vh;
    display: block;
+    background: url(resources/images/daikanyama.jpg) no-repeat center center;
+    background-size: cover;
}
</style>
```

and we need to tell the `WebGLRenderer` to use `alpha` so places we are not drawing anything are transparent.

```js
function main() {
  const canvas = document.querySelector('#c');
-  const renderer = new THREE.WebGLRenderer({canvas: canvas});
+  const renderer = new THREE.WebGLRenderer({
+    canvas: canvas,
+    alpha: true,
+  });
```

And we get a background.

{{{example url="../threejs-background-css.html" }}}

If we want the background to be able to be affected by [post processing effects](threejs-post-processing.html) then we need to draw the background using THREE.js.

The most obvious thing to do is [make a `PlaneBufferGeometry`](threejs-primitives.html), [make a `MeshBasicMaterial`](threejs-materials.html) and [give it a texture](threejs-textures.html) with the background image we want. Then make a `Mesh` that displays the plane with that material.

We then need to position the mesh so it looks like a background. There are several ways to do this.

## Place it in the scene and move it to be in front of the camera

One way would be to place it in the scene and update its position, orientation, and scale every frame so it appears in front of the camera and fills the frame. That sounds like non trival math. We'd also probably set its `renderOrder` so it renders first.

## Make it a child of the camera

We could put the `PerspectiveCamera` itself in the scene and then child the plane `Mesh` to the camera. Set its position to `0, 0, -someAmount` which will mean it's always in front of the camera. Then we only have to deal with what scale to make it.

## We can put it in it's own scene with it's own camera.

In this case we'd make a separate `Scene` and a separate camera and draw it first in our render loop.
Let's pick this solution.

Starting over with an example from [the article on making THREE.js responsive](../threejs-responsive.html) let's make the scene, plane, material, texture, and mesh

```js
const bgCamera = new THREE.OrthographicCamera(
  -1, // left
   1, // right
   1, // top
  -1, // bottom
  -1, // near,
   1, // far
);

const bgScene = new THREE.Scene();

const loader = new THREE.TextureLoader();
const bgTexture = loader.load('resources/images/daikanyama.jpg');
let bgMesh;
{
  const plane = new THREE.PlaneBufferGeometry(2, 2);
  const material = new THREE.MeshBasicMaterial({
    map: bgTexture,
    depthTest: false,
  });
  bgMesh = new THREE.Mesh(plane, material);
  bgScene.add(bgMesh);
}
```

The camera is an `OrthographicCamera`. By setting its `left`, `right`, `top`, and `bottom` to -1 +1 we're telling the camera to show 2 units of space across the canvas. We also set the material not to do the `depthTest`. This also means it will not write to the depth buffer.

We then make a plane that is 2x2 units large. Doing nothing else we'd get the image filling the canvas.

We need to draw the new scene

```js
function render(time)

    /* ... */

+    renderer.render(bgScene, bgCamera);
    renderer.render(scene, camera);
```

By default every time `renderer.render` is called THREE.js will clear the canvas. We need to tell it not to do that otherwise the second call to render will clear our first render and we won't see the background. We can do this by setting `renderer.autoClearColor = false`.

```js
const renderer = new THREE.WebGLRenderer({canvas: canvas});
+renderer.autoClearColor = false;
```

{{{example url="../threejs-background-separate-scene-bad-aspect.html" }}}

This is getting us a background image but its stretched into a bad aspect since it's just drawing a 2x2 unit plane through a camera looking at 2x2 units of space. I intentionally used an image I hope is clear is being stretched or squished to make the issue clear.

A common solution here might be to set the `left`, `right`, `top` and `bottom` properties of the `OrthographicCamera` to half the dimensions of the canvas so that the camera represents pixels. For example 

```js
bgCamera.left   = -canvas.width   / 2;
bgCamera.right  =  canvas.width   / 2;
bgCamera.top    =  canvsas.height / 2;
bgCamera.bottom = -canvas.height  / 2;
```

We'd then look at the size of the image and scale the `bgMesh` to match, checking that we choose a scale that covers the entire background.

```js
// compute scale to make image fit horizontally
let coverScale = bgTexture.image.width / canvas.width;
// check if it fills vertically
if (bgTexture.image.height * coverScale < canvas.height) {
  // no so scale to fit vertically
  coverScale = bgTexture.image.height / canvas.height;
}
bgMesh.scale.x = bgTexture.image.width  * coverScale;
bgMesh.scale.y = bgTexture.image.height * coverScale;
```

It turns out though there's a simpler solution. As it is we know a scale of (1, 1) will cover the screen. A scale of (1 / canvasAspect, 1) would make the plane a square. A but we need the plane to reflect the aspect of the image as well so this works.

```js
// Scale the background plane to cover the canvas and keep the image's aspect correct.
// Note the image may not have loaded yet.
const canvasAspect = canvas.clientWidth / canvas.clientHeight;
const imageAspect = bgTexture.image ? bgTexture.image.width / bgTexture.image.height : 1;
const aspect = imageAspect / canvasAspect;
// choose an axis to have a scale of 1 and the other >= 1
bgMesh.scale.x = aspect > 1 ? aspect : 1;
bgMesh.scale.y = aspect > 1 ? 1 : 1 / aspect;
```

and here's THREE.js drawing the background. There is no visible difference from the CSS version at the top but now if we used a [post processinfg effect](threejs-post-processing.html) the background would be affected too.

{{{example url="../threejs-background-separate-scene.html" }}}

Of course a static background is not usually what we want in a 3D scene. Instead we usually want some kind of *skybox*. A skybox is just that, box with the sky draw on it. We put the camera inside the box and it looks like there is a sky in the background.

The most common way to implement a skybox is to make a cube, apply a texture to it, draw it from the inside. On each side of the cube put a texture (using texture coordinates) that looks like some image of the horizon. It's also often common to use a sky sphere or a sky dome with a texture drawn on it. You can probably figure that one out on your own. Just make a cube or sphere, [apply a texture](../threejs-textures.html), mark it as `THREE.BackSide` so we render the inside instead of the outside, and either put it in your scene directly or like above, or, make 2 scenes, a special one to draw the skybox/sphere/dome and the normal one to draw everything else. You'd use your normal `PerspectiveCamera` to draw. No need for the `OrthographicCamera`.

Another solution is to use a Cubemap. A Cubemap is a special kind of texture that has 6 sides, the sides of a cube. Instead of using standard texture coordinates it uses a direction from the center pointing outward to decide where to get a color.

Here are the 6 images of a cubemap from the computer history museum in Mountain View, California.

<div class="threejs_center">
  <img src="../resources/images/cubemaps/computer-history-museum/pos-x.jpg" style="width: 200px" class="border">
  <img src="../resources/images/cubemaps/computer-history-museum/neg-x.jpg" style="width: 200px" class="border">
  <img src="../resources/images/cubemaps/computer-history-museum/pos-y.jpg" style="width: 200px" class="border">
</div>
<div class="threejs_center">
  <img src="../resources/images/cubemaps/computer-history-museum/neg-y.jpg" style="width: 200px" class="border">
  <img src="../resources/images/cubemaps/computer-history-museum/pos-z.jpg" style="width: 200px" class="border">
  <img src="../resources/images/cubemaps/computer-history-museum/neg-z.jpg" style="width: 200px" class="border">
</div>

To use them we use `CubeTextureLoader` to load them and setup a custom `ShaderMaterial` but using an already built in shader.

```js
const bgScene = new THREE.Scene();
let bgMesh;
{
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    'resources/images/cubemaps/computer-history-museum/pos-x.jpg',
    'resources/images/cubemaps/computer-history-museum/neg-x.jpg',
    'resources/images/cubemaps/computer-history-museum/pos-y.jpg',
    'resources/images/cubemaps/computer-history-museum/neg-y.jpg',
    'resources/images/cubemaps/computer-history-museum/pos-z.jpg',
    'resources/images/cubemaps/computer-history-museum/neg-z.jpg',
  ]);

  const shader = THREE.ShaderLib.cube;
  const material = new THREE.ShaderMaterial({
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false,
    side: THREE.BackSide,
  });
  material.uniforms.tCube.value = texture;
  const plane = new THREE.BoxBufferGeometry(2, 2, 2);
  bgMesh = new THREE.Mesh(plane, material);
  bgScene.add(bgMesh);
}
```

We set `side: THREE.BackSide` to see the inside of the cube and we set `depthWrite: false` so that we neither test nor write to the depth buffer.

At render time we don't need a special camera. We just make sure the box is at the same position as the camera and render.

```js
+bgMesh.position.copy(camera.position);
renderer.render(bgScene, camera);
renderer.render(scene, camera);
```

Note: the box must be larger than the camera's `near` setting but not so large that it passes the camera's `far` setting.

Let's add some controls in so we can rotate the camera.

```html
<script src="resources/threejs/r102/js/controls/OrbitControls.js"></script>
```

```js
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
-const far = 5;
+const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
-camera.position.z = 2;
+camera.position.z = 3;

+const controls = new THREE.OrbitControls(camera, canvas);
+controls.target.set(0, 0, 0);
+controls.update();
```

and try it out. Drag on the example to rotate the camera and see the cubemap surrounds us.

{{{example url="../threejs-background-cubemap.html" }}}

Another option is to use an Equirectangular map. This is the kind of picture a [360 camera](https://google.com/search?q=360+camera) takes.

[Here's one](https://hdrihaven.com/hdri/?h=tears_of_steel_bridge) I found from [this site](https://hdrihaven.com).

<div class="threejs_center"><img src="../resources/images/equirectangularmaps/tears_of_steel_bridge_2k.jpg" style="width: 600px"></div>

To use it is similar to the cubemap above. We're only loading a 2D image in this case so we use the `TextureLoader` instead of the `CubeTextureLoader` and we use a different built in shader for our customer shader.

```js
const bgScene = new THREE.Scene();
let bgMesh;
{
  const loader = new THREE.TextureLoader();
  const texture = loader.load(
    'resources/images/equirectangularmaps/tears_of_steel_bridge_2k.jpg',
  );
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;

  const shader = THREE.ShaderLib.equirect;
  const material = new THREE.ShaderMaterial({
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false,
    side: THREE.BackSide,
  });
  material.uniforms.tEquirect.value = texture;
  const plane = new THREE.BoxBufferGeometry(2, 2, 2);
  bgMesh = new THREE.Mesh(plane, material);
  bgScene.add(bgMesh);
}
```

{{{example url="../threejs-background-equirectangularmap.html" }}}

Using equirectagular images requires more complicated shaders and so is slower than using cubemaps. Fortunately it's easy to convert from an equirectangular image to a cubemap. [Here's a site that will do it for you](https://matheowis.github.io/HDRI-to-CubeMap/).