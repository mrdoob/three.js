*Inheritance: EventDispatcher → RenderTarget → WebGLRenderTarget → WebGLCubeRenderTarget →*

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

## Methods

### .fromEquirectangularTexture( renderer : Renderer, texture : Texture ) : CubeRenderTarget

Converts the given equirectangular texture to a cube map.

**renderer**

The renderer.

**texture**

The equirectangular texture.

**Overrides:** [WebGLCubeRenderTarget#fromEquirectangularTexture](WebGLCubeRenderTarget.html#fromEquirectangularTexture)

**Returns:** A reference to this cube render target.

## Source

[src/renderers/common/CubeRenderTarget.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/CubeRenderTarget.js)