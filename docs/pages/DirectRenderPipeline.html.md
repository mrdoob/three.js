*Inheritance: RenderPipeline →*

# DirectRenderPipeline

An alternative render pipeline that applies output processing directly in material shaders. This avoids the intermediate framebuffer and output pass used by [Renderer](Renderer.html), but changes blending and is not compatible with materials that sample the framebuffer, such as transmissive materials.

Note: This module can only be used with `WebGPURenderer`.

## Code Example

```js
const renderPipeline = new DirectRenderPipeline( renderer );
renderPipeline.render( scene, camera );
```

## Constructor

### new DirectRenderPipeline( renderer : Renderer, outputNode : Node.<vec4> )

Constructs a direct render pipeline.

**renderer**

A reference to the renderer.

**outputNode**

An optional output node.

## Properties

### .isDirectRenderPipeline : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .render( scene : Object3D, camera : Camera )

Renders the scene with output processing applied directly in material shaders.

**scene**

The scene or object to render.

**camera**

The camera.

**Overrides:** [RenderPipeline#render](RenderPipeline.html#render)

## Source

[src/renderers/common/DirectRenderPipeline.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/DirectRenderPipeline.js)