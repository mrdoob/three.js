*Inheritance: EventDispatcher → Material →*

# MeshDepthMaterial

A material for drawing geometry by depth. Depth is based off of the camera near and far plane. White is nearest, black is farthest.

## Constructor

### new MeshDepthMaterial( parameters : Object )

Constructs a new mesh depth material.

**parameters**

An object with one or more properties defining the material's appearance. Any property of the material (including any property from inherited materials) can be passed in here. Color values can be passed any type of value accepted by [Color#set](Color.html#set).

## Properties

### .alphaMap : Texture

The alpha map is a grayscale texture that controls the opacity across the surface (black: fully transparent; white: fully opaque).

Only the color of the texture is used, ignoring the alpha channel if one exists. For RGB and RGBA textures, the renderer will use the green channel when sampling this texture due to the extra bit of precision provided for green in DXT-compressed and uncompressed RGB 565 formats. Luminance-only and luminance/alpha textures will also still work as expected.

Default is `null`.

### .depthPacking : BasicDepthPacking | RGBADepthPacking | RGBDepthPacking | RGDepthPacking

Type for depth packing.

Default is `BasicDepthPacking`.

### .displacementBias : number

The offset of the displacement map's values on the mesh's vertices. The bias is added to the scaled sample of the displacement map. Without a displacement map set, this value is not applied.

Default is `0`.

### .displacementMap : Texture

The displacement map affects the position of the mesh's vertices. Unlike other maps which only affect the light and shade of the material the displaced vertices can cast shadows, block other objects, and otherwise act as real geometry. The displacement texture is an image where the value of each pixel (white being the highest) is mapped against, and repositions, the vertices of the mesh.

Default is `null`.

### .displacementScale : number

How much the displacement map affects the mesh (where black is no displacement, and white is maximum displacement). Without a displacement map set, this value is not applied.

Default is `0`.

### .isMeshDepthMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .map : Texture

The color map. May optionally include an alpha channel, typically combined with [Material#transparent](Material.html#transparent) or [Material#alphaTest](Material.html#alphaTest).

Default is `null`.

### .wireframe : boolean

Renders the geometry as a wireframe.

Default is `false`.

### .wireframeLinewidth : number

Controls the thickness of the wireframe.

WebGL and WebGPU ignore this property and always render 1 pixel wide lines.

Default is `1`.

## Source

[src/materials/MeshDepthMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/MeshDepthMaterial.js)