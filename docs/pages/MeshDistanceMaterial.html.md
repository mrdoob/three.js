*Inheritance: EventDispatcher → Material →*

# MeshDistanceMaterial

A material used internally for implementing shadow mapping with point lights.

Can also be used to customize the shadow casting of an object by assigning an instance of `MeshDistanceMaterial` to [Object3D#customDistanceMaterial](Object3D.html#customDistanceMaterial). The following examples demonstrates this approach in order to ensure transparent parts of objects do not cast shadows.

## Constructor

### new MeshDistanceMaterial( parameters : Object )

Constructs a new mesh distance material.

**parameters**

An object with one or more properties defining the material's appearance. Any property of the material (including any property from inherited materials) can be passed in here. Color values can be passed any type of value accepted by [Color#set](Color.html#set).

## Properties

### .alphaMap : Texture

The alpha map is a grayscale texture that controls the opacity across the surface (black: fully transparent; white: fully opaque).

Only the color of the texture is used, ignoring the alpha channel if one exists. For RGB and RGBA textures, the renderer will use the green channel when sampling this texture due to the extra bit of precision provided for green in DXT-compressed and uncompressed RGB 565 formats. Luminance-only and luminance/alpha textures will also still work as expected.

**This texture does not contain color data and must not have its [Texture#colorSpace](Texture.html#colorSpace) set.**

Default is `null`.

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

### .isMeshDistanceMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .map : Texture

The color map. May optionally include an alpha channel, typically combined with [Material#transparent](Material.html#transparent) or [Material#alphaTest](Material.html#alphaTest).

**This texture may contain color data and must have its [Texture#colorSpace](Texture.html#colorSpace) set appropriately. For an explanation, see [Color Management](Color.html).**

Default is `null`.

## Source

[src/materials/MeshDistanceMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/MeshDistanceMaterial.js)