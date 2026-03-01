*Inheritance: EventDispatcher → Material →*

# MeshBasicMaterial

A material for drawing geometries in a simple shaded (flat or wireframe) way.

This material is not affected by lights.

## Constructor

### new MeshBasicMaterial( parameters : Object )

Constructs a new mesh basic material.

**parameters**

An object with one or more properties defining the material's appearance. Any property of the material (including any property from inherited materials) can be passed in here. Color values can be passed any type of value accepted by [Color#set](Color.html#set).

## Properties

### .alphaMap : Texture

The alpha map is a grayscale texture that controls the opacity across the surface (black: fully transparent; white: fully opaque).

Only the color of the texture is used, ignoring the alpha channel if one exists. For RGB and RGBA textures, the renderer will use the green channel when sampling this texture due to the extra bit of precision provided for green in DXT-compressed and uncompressed RGB 565 formats. Luminance-only and luminance/alpha textures will also still work as expected.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

### .aoMap : Texture

The red channel of this texture is used as the ambient occlusion map. Requires a second set of UVs.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

### .aoMapIntensity : number

Intensity of the ambient occlusion effect. Range is `[0,1]`, where `0` disables ambient occlusion. Where intensity is `1` and the AO map's red channel is also `1`, ambient light is fully occluded on a surface.

Default is `1`.

### .color : Color

Color of the material.

Default is `(1,1,1)`.

### .combine : MultiplyOperation | MixOperation | AddOperation

How to combine the result of the surface's color with the environment map, if any.

When set to `MixOperation`, the [MeshBasicMaterial#reflectivity](MeshBasicMaterial.html#reflectivity) is used to blend between the two colors.

Default is `MultiplyOperation`.

### .envMap : Texture

The environment map.

**This texture may contain color data and must have its [Texture#colorSpace](Texture.html#colorSpace) set appropriately. For an explanation, see [Color Management](Color.html).**

Default is `null`.

### .envMapRotation : Euler

The rotation of the environment map in radians.

Default is `(0,0,0)`.

### .fog : boolean

Whether the material is affected by fog or not.

Default is `true`.

### .isMeshBasicMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .lightMap : Texture

The light map. Requires a second set of UVs.

**This texture may contain color data and must have its [Texture#colorSpace](Texture.html#colorSpace) set appropriately. For an explanation, see [Color Management](Color.html).**

Default is `null`.

### .lightMapIntensity : number

Intensity of the baked light.

Default is `1`.

### .map : Texture

The color map. May optionally include an alpha channel, typically combined with [Material#transparent](Material.html#transparent) or [Material#alphaTest](Material.html#alphaTest). The texture map color is modulated by the diffuse `color`.

**This texture may contain color data and must have its [Texture#colorSpace](Texture.html#colorSpace) set appropriately. For an explanation, see [Color Management](Color.html).**

Default is `null`.

### .reflectivity : number

How much the environment map affects the surface. The valid range is between `0` (no reflections) and `1` (full reflections).

Default is `1`.

### .refractionRatio : number

The index of refraction (IOR) of air (approximately 1) divided by the index of refraction of the material. It is used with environment mapping modes [CubeRefractionMapping](global.html#CubeRefractionMapping) and [EquirectangularRefractionMapping](global.html#EquirectangularRefractionMapping). The refraction ratio should not exceed `1`.

Default is `0.98`.

### .specularMap : Texture

Specular map used by the material.

**This texture may contain color data and must have its [Texture#colorSpace](Texture.html#colorSpace) set appropriately. For an explanation, see [Color Management](Color.html).**

Default is `null`.

### .wireframe : boolean

Renders the geometry as a wireframe.

Default is `false`.

### .wireframeLinecap : 'round' | 'bevel' | 'miter'

Defines appearance of wireframe ends.

Can only be used with [SVGRenderer](SVGRenderer.html).

Default is `'round'`.

### .wireframeLinejoin : 'round' | 'bevel' | 'miter'

Defines appearance of wireframe joints.

Can only be used with [SVGRenderer](SVGRenderer.html).

Default is `'round'`.

### .wireframeLinewidth : number

Controls the thickness of the wireframe.

Can only be used with [SVGRenderer](SVGRenderer.html).

Default is `1`.

## Source

[src/materials/MeshBasicMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/MeshBasicMaterial.js)