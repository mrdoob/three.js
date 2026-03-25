# WebGLRenderer

This renderer uses WebGL 2 to display scenes.

WebGL 1 is not supported since `r163`.

## Constructor

### new WebGLRenderer( parameters : WebGLRenderer~Options )

Constructs a new WebGL renderer.

**parameters**

The configuration parameter.

## Properties

### .autoClear : boolean

Whether the renderer should automatically clear its output before rendering a frame or not.

Default is `true`.

### .autoClearColor : boolean

If [WebGLRenderer#autoClear](WebGLRenderer.html#autoClear) set to `true`, whether the renderer should clear the color buffer or not.

Default is `true`.

### .autoClearDepth : boolean

If [WebGLRenderer#autoClear](WebGLRenderer.html#autoClear) set to `true`, whether the renderer should clear the depth buffer or not.

Default is `true`.

### .autoClearStencil : boolean

If [WebGLRenderer#autoClear](WebGLRenderer.html#autoClear) set to `true`, whether the renderer should clear the stencil buffer or not.

Default is `true`.

### .capabilities : WebGLRenderer~Capabilities

Holds details about the capabilities of the current rendering context.

### .clippingPlanes : Array.<Plane>

User-defined clipping planes specified in world space. These planes apply globally. Points in space whose dot product with the plane is negative are cut away.

### .coordinateSystem : WebGLCoordinateSystem | WebGPUCoordinateSystem (readonly)

Defines the coordinate system of the renderer.

In `WebGLRenderer`, the value is always `WebGLCoordinateSystem`.

Default is `WebGLCoordinateSystem`.

### .debug : Object

A object with debug configuration settings.

*   `checkShaderErrors`: If it is `true`, defines whether material shader programs are checked for errors during compilation and linkage process. It may be useful to disable this check in production for performance gain. It is strongly recommended to keep these checks enabled during development. If the shader does not compile and link, it will not work and associated material will not render.
*   `onShaderError(gl, program, glVertexShader,glFragmentShader)`: A callback function that can be used for custom error reporting. The callback receives the WebGL context, an instance of WebGLProgram as well two instances of WebGLShader representing the vertex and fragment shader. Assigning a custom function disables the default error reporting.

### .domElement : HTMLCanvasElement | OffscreenCanvas

A canvas where the renderer draws its output. This is automatically created by the renderer in the constructor (if not provided already); you just need to add it to your page like so:

```js
document.body.appendChild( renderer.domElement );
```

### .extensions : Object

Provides methods for retrieving and testing WebGL extensions.

*   `get(extensionName:string)`: Used to check whether a WebGL extension is supported and return the extension object if available.
*   `has(extensionName:string)`: returns `true` if the extension is supported.

### .info : WebGLRenderer~Info

Holds a series of statistical information about the GPU memory and the rendering process. Useful for debugging and monitoring.

By default these data are reset at each render call but when having multiple render passes per frame (e.g. when using post processing) it can be preferred to reset with a custom pattern. First, set `autoReset` to `false`.

```js
renderer.info.autoReset = false;
```

Call `reset()` whenever you have finished to render a single frame.

```js
renderer.info.reset();
```

### .isWebGLRenderer : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .localClippingEnabled : boolean

Whether the renderer respects object-level clipping planes or not.

Default is `false`.

### .outputColorSpace : SRGBColorSpace | LinearSRGBColorSpace

Defines the output color space of the renderer.

Default is `SRGBColorSpace`.

### .properties : Object

Used to track properties of other objects like native WebGL objects.

### .renderLists : Object

Manages the render lists of the renderer.

### .shadowMap : WebGLRenderer~ShadowMap

Interface for managing shadows.

### .sortObjects : boolean

Whether the renderer should sort objects or not.

Note: Sorting is used to attempt to properly render objects that have some degree of transparency. By definition, sorting objects may not work in all cases. Depending on the needs of application, it may be necessary to turn off sorting and use other methods to deal with transparency rendering e.g. manually determining each object's rendering order.

Default is `true`.

### .state : Object

Interface for managing the WebGL state.

### .toneMapping : NoToneMapping | LinearToneMapping | ReinhardToneMapping | CineonToneMapping | ACESFilmicToneMapping | CustomToneMapping | AgXToneMapping | NeutralToneMapping

The tone mapping technique of the renderer.

Default is `NoToneMapping`.

### .toneMappingExposure : number

Exposure level of tone mapping.

Default is `1`.

### .transmissionResolutionScale : number

The normalized resolution scale for the transmission render target, measured in percentage of viewport dimensions. Lowering this value can result in significant performance improvements when using [MeshPhysicalMaterial#transmission](MeshPhysicalMaterial.html#transmission).

Default is `1`.

### .xr : WebXRManager

A reference to the XR manager.

## Methods

### .clear( color : boolean, depth : boolean, stencil : boolean )

Tells the renderer to clear its color, depth or stencil drawing buffer(s). This method initializes the buffers to the current clear color values.

**color**

Whether the color buffer should be cleared or not.

Default is `true`.

**depth**

Whether the depth buffer should be cleared or not.

Default is `true`.

**stencil**

Whether the stencil buffer should be cleared or not.

Default is `true`.

### .clearColor()

Clears the color buffer. Equivalent to calling `renderer.clear( true, false, false )`.

### .clearDepth()

Clears the depth buffer. Equivalent to calling `renderer.clear( false, true, false )`.

### .clearStencil()

Clears the stencil buffer. Equivalent to calling `renderer.clear( false, false, true )`.

### .compile( scene : Object3D, camera : Camera, targetScene : Scene ) : Set.<Material>

Compiles all materials in the scene with the camera. This is useful to precompile shaders before the first rendering. If you want to add a 3D object to an existing scene, use the third optional parameter for applying the target scene.

Note that the (target) scene's lighting and environment must be configured before calling this method.

**scene**

The scene or another type of 3D object to precompile.

**camera**

The camera.

**targetScene**

The target scene.

Default is `null`.

**Returns:** The precompiled materials.

### .compileAsync( scene : Object3D, camera : Camera, targetScene : Scene ) : Promise (async)

Asynchronous version of [WebGLRenderer#compile](WebGLRenderer.html#compile).

This method makes use of the `KHR_parallel_shader_compile` WebGL extension. Hence, it is recommended to use this version of `compile()` whenever possible.

**scene**

The scene or another type of 3D object to precompile.

**camera**

The camera.

**targetScene**

The target scene.

Default is `null`.

**Returns:** A Promise that resolves when the given scene can be rendered without unnecessary stalling due to shader compilation.

### .copyFramebufferToTexture( texture : FramebufferTexture, position : Vector2, level : number )

Copies pixels from the current bound framebuffer into the given texture.

**texture**

The texture.

**position**

The start position of the copy operation.

Default is `null`.

**level**

The mip level. The default represents the base mip.

Default is `0`.

### .copyTextureToTexture( srcTexture : Texture, dstTexture : Texture, srcRegion : Box2 | Box3, dstPosition : Vector2 | Vector3, srcLevel : number, dstLevel : number )

Copies data of the given source texture into a destination texture.

When using render target textures as `srcTexture` and `dstTexture`, you must make sure both render targets are initialized [WebGLRenderer#initRenderTarget](WebGLRenderer.html#initRenderTarget).

**srcTexture**

The source texture.

**dstTexture**

The destination texture.

**srcRegion**

A bounding box which describes the source region. Can be two or three-dimensional.

Default is `null`.

**dstPosition**

A vector that represents the origin of the destination region. Can be two or three-dimensional.

Default is `null`.

**srcLevel**

The source mipmap level to copy.

Default is `0`.

**dstLevel**

The destination mipmap level.

Default is `0`.

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .forceContextLoss()

Simulates a loss of the WebGL context. This requires support for the `WEBGL_lose_context` extension.

### .forceContextRestore()

Simulates a restore of the WebGL context. This requires support for the `WEBGL_lose_context` extension.

### .getActiveCubeFace() : number

Returns the active cube face.

**Returns:** The active cube face.

### .getActiveMipmapLevel() : number

Returns the active mipmap level.

**Returns:** The active mipmap level.

### .getClearAlpha() : number

Returns the clear alpha. Ranges within `[0,1]`.

**Returns:** The clear alpha.

### .getClearColor( target : Color ) : Color

Returns the clear color.

**target**

The method writes the result in this target object.

**Returns:** The clear color.

### .getContext() : WebGL2RenderingContext

Returns the rendering context.

**Returns:** The rendering context.

### .getContextAttributes() : WebGLContextAttributes

Returns the rendering context attributes.

**Returns:** The rendering context attributes.

### .getCurrentViewport( target : Vector2 ) : Vector2

Returns the current viewport definition.

**target**

The method writes the result in this target object.

**Returns:** The current viewport definition.

### .getDrawingBufferSize( target : Vector2 ) : Vector2

Returns the drawing buffer size in physical pixels. This method honors the pixel ratio.

**target**

The method writes the result in this target object.

**Returns:** The drawing buffer size.

### .getPixelRatio() : number

Returns the pixel ratio.

**Returns:** The pixel ratio.

### .getRenderTarget() : WebGLRenderTarget

Returns the active render target.

**Returns:** The active render target. Returns `null` if no render target is currently set.

### .getScissor( target : Vector4 ) : Vector4

Returns the scissor region.

**target**

The method writes the result in this target object.

**Returns:** The scissor region.

### .getScissorTest() : boolean

Returns `true` if the scissor test is enabled.

**Returns:** Whether the scissor test is enabled or not.

### .getSize( target : Vector2 ) : Vector2

Returns the renderer's size in logical pixels. This method does not honor the pixel ratio.

**target**

The method writes the result in this target object.

**Returns:** The renderer's size in logical pixels.

### .getViewport( target : Vector4 ) : Vector4

Returns the viewport definition.

**target**

The method writes the result in this target object.

**Returns:** The viewport definition.

### .initRenderTarget( target : WebGLRenderTarget )

Initializes the given WebGLRenderTarget memory. Useful for initializing a render target so data can be copied into it using [WebGLRenderer#copyTextureToTexture](WebGLRenderer.html#copyTextureToTexture) before it has been rendered to.

**target**

The render target.

### .initTexture( texture : Texture )

Initializes the given texture. Useful for preloading a texture rather than waiting until first render (which can cause noticeable lags due to decode and GPU upload overhead).

**texture**

The texture.

### .readRenderTargetPixels( renderTarget : WebGLRenderTarget, x : number, y : number, width : number, height : number, buffer : TypedArray, activeCubeFaceIndex : number, textureIndex : number )

Reads the pixel data from the given render target into the given buffer.

**renderTarget**

The render target to read from.

**x**

The `x` coordinate of the copy region's origin.

**y**

The `y` coordinate of the copy region's origin.

**width**

The width of the copy region.

**height**

The height of the copy region.

**buffer**

The result buffer.

**activeCubeFaceIndex**

The active cube face index.

**textureIndex**

The texture index of an MRT render target.

Default is `0`.

### .readRenderTargetPixelsAsync( renderTarget : WebGLRenderTarget, x : number, y : number, width : number, height : number, buffer : TypedArray, activeCubeFaceIndex : number, textureIndex : number ) : Promise.<TypedArray> (async)

Asynchronous, non-blocking version of [WebGLRenderer#readRenderTargetPixels](WebGLRenderer.html#readRenderTargetPixels).

It is recommended to use this version of `readRenderTargetPixels()` whenever possible.

**renderTarget**

The render target to read from.

**x**

The `x` coordinate of the copy region's origin.

**y**

The `y` coordinate of the copy region's origin.

**width**

The width of the copy region.

**height**

The height of the copy region.

**buffer**

The result buffer.

**activeCubeFaceIndex**

The active cube face index.

**textureIndex**

The texture index of an MRT render target.

Default is `0`.

**Returns:** A Promise that resolves when the read has been finished. The resolve provides the read data as a typed array.

### .render( scene : Object3D, camera : Camera )

Renders the given scene (or other type of 3D object) using the given camera.

The render is done to a previously specified render target set by calling [WebGLRenderer#setRenderTarget](WebGLRenderer.html#setRenderTarget) or to the canvas as usual.

By default render buffers are cleared before rendering but you can prevent this by setting the property `autoClear` to `false`. If you want to prevent only certain buffers being cleared you can `autoClearColor`, `autoClearDepth` or `autoClearStencil` to `false`. To force a clear, use [WebGLRenderer#clear](WebGLRenderer.html#clear).

**scene**

The scene to render.

**camera**

The camera.

### .resetState()

Can be used to reset the internal WebGL state. This method is mostly relevant for applications which share a single WebGL context across multiple WebGL libraries.

### .setAnimationLoop( callback : onAnimationCallback )

Applications are advised to always define the animation loop with this method and not manually with `requestAnimationFrame()` for best compatibility.

**callback**

The application's animation loop.

### .setClearAlpha( alpha : number )

Sets the clear alpha.

**alpha**

The clear alpha.

### .setClearColor( color : Color, alpha : number )

Sets the clear color and alpha.

**color**

The clear color.

**alpha**

The clear alpha.

Default is `1`.

### .setDrawingBufferSize( width : number, height : number, pixelRatio : number )

This method allows to define the drawing buffer size by specifying width, height and pixel ratio all at once. The size of the drawing buffer is computed with this formula:

```js
size.x = width * pixelRatio;
size.y = height * pixelRatio;
```

**width**

The width in logical pixels.

**height**

The height in logical pixels.

**pixelRatio**

The pixel ratio.

### .setEffects( effects : Array )

Sets the post-processing effects to be applied after rendering.

**effects**

An array of post-processing effects.

### .setOpaqueSort( method : function )

Sets a custom opaque sort function for the render lists. Pass `null` to use the default `painterSortStable` function.

**method**

The opaque sort function.

### .setPixelRatio( value : number )

Sets the given pixel ratio and resizes the canvas if necessary.

**value**

The pixel ratio.

### .setRenderTarget( renderTarget : WebGLRenderTarget, activeCubeFace : number, activeMipmapLevel : number )

Sets the active rendertarget.

**renderTarget**

The render target to set. When `null` is given, the canvas is set as the active render target instead.

**activeCubeFace**

The active cube face when using a cube render target. Indicates the z layer to render in to when using 3D or array render targets.

Default is `0`.

**activeMipmapLevel**

The active mipmap level.

Default is `0`.

### .setScissor( x : number | Vector4, y : number, width : number, height : number )

Sets the scissor region to render from `(x, y)` to `(x + width, y + height)`.

**x**

The horizontal coordinate for the lower left corner of the scissor region origin in logical pixel unit. Or alternatively a four-component vector specifying all the parameters of the scissor region.

**y**

The vertical coordinate for the lower left corner of the scissor region origin in logical pixel unit.

**width**

The width of the scissor region in logical pixel unit.

**height**

The height of the scissor region in logical pixel unit.

### .setScissorTest( boolean : boolean )

Enable or disable the scissor test. When this is enabled, only the pixels within the defined scissor area will be affected by further renderer actions.

**boolean**

Whether the scissor test is enabled or not.

### .setSize( width : number, height : number, updateStyle : boolean )

Resizes the output canvas to (width, height) with device pixel ratio taken into account, and also sets the viewport to fit that size, starting in (0, 0). Setting `updateStyle` to false prevents any style changes to the output canvas.

**width**

The width in logical pixels.

**height**

The height in logical pixels.

**updateStyle**

Whether to update the `style` attribute of the canvas or not.

Default is `true`.

### .setTransparentSort( method : function )

Sets a custom transparent sort function for the render lists. Pass `null` to use the default `reversePainterSortStable` function.

**method**

The opaque sort function.

### .setViewport( x : number | Vector4, y : number, width : number, height : number )

Sets the viewport to render from `(x, y)` to `(x + width, y + height)`.

**x**

The horizontal coordinate for the lower left corner of the viewport origin in logical pixel unit. Or alternatively a four-component vector specifying all the parameters of the viewport.

**y**

The vertical coordinate for the lower left corner of the viewport origin in logical pixel unit.

**width**

The width of the viewport in logical pixel unit.

**height**

The height of the viewport in logical pixel unit.

## Type Definitions

### .Capabilities

WebGLRenderer Capabilities.

**getMaxAnisotropy**  
function

Returns the maximum available anisotropy.

**getMaxPrecision**  
function

Returns the maximum available precision for vertex and fragment shaders.

**logarithmicDepthBuffer**  
boolean

`true` if `logarithmicDepthBuffer` was set to `true` in the constructor.

**maxAttributes**  
number

The number of shader attributes that can be used by the vertex shader.

**maxCubemapSize**  
number

Maximum height \* width of cube map textures that a shader can use.

**maxFragmentUniforms**  
number

The number of uniforms that can be used by a fragment shader.

**maxSamples**  
number

Maximum number of samples in context of Multisample anti-aliasing (MSAA).

**maxTextures**  
number

The maximum number of textures that can be used by a shader.

**maxTextureSize**  
number

Maximum height \* width of a texture that a shader use.

**maxVaryings**  
number

The number of varying vectors that can used by shaders.

**maxVertexTextures**  
number

The number of textures that can be used in a vertex shader.

**maxVertexUniforms**  
number

The maximum number of uniforms that can be used in a vertex shader.

**precision**  
string

The shader precision currently being used by the renderer.

**reversedDepthBuffer**  
boolean

`true` if `reversedDepthBuffer` was set to `true` in the constructor and the rendering context supports `EXT_clip_control`.

### .Info

WebGLRenderer Info

**autoReset**  
boolean

Whether to automatically reset the info by the renderer or not.

Default is `true`.

**memory**  
[WebGLRenderer~InfoMemory](WebGLRenderer.html#~InfoMemory)

Information about allocated objects.

**render**  
[WebGLRenderer~InfoRender](WebGLRenderer.html#~InfoRender)

Information about rendered objects.

**programs**  
Array.<WebGLProgram>

An array `WebGLProgram`s used for rendering.

**reset**  
function

Resets the info object for the next frame.

### .InfoMemory

WebGLRenderer Info Memory

**geometries**  
number

The number of active geometries.

**textures**  
number

The number of active textures.

### .InfoRender

WebGLRenderer Info Render

**frame**  
number

The frame ID.

**calls**  
number

The number of draw calls per frame.

**triangles**  
number

The number of rendered triangles primitives per frame.

**points**  
number

The number of rendered points primitives per frame.

**lines**  
number

The number of rendered lines primitives per frame.

### .Options

WebGLRenderer options.

**canvas**  
HTMLCanvasElement | OffscreenCanvas

A canvas element where the renderer draws its output. If not passed in here, a new canvas element will be created by the renderer.

Default is `null`.

**context**  
WebGL2RenderingContext

Can be used to attach an existing rendering context to this renderer.

Default is `null`.

**precision**  
'highp' | 'mediump' | 'lowp'

The default shader precision. Uses `highp` if supported by the device.

Default is `'highp'`.

**alpha**  
boolean

Controls the default clear alpha value. When set to`true`, the value is `0`. Otherwise it's `1`.

Default is `false`.

**premultipliedAlpha**  
boolean

Whether the renderer will assume colors have premultiplied alpha or not.

Default is `true`.

**antialias**  
boolean

Whether to use the default MSAA or not.

Default is `false`.

**stencil**  
boolean

Whether the drawing buffer has a stencil buffer of at least 8 bits or not.

Default is `false`.

**preserveDrawingBuffer**  
boolean

Whether to preserve the buffer until manually cleared or overwritten.

Default is `false`.

**powerPreference**  
'default' | 'low-power' | 'high-performance'

Provides a hint to the user agent indicating what configuration of GPU is suitable for this WebGL context.

Default is `'default'`.

**failIfMajorPerformanceCaveat**  
boolean

Whether the renderer creation will fail upon low performance is detected.

Default is `false`.

**depth**  
boolean

Whether the drawing buffer has a depth buffer of at least 16 bits.

Default is `true`.

**logarithmicDepthBuffer**  
boolean

Whether to use a logarithmic depth buffer. It may be necessary to use this if dealing with huge differences in scale in a single scene. Note that this setting uses `gl_FragDepth` if available which disables the Early Fragment Test optimization and can cause a decrease in performance.

Default is `false`.

**reversedDepthBuffer**  
boolean

Whether to use a reverse depth buffer. Requires the `EXT_clip_control` extension. This is a more faster and accurate version than logarithmic depth buffer.

Default is `false`.

**outputBufferType**  
number

Defines the type of the output buffer. Use `HalfFloatType` for HDR rendering with tone mapping and post-processing support.

Default is `UnsignedByteType`.

### .ShadowMap

WebGLRenderer Shadow Map.

**enabled**  
boolean

If set to `true`, use shadow maps in the scene.

Default is `false`.

**autoUpdate**  
boolean

Enables automatic updates to the shadows in the scene. If you do not require dynamic lighting / shadows, you may set this to `false`.

Default is `true`.

**needsUpdate**  
boolean

When set to `true`, shadow maps in the scene will be updated in the next `render` call.

Default is `false`.

**type**  
[BasicShadowMap](global.html#BasicShadowMap) | [PCFShadowMap](global.html#PCFShadowMap) | [VSMShadowMap](global.html#VSMShadowMap)

Defines the shadow map type.

Default is `PCFShadowMap`.

## Source

[src/renderers/WebGLRenderer.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/WebGLRenderer.js)