*Inheritance: EventDispatcher → RenderTarget → WebGLRenderTarget →*

# WebGL3DRenderTarget

A 3D render target used in context of [WebGLRenderer](WebGLRenderer.html).

## Constructor

### new WebGL3DRenderTarget( width : number, height : number, depth : number, options : RenderTarget~Options )

Constructs a new 3D render target.

**width**

The width of the render target.

Default is `1`.

**height**

The height of the render target.

Default is `1`.

**depth**

The height of the render target.

Default is `1`.

**options**

The configuration object.

## Properties

### .isWebGL3DRenderTarget : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .texture : Data3DTexture

Overwritten with a different texture type.

**Overrides:** [WebGLRenderTarget#texture](WebGLRenderTarget.html#texture)

## Source

[src/renderers/WebGL3DRenderTarget.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/WebGL3DRenderTarget.js)