Title: Three.js Backgrounds and Skyboxes
Description: How to add a background in THREE.js
TOC: Add a Background or Skybox

Most of the articles here use a solid color for a background.

Adding as static background can be as simple as setting some CSS. Taking
an example from [the article on making THREE.js responsive](threejs-responsive.html)
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

and we need to tell the `WebGLRenderer` to use `alpha` so places we are not
drawing anything are transparent.

```js
function main() {
  const canvas = document.querySelector('#c');
-  const renderer = new THREE.WebGLRenderer({canvas});
+  const renderer = new THREE.WebGLRenderer({
+    canvas,
+    alpha: true,
+  });
```

And we get a background.

{{{example url="../threejs-background-css.html" }}}

If we want the background to be able to be affected by [post processing
effects](threejs-post-processing.html) then we need to draw the background using
THREE.js.

THREE.js makes this some what simple. We can just set the background of the scene to
a texture.

```js
const loader = new THREE.TextureLoader();
const bgTexture = loader.load('resources/images/daikanyama.jpg');
scene.background = bgTexture; 
```

which gives us

{{{example url="../threejs-background-scene-background.html" }}}

This gets us a background image but its stretched to fit the screen.

We can solve this issue by setting the `repeat` and `offset` properties of
the texture to show only a portion of image.

```js
function render(time) {

   ...

+  // Set the repeat and offset properties of the background texture
+  // to keep the image's aspect correct.
+  // Note the image may not have loaded yet.
+  const canvasAspect = canvas.clientWidth / canvas.clientHeight;
+  const imageAspect = bgTexture.image ? bgTexture.image.width / bgTexture.image.height : 1;
+  const aspect = imageAspect / canvasAspect;
+
+  bgTexture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
+  bgTexture.repeat.x = aspect > 1 ? 1 / aspect : 1;
+
+  bgTexture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
+  bgTexture.repeat.y = aspect > 1 ? 1 : aspect;

  ...

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
```

and now THREE.js drawing the background. There is no visible difference from
the CSS version at the top but now if we used a [post processing
effect](threejs-post-processing.html) the background would be affected too.

{{{example url="../threejs-background-scene-background-fixed-aspect.html" }}}

Of course a static background is not usually what we want in a 3D scene. Instead
we usually want some kind of *skybox*. A skybox is just that, box with the sky
draw on it. We put the camera inside the box and it looks like there is a sky in
the background.

The most common way to implement a skybox is to make a cube, apply a texture to
it, draw it from the inside. On each side of the cube put a texture (using
texture coordinates) that looks like some image of the horizon. It's also often
common to use a sky sphere or a sky dome with a texture drawn on it. You can
probably figure that one out on your own. Just make a cube or sphere, 
[apply a texture](threejs-textures.html), mark it as `THREE.BackSide` so we 
render the inside instead of the outside, and either put it in your scene directly 
or like above, or, make 2 scenes, a special one to draw the skybox/sphere/dome and the
normal one to draw everything else. You'd use your normal `PerspectiveCamera` to
draw. No need for the `OrthographicCamera`.

Another solution is to use a *Cubemap*. A Cubemap is a special kind of texture
that has 6 sides, the sides of a cube. Instead of using standard texture
coordinates it uses a direction from the center pointing outward to decide where
to get a color.

Here are the 6 images of a cubemap from the computer history museum in Mountain
View, California.

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

To use them we use `CubeTextureLoader` to load them and then use that as a the
scene's background.

```js
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
  scene.background = texture;
}
```

At render time we don't need to adjust the texture like we did above

```js
function render(time) {

   ...

-  // Set the repeat and offset properties of the background texture
-  // to keep the image's aspect correct.
-  // Note the image may not have loaded yet.
-  const canvasAspect = canvas.clientWidth / canvas.clientHeight;
-  const imageAspect = bgTexture.image ? bgTexture.image.width / bgTexture.image.height : 1;
-  const aspect = imageAspect / canvasAspect;
-
-  bgTexture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
-  bgTexture.repeat.x = aspect > 1 ? 1 / aspect : 1;
-
-  bgTexture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
-  bgTexture.repeat.y = aspect > 1 ? 1 : aspect;

  ...

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
```

Let's add some controls in so we can rotate the camera.

```js
import {OrbitControls} from './resources/threejs/r113/examples/jsm/controls/OrbitControls.js';
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

+const controls = new OrbitControls(camera, canvas);
+controls.target.set(0, 0, 0);
+controls.update();
```

and try it out. Drag on the example to rotate the camera and see the cubemap
surrounds us.

{{{example url="../threejs-background-cubemap.html" }}}

Another option is to use an Equirectangular map. This is the kind of picture a
[360 camera](https://google.com/search?q=360+camera) takes.

[Here's one](https://hdrihaven.com/hdri/?h=tears_of_steel_bridge) I found from
[this site](https://hdrihaven.com).

<div class="threejs_center"><img src="../resources/images/equirectangularmaps/tears_of_steel_bridge_2k.jpg" style="width: 600px"></div>

To use it is a little more involved. We make a separate `Scene`, a
`BoxBufferGeometry`, and a custom `ShaderMaterial` but using a built in shader.
We use these to render the background by itself before rendering the scene we
already have.

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

The box must be larger than the camera's `near` setting but not so large that 
it passes the camera's `far` setting.

We set `side: THREE.BackSide` to see the inside of the box and we set
`depthWrite: false` so that we neither test nor write to the depth buffer.

At render time we just make sure the box is at the same position as the camera
and render the new scene

```js
function render(time)

    /* ... */

+    bgMesh.position.copy(camera.position);
+    renderer.render(bgScene, bgCamera);
    renderer.render(scene, camera);
```

By default every time `renderer.render` is called THREE.js will clear the
canvas. We need to tell it not to do that otherwise the second call to render
will clear our first render and we won't see the background. We can do this by
setting `renderer.autoClearColor = false`.

```js
const renderer = new THREE.WebGLRenderer({canvas});
+renderer.autoClearColor = false;
```

And there we have it.

{{{example url="../threejs-background-equirectangularmap.html" }}}

Using equirectagular images requires more complicated shaders and so is slower than using cubemaps. Fortunately it's easy to convert from an equirectangular image to a cubemap. [Here's a site that will do it for you](https://matheowis.github.io/HDRI-to-CubeMap/).