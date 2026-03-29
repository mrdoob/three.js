# VolumeSlice

This class has been made to hold a slice of a volume data.

## Import

VolumeSlice is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { VolumeSlice } from 'three/addons/misc/VolumeSlice.js';
```

## Constructor

### new VolumeSlice( volume : Volume, index : number, axis : 'x' | 'y' | 'z' )

Constructs a new volume slice.

**volume**

The associated volume.

**index**

The index of the slice.

Default is `0`.

**axis**

For now only 'x', 'y' or 'z' but later it will change to a normal vector.

Default is `'z'`.

See:

*   [Volume](Volume.html)

## Properties

### .axis : 'x' | 'y' | 'z'

The normal axis.

### .canvas : HTMLCanvasElement

The final canvas used for the texture.

### .canvasBuffer : HTMLCanvasElement

The intermediary canvas used to paint the data.

### .ctx : CanvasRenderingContext2D

The rendering context of the canvas.

### .ctxBuffer : CanvasRenderingContext2D

The rendering context of the canvas buffer,

### .geometryNeedsUpdate : boolean

If set to `true`, `updateGeometry()` will be triggered at the next repaint.

Default is `true`.

### .iLength : number

Width of slice in the original coordinate system, corresponds to the width of the buffer canvas.

Default is `0`.

### .index : number

The index of the slice, if changed, will automatically call updateGeometry at the next repaint.

Default is `0`.

### .jLength : number

Height of slice in the original coordinate system, corresponds to the height of the buffer canvas.

Default is `0`.

### .mesh : Mesh

The mesh ready to get used in the scene.

### .sliceAccess : function

Function that allow the slice to access right data.

See:

*   [Volume#extractPerpendicularPlane](Volume.html#extractPerpendicularPlane)

### .volume : Volume

The associated volume.

## Methods

### .repaint()

Refresh the texture and the geometry if geometryNeedsUpdate is set to `true`.

### .updateGeometry()

Refresh the geometry according to axis and index.

See:

*   [Volume#extractPerpendicularPlane](Volume.html#extractPerpendicularPlane)

## Source

[examples/jsm/misc/VolumeSlice.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/misc/VolumeSlice.js)