*Inheritance: EventDispatcher → Object3D → Line → LineSegments →*

# AxesHelper

An axis object to visualize the 3 axes in a simple way. The X axis is red. The Y axis is green. The Z axis is blue.

## Code Example

```js
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );
```

## Constructor

### new AxesHelper( size : number )

Constructs a new axes helper.

**size**

Size of the lines representing the axes.

Default is `1`.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .setColors( xAxisColor : number | Color | string, yAxisColor : number | Color | string, zAxisColor : number | Color | string ) : AxesHelper

Defines the colors of the axes helper.

**xAxisColor**

The color for the x axis.

**yAxisColor**

The color for the y axis.

**zAxisColor**

The color for the z axis.

**Returns:** A reference to this axes helper.

## Source

[src/helpers/AxesHelper.js](https://github.com/mrdoob/three.js/blob/master/src/helpers/AxesHelper.js)