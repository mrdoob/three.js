# Global

## Properties

### .ACESFilmicToneMapping : number (constant)

ACES Filmic tone mapping.

### .AddEquation : number (constant)

A `source + destination` blending equation.

### .AddOperation : number (constant)

Adds the two colors.

### .AdditiveAnimationBlendMode : number (constant)

Additive animation blend mode. Can be used to layer motions on top of each other to build complex performances from smaller re-usable assets.

### .AdditiveBlending : number (constant)

Represents additive blending.

### .AgXToneMapping : number (constant)

AgX tone mapping.

### .AlphaFormat : number (constant)

Discards the red, green and blue components and reads just the alpha component.

### .AlwaysCompare : number (constant)

Always pass.

### .AlwaysDepth : number (constant)

Always pass.

### .AlwaysStencilFunc : number (constant)

Will always return true.

### .AnaglyphAlgorithm : string (constant)

Anaglyph algorithm types.

**TRUE**  
string

**GREY**  
string

**COLOUR**  
string

**HALF\_COLOUR**  
string

**DUBOIS**  
string

**OPTIMISED**  
string

**COMPROMISE**  
string

### .AnaglyphColorMode : string (constant)

Anaglyph color modes.

**RED\_CYAN**  
string

**MAGENTA\_CYAN**  
string

**MAGENTA\_GREEN**  
string

### .AttachedBindMode : string (constant)

The skinned mesh shares the same world space as the skeleton.

### .BackSide : number (constant)

Only back faces are rendered.

### .BasicDepthPacking : number (constant)

The depth value is inverted (1.0 - z) for visualization purposes.

### .BasicShadowMap : number (constant)

Gives unfiltered shadow maps - fastest, but lowest quality.

### .ByteType : number (constant)

A byte data type for textures.

### .CineonToneMapping : number (constant)

Cineon tone mapping.

### .ClampToEdgeWrapping : number (constant)

The last pixel of the texture stretches to the edge of the mesh.

### .Compatibility : Object (constant)

Compatibility flags for features that may not be supported across all platforms.

### .ConstantAlphaFactor : number (constant)

Multiplies all colors by a constant alpha value.

### .ConstantColorFactor : number (constant)

Multiplies all colors by a constant color.

### .CubeReflectionMapping : number (constant)

Reflection mapping for cube textures.

### .CubeRefractionMapping : number (constant)

Refraction mapping for cube textures.

### .CubeUVReflectionMapping : number (constant)

Reflection mapping for PMREM textures.

### .CullFaceBack : number (constant)

Culls back faces.

### .CullFaceFront : number (constant)

Culls front faces.

### .CullFaceFrontBack : number (constant)

Culls both front and back faces.

### .CullFaceNone : number (constant)

Disables face culling.

### .CustomBlending : number (constant)

Represents custom blending.

### .CustomToneMapping : number (constant)

Custom tone mapping.

Expects a custom implementation by modifying shader code of the material's fragment shader.

### .DATA (constant)

Precomputed DFG LUT for Image-Based Lighting Resolution: 16x16 Samples: 4096 per texel Format: RG16F (2 half floats per texel: scale, bias)

### .DecrementStencilOp : number (constant)

Decrements the current stencil buffer value. Clamps to `0`.

### .DecrementWrapStencilOp : number (constant)

Decrements the current stencil buffer value. Wraps stencil buffer value to the maximum representable unsigned value when decrementing a stencil buffer value of `0`.

### .DefaultLoadingManager : LoadingManager (constant)

The global default loading manager.

### .DepthFormat : number (constant)

Reads each element as a single depth value, converts it to floating point, and clamps to the range `[0,1]`.

### .DepthStencilFormat : number (constant)

Reads each element is a pair of depth and stencil values. The depth component of the pair is interpreted as in `DepthFormat`. The stencil component is interpreted based on the depth + stencil internal format.

### .DetachedBindMode : string (constant)

The skinned mesh does not share the same world space as the skeleton. This is useful when a skeleton is shared across multiple skinned meshes.

### .DoubleSide : number (constant)

Both front and back faces are rendered.

### .DstAlphaFactor : number (constant)

Multiplies all colors by the destination alpha value.

### .DstColorFactor : number (constant)

Multiplies all colors by the destination color.

### .DynamicCopyUsage : number (constant)

The contents are intended to be respecified repeatedly by reading data from the 3D API, and used many times as the source for WebGL drawing and image specification commands.

### .DynamicDrawUsage : number (constant)

The contents are intended to be respecified repeatedly by the application, and used many times as the source for drawing and image specification commands.

### .DynamicReadUsage : number (constant)

The contents are intended to be respecified repeatedly by reading data from the 3D API, and queried many times by the application.

### .EqualCompare : number (constant)

Pass if the incoming value equals the texture value.

### .EqualDepth : number (constant)

Pass if the incoming value equals the depth buffer value.

### .EqualStencilFunc : number (constant)

Will return true if the stencil reference value is equal to the current stencil value.

### .EquirectangularReflectionMapping : number (constant)

Reflection mapping for equirectangular textures.

### .EquirectangularRefractionMapping : number (constant)

Refraction mapping for equirectangular textures.

### .FloatType : number (constant)

A float data type for textures.

### .FrontSide : number (constant)

Only front faces are rendered.

### .GLSL1 : string (constant)

GLSL 1 shader code.

### .GLSL3 : string (constant)

GLSL 3 shader code.

### .GreaterCompare : number (constant)

Pass if the incoming value is greater than the texture value.

### .GreaterDepth : number (constant)

Pass if the incoming value is greater than the depth buffer value.

### .GreaterEqualCompare : number (constant)

Pass if the incoming value is greater than or equal to the texture value.

### .GreaterEqualDepth : number (constant)

Pass if the incoming value is greater than or equal to the depth buffer value.

### .GreaterEqualStencilFunc : number (constant)

Will return true if the stencil reference value is greater than or equal to the current stencil value.

### .GreaterStencilFunc : number (constant)

Will return true if the stencil reference value is greater than the current stencil value.

### .HalfFloatType : number (constant)

A half float data type for textures.

### .IncrementStencilOp : number (constant)

Increments the current stencil buffer value. Clamps to the maximum representable unsigned value.

### .IncrementWrapStencilOp : number (constant)

Increments the current stencil buffer value. Wraps stencil buffer value to zero when incrementing the maximum representable unsigned value.

### .IntType : number (constant)

An int data type for textures.

### .InterpolateBezier : number (constant)

Bezier interpolation mode for keyframe tracks.

Uses cubic Bezier curves with explicit 2D control points. Requires tangent data to be set on the track.

### .InterpolateDiscrete : number (constant)

Discrete interpolation mode for keyframe tracks.

### .InterpolateLinear : number (constant)

Linear interpolation mode for keyframe tracks.

### .InterpolateSmooth : number (constant)

Smooth interpolation mode for keyframe tracks.

### .InterpolationSamplingMode : ConstantsInterpolationSamplingMode (constant)

Represents the different interpolation sampling modes.

### .InterpolationSamplingType : ConstantsInterpolationSamplingType (constant)

Represents mouse buttons and interaction types in context of controls.

### .InvertStencilOp : number (constant)

Inverts the current stencil buffer value bitwise.

### .KHR_mesh_quantization_ExtraAttrTypes (constant)

The KHR\_mesh\_quantization extension allows these extra attribute component types

See:

*   [https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR\_mesh\_quantization/README.md#extending-mesh-attributes](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_mesh_quantization/README.md#extending-mesh-attributes)

### .KeepStencilOp : number (constant)

Keeps the current value.

### .LessCompare : number (constant)

Pass if the incoming value is less than the texture value.

### .LessDepth : number (constant)

Pass if the incoming value is less than the depth buffer value.

### .LessEqualCompare : number (constant)

Pass if the incoming value is less than or equal to the texture value.

### .LessEqualDepth : number (constant)

Pass if the incoming value is less than or equal to the depth buffer value.

### .LessEqualStencilFunc : number (constant)

Will return true if the stencil reference value is less than or equal to the current stencil value.

### .LessStencilFunc : number (constant)

Will return true if the stencil reference value is less than the current stencil value.

### .LinearFilter : number (constant)

Returns the weighted average of the four texture elements that are closest to the specified texture coordinates, and can include items wrapped or repeated from other parts of a texture, depending on the values of `wrapS` and `wrapT`, and on the exact mapping.

### .LinearMipmapLinearFilter : number (constant)

Chooses the two mipmaps that most closely match the size of the pixel being textured and uses the `LinearFilter` criterion to produce a texture value from each mipmap. The final texture value is a weighted average of those two values.

### .LinearMipmapNearestFilter : number (constant)

Chooses the mipmap that most closely matches the size of the pixel being textured and uses the `LinearFilter` criterion (a weighted average of the four texels that are closest to the center of the pixel) to produce a texture value.

### .LinearSRGBColorSpace : string (constant)

sRGB-linear color space.

### .LinearToneMapping : number (constant)

Linear tone mapping.

### .LinearTransfer : string (constant)

Linear transfer function.

### .LoopOnce : number (constant)

Animations are played once.

### .LoopPingPong : number (constant)

Animations are played with a chosen number of repetitions, alternately playing forward and backward.

### .LoopRepeat : number (constant)

Animations are played with a chosen number of repetitions, each time jumping from the end of the clip directly to its beginning.

### .MOUSE : ConstantsMouse (constant)

Represents mouse buttons and interaction types in context of controls.

### .MaterialBlending : number (constant)

Represents material blending.

### .MaxEquation : number (constant)

A blend equation that uses the maximum of source and destination.

### .MinEquation : number (constant)

A blend equation that uses the minimum of source and destination.

### .MirroredRepeatWrapping : number (constant)

The texture will repeats to infinity, mirroring on each repeat.

### .MixOperation : number (constant)

Uses reflectivity to blend between the two colors.

### .MultiplyBlending : number (constant)

Represents multiply blending.

### .MultiplyOperation : number (constant)

Multiplies the environment map color with the surface color.

### .NearestFilter : number (constant)

Returns the value of the texture element that is nearest (in Manhattan distance) to the specified texture coordinates.

### .NearestMipmapLinearFilter : number (constant)

Chooses the two mipmaps that most closely match the size of the pixel being textured and uses the `NearestFilter` criterion to produce a texture value from each mipmap. The final texture value is a weighted average of those two values.

### .NearestMipmapNearestFilter : number (constant)

Chooses the mipmap that most closely matches the size of the pixel being textured and uses the `NearestFilter` criterion (the texel nearest to the center of the pixel) to produce a texture value.

### .NeutralToneMapping : number (constant)

Neutral tone mapping.

Implementation based on the Khronos 3D Commerce Group standard tone mapping.

### .NeverCompare : number (constant)

Never pass.

### .NeverDepth : number (constant)

Never pass.

### .NeverStencilFunc : number (constant)

Will never return true.

### .NoBlending : number (constant)

No blending is performed which effectively disables alpha transparency.

### .NoColorSpace : string (constant)

No color space.

### .NoNormalPacking : string (constant)

No normal map packing.

### .NoToneMapping : number (constant)

No tone mapping is applied.

### .NodeAccess (constant)

Access types of a node. These are relevant for compute and storage usage.

**READ\_ONLY**  
string

Read-only access

**WRITE\_ONLY**  
string

Write-only access.

**READ\_WRITE**  
string

Read and write access.

### .NodeShaderStage (constant)

Possible shader stages.

**VERTEX**  
string

The vertex shader stage.

**FRAGMENT**  
string

The fragment shader stage.

### .NodeType (constant)

Data types of a node.

**BOOLEAN**  
string

Boolean type.

**INTEGER**  
string

Integer type.

**FLOAT**  
string

Float type.

**VECTOR2**  
string

Two-dimensional vector type.

**VECTOR3**  
string

Three-dimensional vector type.

**VECTOR4**  
string

Four-dimensional vector type.

**MATRIX2**  
string

2x2 matrix type.

**MATRIX3**  
string

3x3 matrix type.

**MATRIX4**  
string

4x4 matrix type.

### .NodeUpdateType (constant)

Update types of a node.

**NONE**  
string

The update method is not executed.

**FRAME**  
string

The update method is executed per frame.

**RENDER**  
string

The update method is executed per render. A frame might be produced by multiple render calls so this value allows more detailed updates than FRAME.

**OBJECT**  
string

The update method is executed per [Object3D](Object3D.html) that uses the node for rendering.

### .NormalAnimationBlendMode : number (constant)

Default animation blend mode.

### .NormalBlending : number (constant)

The default blending.

### .NormalGAPacking : string (constant)

Normal GA packing.

### .NormalRGPacking : string (constant)

Normal RG packing.

### .NotEqualCompare : number (constant)

Pass if the incoming value is not equal to the texture value.

### .NotEqualDepth : number (constant)

Pass if the incoming value is not equal to the depth buffer value.

### .NotEqualStencilFunc : number (constant)

Will return true if the stencil reference value is not equal to the current stencil value.

### .ObjectSpaceNormalMap : number (constant)

Normal information is relative to the object orientation.

### .OnBeforeMaterialUpdate (constant)

Creates an event that triggers a function before the material is updated.

The event will be bound to the declared TSL function `Fn()`; it must be declared within a `Fn()` or the JS function call must be inherited from one.

### .OnBeforeObjectUpdate (constant)

Creates an event that triggers a function before an object (Mesh|Sprite) is updated.

The event will be bound to the declared TSL function `Fn()`; it must be declared within a `Fn()` or the JS function call must be inherited from one.

### .OnMaterialUpdate (constant)

Creates an event that triggers a function when the first object that uses the material is rendered.

The event will be bound to the declared TSL function `Fn()`; it must be declared within a `Fn()` or the JS function call must be inherited from one.

### .OnObjectUpdate (constant)

Creates an event that triggers a function every time an object (Mesh|Sprite) is rendered.

The event will be bound to the declared TSL function `Fn()`; it must be declared within a `Fn()` or the JS function call must be inherited from one.

### .OneFactor : number (constant)

Multiplies all colors by `1`.

### .OneMinusConstantAlphaFactor : number (constant)

Multiplies all colors by 1 minus a constant alpha value.

### .OneMinusConstantColorFactor : number (constant)

Multiplies all colors by `1` minus a constant color.

### .OneMinusDstAlphaFactor : number (constant)

Multiplies all colors by `1` minus the destination alpha value.

### .OneMinusDstColorFactor : number (constant)

Multiplies all colors by `1` minus each destination color.

### .OneMinusSrcAlphaFactor : number (constant)

Multiplies all colors by 1 minus the source alpha value.

### .OneMinusSrcColorFactor : number (constant)

Multiplies all colors by `1` minus each source color.

### .PCFShadowMap : number (constant)

Filters shadow maps using the Percentage-Closer Filtering (PCF) algorithm.

### .PCFSoftShadowMap : number (constant)

Filters shadow maps using the Percentage-Closer Filtering (PCF) algorithm with better soft shadows especially when using low-resolution shadow maps.

### .R11_EAC_Format : number (constant)

EAC R11 UNORM format.

### .RED_GREEN_RGTC2_Format : number (constant)

RGTC2 Red Green format.

### .RED_RGTC1_Format : number (constant)

RGTC1 Red format.

### .RG11_EAC_Format : number (constant)

EAC RG11 UNORM format.

### .RGBADepthPacking : number (constant)

The depth value is packed into 32 bit RGBA.

### .RGBAFormat : number (constant)

Reads the red, green, blue and alpha components.

### .RGBAIntegerFormat : number (constant)

Reads the red, green, blue and alpha components. The texels are read as integers instead of floating point.

### .RGBA_ASTC_10x10_Format : number (constant)

ASTC RGBA 10x10 format.

### .RGBA_ASTC_10x5_Format : number (constant)

ASTC RGBA 10x5 format.

### .RGBA_ASTC_10x6_Format : number (constant)

ASTC RGBA 10x6 format.

### .RGBA_ASTC_10x8_Format : number (constant)

ASTC RGBA 10x8 format.

### .RGBA_ASTC_12x10_Format : number (constant)

ASTC RGBA 12x10 format.

### .RGBA_ASTC_12x12_Format : number (constant)

ASTC RGBA 12x12 format.

### .RGBA_ASTC_4x4_Format : number (constant)

ASTC RGBA 4x4 format.

### .RGBA_ASTC_5x4_Format : number (constant)

ASTC RGBA 5x4 format.

### .RGBA_ASTC_5x5_Format : number (constant)

ASTC RGBA 5x5 format.

### .RGBA_ASTC_6x5_Format : number (constant)

ASTC RGBA 6x5 format.

### .RGBA_ASTC_6x6_Format : number (constant)

ASTC RGBA 6x6 format.

### .RGBA_ASTC_8x5_Format : number (constant)

ASTC RGBA 8x5 format.

### .RGBA_ASTC_8x6_Format : number (constant)

ASTC RGBA 8x6 format.

### .RGBA_ASTC_8x8_Format : number (constant)

ASTC RGBA 8x8 format.

### .RGBA_BPTC_Format : number (constant)

BPTC RGBA format.

### .RGBA_ETC2_EAC_Format : number (constant)

ETC2 RGBA format.

### .RGBA_PVRTC_2BPPV1_Format : number (constant)

PVRTC RGBA compression in 2-bit mode. One block for each 8×4 pixels.

### .RGBA_PVRTC_4BPPV1_Format : number (constant)

PVRTC RGBA compression in 4-bit mode. One block for each 4×4 pixels.

### .RGBA_S3TC_DXT1_Format : number (constant)

A DXT1-compressed image in an RGB image format with a simple on/off alpha value.

### .RGBA_S3TC_DXT3_Format : number (constant)

A DXT3-compressed image in an RGBA image format. Compared to a 32-bit RGBA texture, it offers 4:1 compression.

### .RGBA_S3TC_DXT5_Format : number (constant)

A DXT5-compressed image in an RGBA image format. It also provides a 4:1 compression, but differs to the DXT3 compression in how the alpha compression is done.

### .RGBDepthPacking : number (constant)

The depth value is packed into 24 bit RGB.

### .RGBFormat : number (constant)

Discards the alpha component and reads the red, green and blue component.

### .RGBIntegerFormat : number (constant)

Discards the alpha component and reads the red, green and blue component. The texels are read as integers instead of floating point.

### .RGB_BPTC_SIGNED_Format : number (constant)

BPTC Signed RGB format.

### .RGB_BPTC_UNSIGNED_Format : number (constant)

BPTC Unsigned RGB format.

### .RGB_ETC1_Format : number (constant)

ETC1 RGB format.

### .RGB_ETC2_Format : number (constant)

ETC2 RGB format.

### .RGB_PVRTC_2BPPV1_Format : number (constant)

PVRTC RGB compression in 2-bit mode. One block for each 8×4 pixels.

### .RGB_PVRTC_4BPPV1_Format : number (constant)

PVRTC RGB compression in 4-bit mode. One block for each 4×4 pixels.

### .RGB_S3TC_DXT1_Format : number (constant)

A DXT1-compressed image in an RGB image format.

### .RGDepthPacking : number (constant)

The depth value is packed into 16 bit RG.

### .RGFormat : number (constant)

Discards the alpha, and blue components and reads the red, and green components.

### .RGIntegerFormat : number (constant)

Discards the alpha, and blue components and reads the red, and green components. The texels are read as integers instead of floating point.

### .RedFormat : number (constant)

Discards the green, blue and alpha components and reads just the red component.

### .RedIntegerFormat : number (constant)

Discards the green, blue and alpha components and reads just the red component. The texels are read as integers instead of floating point.

### .ReinhardToneMapping : number (constant)

Reinhard tone mapping.

### .RepeatWrapping : number (constant)

The texture will simply repeat to infinity.

### .ReplaceStencilOp : number (constant)

Sets the stencil buffer value to the specified reference value.

### .ReverseSubtractEquation : number (constant)

A `destination - source` blending equation.

### .SIGNED_R11_EAC_Format : number (constant)

EAC R11 SNORM format.

### .SIGNED_RED_GREEN_RGTC2_Format : number (constant)

RGTC2 Signed Red Green format.

### .SIGNED_RED_RGTC1_Format : number (constant)

RGTC1 Signed Red format.

### .SIGNED_RG11_EAC_Format : number (constant)

EAC RG11 SNORM format.

### .SRGBColorSpace : string (constant)

sRGB color space.

### .SRGBTransfer : string (constant)

sRGB transfer function.

### .SRGB_TO_LINEAR (constant)

UltraHDR Image Format - https://developer.android.com/media/platform/hdr-image-format

Short format brief:

\[JPEG headers\] \[Metadata describing the MPF container and both SDR and gainmap images\]

*   XMP metadata (legacy format)
*   ISO 21496-1 metadata (current standard) \[Optional metadata\] \[EXIF\] \[ICC Profile\] \[SDR image\] \[Gainmap image with metadata\]

Each section is separated by a 0xFFXX byte followed by a descriptor byte (0xFFE0, 0xFFE1, 0xFFE2.) Binary image storages are prefixed with a unique 0xFFD8 16-bit descriptor.

### .ShortType : number (constant)

A short data type for textures.

### .SrcAlphaFactor : number (constant)

Multiplies all colors by the source alpha value.

### .SrcAlphaSaturateFactor : number (constant)

Multiplies the RGB colors by the smaller of either the source alpha value or the value of `1` minus the destination alpha value. The alpha value is multiplied by `1`.

### .SrcColorFactor : number (constant)

Multiplies all colors by the source colors.

### .StaticCopyUsage : number (constant)

The contents are intended to be specified once by reading data from the 3D API, and used many times as the source for WebGL drawing and image specification commands.

### .StaticDrawUsage : number (constant)

The contents are intended to be specified once by the application, and used many times as the source for drawing and image specification commands.

### .StaticReadUsage : number (constant)

The contents are intended to be specified once by reading data from the 3D API, and queried many times by the application.

### .StreamCopyUsage : number (constant)

The contents are intended to be specified once by reading data from the 3D API, and used at most a few times as the source for WebGL drawing and image specification commands.

### .StreamDrawUsage : number (constant)

The contents are intended to be specified once by the application, and used at most a few times as the source for drawing and image specification commands.

### .StreamReadUsage : number (constant)

The contents are intended to be specified once by reading data from the 3D API, and queried at most a few times by the application

### .SubtractEquation : number (constant)

A `source - destination` blending equation.

### .SubtractiveBlending : number (constant)

Represents subtractive blending.

### .TOUCH : ConstantsTouch (constant)

Represents touch interaction types in context of controls.

### .TangentSpaceNormalMap : number (constant)

Normal information is relative to the underlying surface.

### .TimestampQuery : ConstantsTimestampQuery (constant)

Represents the different timestamp query types.

### .TriangleFanDrawMode : number (constant)

For each vertex draw a triangle from the first vertex and the last two vertices.

### .TriangleStripDrawMode : number (constant)

For each vertex draw a triangle from the last three vertices.

### .TrianglesDrawMode : number (constant)

For every three vertices draw a single triangle.

### .UVMapping : number (constant)

Maps textures using the geometry's UV coordinates.

### .UnsignedByteType : number (constant)

An unsigned byte data type for textures.

### .UnsignedInt101111Type : number (constant)

An unsigned int 10\_11\_11 (packed) data type for textures.

### .UnsignedInt248Type : number (constant)

An unsigned int 24\_8 data type for textures.

### .UnsignedInt5999Type : number (constant)

An unsigned int 5\_9\_9\_9 (packed) data type for textures.

### .UnsignedIntType : number (constant)

An unsigned int data type for textures.

### .UnsignedShort4444Type : number (constant)

An unsigned short 4\_4\_4\_4 (packed) data type for textures.

### .UnsignedShort5551Type : number (constant)

An unsigned short 5\_5\_5\_1 (packed) data type for textures.

### .UnsignedShortType : number (constant)

An unsigned short data type for textures.

### .VK_FORMAT_MAP (constant)

References:

*   https://github.khronos.org/KTX-Specification/ktxspec.v2.html
*   https://registry.khronos.org/DataFormat/specs/1.3/dataformat.1.3.html
*   https://github.com/donmccurdy/KTX-Parse

### .VSMShadowMap : number (constant)

Filters shadow maps using the Variance Shadow Map (VSM) algorithm. When using VSMShadowMap all shadow receivers will also cast shadows.

### .WebGLCoordinateSystem : number (constant)

WebGL coordinate system.

### .WebGPUCoordinateSystem : number (constant)

WebGPU coordinate system.

### .WrapAroundEnding : number (constant)

Wrap around ending for animations.

### .ZeroCurvatureEnding : number (constant)

Zero curvature ending for animations.

### .ZeroFactor : number (constant)

Multiplies all colors by `0`.

### .ZeroSlopeEnding : number (constant)

Zero slope ending for animations.

### .ZeroStencilOp : number (constant)

Sets the stencil buffer value to `0`.

### .depthAwareBlend (constant)

Performs a depth-aware blend between a base scene and a secondary effect (like godrays). This function uses a Poisson disk sampling pattern to detect depth discontinuities in the neighborhood of the current pixel. If an edge is detected, it shifts the sampling coordinate for the blend node away from the edge to prevent light leaking/haloing.

### .disposeShadowMaterial (constant)

Disposes the shadow material for the given light source.

### .viewportResolution (constant)

**Deprecated:** since r169. Use [screenSize](TSL.html#screenSize) instead.

## Methods

### .BasicShadowFilter( inputs : Object ) : Node.<float>

A shadow filtering function performing basic filtering. This is in fact an unfiltered version of the shadow map with a binary `[0,1]` result.

**inputs**

The input parameter object.

**depthTexture**

A reference to the shadow map's texture data.

**shadowCoord**

The shadow coordinates.

**Returns:** The filtering result.

### .PCFShadowFilter( inputs : Object ) : Node.<float>

A shadow filtering function performing PCF filtering with Vogel disk sampling and IGN.

Uses 5 samples distributed via Vogel disk pattern, rotated per-pixel using Interleaved Gradient Noise (IGN) to break up banding artifacts. Combined with hardware PCF (4-tap filtering per sample), this effectively provides 20 filtered taps with better distribution.

**inputs**

The input parameter object.

**depthTexture**

A reference to the shadow map's texture data.

**shadowCoord**

The shadow coordinates.

**shadow**

The light shadow.

**Returns:** The filtering result.

### .PCFSoftShadowFilter( inputs : Object ) : Node.<float>

A shadow filtering function performing PCF soft filtering.

**inputs**

The input parameter object.

**depthTexture**

A reference to the shadow map's texture data.

**shadowCoord**

The shadow coordinates.

**shadow**

The light shadow.

**Returns:** The filtering result.

### .PointShadowFilter( inputs : Object ) : Node.<float>

A shadow filtering function for point lights using Vogel disk sampling and IGN.

Uses 5 samples distributed via Vogel disk pattern in tangent space around the sample direction, rotated per-pixel using Interleaved Gradient Noise (IGN).

**inputs**

The input parameter object.

**depthTexture**

A reference to the shadow cube map.

**bd3D**

The normalized direction from light to fragment.

**dp**

The depth value to compare against.

**shadow**

The light shadow.

**Returns:** The filtering result.

### .Stack( node : Node ) : Node

Add the given node to the current stack.

**node**

The node to add.

**Returns:** The node that was added to the stack.

### .VSMShadowFilter( inputs : Object ) : Node.<float>

A shadow filtering function performing VSM filtering.

**inputs**

The input parameter object.

**depthTexture**

A reference to the shadow map's texture data.

**shadowCoord**

The shadow coordinates.

**Returns:** The filtering result.

### .buildData3DTexture( chunk : Object ) : Data3DTexture

Builds a 3D texture from a VOX chunk.

**chunk**

A VOX chunk loaded via [VOXLoader](VOXLoader.html).

**Returns:** The generated 3D texture.

### .buildMesh( chunk : Object ) : Mesh

Builds a mesh from a VOX chunk.

**chunk**

A VOX chunk loaded via [VOXLoader](VOXLoader.html).

**Returns:** The generated mesh.

### .ceilPowerOfTwo( value : number ) : number

Returns the smallest power of two that is greater than or equal to the given number.

**value**

The value to find a POT for. Must be greater than `0`.

**Returns:** The smallest power of two that is greater than or equal to the given number.

### .clamp( value : number, min : number, max : number ) : number

Clamps the given value between min and max.

**value**

The value to clamp.

**min**

The min value.

**max**

The max value.

**Returns:** The clamped value.

### .contain( texture : Texture, aspect : number ) : Texture

Scales the texture as large as possible within its surface without cropping or stretching the texture. The method preserves the original aspect ratio of the texture. Akin to CSS `object-fit: contain`

**texture**

The texture.

**aspect**

The texture's aspect ratio.

**Returns:** The updated texture.

### .convertArray( array : TypedArray | Array, type : TypedArray.constructor ) : TypedArray

Converts an array to a specific type.

**array**

The array to convert.

**type**

The constructor of a typed array that defines the new type.

**Returns:** The converted array.

### .cover( texture : Texture, aspect : number ) : Texture

Scales the texture to the smallest possible size to fill the surface, leaving no empty space. The method preserves the original aspect ratio of the texture. Akin to CSS `object-fit: cover`.

**texture**

The texture.

**aspect**

The texture's aspect ratio.

**Returns:** The updated texture.

### .createCanvasElement() : HTMLCanvasElement

Creates a canvas element configured for block display.

This is a convenience function that creates a canvas element with display style set to 'block', which is commonly used in three.js rendering contexts to avoid inline element spacing issues.

**Returns:** A canvas element with display set to 'block'.

### .createEvent( type : string, callback : function ) : EventNode

Helper to create an EventNode and add it to the stack.

**type**

The event type.

**callback**

The callback function.

### .damp( x : number, y : number, lambda : number, dt : number ) : number

Smoothly interpolate a number from `x` to `y` in a spring-like manner using a delta time to maintain frame rate independent movement. For details, see [Frame rate independent damping using lerp](http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/).

**x**

The current point.

**y**

The target point.

**lambda**

A higher lambda value will make the movement more sudden, and a lower value will make the movement more gradual.

**dt**

Delta time in seconds.

**Returns:** The interpolated value.

### .degToRad( degrees : number ) : number

Converts degrees to radians.

**degrees**

A value in degrees.

**Returns:** The converted value in radians.

### .denormalize( value : number, array : TypedArray ) : number

Denormalizes the given value according to the given typed array.

**value**

The value to denormalize.

**array**

The typed array that defines the data type of the value.

**Returns:** The denormalize (float) value in the range `[0,1]`.

### .enhanceLogMessage( params : Array.<any> ) : Array.<any>

Enhances log/warn/error messages related to TSL.

**params**

The original message parameters.

**Returns:** The filtered and enhanced message parameters.

### .error( …params : any )

Logs an error message with the 'THREE.' prefix.

If a custom console function is set via setConsoleFunction(), it will be used instead of the native console.error. The first parameter is treated as the method name and is automatically prefixed with 'THREE.'.

**params**

The message components. The first param is used as the method name and prefixed with 'THREE.'.

### .euclideanModulo( n : number, m : number ) : number

Computes the Euclidean modulo of the given parameters that is `( ( n % m ) + m ) % m`.

**n**

The first parameter.

**m**

The second parameter.

**Returns:** The Euclidean modulo.

### .fill( texture : Texture ) : Texture

Configures the texture to the default transformation. Akin to CSS `object-fit: fill`.

**texture**

The texture.

**Returns:** The updated texture.

### .flattenJSON( jsonKeys : Array.<number>, times : Array.<number>, values : Array.<number>, valuePropertyName : string )

Used for parsing AOS keyframe formats.

**jsonKeys**

A list of JSON keyframes.

**times**

This array will be filled with keyframe times by this function.

**values**

This array will be filled with keyframe values by this function.

**valuePropertyName**

The name of the property to use.

### .floorPowerOfTwo( value : number ) : number

Returns the largest power of two that is less than or equal to the given number.

**value**

The value to find a POT for. Must be greater than `0`.

**Returns:** The largest power of two that is less than or equal to the given number.

### .fromHalfFloat( val : number ) : number

Returns a single precision floating point value (FP32) from the given half precision floating point value (FP16).

**val**

A half precision floating point value.

**Returns:** The FP32 value.

### .generateMagicSquare( size : number ) : Array.<number>

Computes an array of magic square values required to generate the noise texture.

**size**

The noise size.

**Returns:** The magic square values.

### .generateMagicSquareNoise( size : number ) : DataTexture

Generates the AO's noise texture for the given size.

**size**

The noise size.

Default is `5`.

**Returns:** The generated noise texture.

### .generateUUID() : string

Generate a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) (universally unique identifier).

**Returns:** The UUID.

### .getByteLength( width : number, height : number, format : number, type : number ) : number

Determines how many bytes must be used to represent the texture.

**width**

The width of the texture.

**height**

The height of the texture.

**format**

The texture's format.

**type**

The texture's type.

**Returns:** The byte length.

### .getCacheKey( renderContext : RenderContext ) : number

Computes a cache key for the given render context. This key should identify the render target state so it is possible to configure the correct attachments in the respective backend.

**renderContext**

The render context.

**Returns:** The cache key.

### .getConsoleFunction() : function | null

Gets the currently set custom console function.

**Returns:** The custom console function, or null if not set.

### .getDistanceAttenuation( inputs : Object ) : Node.<float>

Represents a `discard` shader operation in TSL.

**inputs**

The input parameter object.

**lightDistance**

The distance of the light's position to the current fragment position.

**cutoffDistance**

The light's cutoff distance.

**decayExponent**

The light's decay exponent.

**Returns:** The distance falloff.

### .getElementsByTagName()

Utility functions for parsing

### .getFilteredStack()

Parses the stack trace and filters out ignored files. Returns an array with function name, file, line, and column.

### .getFloatLength( floatLength : number ) : number

This function is usually called with the length in bytes of an array buffer. It returns an padded value which ensure chunk size alignment according to STD140 layout.

**floatLength**

The buffer length.

**Returns:** The padded length.

### .getFormat( texture : Texture, device : GPUDevice ) : string

Returns the GPU format for the given texture.

**texture**

The texture.

**device**

The GPU device which is used for feature detection. It is not necessary to apply the device for most formats.

Default is `null`.

**Returns:** The GPU format.

### .getKeyframeOrder( times : Array.<number> ) : Array.<number>

Returns an array by which times and values can be sorted.

**times**

The keyframe time values.

**Returns:** The array.

### .getMembersLayout( members : Object.<string, (string|Object)> ) : Array.<{name: string, type: string, atomic: boolean}>

Generates a layout for struct members. This function takes an object representing struct members and returns an array of member layouts. Each member layout includes the member's name, type, and whether it is atomic.

**members**

An object where keys are member names and values are either types (as strings) or objects with type and atomic properties.

**Returns:** An array of member layouts.

### .getStrideLength( vectorLength : number ) : number

This function is called with a vector length and ensure the computed length matches a predefined stride (in this case `4`).

**vectorLength**

The vector length.

**Returns:** The padded length.

### .getTextureIndex( textures : Array.<Texture>, name : string ) : number

Returns the MRT texture index for the given name.

**textures**

The textures of a MRT-configured render target.

**name**

The name of the MRT texture which index is requested.

**Returns:** The texture index.

### .getUniforms( splineTexture : DataTexture ) : Object

Create a new set of uniforms for describing the curve modifier.

**splineTexture**

Which holds the curve description.

**Returns:** The uniforms object to be used in the shader.

### .getVectorLength( count : number, vectorLength : number ) : number

Given the count of vectors and their vector length, this function computes a total length in bytes with buffer alignment according to STD140 layout.

**count**

The number of vectors.

**vectorLength**

The vector length.

Default is `4`.

**Returns:** The padded length.

### .getViewZNode( builder : NodeBuilder ) : Node

Returns a node that represents the `z` coordinate in view space for the current fragment. It's a different representation of the default depth value.

This value can be part of a computation that defines how the fog density increases when moving away from the camera.

**builder**

The current node builder.

**Returns:** The viewZ node.

### .inverseLerp( x : number, y : number, value : number ) : number

Returns the percentage in the closed interval `[0, 1]` of the given value between the start and end point.

**x**

The start point

**y**

The end point.

**value**

A value between start and end.

**Returns:** The interpolation factor.

### .isPowerOfTwo( value : number ) : boolean

Returns `true` if the given number is a power of two.

**value**

The value to check.

**Returns:** Whether the given number is a power of two or not.

### .isTypedArray( array : any ) : boolean

Returns `true` if the given object is a typed array.

**array**

The object to check.

**Returns:** Whether the given object is a typed array.

### .lerp( x : number, y : number, t : number ) : number

Returns a value linearly interpolated from two known points based on the given interval - `t = 0` will return `x` and `t = 1` will return `y`.

**x**

The start point

**y**

The end point.

**t**

The interpolation factor in the closed interval `[0, 1]`.

**Returns:** The interpolated value.

### .log( …params : any )

Logs an informational message with the 'THREE.' prefix.

If a custom console function is set via setConsoleFunction(), it will be used instead of the native console.log. The first parameter is treated as the method name and is automatically prefixed with 'THREE.'.

**params**

The message components. The first param is used as the method name and prefixed with 'THREE.'.

### .makeClipAdditive( targetClip : AnimationClip, referenceFrame : number, referenceClip : AnimationClip, fps : number ) : AnimationClip

Converts the keyframes of the given animation clip to an additive format.

**targetClip**

The clip to make additive.

**referenceFrame**

The reference frame.

Default is `0`.

**referenceClip**

The reference clip.

Default is `targetClip`.

**fps**

The FPS.

Default is `30`.

**Returns:** The updated clip which is now additive.

### .mapLinear( x : number, a1 : number, a2 : number, b1 : number, b2 : number ) : number

Performs a linear mapping from range `<a1, a2>` to range `<b1, b2>` for the given value. `a2` must be greater than `a1`.

**x**

The value to be mapped.

**a1**

Minimum value for range A.

**a2**

Maximum value for range A.

**b1**

Minimum value for range B.

**b2**

Maximum value for range B.

**Returns:** The mapped value.

### .normalize( value : number, array : TypedArray ) : number

Normalizes the given value according to the given typed array.

**value**

The float value in the range `[0,1]` to normalize.

**array**

The typed array that defines the data type of the value.

**Returns:** The normalize value.

### .pingpong( x : number, length : number ) : number

Returns a value that alternates between `0` and the given `length` parameter.

**x**

The value to pingpong.

**length**

The positive value the function will pingpong to.

Default is `1`.

**Returns:** The alternated value.

### .radToDeg( radians : number ) : number

Converts radians to degrees.

**radians**

A value in radians.

**Returns:** The converted value in degrees.

### .randFloat( low : number, high : number ) : number

Returns a random float from `<low, high>` interval.

**low**

The lower value boundary.

**high**

The upper value boundary

**Returns:** A random float.

### .randFloatSpread( range : number ) : number

Returns a random integer from `<-range/2, range/2>` interval.

**range**

Defines the value range.

**Returns:** A random float.

### .randInt( low : number, high : number ) : number

Returns a random integer from `<low, high>` interval.

**low**

The lower value boundary.

**high**

The upper value boundary

**Returns:** A random integer.

### .sample( callback : function, uv : Node.<vec2> ) : SampleNode

Helper function to create a SampleNode wrapped as a node object.

**callback**

The function to be called when sampling. Should accept a UV node and return a value.

**uv**

The UV node to be used in the texture sampling.

Default is `null`.

**Returns:** The created SampleNode instance wrapped as a node object.

### .seededRandom( s : number ) : number

Returns a deterministic pseudo-random float in the interval `[0, 1]`.

**s**

The integer seed.

**Returns:** A random float.

### .setConsoleFunction( fn : function )

Sets a custom function to handle console output.

This allows external code to intercept and handle console.log, console.warn, and console.error calls made by three.js, which is useful for custom logging, testing, or debugging workflows.

**fn**

The function to handle console output. Should accept (type, message, ...params) where type is 'log', 'warn', or 'error'.

### .setProjectionFromUnion( camera : ArrayCamera, cameraL : PerspectiveCamera, cameraR : PerspectiveCamera )

Assumes 2 cameras that are parallel and share an X-axis, and that the cameras' projection and world matrices have already been set. And that near and far planes are identical for both cameras. Visualization of this technique: https://computergraphics.stackexchange.com/a/4765

**camera**

The camera to update.

**cameraL**

The left camera.

**cameraR**

The right camera.

### .setQuaternionFromProperEuler( q : Quaternion, a : number, b : number, c : number, order : 'XYX' | 'XZX' | 'YXY' | 'YZY' | 'ZXZ' | 'ZYZ' )

Sets the given quaternion from the [Intrinsic Proper Euler Angles](https://en.wikipedia.org/wiki/Euler_angles) defined by the given angles and order.

Rotations are applied to the axes in the order specified by order: rotation by angle `a` is applied first, then by angle `b`, then by angle `c`.

**q**

The quaternion to set.

**a**

The rotation applied to the first axis, in radians.

**b**

The rotation applied to the second axis, in radians.

**c**

The rotation applied to the third axis, in radians.

**order**

A string specifying the axes order.

### .shadowRenderObjectFunction( object : Object3D, scene : Scene, _camera : Camera, geometry : BufferGeometry, material : Material, group : Group, …params : any )

Shadow Render Object Function.

**object**

The 3D object to render.

**scene**

The scene containing the object.

**\_camera**

The camera used for rendering.

**geometry**

The geometry of the object.

**material**

The material of the object.

**group**

The group the object belongs to.

**params**

Additional parameters for rendering.

### .smootherstep( x : number, min : number, max : number ) : number

A [variation on smoothstep](https://en.wikipedia.org/wiki/Smoothstep#Variations) that has zero 1st and 2nd order derivatives at `x=0` and `x=1`.

**x**

The value to evaluate based on its position between `min` and `max`.

**min**

The min value. Any `x` value below `min` will be `0`. `min` must be lower than `max`.

**max**

The max value. Any `x` value above `max` will be `1`. `max` must be greater than `min`.

**Returns:** The alternated value.

### .smoothstep( x : number, min : number, max : number ) : number

Returns a value in the range `[0,1]` that represents the percentage that `x` has moved between `min` and `max`, but smoothed or slowed down the closer `x` is to the `min` and `max`.

See [Smoothstep](http://en.wikipedia.org/wiki/Smoothstep) for more details.

**x**

The value to evaluate based on its position between `min` and `max`.

**min**

The min value. Any `x` value below `min` will be `0`. `min` must be lower than `max`.

**max**

The max value. Any `x` value above `max` will be `1`. `max` must be greater than `min`.

**Returns:** The alternated value.

### .sortedArray( values : Array.<number>, stride : number, order : Array.<number> ) : Array.<number>

Sorts the given array by the previously computed order via `getKeyframeOrder()`.

**values**

The values to sort.

**stride**

The stride.

**order**

The sort order.

**Returns:** The sorted values.

### .subclip( sourceClip : AnimationClip, name : string, startFrame : number, endFrame : number, fps : number ) : AnimationClip

Creates a new clip, containing only the segment of the original clip between the given frames.

**sourceClip**

The values to sort.

**name**

The name of the clip.

**startFrame**

The start frame.

**endFrame**

The end frame.

**fps**

The FPS.

Default is `30`.

**Returns:** The new sub clip.

### .toHalfFloat( val : number ) : number

Returns a half precision floating point value (FP16) from the given single precision floating point value (FP32).

**val**

A single precision floating point value.

**Returns:** The FP16 value.

### .updateCamera( camera : Camera, parent : Object3D )

Updates the world matrices for the given camera based on the parent 3D object.

**camera**

The camera to update.

**parent**

The parent 3D object.

### .updateUserCamera( camera : Camera, cameraXR : ArrayCamera, parent : Object3D )

Updates the given camera with the transformation of the XR camera and parent object.

**camera**

The camera to update.

**cameraXR**

The XR camera.

**parent**

The parent 3D object.

### .warn( …params : any )

Logs a warning message with the 'THREE.' prefix.

If a custom console function is set via setConsoleFunction(), it will be used instead of the native console.warn. The first parameter is treated as the method name and is automatically prefixed with 'THREE.'.

**params**

The message components. The first param is used as the method name and prefixed with 'THREE.'.

### .warnOnce( …params : any )

Logs a warning message only once, preventing duplicate warnings.

This function maintains an internal cache of warning messages and will only output each unique warning message once. Useful for warnings that may be triggered repeatedly but should only be shown to the user once.

**params**

The warning message components.

## Type Definitions

### .ConstantsInterpolationSamplingMode

Represents the different interpolation sampling modes.

**NORMAL**  
string

Normal sampling mode.

**CENTROID**  
string

Centroid sampling mode.

**SAMPLE**  
string

Sample-specific sampling mode.

**FIRST**  
string

Flat interpolation using the first vertex.

**EITHER**  
string

Flat interpolation using either vertex.

### .ConstantsInterpolationSamplingType

Represents the different interpolation sampling types.

**PERSPECTIVE**  
string

Perspective-correct interpolation.

**LINEAR**  
string

Linear interpolation.

**FLAT**  
string

Flat interpolation.

### .ConstantsMouse

This type represents mouse buttons and interaction types in context of controls.

**MIDDLE**  
number

The left mouse button.

**LEFT**  
number

The middle mouse button.

**RIGHT**  
number

The right mouse button.

**ROTATE**  
number

A rotate interaction.

**DOLLY**  
number

A dolly interaction.

**PAN**  
number

A pan interaction.

### .ConstantsTimestampQuery

This type represents the different timestamp query types.

**COMPUTE**  
string

A `compute` timestamp query.

**RENDER**  
string

A `render` timestamp query.

### .ConstantsTouch

This type represents touch interaction types in context of controls.

**ROTATE**  
number

A rotate interaction.

**PAN**  
number

A pan interaction.

**DOLLY\_PAN**  
number

The dolly-pan interaction.

**DOLLY\_ROTATE**  
number

A dolly-rotate interaction.

### .DebugConfig

Debug configuration.

**checkShaderErrors**  
boolean

Whether shader errors should be checked or not.

**onShaderError**  
function

A callback function that is executed when a shader error happens. Only supported with WebGL 2 right now.

**getShaderAsync**  
function

Allows the get the raw shader code for the given scene, camera and 3D object.

### .ShadowMapConfig

Shadow map configuration

**enabled**  
boolean

Whether to globally enable shadows or not.

**transmitted**  
boolean

Whether to enable light transmission through non-opaque materials.

**type**  
number

The shadow map type.

### .XRConfig

XR configuration.

**enabled**  
boolean

Whether to globally enable XR or not.

### .onAnimationCallback( time : DOMHighResTimeStamp, frame : XRFrame )

Animation loop parameter of `renderer.setAnimationLoop()`.

**time**

A timestamp indicating the end time of the previous frame's rendering.

**frame**

A reference to the current XR frame. Only relevant when using XR rendering.

### .onErrorCallback( error : Error )

Callback for onError in loaders.

**error**

The error which occurred during the loading process.

### .onProgressCallback( event : ProgressEvent )

Callback for onProgress in loaders.

**event**

An instance of `ProgressEvent` that represents the current loading status.

### .renderObjectFunction( object : Object3D, scene : Scene, camera : Camera, geometry : BufferGeometry, material : Material, group : Object, lightsNode : LightsNode, clippingContext : ClippingContext, passId : string )

Callback for [Renderer#setRenderObjectFunction](Renderer.html#setRenderObjectFunction).

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

**passId**

An optional ID for identifying the pass.

Default is `null`.

### .traverseCallback( node : Node )

Callback for [Node#traverse](Node.html#traverse).

**node**

The current node.