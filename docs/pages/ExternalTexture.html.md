*Inheritance: EventDispatcher → Texture →*

# ExternalTexture

Represents a texture created externally with the same renderer context.

This may be a texture from a protected media stream, device camera feed, or other data feeds like a depth sensor.

Note that this class is only supported in [WebGLRenderer](WebGLRenderer.html), and in the [WebGPURenderer](WebGPURenderer.html) WebGPU backend.

## Constructor

### new ExternalTexture( sourceTexture : WebGLTexture | GPUTexture )

Creates a new raw texture.

**sourceTexture**

The external texture.

Default is `null`.

## Properties

### .isExternalTexture : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .sourceTexture : WebGLTexture | GPUTexture

The external source texture.

Default is `null`.

## Source

[src/textures/ExternalTexture.js](https://github.com/mrdoob/three.js/blob/master/src/textures/ExternalTexture.js)