*Inheritance: EventDispatcher → RenderTarget → WebGLRenderTarget →*

# WebGLArrayRenderTarget

An array render target used in context of [WebGLRenderer](WebGLRenderer.html).

## Constructor

### new WebGLArrayRenderTarget( width : number, height : number, depth : number, options : RenderTarget~Options )

Constructs a new array render target.

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

### .isWebGLArrayRenderTarget : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .texture : DataArrayTexture

Overwritten with a different texture type.

**Overrides:** [WebGLRenderTarget#texture](WebGLRenderTarget.html#texture)

## Source

[src/renderers/WebGLArrayRenderTarget.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/WebGLArrayRenderTarget.js)