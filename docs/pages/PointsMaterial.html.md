*Inheritance: EventDispatcher → Material →*

# PointsMaterial

A material for rendering point primitives.

Materials define the appearance of renderable 3D objects.

## Code Example

```js
const vertices = [];
for ( let i = 0; i < 10000; i ++ ) {
	const x = THREE.MathUtils.randFloatSpread( 2000 );
	const y = THREE.MathUtils.randFloatSpread( 2000 );
	const z = THREE.MathUtils.randFloatSpread( 2000 );
	vertices.push( x, y, z );
}
const geometry = new THREE.BufferGeometry();
geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
const material = new THREE.PointsMaterial( { color: 0x888888 } );
const points = new THREE.Points( geometry, material );
scene.add( points );
```

## Constructor

### new PointsMaterial( parameters : Object )

Constructs a new points material.

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

### .isPointsMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .map : Texture

The color map. May optionally include an alpha channel, typically combined with [Material#transparent](Material.html#transparent) or [Material#alphaTest](Material.html#alphaTest). The texture map color is modulated by the diffuse `color`.

Default is `null`.

### .size : number

Defines the size of the points in pixels.

Might be capped if the value exceeds hardware dependent parameters like [gl.ALIASED\_POINT\_SIZE\_RANGE](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParamete).

Default is `1`.

### .sizeAttenuation : boolean

Specifies whether size of individual points is attenuated by the camera depth (perspective camera only).

Default is `true`.

## Source

[src/materials/PointsMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/PointsMaterial.js)