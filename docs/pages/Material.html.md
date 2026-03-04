*Inheritance: EventDispatcher →*

# Material

Abstract base class for materials.

Materials define the appearance of renderable 3D objects.

## Constructor

### new Material() (abstract)

Constructs a new material.

## Properties

### .allowOverride : boolean

Whether it's possible to override the material with [Scene#overrideMaterial](Scene.html#overrideMaterial) or not.

Default is `true`.

### .alphaHash : boolean

Enables alpha hashed transparency, an alternative to [Material#transparent](Material.html#transparent) or [Material#alphaTest](Material.html#alphaTest). The material will not be rendered if opacity is lower than a random threshold. Randomization introduces some grain or noise, but approximates alpha blending without the associated problems of sorting. Using TAA can reduce the resulting noise.

Default is `false`.

### .alphaTest : number (readonly)

Sets the alpha value to be used when running an alpha test. The material will not be rendered if the opacity is lower than this value.

Default is `0`.

### .alphaToCoverage : boolean

Whether alpha to coverage should be enabled or not. Can only be used with MSAA-enabled contexts (meaning when the renderer was created with _antialias_ parameter set to `true`). Enabling this will smooth aliasing on clip plane edges and alphaTest-clipped edges.

Default is `false`.

### .blendAlpha : number

Represents the alpha value of the constant blend color.

This property has only an effect when using custom blending with `ConstantAlpha` or `OneMinusConstantAlpha`.

Default is `0`.

### .blendColor : Color

Represents the RGB values of the constant blend color.

This property has only an effect when using custom blending with `ConstantColor` or `OneMinusConstantColor`.

Default is `(0,0,0)`.

### .blendDst : ZeroFactor | OneFactor | SrcColorFactor | OneMinusSrcColorFactor | SrcAlphaFactor | OneMinusSrcAlphaFactor | DstAlphaFactor | OneMinusDstAlphaFactor | DstColorFactor | OneMinusDstColorFactor | SrcAlphaSaturateFactor | ConstantColorFactor | OneMinusConstantColorFactor | ConstantAlphaFactor | OneMinusConstantAlphaFactor

Defines the blending destination factor.

Default is `OneMinusSrcAlphaFactor`.

### .blendDstAlpha : ZeroFactor | OneFactor | SrcColorFactor | OneMinusSrcColorFactor | SrcAlphaFactor | OneMinusSrcAlphaFactor | DstAlphaFactor | OneMinusDstAlphaFactor | DstColorFactor | OneMinusDstColorFactor | SrcAlphaSaturateFactor | ConstantColorFactor | OneMinusConstantColorFactor | ConstantAlphaFactor | OneMinusConstantAlphaFactor

Defines the blending destination alpha factor.

Default is `null`.

### .blendEquation : AddEquation | SubtractEquation | ReverseSubtractEquation | MinEquation | MaxEquation

Defines the blending equation.

Default is `AddEquation`.

### .blendEquationAlpha : AddEquation | SubtractEquation | ReverseSubtractEquation | MinEquation | MaxEquation

Defines the blending equation of the alpha channel.

Default is `null`.

### .blendSrc : ZeroFactor | OneFactor | SrcColorFactor | OneMinusSrcColorFactor | SrcAlphaFactor | OneMinusSrcAlphaFactor | DstAlphaFactor | OneMinusDstAlphaFactor | DstColorFactor | OneMinusDstColorFactor | SrcAlphaSaturateFactor | ConstantColorFactor | OneMinusConstantColorFactor | ConstantAlphaFactor | OneMinusConstantAlphaFactor

Defines the blending source factor.

Default is `SrcAlphaFactor`.

### .blendSrcAlpha : ZeroFactor | OneFactor | SrcColorFactor | OneMinusSrcColorFactor | SrcAlphaFactor | OneMinusSrcAlphaFactor | DstAlphaFactor | OneMinusDstAlphaFactor | DstColorFactor | OneMinusDstColorFactor | SrcAlphaSaturateFactor | ConstantColorFactor | OneMinusConstantColorFactor | ConstantAlphaFactor | OneMinusConstantAlphaFactor

Defines the blending source alpha factor.

Default is `null`.

### .blending : NoBlending | NormalBlending | AdditiveBlending | SubtractiveBlending | MultiplyBlending | CustomBlending

Defines the blending type of the material.

It must be set to `CustomBlending` if custom blending properties like [Material#blendSrc](Material.html#blendSrc), [Material#blendDst](Material.html#blendDst) or [Material#blendEquation](Material.html#blendEquation) should have any effect.

Default is `NormalBlending`.

### .clipIntersection : boolean

Changes the behavior of clipping planes so that only their intersection is clipped, rather than their union.

Default is `false`.

### .clipShadows : boolean

Defines whether to clip shadows according to the clipping planes specified on this material.

Default is `false`.

### .clippingPlanes : Array.<Plane>

User-defined clipping planes specified as THREE.Plane objects in world space. These planes apply to the objects this material is attached to. Points in space whose signed distance to the plane is negative are clipped (not rendered). This requires [WebGLRenderer#localClippingEnabled](WebGLRenderer.html#localClippingEnabled) to be `true`.

Default is `null`.

### .colorWrite : boolean

Whether to render the material's color.

This can be used in conjunction with Object3D#renderOder to create invisible objects that occlude other objects.

Default is `true`.

### .depthFunc : NeverDepth | AlwaysDepth | LessDepth | LessEqualDepth | EqualDepth | GreaterEqualDepth | GreaterDepth | NotEqualDepth

Defines the depth function.

Default is `LessEqualDepth`.

### .depthTest : boolean

Whether to have depth test enabled when rendering this material. When the depth test is disabled, the depth write will also be implicitly disabled.

Default is `true`.

### .depthWrite : boolean

Whether rendering this material has any effect on the depth buffer.

When drawing 2D overlays it can be useful to disable the depth writing in order to layer several things together without creating z-index artifacts.

Default is `true`.

### .dithering : boolean

Whether to apply dithering to the color to remove the appearance of banding.

Default is `false`.

### .forceSinglePass : boolean

Whether double-sided, transparent objects should be rendered with a single pass or not.

The engine renders double-sided, transparent objects with two draw calls (back faces first, then front faces) to mitigate transparency artifacts. There are scenarios however where this approach produces no quality gains but still doubles draw calls e.g. when rendering flat vegetation like grass sprites. In these cases, set the `forceSinglePass` flag to `true` to disable the two pass rendering to avoid performance issues.

Default is `false`.

### .id : number (readonly)

The ID of the material.

### .isMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .name : string

The name of the material.

### .needsUpdate : boolean

Setting this property to `true` indicates the engine the material needs to be recompiled.

Default is `false`.

### .opacity : number

Defines how transparent the material is. A value of `0.0` indicates fully transparent, `1.0` is fully opaque.

If the [Material#transparent](Material.html#transparent) is not set to `true`, the material will remain fully opaque and this value will only affect its color.

Default is `1`.

### .polygonOffset : boolean

Whether to use polygon offset or not. When enabled, each fragment's depth value will be offset after it is interpolated from the depth values of the appropriate vertices. The offset is added before the depth test is performed and before the value is written into the depth buffer.

Can be useful for rendering hidden-line images, for applying decals to surfaces, and for rendering solids with highlighted edges.

Default is `false`.

### .polygonOffsetFactor : number

Specifies a scale factor that is used to create a variable depth offset for each polygon.

Default is `0`.

### .polygonOffsetUnits : number

Is multiplied by an implementation-specific value to create a constant depth offset.

Default is `0`.

### .precision : 'highp' | 'mediump' | 'lowp'

Override the renderer's default precision for this material.

Default is `null`.

### .premultipliedAlpha : boolean

Whether to premultiply the alpha (transparency) value.

Default is `false`.

### .shadowSide : FrontSide | BackSide | DoubleSide

Defines which side of faces cast shadows. If `null`, the side casting shadows is determined as follows:

*   When [Material#side](Material.html#side) is set to `FrontSide`, the back side cast shadows.
*   When [Material#side](Material.html#side) is set to `BackSide`, the front side cast shadows.
*   When [Material#side](Material.html#side) is set to `DoubleSide`, both sides cast shadows.

Default is `null`.

### .side : FrontSide | BackSide | DoubleSide

Defines which side of faces will be rendered - front, back or both.

Default is `FrontSide`.

### .stencilFail : ZeroStencilOp | KeepStencilOp | ReplaceStencilOp | IncrementStencilOp | DecrementStencilOp | IncrementWrapStencilOp | DecrementWrapStencilOp | InvertStencilOp

Which stencil operation to perform when the comparison function returns `false`.

Default is `KeepStencilOp`.

### .stencilFunc : NeverStencilFunc | LessStencilFunc | EqualStencilFunc | LessEqualStencilFunc | GreaterStencilFunc | NotEqualStencilFunc | GreaterEqualStencilFunc | AlwaysStencilFunc

The stencil comparison function to use.

Default is `AlwaysStencilFunc`.

### .stencilFuncMask : number

The bit mask to use when comparing against the stencil buffer.

Default is `0xff`.

### .stencilRef : number

The value to use when performing stencil comparisons or stencil operations.

Default is `0`.

### .stencilWrite : boolean

Whether stencil operations are performed against the stencil buffer. In order to perform writes or comparisons against the stencil buffer this value must be `true`.

Default is `false`.

### .stencilWriteMask : number

The bit mask to use when writing to the stencil buffer.

Default is `0xff`.

### .stencilZFail : ZeroStencilOp | KeepStencilOp | ReplaceStencilOp | IncrementStencilOp | DecrementStencilOp | IncrementWrapStencilOp | DecrementWrapStencilOp | InvertStencilOp

Which stencil operation to perform when the comparison function returns `true` but the depth test fails.

Default is `KeepStencilOp`.

### .stencilZPass : ZeroStencilOp | KeepStencilOp | ReplaceStencilOp | IncrementStencilOp | DecrementStencilOp | IncrementWrapStencilOp | DecrementWrapStencilOp | InvertStencilOp

Which stencil operation to perform when the comparison function returns `true` and the depth test passes.

Default is `KeepStencilOp`.

### .toneMapped : boolean

Defines whether this material is tone mapped according to the renderer's tone mapping setting.

It is ignored when rendering to a render target or using post processing or when using `WebGPURenderer`. In all these cases, all materials are honored by tone mapping.

Default is `true`.

### .transparent : boolean

Defines whether this material is transparent. This has an effect on rendering as transparent objects need special treatment and are rendered after non-transparent objects.

When set to true, the extent to which the material is transparent is controlled by [Material#opacity](Material.html#opacity).

Default is `false`.

### .type : string (readonly)

The type property is used for detecting the object type in context of serialization/deserialization.

### .userData : Object

An object that can be used to store custom data about the Material. It should not hold references to functions as these will not be cloned.

### .uuid : string (readonly)

The UUID of the material.

### .version : number (readonly)

This starts at `0` and counts how many times [Material#needsUpdate](Material.html#needsUpdate) is set to `true`.

Default is `0`.

### .vertexColors : boolean

If set to `true`, vertex colors should be used.

The engine supports RGB and RGBA vertex colors depending on whether a three (RGB) or four (RGBA) component color buffer attribute is used.

Default is `false`.

### .visible : boolean

Defines whether 3D objects using this material are visible.

Default is `true`.

## Methods

### .clone() : Material

Returns a new material with copied values from this instance.

**Returns:** A clone of this instance.

### .copy( source : Material ) : Material

Copies the values of the given material to this instance.

**source**

The material to copy.

**Returns:** A reference to this instance.

### .customProgramCacheKey() : string

In case [Material#onBeforeCompile](Material.html#onBeforeCompile) is used, this callback can be used to identify values of settings used in `onBeforeCompile()`, so three.js can reuse a cached shader or recompile the shader for this material as needed.

This method can only be used when rendering with [WebGLRenderer](WebGLRenderer.html).

**Returns:** The custom program cache key.

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

##### Fires:

*   [Material#event:dispose](Material.html#event:dispose)

### .onBeforeCompile( shaderobject : Object, renderer : WebGLRenderer )

An optional callback that is executed immediately before the shader program is compiled. This function is called with the shader source code as a parameter. Useful for the modification of built-in materials.

This method can only be used when rendering with [WebGLRenderer](WebGLRenderer.html). The recommended approach when customizing materials is to use `WebGPURenderer` with the new Node Material system and [TSL](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language).

**shaderobject**

The object holds the uniforms and the vertex and fragment shader source.

**renderer**

A reference to the renderer.

### .onBeforeRender( renderer : WebGLRenderer, scene : Scene, camera : Camera, geometry : BufferGeometry, object : Object3D, group : Object )

An optional callback that is executed immediately before the material is used to render a 3D object.

This method can only be used when rendering with [WebGLRenderer](WebGLRenderer.html).

**renderer**

The renderer.

**scene**

The scene.

**camera**

The camera that is used to render the scene.

**geometry**

The 3D object's geometry.

**object**

The 3D object.

**group**

The geometry group data.

### .setValues( values : Object )

This method can be used to set default values from parameter objects. It is a generic implementation so it can be used with different types of materials.

**values**

The material values to set.

### .toJSON( meta : Object | string ) : Object

Serializes the material into JSON.

**meta**

An optional value holding meta information about the serialization.

See:

*   [ObjectLoader#parse](ObjectLoader.html#parse)

**Returns:** A JSON object representing the serialized material.

## Events

### .dispose

Fires when the material has been disposed of.

##### Type:

*   Object

## Source

[src/materials/Material.js](https://github.com/mrdoob/three.js/blob/master/src/materials/Material.js)