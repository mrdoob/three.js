*Inheritance: EventDispatcher → Material → MeshStandardMaterial →*

# MeshPhysicalMaterial

An extension of the [MeshStandardMaterial](MeshStandardMaterial.html), providing more advanced physically-based rendering properties:

*   Anisotropy: Ability to represent the anisotropic property of materials as observable with brushed metals.
*   Clearcoat: Some materials — like car paints, carbon fiber, and wet surfaces — require a clear, reflective layer on top of another layer that may be irregular or rough. Clearcoat approximates this effect, without the need for a separate transparent surface.
*   Iridescence: Allows to render the effect where hue varies depending on the viewing angle and illumination angle. This can be seen on soap bubbles, oil films, or on the wings of many insects.
*   Physically-based transparency: One limitation of [Material#opacity](Material.html#opacity) is that highly transparent materials are less reflective. Physically-based transmission provides a more realistic option for thin, transparent surfaces like glass.
*   Advanced reflectivity: More flexible reflectivity for non-metallic materials.
*   Sheen: Can be used for representing cloth and fabric materials.

As a result of these complex shading features, `MeshPhysicalMaterial` has a higher performance cost, per pixel, than other three.js materials. Most effects are disabled by default, and add cost as they are enabled. For best results, always specify an environment map when using this material.

## Constructor

### new MeshPhysicalMaterial( parameters : Object )

Constructs a new mesh physical material.

**parameters**

An object with one or more properties defining the material's appearance. Any property of the material (including any property from inherited materials) can be passed in here. Color values can be passed any type of value accepted by [Color#set](Color.html#set).

## Properties

### .anisotropy : number

The anisotropy strength, from `0.0` to `1.0`.

Default is `0`.

### .anisotropyMap : Texture

Red and green channels represent the anisotropy direction in `[-1, 1]` tangent, bitangent space, to be rotated by `anisotropyRotation`. The blue channel contains strength as `[0, 1]` to be multiplied by `anisotropy`.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

### .anisotropyRotation : number

The rotation of the anisotropy in tangent, bitangent space, measured in radians counter-clockwise from the tangent. When `anisotropyMap` is present, this property provides additional rotation to the vectors in the texture.

Default is `1`.

### .attenuationColor : Color

The color that white light turns into due to absorption when reaching the attenuation distance.

Default is `(1,1,1)`.

### .attenuationDistance : number

Density of the medium given as the average distance that light travels in the medium before interacting with a particle. The value is given in world space units, and must be greater than zero.

Default is `Infinity`.

### .clearcoat : number

Represents the intensity of the clear coat layer, from `0.0` to `1.0`. Use clear coat related properties to enable multilayer materials that have a thin translucent layer over the base layer.

Default is `0`.

### .clearcoatMap : Texture

The red channel of this texture is multiplied against `clearcoat`, for per-pixel control over a coating's intensity.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

### .clearcoatNormalMap : Texture

Can be used to enable independent normals for the clear coat layer.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

### .clearcoatNormalScale : Vector2

How much `clearcoatNormalMap` affects the clear coat layer, from `(0,0)` to `(1,1)`.

Default is `(1,1)`.

### .clearcoatRoughness : number

Roughness of the clear coat layer, from `0.0` to `1.0`.

Default is `0`.

### .clearcoatRoughnessMap : Texture

The green channel of this texture is multiplied against `clearcoatRoughness`, for per-pixel control over a coating's roughness.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

### .dispersion : number

Defines the strength of the angular separation of colors (chromatic aberration) transmitting through a relatively clear volume. Any value zero or larger is valid, the typical range of realistic values is `[0, 1]`. This property can be only be used with transmissive objects.

Default is `0`.

### .ior : number

Index-of-refraction for non-metallic materials, from `1.0` to `2.333`.

Default is `1.5`.

### .iridescence : number

The intensity of the iridescence layer, simulating RGB color shift based on the angle between the surface and the viewer, from `0.0` to `1.0`.

Default is `0`.

### .iridescenceIOR : number

Strength of the iridescence RGB color shift effect, represented by an index-of-refraction. Between `1.0` to `2.333`.

Default is `1.3`.

### .iridescenceMap : Texture

The red channel of this texture is multiplied against `iridescence`, for per-pixel control over iridescence.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

### .iridescenceThicknessMap : Texture

A texture that defines the thickness of the iridescence layer, stored in the green channel. Minimum and maximum values of thickness are defined by `iridescenceThicknessRange` array:

*   `0.0` in the green channel will result in thickness equal to first element of the array.
*   `1.0` in the green channel will result in thickness equal to second element of the array.
*   Values in-between will linearly interpolate between the elements of the array.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

### .iridescenceThicknessRange : Array.<number, number>

Array of exactly 2 elements, specifying minimum and maximum thickness of the iridescence layer. Thickness of iridescence layer has an equivalent effect of the one `thickness` has on `ior`.

Default is `[100,400]`.

### .isMeshPhysicalMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .reflectivity : number

Degree of reflectivity, from `0.0` to `1.0`. Default is `0.5`, which corresponds to an index-of-refraction of `1.5`.

This models the reflectivity of non-metallic materials. It has no effect when `metalness` is `1.0`

Default is `0.5`.

### .sheen : number

The intensity of the sheen layer, from `0.0` to `1.0`.

Default is `0`.

### .sheenColor : Color

The sheen tint.

Default is `(0,0,0)`.

### .sheenColorMap : Texture

The RGB channels of this texture are multiplied against `sheenColor`, for per-pixel control over sheen tint.

**This texture may contain color data and must have its [Texture#colorSpace](Texture.html#colorSpace) set appropriately. For an explanation, see [Color Management](Color.html).**

Default is `null`.

### .sheenRoughness : number

Roughness of the sheen layer, from `0.0` to `1.0`.

Default is `1`.

### .sheenRoughnessMap : Texture

The alpha channel of this texture is multiplied against `sheenRoughness`, for per-pixel control over sheen roughness.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

### .specularColor : Color

Tints the specular reflection at normal incidence for non-metals only.

Default is `(1,1,1)`.

### .specularColorMap : Texture

The RGB channels of this texture are multiplied against `specularColor`, for per-pixel control over specular color.

**This texture may contain color data and must have its [Texture#colorSpace](Texture.html#colorSpace) set appropriately. For an explanation, see [Color Management](Color.html).**

Default is `null`.

### .specularIntensity : number

A float that scales the amount of specular reflection for non-metals only. When set to zero, the model is effectively Lambertian. From `0.0` to `1.0`.

Default is `1`.

### .specularIntensityMap : Texture

The alpha channel of this texture is multiplied against `specularIntensity`, for per-pixel control over specular intensity.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

### .thickness : number

The thickness of the volume beneath the surface. The value is given in the coordinate space of the mesh. If the value is `0` the material is thin-walled. Otherwise the material is a volume boundary.

Default is `0`.

### .thicknessMap : Texture

A texture that defines the thickness, stored in the green channel. This will be multiplied by `thickness`.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

### .transmission : number

Degree of transmission (or optical transparency), from `0.0` to `1.0`.

Thin, transparent or semitransparent, plastic or glass materials remain largely reflective even if they are fully transmissive. The transmission property can be used to model these materials.

When transmission is non-zero, `opacity` should be set to `1`.

Default is `0`.

### .transmissionMap : Texture

The red channel of this texture is multiplied against `transmission`, for per-pixel control over optical transparency.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

## Source

[src/materials/MeshPhysicalMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/MeshPhysicalMaterial.js)