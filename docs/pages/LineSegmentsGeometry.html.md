*Inheritance: InstancedBufferGeometry →*

# LineSegmentsGeometry

A series of vertex pairs, forming line segments.

This is used in [LineSegments2](LineSegments2.html) to describe the shape.

## Import

LineSegmentsGeometry is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
```

## Constructor

### new LineSegmentsGeometry()

Constructs a new line segments geometry.

## Properties

### .isLineSegmentsGeometry : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .applyMatrix4( matrix : Matrix4 ) : LineSegmentsGeometry

Applies the given 4x4 transformation matrix to the geometry.

**matrix**

The matrix to apply.

**Returns:** A reference to this instance.

### .fromEdgesGeometry( geometry : EdgesGeometry ) : LineSegmentsGeometry

Setups this line segments geometry from the given edges geometry.

**geometry**

The geometry that should be used as a data source for this geometry.

**Returns:** A reference to this geometry.

### .fromLineSegments( lineSegments : LineSegments ) : LineSegmentsGeometry

Setups this line segments geometry from the given line segments.

**lineSegments**

The line segments that should be used as a data source for this geometry. Assumes the source geometry is not using indices.

**Returns:** A reference to this geometry.

### .fromMesh( mesh : Mesh ) : LineSegmentsGeometry

Setups this line segments geometry from the given mesh.

**mesh**

The mesh geometry that should be used as a data source for this geometry.

**Returns:** A reference to this geometry.

### .fromWireframeGeometry( geometry : WireframeGeometry ) : LineSegmentsGeometry

Setups this line segments geometry from the given wireframe geometry.

**geometry**

The geometry that should be used as a data source for this geometry.

**Returns:** A reference to this geometry.

### .setColors( array : Float32Array | Array.<number> ) : LineSegmentsGeometry

Sets the given line colors for this geometry. The length must be a multiple of six since each line segment is defined by a start end color in the pattern `(rgb rgb)`.

**array**

The position data to set.

**Returns:** A reference to this geometry.

### .setPositions( array : Float32Array | Array.<number> ) : LineSegmentsGeometry

Sets the given line positions for this geometry. The length must be a multiple of six since each line segment is defined by a start end vertex in the pattern `(xyz xyz)`.

**array**

The position data to set.

**Returns:** A reference to this geometry.

## Source

[examples/jsm/lines/LineSegmentsGeometry.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lines/LineSegmentsGeometry.js)