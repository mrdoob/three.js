*Inheritance: EventDispatcher → Material →*

# SpriteMaterial

A material for rendering instances of [Sprite](Sprite.html).

## Code Example

```js
const map = new THREE.TextureLoader().load( 'textures/sprite.png' );
const material = new THREE.SpriteMaterial( { map: map, color: 0xffffff } );
const sprite = new THREE.Sprite( material );
sprite.scale.set(200, 200, 1)
scene.add( sprite );
```

## Constructor

### new SpriteMaterial( parameters : Object )

Constructs a new sprite material.

**parameters**

An object with one or more properties defining the material's appearance. Any property of the material (including any property from inherited materials) can be passed in here. Color values can be passed any type of value accepted by [Color#set](Color.html#set).

## Properties

### .alphaMap : Texture

The alpha map is a grayscale texture that controls the opacity across the surface (black: fully transparent; white: fully opaque).

Only the color of the texture is used, ignoring the alpha channel if one exists. For RGB and RGBA textures, the renderer will use the green channel when sampling this texture due to the extra bit of precision provided for green in DXT-compressed and uncompressed RGB 565 formats. Luminance-only and luminance/alpha textures will also still work as expected.

Default is `null`.

### .color : Color

Color of the material.

Default is `(1,1,1)`.

### .fog : boolean

Whether the material is affected by fog or not.

Default is `true`.

### .isSpriteMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .map : Texture

The color map. May optionally include an alpha channel, typically combined with [Material#transparent](Material.html#transparent) or [Material#alphaTest](Material.html#alphaTest). The texture map color is modulated by the diffuse `color`.

Default is `null`.

### .rotation : number

The rotation of the sprite in radians.

Default is `0`.

### .sizeAttenuation : boolean

Specifies whether size of the sprite is attenuated by the camera depth (perspective camera only).

Default is `true`.

### .transparent : boolean

Overwritten since sprite materials are transparent by default.

Default is `true`.

**Overrides:** [Material#transparent](Material.html#transparent)

## Source

[src/materials/SpriteMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/SpriteMaterial.js)