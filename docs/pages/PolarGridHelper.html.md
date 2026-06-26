*Inheritance: EventDispatcher → Object3D → Line → LineSegments →*

# PolarGridHelper

This helper is an object to define polar grids. Grids are two-dimensional arrays of lines.

## Code Example

```js
const radius = 10;
const sectors = 16;
const rings = 8;
const divisions = 64;
const helper = new THREE.PolarGridHelper( radius, sectors, rings, divisions );
scene.add( helper );
```

## Constructor

### new PolarGridHelper( radius : number, sectors : number, rings : number, divisions : number, color1 : number | Color | string, color2 : number | Color | string )

Constructs a new polar grid helper.

**radius**

The radius of the polar grid. This can be any positive number.

Default is `10`.

**sectors**

The number of sectors the grid will be divided into. This can be any positive integer.

Default is `16`.

**rings**

The number of rings. This can be any positive integer.

Default is `16`.

**divisions**

The number of line segments used for each circle. This can be any positive integer.

Default is `64`.

**color1**

The first color used for grid elements.

Default is `0x444444`.

**color2**

The second color used for grid elements.

Default is `0x888888`.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

## Source

[src/helpers/PolarGridHelper.js](https://github.com/mrdoob/three.js/blob/master/src/helpers/PolarGridHelper.js)