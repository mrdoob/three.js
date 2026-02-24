*Inheritance: EventDispatcher → Object3D → Line → LineSegments →*

# GridHelper

The helper is an object to define grids. Grids are two-dimensional arrays of lines.

## Code Example

```js
const size = 10;
const divisions = 10;
const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );
```

## Constructor

### new GridHelper( size : number, divisions : number, color1 : number | Color | string, color2 : number | Color | string )

Constructs a new grid helper.

**size**

The size of the grid.

Default is `10`.

**divisions**

The number of divisions across the grid.

Default is `10`.

**color1**

The color of the center line.

Default is `0x444444`.

**color2**

The color of the lines of the grid.

Default is `0x888888`.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

## Source

[src/helpers/GridHelper.js](https://github.com/mrdoob/three.js/blob/master/src/helpers/GridHelper.js)