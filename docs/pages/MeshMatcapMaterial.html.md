*Inheritance: EventDispatcher → Material →*

# MeshMatcapMaterial

This material is defined by a MatCap (or Lit Sphere) texture, which encodes the material color and shading.

`MeshMatcapMaterial` does not respond to lights since the matcap image file encodes baked lighting. It will cast a shadow onto an object that receives shadows (and shadow clipping works), but it will not self-shadow or receive shadows.

## Constructor

### new MeshMatcapMaterial( parameters : Object )

Constructs a new mesh matcap material.

**parameters**

An object with one or more properties defining the material's appearance. Any property of the material (including any property from inherited materials) can be passed in here. Color values can be passed any type of value accepted by [Color#set](Color.html#set).

## Properties

### .alphaMap : Texture

The alpha map is a grayscale texture that controls the opacity across the surface (black: fully transparent; white: fully opaque).

Only the color of the texture is used, ignoring the alpha channel if one exists. For RGB and RGBA textures, the renderer will use the green channel when sampling this texture due to the extra bit of precision provided for green in DXT-compressed and uncompressed RGB 565 formats. Luminance-only and luminance/alpha textures will also still work as expected.

Default is `null`.

### .bumpMap : Texture

The texture to create a bump map. The black and white values map to the perceived depth in relation to the lights. Bump doesn't actually affect the geometry of the object, only the lighting. If a normal map is defined this will be ignored.

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

Default is `null`.

### .displacementScale : number

How much the displacement map affects the mesh (where black is no displacement, and white is maximum displacement). Without a displacement map set, this value is not applied.

Default is `0`.

### .flatShading : boolean

Whether the material is rendered with flat shading or not.

Default is `false`.

### .fog : boolean

Whether the material is affected by fog or not.

Default is `true`.

### .isMeshMatcapMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .map : Texture

The color map. May optionally include an alpha channel, typically combined with [Material#transparent](Material.html#transparent) or [Material#alphaTest](Material.html#alphaTest). The texture map color is modulated by the diffuse `color`.

Default is `null`.

### .matcap : Texture

The matcap map.

Default is `null`.

### .normalMap : Texture

The texture to create a normal map. The RGB values affect the surface normal for each pixel fragment and change the way the color is lit. Normal maps do not change the actual shape of the surface, only the lighting. In case the material has a normal map authored using the left handed convention, the `y` component of `normalScale` should be negated to compensate for the different handedness.

Default is `null`.

### .normalMapType : TangentSpaceNormalMap | ObjectSpaceNormalMap

The type of normal map.

Default is `TangentSpaceNormalMap`.

### .normalScale : Vector2

How much the normal map affects the material. Typical value range is `[0,1]`.

Default is `(1,1)`.

### .wireframe : boolean

Renders the geometry as a wireframe.

Default is `false`.

### .wireframeLinewidth : number

Controls the thickness of the wireframe.

Can only be used with [SVGRenderer](SVGRenderer.html).

Default is `1`.

## Source

[src/materials/MeshMatcapMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/MeshMatcapMaterial.js)