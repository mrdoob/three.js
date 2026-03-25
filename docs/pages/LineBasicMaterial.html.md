*Inheritance: EventDispatcher → Material →*

# LineBasicMaterial

A material for rendering line primitives.

Materials define the appearance of renderable 3D objects.

## Code Example

```js
const material = new THREE.LineBasicMaterial( { color: 0xffffff } );
```

## Constructor

### new LineBasicMaterial( parameters : Object )

Constructs a new line basic material.

**parameters**

An object with one or more properties defining the material's appearance. Any property of the material (including any property from inherited materials) can be passed in here. Color values can be passed any type of value accepted by [Color#set](Color.html#set).

## Properties

### .color : Color

Color of the material.

Default is `(1,1,1)`.

### .fog : boolean

Whether the material is affected by fog or not.

Default is `true`.

### .isLineBasicMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .linecap : 'butt' | 'round' | 'square'

Defines appearance of line ends.

Can only be used with [SVGRenderer](SVGRenderer.html).

Default is `'round'`.

### .linejoin : 'round' | 'bevel' | 'miter'

Defines appearance of line joints.

Can only be used with [SVGRenderer](SVGRenderer.html).

Default is `'round'`.

### .linewidth : number

Controls line thickness or lines.

Can only be used with [SVGRenderer](SVGRenderer.html). WebGL and WebGPU ignore this setting and always render line primitives with a width of one pixel.

Default is `1`.

### .map : Texture

Sets the color of the lines using data from a texture. The texture map color is modulated by the diffuse `color`.

Default is `null`.

## Source

[src/materials/LineBasicMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/LineBasicMaterial.js)