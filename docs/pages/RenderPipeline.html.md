# RenderPipeline

This module is responsible to manage the rendering pipeline setups in apps. You usually create a single instance of this class and use it to define the output of your render pipeline and post processing effect chain.

Note: This module can only be used with `WebGPURenderer`.

## Code Example

```js
const renderPipeline = new RenderPipeline( renderer );
const scenePass = pass( scene, camera );
renderPipeline.outputNode = scenePass;
```

## Constructor

### new RenderPipeline( renderer : Renderer, outputNode : Node.<vec4> )

Constructs a new render pipeline management module.

**renderer**

A reference to the renderer.

**outputNode**

An optional output node.

## Properties

### .context : Object (readonly)

Returns the current context of the render pipeline stack.

### .needsUpdate : Node.<vec4>

Must be set to `true` when the output node changes.

### .outputColorTransform : boolean

Whether the default output tone mapping and color space transformation should be enabled or not.

It is enabled by default by it must be disabled when effects must be executed after tone mapping and color space conversion. A typical example is FXAA which requires sRGB input.

When set to `false`, the app must control the output transformation with `RenderOutputNode`.

```js
const outputPass = renderOutput( scenePass );
```

### .outputNode : Node.<vec4>

A node which defines the final output of the rendering pipeline. This is usually the last node in a chain of effect nodes.

### .renderer : Renderer

A reference to the renderer.

## Methods

### .dispose()

Frees internal resources.

### .render()

When `RenderPipeline` is used to apply rendering pipeline and post processing effects, the application must use this version of `render()` inside its animation loop (not the one from the renderer).

### .renderAsync() : Promise (async)

When `RenderPipeline` is used to apply rendering pipeline and post processing effects, the application must use this version of `renderAsync()` inside its animation loop (not the one from the renderer).

**Deprecated:** Yes

**Returns:** A Promise that resolves when the render has been finished.

## Source

[src/renderers/common/RenderPipeline.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/RenderPipeline.js)