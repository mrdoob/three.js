Title: Three.js Post Processing
Description: How to Post Process in THREE.js
TOC: Post Processing

*Post processing* generally refers to applying some kind of effect or filter to
a 2D image. In the case of THREE.js we have a scene with a bunch of meshes in
it. We render that scene into a 2D image. Normally that image is rendered
directly into the canvas and displayed in the browser but instead we can [render
it to a render target](threejs-rendertargets.html) and then apply some *post
processing* effects to the result before drawing it to the canvas. It's called
post processing because it happens after (post) the main scene processing.

Examples of post processing are Instagram like filters,
Photoshop filters, etc...

THREE.js has some example classes to help setup a post processing pipeline. The
way it works is you create an `EffectComposer` and to it you add multiple `Pass`
objects. You then call `EffectComposer.render` and it renders your scene to a
[render target](threejs-rendertargets.html) and then applies each `Pass`.

Each `Pass` can be some post processing effect like adding a vignette, blurring,
applying a bloom, applying film grain, adjusting the hue, saturation, contrast,
etc... and finally rendering the result to the canvas.

It's a little bit important to understand how `EffectComposer` functions. It
creates two [render targets](threejs-rendertargets.html). Let's call them
**rtA** and **rtB**.

Then, you call `EffectComposer.addPass` to add each pass in the order you want
to apply them. The passes are then applied *something like* this.

<div class="threejs_center"><img src="resources/images/threejs-postprocessing.svg" style="width: 600px"></div>

First the scene you passed into `RenderPass` is rendered to **rtA**, then
**rtA** is passed to the next pass, whatever it is. That pass uses **rtA** as
input to do whatever it does and writes the results to **rtB**. **rtB** is then
passed to the next pass which uses **rtB** as input and writes back to **rtA**.
This continues through all the passes. 

Each `Pass` has 4 basic options

## `enabled`

Whether or not to use this pass

## `needsSwap`

Whether or not to swap `rtA` and `rtB` after finishing this pass

## `clear`

Whether are not to clear before rendering this pass

## `renderToScreen`

Whether or not to render to the canvas instead the current destination render
target. Usually you need to set this to true on the last pass you add to your
`EffectComposer`.

Let's put together a basic example. We'll start with the example from [the
article on responsiveness](threejs-responsive.html).

To that first we create an `EffectComposer`.

```js
const composer = new EffectComposer(renderer);
```

Then as the first pass we add a `RenderPass` that will render our scene with our
camera into the first render target.

```js
composer.addPass(new RenderPass(scene, camera));
```

Next we add a `BloomPass`. A `BloomPass` renders its input to a generally
smaller render target and blurs the result. It then adds that blurred result on
top of the original input. This makes the scene *bloom*

```js
const bloomPass = new BloomPass(
    1,    // strength
    25,   // kernel size
    4,    // sigma ?
    256,  // blur render target resolution
);
composer.addPass(bloomPass);
```

Finally we had a `FilmPass` that draws noise and scanlines on top of its input.

```js
const filmPass = new FilmPass(
    0.35,   // noise intensity
    0.025,  // scanline intensity
    648,    // scanline count
    false,  // grayscale
);
filmPass.renderToScreen = true;
composer.addPass(filmPass);
```

Since the `filmPass` is the last pass we set its `renderToScreen` property to
true to tell it to render to the canvas. Without setting this it would instead
render to the next render target.

To use these classes we need to import a bunch of scripts.

```js
import {EffectComposer} from './resources/threejs/r110/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from './resources/threejs/r110/examples/jsm/postprocessing/RenderPass.js';
import {BloomPass} from './resources/threejs/r110/examples/jsm/postprocessing/BloomPass.js';
import {FilmPass} from './resources/threejs/r110/examples/jsm/postprocessing/FilmPass.js';
```

For pretty much any post processing `EffectComposer.js`, and `RenderPass.js`
are required.

The last things we need to do are to use `EffectComposer.render` instead of
`WebGLRenderer.render` *and* to tell the `EffectComposer` to match the size of
the canvas.

```js
-function render(now) {
-  time *= 0.001;
+let then = 0;
+function render(now) {
+  now *= 0.001;  // convert to seconds
+  const deltaTime = now - then;
+  then = now;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
+    composer.setSize(canvas.width, canvas.height);
  }

  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * .1;
-    const rot = time * speed;
+    const rot = now * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

-  renderer.render(scene, camera);
+  composer.render(deltaTime);

  requestAnimationFrame(render);
}
```

`EffectComposer.render` takes a `deltaTime` which is the time in seconds since
the last frame was rendered. It passes this to the various effects in case any
of them are animated. In this case the `FilmPass` is animated.

{{{example url="../threejs-postprocessing.html" }}}

To change effect parameters at runtime usually requires setting uniform values.
Let's add a gui to adjust some of the parameters. Figuring out which values you
can easily adjust and how to adjust them requires digging through the code for
that effect.

Looking inside
[`BloomPass.js`](https://github.com/mrdoob/three.js/blob/master/examples/js/postprocessing/BloomPass.js)
I found this line:

```js
this.copyUniforms[ "opacity" ].value = strength;
```

So we can set the strength by setting

```js
bloomPass.copyUniforms.opacity.value = someValue;
```

Similarly looking in
[`FilmPass.js`](https://github.com/mrdoob/three.js/blob/master/examples/js/postprocessing/FilmPass.js)
I found these lines:

```js
if ( grayscale !== undefined )	this.uniforms.grayscale.value = grayscale;
if ( noiseIntensity !== undefined ) this.uniforms.nIntensity.value = noiseIntensity;
if ( scanlinesIntensity !== undefined ) this.uniforms.sIntensity.value = scanlinesIntensity;
if ( scanlinesCount !== undefined ) this.uniforms.sCount.value = scanlinesCount;
```

So which makes it pretty clear how to set them.

Let's make a quick GUI to set those values

```js
import {GUI} from '../3rdparty/dat.gui.module.js';
```

and

```js
const gui = new GUI();
{
  const folder = gui.addFolder('BloomPass');
  folder.add(bloomPass.copyUniforms.opacity, 'value', 0, 2).name('strength');
  folder.open();
}
{
  const folder = gui.addFolder('FilmPass');
  folder.add(filmPass.uniforms.grayscale, 'value').name('grayscale');
  folder.add(filmPass.uniforms.nIntensity, 'value', 0, 1).name('noise intensity');
  folder.add(filmPass.uniforms.sIntensity, 'value', 0, 1).name('scanline intensity');
  folder.add(filmPass.uniforms.sCount, 'value', 0, 1000).name('scanline count');
  folder.open();
}
```

and now we can adjust those settings

{{{example url="../threejs-postprocessing-gui.html" }}}

That was a small step to making our own effect.

Post processing effects use shaders. Shaders are written in a language called
[GLSL (Graphics Library Shading Language)](https://www.khronos.org/files/opengles_shading_language.pdf). Going
over the entire language is way too large a topic for these articles. A few
resources to get start from would be maybe [this article](https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html)
and maybe [the Book of Shaders](https://thebookofshaders.com/).

I think an example to get you started would be helpful though so let's make a
simple GLSL post processing shader. We'll make one that lets us multiply the
image by a color.

For post processing THREE.js provides a useful helper called the `ShaderPass`.
It takes an object with info defining a vertex shader, a fragment shader, and
the default inputs. It will handling setting up which texture to read from to
get the previous pass's results and where to render to, either one of the
`EffectComposer`s render target or the canvas.

Here's a simple post processing shader that multiplies the previous pass's
result by a color. 

```js
const colorShader = {
  uniforms: {
    tDiffuse: { value: null },
    color:    { value: new THREE.Color(0x88CCFF) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform vec3 color;
    void main() {
      vec4 previousPassColor = texture2D(tDiffuse, vUv);
      gl_FragColor = vec4(
          previousPassColor.rgb * color,
          previousPassColor.w);
    }
  `,
};
```

Above `tDiffuse` is the name that `ShaderPass` uses to pass in the previous
pass's result texture so we pretty much always need that. We then declare
`color` as a THREE.js `Color`.

Next we need a vertex shader. For post processing the vertex shader shown here
is pretty much standard and rarely needs to be changed. Without going into too
many details (see articles linked above) the variables `uv`, `projectionMatrix`,
`modelViewMatrix` and `position` are all magically added by THREE.js.

Finally we create a fragment shader. In it we get get pixel color from the
previous pass with this line

```glsl
vec4 previousPassColor = texture2D(tDiffuse, vUv);
```

we multiply it by our color and set `gl_FragColor` to the result

```glsl
gl_FragColor = vec4(
    previousPassColor.rgb * color,
    previousPassColor.a);
```

Adding some simple GUI to set the 3 values of the color

```js
const gui = new GUI();
gui.add(colorPass.uniforms.color.value, 'r', 0, 4).name('red');
gui.add(colorPass.uniforms.color.value, 'g', 0, 4).name('green');
gui.add(colorPass.uniforms.color.value, 'b', 0, 4).name('blue');
```

Gives us a simple postprocessing effect that multiplies by a color.

{{{example url="../threejs-postprocessing-custom.html" }}}

As mentioned about all the details of how to write GLSL and custom shaders is
too much for these articles. If you really want to know how WebGL itself works
then check out [these articles](https://webglfundamentals.org). Another great
resources is just to 
[read through the existing post processing shaders in the THREE.js repo](https://github.com/mrdoob/three.js/tree/master/examples/js/shaders). Some
are more complicated than others but if you start with the smaller ones you can
hopefully get an idea of how they work.

Most of the post processing effects in the THREE.js repo are unfortunately
undocumented so to use them you'll have to [read through the examples](https://github.com/mrdoob/three.js/tree/master/examples) or 
[the code for the effects themselves](https://github.com/mrdoob/three.js/tree/master/examples/js/postprocessing).
Hopefully these simple example and the article on 
[render targets](threejs-rendertargets.html) provide enough context to get started.
