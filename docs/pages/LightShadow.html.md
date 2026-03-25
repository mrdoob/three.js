# LightShadow

Abstract base class for light shadow classes. These classes represent the shadow configuration for different light types.

## Constructor

### new LightShadow( camera : Camera ) (abstract)

Constructs a new light shadow.

**camera**

The light's view of the world.

## Properties

### .autoUpdate : boolean

Enables automatic updates of the light's shadow. If you do not require dynamic lighting / shadows, you may set this to `false`.

Default is `true`.

### .bias : number

Shadow map bias, how much to add or subtract from the normalized depth when deciding whether a surface is in shadow.

The default is `0`. Very tiny adjustments here (in the order of `0.0001`) may help reduce artifacts in shadows.

Default is `0`.

### .biasNode : Node.<float>

A node version of `bias`. Only supported with `WebGPURenderer`.

If a bias node is defined, `bias` has no effect.

Default is `null`.

### .blurSamples : number

The amount of samples to use when blurring a VSM shadow map.

Default is `8`.

### .camera : Camera

The light's view of the world.

### .intensity : number

The intensity of the shadow. The default is `1`. Valid values are in the range `[0, 1]`.

Default is `1`.

### .map : RenderTarget

The depth map generated using the internal camera; a location beyond a pixel's depth is in shadow. Computed internally during rendering.

Default is `null`.

### .mapPass : RenderTarget

The distribution map generated using the internal camera; an occlusion is calculated based on the distribution of depths. Computed internally during rendering.

Default is `null`.

### .mapSize : Vector2

Defines the width and height of the shadow map. Higher values give better quality shadows at the cost of computation time. Values must be powers of two.

Default is `(512,512)`.

### .mapType : number

The type of shadow texture. The default is `UnsignedByteType`.

Default is `UnsignedByteType`.

### .matrix : Matrix4

Model to shadow camera space, to compute location and depth in shadow map. This is computed internally during rendering.

### .needsUpdate : boolean

When set to `true`, shadow maps will be updated in the next `render` call. If you have set [LightShadow#autoUpdate](LightShadow.html#autoUpdate) to `false`, you will need to set this property to `true` and then make a render call to update the light's shadow.

Default is `false`.

### .normalBias : number

Defines how much the position used to query the shadow map is offset along the object normal. The default is `0`. Increasing this value can be used to reduce shadow acne especially in large scenes where light shines onto geometry at a shallow angle. The cost is that shadows may appear distorted.

Default is `0`.

### .radius : number

Setting this to values greater than 1 will blur the edges of the shadow. High values will cause unwanted banding effects in the shadows - a greater map size will allow for a higher value to be used here before these effects become visible.

The property has no effect when the shadow map type is `BasicShadowMap`.

Default is `1`.

## Methods

### .clone() : LightShadow

Returns a new light shadow instance with copied values from this instance.

**Returns:** A clone of this instance.

### .copy( source : LightShadow ) : LightShadow

Copies the values of the given light shadow instance to this instance.

**source**

The light shadow to copy.

**Returns:** A reference to this light shadow instance.

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .getFrameExtents() : Vector2

Returns the frame extends.

**Returns:** The frame extends.

### .getFrustum() : Frustum

Gets the shadow cameras frustum. Used internally by the renderer to cull objects.

**Returns:** The shadow camera frustum.

### .getViewport( viewportIndex : number ) : Vector4

Returns a viewport definition for the given viewport index.

**viewportIndex**

The viewport index.

**Returns:** The viewport.

### .getViewportCount() : number

Used internally by the renderer to get the number of viewports that need to be rendered for this shadow.

**Returns:** The viewport count.

### .toJSON() : Object

Serializes the light shadow into JSON.

See:

*   [ObjectLoader#parse](ObjectLoader.html#parse)

**Returns:** A JSON object representing the serialized light shadow.

### .updateMatrices( light : Light )

Update the matrices for the camera and shadow, used internally by the renderer.

**light**

The light for which the shadow is being rendered.

## Source

[src/lights/LightShadow.js](https://github.com/mrdoob/three.js/blob/master/src/lights/LightShadow.js)