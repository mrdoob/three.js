*Inheritance: EventDispatcher → Material →*

# MeshStandardMaterial

A standard physically based material, using Metallic-Roughness workflow.

Physically based rendering (PBR) has recently become the standard in many 3D applications, such as [Unity](https://blogs.unity3d.com/2014/10/29/physically-based-shading-in-unity-5-a-primer/), [Unreal](https://docs.unrealengine.com/latest/INT/Engine/Rendering/Materials/PhysicallyBased/) and [3D Studio Max](http://area.autodesk.com/blogs/the-3ds-max-blog/what039s-new-for-rendering-in-3ds-max-2017).

This approach differs from older approaches in that instead of using approximations for the way in which light interacts with a surface, a physically correct model is used. The idea is that, instead of tweaking materials to look good under specific lighting, a material can be created that will react 'correctly' under all lighting scenarios.

In practice this gives a more accurate and realistic looking result than the [MeshLambertMaterial](MeshLambertMaterial.html) or [MeshPhongMaterial](MeshPhongMaterial.html), at the cost of being somewhat more computationally expensive. `MeshStandardMaterial` uses per-fragment shading.

Note that for best results you should always specify an environment map when using this material.

For a non-technical introduction to the concept of PBR and how to set up a PBR material, check out these articles by the people at [marmoset](https://www.marmoset.co):

*   [Basic Theory of Physically Based Rendering](https://www.marmoset.co/posts/basic-theory-of-physically-based-rendering/)
*   [Physically Based Rendering and You Can Too](https://www.marmoset.co/posts/physically-based-rendering-and-you-can-too/)

Technical details of the approach used in three.js (and most other PBR systems) can be found is this [paper from Disney](https://media.disneyanimation.com/uploads/production/publication_asset/48/asset/s2012_pbs_disney_brdf_notes_v3.pdf) (pdf), by Brent Burley.

## Constructor

### new MeshStandardMaterial( parameters : Object )

Constructs a new mesh standard material.

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

### .bumpMap : Texture

The texture to create a bump map. The black and white values map to the perceived depth in relation to the lights. Bump doesn't actually affect the geometry of the object, only the lighting. If a normal map is defined this will be ignored.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

### .bumpScale : number

How much the bump map affects the material. Typical range is `[0,1]`.

Default is `1`.

### .color : Color

Color of the material.

Default is `(1,1,1)`.

### .displacementBias : number

The offset of the displacement map's values on the mesh's vertices. The bias is added to the scaled sample of the displacement map. Without a displacement map set, this value is not applied.

Default is `0`.

### .displacementMap : Texture

The displacement map affects the position of the mesh's vertices. Unlike other maps which only affect the light and shade of the material the displaced vertices can cast shadows, block other objects, and otherwise act as real geometry. The displacement texture is an image where the value of each pixel (white being the highest) is mapped against, and repositions, the vertices of the mesh.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

### .displacementScale : number

How much the displacement map affects the mesh (where black is no displacement, and white is maximum displacement). Without a displacement map set, this value is not applied.

Default is `0`.

### .emissive : Color

Emissive (light) color of the material, essentially a solid color unaffected by other lighting.

Default is `(0,0,0)`.

### .emissiveIntensity : number

Intensity of the emissive light. Modulates the emissive color.

Default is `1`.

### .emissiveMap : Texture

Set emissive (glow) map. The emissive map color is modulated by the emissive color and the emissive intensity. If you have an emissive map, be sure to set the emissive color to something other than black.

**This texture may contain color data and must have its [Texture#colorSpace](Texture.html#colorSpace) set appropriately. For an explanation, see [Color Management](Color.html).**

Default is `null`.

### .envMap : Texture

The environment map. To ensure a physically correct rendering, environment maps are internally pre-processed with [PMREMGenerator](PMREMGenerator.html).

**This texture may contain color data and must have its [Texture#colorSpace](Texture.html#colorSpace) set appropriately. For an explanation, see [Color Management](Color.html).**

Default is `null`.

### .envMapIntensity : number

Scales the effect of the environment map by multiplying its color.

Default is `1`.

### .envMapRotation : Euler

The rotation of the environment map in radians.

Default is `(0,0,0)`.

### .flatShading : boolean

Whether the material is rendered with flat shading or not.

Default is `false`.

### .fog : boolean

Whether the material is affected by fog or not.

Default is `true`.

### .isMeshStandardMaterial : boolean (readonly)

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

### .metalness : number

How much the material is like a metal. Non-metallic materials such as wood or stone use `0.0`, metallic use `1.0`, with nothing (usually) in between. A value between `0.0` and `1.0` could be used for a rusty metal look. If `metalnessMap` is also provided, both values are multiplied.

Default is `0`.

### .metalnessMap : Texture

The blue channel of this texture is used to alter the metalness of the material.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

### .normalMap : Texture

The texture to create a normal map. The RGB values affect the surface normal for each pixel fragment and change the way the color is lit. Normal maps do not change the actual shape of the surface, only the lighting. In case the material has a normal map authored using the left handed convention, the `y` component of `normalScale` should be negated to compensate for the different handedness.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

### .normalMapType : TangentSpaceNormalMap | ObjectSpaceNormalMap

The type of normal map.

Default is `TangentSpaceNormalMap`.

### .normalScale : Vector2

How much the normal map affects the material. Typical value range is `[0,1]`.

Default is `(1,1)`.

### .roughness : number

How rough the material appears. `0.0` means a smooth mirror reflection, `1.0` means fully diffuse. If `roughnessMap` is also provided, both values are multiplied.

Default is `1`.

### .roughnessMap : Texture

The green channel of this texture is used to alter the roughness of the material.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

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

[src/materials/MeshStandardMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/MeshStandardMaterial.js)