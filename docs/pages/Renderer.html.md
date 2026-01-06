# Renderer

Base class for renderers.

## Constructor

### new Renderer( backend : Backend, parameters : Renderer~Options )

Constructs a new renderer.

**backend**

The backend the renderer is targeting (e.g. WebGPU or WebGL 2).

**parameters**

The configuration parameter.

## Properties

### .alpha : boolean

Whether the default framebuffer should be transparent or opaque.

Default is `true`.

### .autoClear : boolean

Whether the renderer should automatically clear the current rendering target before execute a `render()` call. The target can be the canvas (default framebuffer) or the current bound render target (custom framebuffer).

Default is `true`.

### .autoClearColor : boolean

When `autoClear` is set to `true`, this property defines whether the renderer should clear the color buffer.

Default is `true`.

### .autoClearDepth : boolean

When `autoClear` is set to `true`, this property defines whether the renderer should clear the depth buffer.

Default is `true`.

### .autoClearStencil : boolean

When `autoClear` is set to `true`, this property defines whether the renderer should clear the stencil buffer.

Default is `true`.

### .backend : Backend

A reference to the current backend.

### .contextNode : ContextNode

A global context node that stores override nodes for specific transformations or calculations. These nodes can be used to replace default behavior in the rendering pipeline.

**value**  
Object

The context value object.

### .coordinateSystem : number (readonly)

The coordinate system of the renderer. The value of this property depends on the selected backend. Either `THREE.WebGLCoordinateSystem` or `THREE.WebGPUCoordinateSystem`.

### .currentColorSpace : string

The current color space of the renderer. When not producing screen output, the color space is always the working color space.

### .currentSamples : number

The current number of samples used for multi-sample anti-aliasing (MSAA).

When rendering to a custom render target, the number of samples of that render target is used. If the renderer needs an internal framebuffer target for tone mapping or color space conversion, the number of samples is set to 0.

### .currentToneMapping : number

The current tone mapping of the renderer. When not producing screen output, the tone mapping is always `NoToneMapping`.

### .debug : DebugConfig

The renderer's debug configuration.

### .depth : boolean

Whether the default framebuffer should have a depth buffer or not.

Default is `true`.

### .domElement : HTMLCanvasElement | OffscreenCanvas

A reference to the canvas element the renderer is drawing to. This value of this property will automatically be created by the renderer.

### .highPrecision : boolean

Enables or disables high precision for model-view and normal-view matrices. When enabled, will use CPU 64-bit precision for higher precision instead of GPU 32-bit for higher performance.

NOTE: 64-bit precision is not compatible with `InstancedMesh` and `SkinnedMesh`.

### .highPrecision : boolean

Returns whether high precision is enabled or not.

### .info : Info

Holds a series of statistical information about the GPU memory and the rendering process. Useful for debugging and monitoring.

### .initialized (readonly)

Returns whether the renderer has been initialized or not.

### .inspector : InspectorBase

The inspector instance. The inspector can be any class that extends from `InspectorBase`.

### .isOutputTarget

Returns `true` if the rendering settings are set to screen output.

### .isRenderer : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .library : NodeLibrary

The node library defines how certain library objects like materials, lights or tone mapping functions are mapped to node types. This is required since although instances of classes like `MeshBasicMaterial` or `PointLight` can be part of the scene graph, they are internally represented as nodes for further processing.

### .lighting : Lighting

A map-like data structure for managing lights.

### .logarithmicDepthBuffer : boolean

Whether logarithmic depth buffer is enabled or not.

Default is `false`.

### .needsFrameBufferTarget

Returns `true` if a framebuffer target is needed to perform tone mapping or color space conversion. If this is the case, the renderer allocates an internal render target for that purpose.

### .onDeviceLost : function

A callback function that defines what should happen when a device/context lost occurs.

### .opaque : boolean

Whether the renderer should render opaque render objects or not.

Default is `true`.

### .outputColorSpace : string

Defines the output color space of the renderer.

Default is `SRGBColorSpace`.

### .samples : number

The number of samples used for multi-sample anti-aliasing (MSAA).

Default is `0`.

### .shadowMap : ShadowMapConfig

The renderer's shadow configuration.

### .sortObjects : boolean

Whether the renderer should sort its render lists or not.

Note: Sorting is used to attempt to properly render objects that have some degree of transparency. By definition, sorting objects may not work in all cases. Depending on the needs of application, it may be necessary to turn off sorting and use other methods to deal with transparency rendering e.g. manually determining each object's rendering order.

Default is `true`.

### .stencil : boolean

Whether the default framebuffer should have a stencil buffer or not.

Default is `false`.

### .toneMapping : number

Defines the tone mapping of the renderer.

Default is `NoToneMapping`.

### .toneMappingExposure : number

Defines the tone mapping exposure.

Default is `1`.

### .transparent : boolean

Whether the renderer should render transparent render objects or not.

Default is `true`.

### .xr : XRManager

The renderer's XR manager.

## Methods

### .clear( color : boolean, depth : boolean, stencil : boolean )

Performs a manual clear operation. This method ignores `autoClear` properties.

**color**

Whether the color buffer should be cleared or not.

Default is `true`.

**depth**

Whether the depth buffer should be cleared or not.

Default is `true`.

**stencil**

Whether the stencil buffer should be cleared or not.

Default is `true`.

### .clearAsync( color : boolean, depth : boolean, stencil : boolean ) : Promise (async)

Async version of [Renderer#clear](Renderer.html#clear).

**color**

Whether the color buffer should be cleared or not.

Default is `true`.

**depth**

Whether the depth buffer should be cleared or not.

Default is `true`.

**stencil**

Whether the stencil buffer should be cleared or not.

Default is `true`.

**Deprecated:** Yes

**Returns:** A Promise that resolves when the clear operation has been executed.

### .clearColor()

Performs a manual clear operation of the color buffer. This method ignores `autoClear` properties.

### .clearColorAsync() : Promise (async)

Async version of [Renderer#clearColor](Renderer.html#clearColor).

**Deprecated:** Yes

**Returns:** A Promise that resolves when the clear operation has been executed.

### .clearDepth()

Performs a manual clear operation of the depth buffer. This method ignores `autoClear` properties.

### .clearDepthAsync() : Promise (async)

Async version of [Renderer#clearDepth](Renderer.html#clearDepth).

**Deprecated:** Yes

**Returns:** A Promise that resolves when the clear operation has been executed.

### .clearStencil()

Performs a manual clear operation of the stencil buffer. This method ignores `autoClear` properties.

### .clearStencilAsync() : Promise (async)

Async version of [Renderer#clearStencil](Renderer.html#clearStencil).

**Deprecated:** Yes

**Returns:** A Promise that resolves when the clear operation has been executed.

### .compile( scene : Object3D, camera : Camera, targetScene : Scene ) : function

Alias for `compileAsync()`.

**scene**

The scene or 3D object to precompile.

**camera**

The camera that is used to render the scene.

**targetScene**

If the first argument is a 3D object, this parameter must represent the scene the 3D object is going to be added.

**Returns:** A Promise that resolves when the compile has been finished.

### .compileAsync( scene : Object3D, camera : Camera, targetScene : Scene ) : Promise (async)

Compiles all materials in the given scene. This can be useful to avoid a phenomenon which is called "shader compilation stutter", which occurs when rendering an object with a new shader for the first time.

If you want to add a 3D object to an existing scene, use the third optional parameter for applying the target scene. Note that the (target) scene's lighting and environment must be configured before calling this method.

**scene**

The scene or 3D object to precompile.

**camera**

The camera that is used to render the scene.

**targetScene**

If the first argument is a 3D object, this parameter must represent the scene the 3D object is going to be added.

Default is `null`.

**Returns:** A Promise that resolves when the compile has been finished.

### .compute( computeNodes : Node | Array.<Node>, dispatchSize : number | Array.<number> | IndirectStorageBufferAttribute ) : Promise | undefined

Execute a single or an array of compute nodes. This method can only be called if the renderer has been initialized.

**computeNodes**

The compute node(s).

**dispatchSize**

*   A single number representing count, or
*   An array \[x, y, z\] representing dispatch size, or
*   A IndirectStorageBufferAttribute for indirect dispatch size.

Default is `null`.

**Returns:** A Promise that resolve when the compute has finished. Only returned when the renderer has not been initialized.

### .computeAsync( computeNodes : Node | Array.<Node>, dispatchSize : number | Array.<number> | IndirectStorageBufferAttribute ) : Promise (async)

Execute a single or an array of compute nodes.

**computeNodes**

The compute node(s).

**dispatchSize**

*   A single number representing count, or
*   An array \[x, y, z\] representing dispatch size, or
*   A IndirectStorageBufferAttribute for indirect dispatch size.

Default is `null`.

**Returns:** A Promise that resolve when the compute has finished.

### .copyFramebufferToTexture( framebufferTexture : FramebufferTexture, rectangle : Vector2 | Vector4 )

Copies the current bound framebuffer into the given texture.

**framebufferTexture**

The texture.

**rectangle**

A two or four dimensional vector that defines the rectangular portion of the framebuffer that should be copied.

Default is `null`.

### .copyTextureToTexture( srcTexture : Texture, dstTexture : Texture, srcRegion : Box2 | Box3, dstPosition : Vector2 | Vector3, srcLevel : number, dstLevel : number )

Copies data of the given source texture into a destination texture.

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

The source mip level to copy from.

Default is `0`.

**dstLevel**

The destination mip level to copy to.

Default is `0`.

### .dispose()

Frees all internal resources of the renderer. Call this method if the renderer is no longer in use by your app.

### .getActiveCubeFace() : number

Returns the active cube face.

**Returns:** The active cube face.

### .getActiveMipmapLevel() : number

Returns the active mipmap level.

**Returns:** The active mipmap level.

### .getAnimationLoop() : function

Returns the current animation loop callback.

**Returns:** The current animation loop callback.

### .getArrayBufferAsync( attribute : StorageBufferAttribute ) : Promise.<ArrayBuffer> (async)

Can be used to transfer buffer data from a storage buffer attribute from the GPU to the CPU in context of compute shaders.

**attribute**

The storage buffer attribute.

**Returns:** A promise that resolves with the buffer data when the data are ready.

### .getCanvasTarget() : CanvasTarget

Returns the current canvas target.

**Returns:** The current canvas target.

### .getClearAlpha() : number

Returns the clear alpha.

**Returns:** The clear alpha.

### .getClearColor( target : Color ) : Color

Returns the clear color.

**target**

The method writes the result in this target object.

**Returns:** The clear color.

### .getClearDepth() : number

Returns the clear depth.

**Returns:** The clear depth.

### .getClearStencil() : number

Returns the clear stencil.

**Returns:** The clear stencil.

### .getColorBufferType() : number

Returns the output buffer type.

**Deprecated:** since r182. Use \`.getOutputBufferType()\` instead.

**Returns:** The output buffer type.

### .getContext() : GPUCanvasContext | WebGL2RenderingContext

Returns the rendering context.

**Returns:** The rendering context.

### .getDrawingBufferSize( target : Vector2 ) : Vector2

Returns the drawing buffer size in physical pixels. This method honors the pixel ratio.

**target**

The method writes the result in this target object.

**Returns:** The drawing buffer size.

### .getMRT() : MRTNode

Returns the MRT configuration.

**Returns:** The MRT configuration.

### .getMaxAnisotropy() : number

Returns the maximum available anisotropy for texture filtering.

**Returns:** The maximum available anisotropy.

### .getOutputBufferType() : number

Returns the output buffer type.

**Returns:** The output buffer type.

### .getOutputRenderTarget() : RenderTarget

Returns the current output target.

**Returns:** The current output render target. Returns `null` if no output target is set.

### .getPixelRatio() : number

Returns the pixel ratio.

**Returns:** The pixel ratio.

### .getRenderObjectFunction() : function

Returns the current render object function.

**Returns:** The current render object function. Returns `null` if no function is set.

### .getRenderTarget() : RenderTarget

Returns the current render target.

**Returns:** The render target. Returns `null` if no render target is set.

### .getScissor( target : Vector4 ) : Vector4

Returns the scissor rectangle.

**target**

The method writes the result in this target object.

**Returns:** The scissor rectangle.

### .getScissorTest() : boolean

Returns the scissor test value.

**Returns:** Whether the scissor test should be enabled or not.

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

### .hasCompatibility( name : string ) : boolean

Checks if the given compatibility is supported by the selected backend. If the renderer has not been initialized, this method always returns `false`.

**name**

The compatibility's name.

**Returns:** Whether the compatibility is supported or not.

### .hasFeature( name : string ) : boolean

Checks if the given feature is supported by the selected backend. If the renderer has not been initialized, this method always returns `false`.

**name**

The feature's name.

**Returns:** Whether the feature is supported or not.

### .hasFeatureAsync( name : string ) : Promise.<boolean> (async)

Checks if the given feature is supported by the selected backend.

**name**

The feature's name.

**Deprecated:** Yes

**Returns:** A Promise that resolves with a bool that indicates whether the feature is supported or not.

### .hasInitialized() : boolean

Returns `true` when the renderer has been initialized.

**Returns:** Whether the renderer has been initialized or not.

### .init() : Promise.<this> (async)

Initializes the renderer so it is ready for usage.

**Returns:** A Promise that resolves when the renderer has been initialized.

### .initTexture( texture : Texture )

Initializes the given texture. Useful for preloading a texture rather than waiting until first render (which can cause noticeable lags due to decode and GPU upload overhead).

This method can only be used if the renderer has been initialized.

**texture**

The texture.

### .initTextureAsync( texture : Texture ) : Promise (async)

Initializes the given textures. Useful for preloading a texture rather than waiting until first render (which can cause noticeable lags due to decode and GPU upload overhead).

**texture**

The texture.

**Deprecated:** Yes

**Returns:** A Promise that resolves when the texture has been initialized.

### .isOccluded( object : Object3D ) : boolean

This method performs an occlusion query for the given 3D object. It returns `true` if the given 3D object is fully occluded by other 3D objects in the scene.

**object**

The 3D object to test.

**Returns:** Whether the 3D object is fully occluded or not.

### .readRenderTargetPixelsAsync( renderTarget : RenderTarget, x : number, y : number, width : number, height : number, textureIndex : number, faceIndex : number ) : Promise.<TypedArray> (async)

Reads pixel data from the given render target.

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

**textureIndex**

The texture index of a MRT render target.

Default is `0`.

**faceIndex**

The active cube face index.

Default is `0`.

**Returns:** A Promise that resolves when the read has been finished. The resolve provides the read data as a typed array.

### .render( scene : Object3D, camera : Camera )

Renders the scene or 3D object with the given camera. This method can only be called if the renderer has been initialized. When using `render()` inside an animation loop, it's guaranteed the renderer will be initialized. The animation loop must be defined with [Renderer#setAnimationLoop](Renderer.html#setAnimationLoop) though.

For all other use cases (like when using on-demand rendering), you must call [Renderer#init](Renderer.html#init) before rendering.

The target of the method is the default framebuffer (meaning the canvas) or alternatively a render target when specified via `setRenderTarget()`.

**scene**

The scene or 3D object to render.

**camera**

The camera to render the scene with.

### .renderAsync( scene : Object3D, camera : Camera ) : Promise (async)

Renders the scene in an async fashion.

**scene**

The scene or 3D object to render.

**camera**

The camera.

**Deprecated:** Yes

**Returns:** A Promise that resolves when the render has been finished.

### .renderObject( object : Object3D, scene : Scene, camera : Camera, geometry : BufferGeometry, material : Material, group : Object, lightsNode : LightsNode, clippingContext : ClippingContext, passId : string )

This method represents the default render object function that manages the render lifecycle of the object.

**object**

The 3D object.

**scene**

The scene the 3D object belongs to.

**camera**

The camera the object should be rendered with.

**geometry**

The object's geometry.

**material**

The object's material.

**group**

Only relevant for objects using multiple materials. This represents a group entry from the respective `BufferGeometry`.

**lightsNode**

The current lights node.

**clippingContext**

The clipping context.

Default is `null`.

**passId**

An optional ID for identifying the pass.

Default is `null`.

### .setAnimationLoop( callback : onAnimationCallback ) : Promise (async)

Applications are advised to always define the animation loop with this method and not manually with `requestAnimationFrame()` for best compatibility.

**callback**

The application's animation loop.

**Returns:** A Promise that resolves when the set has been executed.

### .setCanvasTarget( canvasTarget : CanvasTarget )

Sets the canvas target. The canvas target manages the HTML canvas or the offscreen canvas the renderer draws into.

**canvasTarget**

The canvas target.

### .setClearAlpha( alpha : number )

Defines the clear alpha.

**alpha**

The clear alpha.

### .setClearColor( color : Color, alpha : number )

Defines the clear color and optionally the clear alpha.

**color**

The clear color.

**alpha**

The clear alpha.

Default is `1`.

### .setClearDepth( depth : number )

Defines the clear depth.

**depth**

The clear depth.

### .setClearStencil( stencil : number )

Defines the clear stencil.

**stencil**

The clear stencil.

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

### .setMRT( mrt : MRTNode ) : Renderer

Sets the given MRT configuration.

**mrt**

The MRT node to set.

**Returns:** A reference to this renderer.

### .setOpaqueSort( method : function )

Defines a manual sort function for the opaque render list. Pass `null` to use the default sort.

**method**

The sort function.

### .setOutputRenderTarget( renderTarget : Object )

Sets the output render target for the renderer.

**renderTarget**

The render target to set as the output target.

### .setPixelRatio( value : number )

Sets the given pixel ratio and resizes the canvas if necessary.

**value**

The pixel ratio.

Default is `1`.

### .setRenderObjectFunction( renderObjectFunction : renderObjectFunction )

Sets the given render object function. Calling this method overwrites the default implementation which is [Renderer#renderObject](Renderer.html#renderObject). Defining a custom function can be useful if you want to modify the way objects are rendered. For example you can define things like "every object that has material of a certain type should perform a pre-pass with a special overwrite material". The custom function must always call `renderObject()` in its implementation.

Use `null` as the first argument to reset the state.

**renderObjectFunction**

The render object function.

### .setRenderTarget( renderTarget : RenderTarget, activeCubeFace : number, activeMipmapLevel : number )

Sets the given render target. Calling this method means the renderer does not target the default framebuffer (meaning the canvas) anymore but a custom framebuffer. Use `null` as the first argument to reset the state.

**renderTarget**

The render target to set.

**activeCubeFace**

The active cube face.

Default is `0`.

**activeMipmapLevel**

The active mipmap level.

Default is `0`.

### .setScissor( x : number | Vector4, y : number, width : number, height : number )

Defines the scissor rectangle.

**x**

The horizontal coordinate for the upper left corner of the box in logical pixel unit. Instead of passing four arguments, the method also works with a single four-dimensional vector.

**y**

The vertical coordinate for the upper left corner of the box in logical pixel unit.

**width**

The width of the scissor box in logical pixel unit.

**height**

The height of the scissor box in logical pixel unit.

### .setScissorTest( boolean : boolean )

Defines the scissor test.

**boolean**

Whether the scissor test should be enabled or not.

### .setSize( width : number, height : number, updateStyle : boolean )

Sets the size of the renderer.

**width**

The width in logical pixels.

**height**

The height in logical pixels.

**updateStyle**

Whether to update the `style` attribute of the canvas or not.

Default is `true`.

### .setTransparentSort( method : function )

Defines a manual sort function for the transparent render list. Pass `null` to use the default sort.

**method**

The sort function.

### .setViewport( x : number | Vector4, y : number, width : number, height : number, minDepth : number, maxDepth : number )

Defines the viewport.

**x**

The horizontal coordinate for the upper left corner of the viewport origin in logical pixel unit.

**y**

The vertical coordinate for the upper left corner of the viewport origin in logical pixel unit.

**width**

The width of the viewport in logical pixel unit.

**height**

The height of the viewport in logical pixel unit.

**minDepth**

The minimum depth value of the viewport. WebGPU only.

Default is `0`.

**maxDepth**

The maximum depth value of the viewport. WebGPU only.

Default is `1`.

### .waitForGPU() : Promise (async)

Can be used to synchronize CPU operations with GPU tasks. So when this method is called, the CPU waits for the GPU to complete its operation (e.g. a compute task).

**Deprecated:** Yes

**Returns:** A Promise that resolves when synchronization has been finished.

## Type Definitions

### .Options

Renderer options.

**logarithmicDepthBuffer**  
boolean

Whether logarithmic depth buffer is enabled or not.

Default is `false`.

**alpha**  
boolean

Whether the default framebuffer (which represents the final contents of the canvas) should be transparent or opaque.

Default is `true`.

**depth**  
boolean

Whether the default framebuffer should have a depth buffer or not.

Default is `true`.

**stencil**  
boolean

Whether the default framebuffer should have a stencil buffer or not.

Default is `false`.

**antialias**  
boolean

Whether MSAA as the default anti-aliasing should be enabled or not.

Default is `false`.

**samples**  
number

When `antialias` is `true`, `4` samples are used by default. This parameter can set to any other integer value than 0 to overwrite the default.

Default is `0`.

**getFallback**  
function

This callback function can be used to provide a fallback backend, if the primary backend can't be targeted.

Default is `null`.

**outputBufferType**  
number

Defines the type of output buffers. The default `HalfFloatType` is recommend for best quality. To save memory and bandwidth, `UnsignedByteType` might be used. This will reduce rendering quality though.

Default is `HalfFloatType`.

**multiview**  
boolean

If set to `true`, the renderer will use multiview during WebXR rendering if supported.

Default is `false`.

## Source

[src/renderers/common/Renderer.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/Renderer.js)