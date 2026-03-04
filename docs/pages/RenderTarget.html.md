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

### .resolveDepthBuffer : boolean

Whether to resolve the depth buffer or not.

Default is `true`.

### .resolveStencilBuffer : boolean

Whether to resolve the stencil buffer or not.

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

### .texture : Texture

The texture representing the default color attachment.

### .textures : Array.<Texture>

An array of textures. Each color attachment is represented as a separate texture. Has at least a single entry for the default color attachment.

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

**resolveDepthBuffer**  
boolean

Whether to resolve the depth buffer or not.

Default is `true`.

**resolveStencilBuffer**  
boolean

Whether to resolve the stencil buffer or not.

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

Whether this target is used for multiview rendering.

Default is `false`.

## Source

[src/core/RenderTarget.js](https://github.com/mrdoob/three.js/blob/master/src/core/RenderTarget.js)