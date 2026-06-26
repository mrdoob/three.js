*Inheritance: EventDispatcher → RenderTarget →*

# CubeRenderTarget

This class represents a cube render target. It is a special version of `WebGLCubeRenderTarget` which is compatible with `WebGPURenderer`.

## Constructor

### new CubeRenderTarget( size : number, options : RenderTarget~Options )

Constructs a new cube render target.

**size**

The size of the render target.

Default is `1`.

**options**

The configuration object.

## Properties

### .isCubeRenderTarget : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .texture : DataArrayTexture

Overwritten with a different texture type.

**Overrides:** [RenderTarget#texture](RenderTarget.html#texture)

## Methods

### .clear( renderer : Renderer, color : boolean, depth : boolean, stencil : boolean )

Clears this cube render target.

**renderer**

The renderer.

**color**

Whether the color buffer should be cleared or not.

Default is `true`.

**depth**

Whether the depth buffer should be cleared or not.

Default is `true`.

**stencil**

Whether the stencil buffer should be cleared or not.

Default is `true`.

### .fromEquirectangularTexture( renderer : Renderer, texture : Texture ) : CubeRenderTarget

Converts the given equirectangular texture to a cube map.

**renderer**

The renderer.

**texture**

The equirectangular texture.

**Returns:** A reference to this cube render target.

## Source

[src/renderers/common/CubeRenderTarget.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/CubeRenderTarget.js)