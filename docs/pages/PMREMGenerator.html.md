# PMREMGenerator

Generates a Prefiltered, Mipmapped Radiance Environment Map (PMREM) for image-based lighting. The result is a cube render target whose mip levels store GGX-filtered radiance at increasing roughness, from a mirror at level 0 to roughness 1. See [PMREMGenerator.lodToRoughness](PMREMGenerator.html#.lodToRoughness) for the mapping.

Filtering assumes the view direction equals the surface normal. Sharp levels use GGX visible normal sampling (Heitz, 2018), while rough levels integrate a lower-resolution source cubemap.

## Constructor

### new PMREMGenerator( renderer : WebGLRenderer )

Constructs a new PMREM generator.

**renderer**

The renderer.

See:

*   [Sampling the GGX Distribution of Visible Normals](https://jcgt.org/published/0007/04/01/)

## Methods

### .compileCubemapShader()

Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during your texture's network fetch for increased concurrency.

### .compileEquirectangularShader()

Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during your texture's network fetch for increased concurrency.

### .dispose()

Disposes of the PMREMGenerator's internal memory. The PMREMs it returned belong to the caller and are not disposed.

### .fromCubemap( cubemap : Texture, renderTarget : WebGLCubeRenderTarget ) : WebGLCubeRenderTarget

Generates a PMREM from an LDR or HDR cubemap. The cube face size matches the input, rounded down to a power of two and at least 256.

**cubemap**

The cubemap texture to be converted.

**renderTarget**

The render target to use.

Default is `null`.

**Returns:** The resulting PMREM.

### .fromEquirectangular( equirectangular : Texture, renderTarget : WebGLCubeRenderTarget ) : WebGLCubeRenderTarget

Generates a PMREM from an LDR or HDR equirectangular texture. The cube face size is one quarter of the image width, rounded down to a power of two and at least 256.

**equirectangular**

The equirectangular texture to be converted.

**renderTarget**

The render target to use.

Default is `null`.

**Returns:** The resulting PMREM.

### .fromScene( scene : Scene, sigma : number, near : number, far : number, options : Object ) : WebGLCubeRenderTarget

Generates a PMREM from a scene, optionally applying a Gaussian blur before GGX filtering.

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

The texture size of the PMREM, rounded down to a power of two and at least 256.

Default is `256`.

**position**

The position of the internal cube camera that renders the scene.

Default is `origin`.

**Returns:** The resulting PMREM.

## Static Methods

### .lodToRoughness( lod : number, maxLod : number ) : number

Returns the roughness a mip level of a PMREM has been prefiltered for. The inverse mapping is used by the renderers when sampling a PMREM.

**lod**

The mip level.

**maxLod**

The last mip level of the PMREM.

**Returns:** The roughness.

## Source

[src/extras/PMREMGenerator.js](https://github.com/mrdoob/three.js/blob/master/src/extras/PMREMGenerator.js)