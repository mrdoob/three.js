*Inheritance: EventDispatcher →*

# RenderTarget

A render target is a buffer where the video card draws pixels for a scene that is being rendered in the background. It is used in different effects, such as applying postprocessing to a rendered image before displaying it on the screen.

## Constructor

### new RenderTarget( width : number, height : number, options : RenderTarget~Options )

Constructs a new render target.

**width**

The width of the render target.

Default is `1`.

**height**

The height of the render target.

Default is `1`.

**options**

The configuration object.

## Properties

### .depth : number

The depth of the render target.

Default is `1`.

### .depthBuffer : boolean

Whether to allocate a depth buffer or not.

Default is `true`.

### .depthTexture : DepthTexture

Instead of saving the depth in a renderbuffer, a texture can be used instead which is useful for further processing e.g. in context of post-processing.

Default is `null`.

### .height : number

The height of the render target.

Default is `1`.

### .isRenderTarget : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .multiview : boolean

Whether to this target is used in multiview rendering.

Default is `false`.

### .resolveColorBuffer : boolean

Whether to resolve the color buffer or not. When set to `false`, the color attachments do not receive the resolved (single-sampled) output of a render pass and the render target's textures are left untouched. The rendered content is then only accessible within the render pass itself.

Only relevant for multisampled render targets.

Default is `true`.

### .resolveDepthBuffer : boolean

Whether to resolve the depth buffer or not. When set to `false`, the depth texture does not receive the resolved depth output of a render pass which saves memory bandwidth. Use this setting when the depth data of a render pass are not required afterwards.

Only relevant for multisampled render targets in WebGL. WebGPU does not support depth resolves; sampling the depth texture of a multisampled render target accesses the multisampled data directly, see [RenderTarget#storeMultisampledDepthBuffer](RenderTarget.html#storeMultisampledDepthBuffer).

Default is `true`.

### .resolveStencilBuffer : boolean

Whether to resolve the stencil buffer or not. Analogous to [RenderTarget#resolveDepthBuffer](RenderTarget.html#resolveDepthBuffer) but for the stencil aspect.

Default is `true`.

### .samples : number

The number of MSAA samples.

A value of `0` disables MSAA.

Default is `0`.

### .scissor : Vector4

A rectangular area inside the render target's viewport. Fragments that are outside the area will be discarded.

Default is `(0,0,width,height)`.

### .scissorTest : boolean

Indicates whether the scissor test should be enabled when rendering into this render target or not.

Default is `false`.

### .stencilBuffer : boolean

Whether to allocate a stencil buffer or not.

Default is `false`.

### .storeMultisampledColorBuffer : boolean

Whether to store the multisampled color buffer or not. When set to `false`, the multisampled data are discarded at the end of a render pass, right after they have been resolved. This saves memory bandwidth, especially on tile-based GPUs, and is the recommended setting for render targets that are fully redrawn each frame and whose output is only accessed via the resolved textures (e.g. scene passes in post-processing chains).

Must be kept `true` when the multisampled data are needed after the render pass ends, e.g. when rendering into the target without clearing or when the scene contains transmissive objects which require a mid-pass framebuffer copy.

Default is `true`.

### .storeMultisampledDepthBuffer : boolean

Whether to store the multisampled depth buffer or not. When set to `false`, the multisampled depth data are discarded at the end of a render pass which saves memory bandwidth.

Must be kept `true` in WebGPU when the depth texture of a multisampled render target is sampled (e.g. by depth-based post-processing effects) since depth is read directly from the multisampled data.

Default is `true`.

### .storeMultisampledStencilBuffer : boolean

Whether to store the multisampled stencil buffer or not. Analogous to [RenderTarget#storeMultisampledDepthBuffer](RenderTarget.html#storeMultisampledDepthBuffer) but for the stencil aspect.

Default is `true`.

### .texture : Texture

The texture representing the default color attachment.

### .textures : Array.<Texture>

An array of textures. Each color attachment is represented as a separate texture. Has at least a single entry for the default color attachment.

### .useArrayDepthTexture : boolean

Whether to create the depth texture as an array texture for per-layer depth testing. This is separate from multiview so layered render targets can use array depth without the multiview extension.

Default is `false`.

### .viewport : Vector4

A rectangular area representing the render target's viewport.

Default is `(0,0,width,height)`.

### .width : number

The width of the render target.

Default is `1`.

## Methods

### .clone() : RenderTarget

Returns a new render target with copied values from this instance.

**Returns:** A clone of this instance.

### .copy( source : RenderTarget ) : RenderTarget

Copies the settings of the given render target. This is a structural copy so no resources are shared between render targets after the copy. That includes all MRT textures and the depth texture.

**source**

The render target to copy.

**Returns:** A reference to this instance.

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

##### Fires:

*   RenderTarget#event:dispose

### .setSize( width : number, height : number, depth : number )

Sets the size of this render target.

**width**

The width.

**height**

The height.

**depth**

The depth.

Default is `1`.

## Type Definitions

### .Options

Render target options.

**generateMipmaps**  
boolean

Whether to generate mipmaps or not.

Default is `false`.

**magFilter**  
number

The mag filter.

Default is `LinearFilter`.

**minFilter**  
number

The min filter.

Default is `LinearFilter`.

**format**  
number

The texture format.

Default is `RGBAFormat`.

**type**  
number

The texture type.

Default is `UnsignedByteType`.

**internalFormat**  
string

The texture's internal format.

Default is `null`.

**wrapS**  
number

The texture's uv wrapping mode.

Default is `ClampToEdgeWrapping`.

**wrapT**  
number

The texture's uv wrapping mode.

Default is `ClampToEdgeWrapping`.

**anisotropy**  
number

The texture's anisotropy value.

Default is `1`.

**colorSpace**  
string

The texture's color space.

Default is `NoColorSpace`.

**depthBuffer**  
boolean

Whether to allocate a depth buffer or not.

Default is `true`.

**stencilBuffer**  
boolean

Whether to allocate a stencil buffer or not.

Default is `false`.

**resolveColorBuffer**  
boolean

Whether to resolve the color buffer or not. Only relevant for multisampled render targets.

Default is `true`.

**resolveDepthBuffer**  
boolean

Whether to resolve the depth buffer or not. Only relevant for multisampled render targets.

Default is `true`.

**resolveStencilBuffer**  
boolean

Whether to resolve the stencil buffer or not. Only relevant for multisampled render targets.

Default is `true`.

**storeMultisampledColorBuffer**  
boolean

Whether to store the multisampled color buffer or not. Setting to `false` saves memory bandwidth when the multisampled data are not needed after a render pass.

Default is `true`.

**storeMultisampledDepthBuffer**  
boolean

Whether to store the multisampled depth buffer or not. Setting to `false` saves memory bandwidth when the multisampled data are not needed after a render pass.

Default is `true`.

**storeMultisampledStencilBuffer**  
boolean

Whether to store the multisampled stencil buffer or not. Setting to `false` saves memory bandwidth when the multisampled data are not needed after a render pass.

Default is `true`.

**depthTexture**  
[Texture](Texture.html)

Reference to a depth texture.

Default is `null`.

**samples**  
number

The MSAA samples count.

Default is `0`.

**count**  
number

Defines the number of color attachments . Must be at least `1`.

Default is `1`.

**depth**  
number

The texture depth.

Default is `1`.

**multiview**  
boolean

Whether this target is used for multiview rendering (WebGL OVR\_multiview2 extension).

Default is `false`.

**useArrayDepthTexture**  
boolean

Whether to create the depth texture as an array texture for per-layer depth testing. This is separate from multiview so layered render targets can use array depth without the multiview extension.

Default is `false`.

## Source

[src/core/RenderTarget.js](https://github.com/mrdoob/three.js/blob/master/src/core/RenderTarget.js)