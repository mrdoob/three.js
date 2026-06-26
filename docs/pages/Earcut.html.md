# Earcut

An implementation of the earcut polygon triangulation algorithm. The code is a port of [mapbox/earcut](https://github.com/mapbox/earcut).

## Constructor

### new Earcut()

See:

*   [https://github.com/mapbox/earcut](https://github.com/mapbox/earcut)

## Static Methods

### .triangulate( data : Array.<number>, holeIndices : Array.<number>, dim : number ) : Array.<number>

Triangulates the given shape definition by returning an array of triangles.

**data**

An array with 2D points.

**holeIndices**

An array with indices defining holes.

**dim**

The number of coordinates per vertex in the input array.

Default is `2`.

**Returns:** An array representing the triangulated faces. Each face is defined by three consecutive numbers representing vertex indices.

## Source

[src/extras/Earcut.js](https://github.com/mrdoob/three.js/blob/master/src/extras/Earcut.js)