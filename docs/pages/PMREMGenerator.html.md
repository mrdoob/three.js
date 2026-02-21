# PMREMGenerator

This class generates a Prefiltered, Mipmapped Radiance Environment Map (PMREM) from a cubeMap environment texture. This allows different levels of blur to be quickly accessed based on material roughness. It is packed into a special CubeUV format that allows us to perform custom interpolation so that we can support nonlinear formats such as RGBE. Unlike a traditional mipmap chain, it only goes down to the LOD\_MIN level (above), and then creates extra even more filtered 'mips' at the same LOD\_MIN resolution, associated with higher roughness levels. In this way we maintain resolution to smoothly interpolate diffuse lighting while limiting sampling computation.

The prefiltering uses GGX VNDF (Visible Normal Distribution Function) importance sampling based on "Sampling the GGX Distribution of Visible Normals" (Heitz, 2018) to generate environment maps that accurately match the GGX BRDF used in material rendering for physically-based image-based lighting.

## Constructor

### new PMREMGenerator( renderer : WebGLRenderer )

Constructs a new PMREM generator.

**renderer**

The renderer.

## Methods

### .compileCubemapShader()

Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during your texture's network fetch for increased concurrency.

### .compileEquirectangularShader()

Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during your texture's network fetch for increased concurrency.

### .dispose()

Disposes of the PMREMGenerator's internal memory. Note that PMREMGenerator is a static class, so you should not need more than one PMREMGenerator object. If you do, calling dispose() on one of them will cause any others to also become unusable.

### .fromCubemap( cubemap : Texture, renderTarget : WebGLRenderTarget ) : WebGLRenderTarget

Generates a PMREM from an cubemap texture, which can be either LDR or HDR. The ideal input cube size is 256 x 256, as this matches best with the 256 x 256 cubemap output.

**cubemap**

The cubemap texture to be converted.

**renderTarget**

The render target to use.

Default is `null`.

**Returns:** The resulting PMREM.

### .fromEquirectangular( equirectangular : Texture, renderTarget : WebGLRenderTarget ) : WebGLRenderTarget

Generates a PMREM from an equirectangular texture, which can be either LDR or HDR. The ideal input image size is 1k (1024 x 512), as this matches best with the 256 x 256 cubemap output.

**equirectangular**

The equirectangular texture to be converted.

**renderTarget**

The render target to use.

Default is `null`.

**Returns:** The resulting PMREM.

### .fromScene( scene : Scene, sigma : number, near : number, far : number, options : Object ) : WebGLRenderTarget

Generates a PMREM from a supplied Scene, which can be faster than using an image if networking bandwidth is low. Optional sigma specifies a blur radius in radians to be applied to the scene before PMREM generation. Optional near and far planes ensure the scene is rendered in its entirety.

**scene**

The scene to be captured.

**sigma**

The blur radius in radians.

Default is `0`.

**near**

The near plane distance.

Default is `0.1`.

**far**

The far plane distance.

Default is `100`.

**options**

The configuration options.

Default is `{}`.

**size**

The texture size of the PMREM.

Default is `256`.

**position**

The position of the internal cube camera that renders the scene.

Default is `origin`.

**Returns:** The resulting PMREM.

## Source

[src/extras/PMREMGenerator.js](https://github.com/mrdoob/three.js/blob/master/src/extras/PMREMGenerator.js)