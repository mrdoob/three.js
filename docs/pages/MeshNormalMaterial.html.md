*Inheritance: EventDispatcher → Material →*

# MeshNormalMaterial

A material that maps the normal vectors to RGB colors.

## Constructor

### new MeshNormalMaterial( parameters : Object )

Constructs a new mesh normal material.

**parameters**

An object with one or more properties defining the material's appearance. Any property of the material (including any property from inherited materials) can be passed in here. Color values can be passed any type of value accepted by [Color#set](Color.html#set).

## Properties

### .bumpMap : Texture

The texture to create a bump map. The black and white values map to the perceived depth in relation to the lights. Bump doesn't actually affect the geometry of the object, only the lighting. If a normal map is defined this will be ignored.

Default is `null`.

### .bumpScale : number

How much the bump map affects the material. Typical range is `[0,1]`.

Default is `1`.

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

### .isMeshNormalMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

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

WebGL and WebGPU ignore this property and always render 1 pixel wide lines.

Default is `1`.

## Source

[src/materials/MeshNormalMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/MeshNormalMaterial.js)