# EffectComposer

Used to implement post-processing effects in three.js. The class manages a chain of post-processing passes to produce the final visual result. Post-processing passes are executed in order of their addition/insertion. The last pass is automatically rendered to screen.

This module can only be used with [WebGLRenderer](WebGLRenderer.html).

## Code Example

```js
const composer = new EffectComposer( renderer );
// adding some passes
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );
const glitchPass = new GlitchPass();
composer.addPass( glitchPass );
const outputPass = new OutputPass()
composer.addPass( outputPass );
function animate() {
	composer.render(); // instead of renderer.render()
}
```

## Import

EffectComposer is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
```

## Constructor

### new EffectComposer( renderer : WebGLRenderer, renderTarget : WebGLRenderTarget )

Constructs a new effect composer.

**renderer**

The renderer.

**renderTarget**

This render target and a clone will be used as the internal read and write buffers. If not given, the composer creates the buffers automatically.

## Properties

### .passes : Array.<Pass>

An array representing the (ordered) chain of post-processing passes.

### .readBuffer : WebGLRenderTarget

A reference to the internal read buffer. Passes usually read the previous render result from this buffer.

### .renderToScreen : boolean

Whether the final pass is rendered to the screen (default framebuffer) or not.

Default is `true`.

### .renderer : WebGLRenderer

The renderer.

### .writeBuffer : WebGLRenderTarget

A reference to the internal write buffer. Passes usually write their result into this buffer.

## Methods

### .addPass( pass : Pass )

Adds the given pass to the pass chain.

**pass**

The pass to add.

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever the composer is no longer used in your app.

### .insertPass( pass : Pass, index : number )

Inserts the given pass at a given index.

**pass**

The pass to insert.

**index**

The index into the pass chain.

### .isLastEnabledPass( passIndex : number ) : boolean

Returns `true` if the pass for the given index is the last enabled pass in the pass chain.

**passIndex**

The pass index.

**Returns:** Whether the pass for the given index is the last pass in the pass chain.

### .removePass( pass : Pass )

Removes the given pass from the pass chain.

**pass**

The pass to remove.

### .render( deltaTime : number )

Executes all enabled post-processing passes in order to produce the final frame.

**deltaTime**

The delta time in seconds. If not given, the composer computes its own time delta value.

### .reset( renderTarget : WebGLRenderTarget )

Resets the internal state of the EffectComposer.

**renderTarget**

This render target has the same purpose like the one from the constructor. If set, it is used to setup the read and write buffers.

### .setPixelRatio( pixelRatio : number )

Sets device pixel ratio. This is usually used for HiDPI device to prevent blurring output. Setting the pixel ratio will automatically resize the composer.

**pixelRatio**

The pixel ratio to set.

### .setSize( width : number, height : number )

Resizes the internal read and write buffers as well as all passes. Similar to [WebGLRenderer#setSize](WebGLRenderer.html#setSize), this method honors the current pixel ration.

**width**

The width in logical pixels.

**height**

The height in logical pixels.

### .swapBuffers()

Swaps the internal read/write buffers.

## Source

[examples/jsm/postprocessing/EffectComposer.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/EffectComposer.js)