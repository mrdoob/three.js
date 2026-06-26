*Inheritance: EventDispatcher → BufferGeometry →*

# PolyhedronGeometry

A polyhedron is a solid in three dimensions with flat faces. This class will take an array of vertices, project them onto a sphere, and then divide them up to the desired level of detail.

## Constructor

### new PolyhedronGeometry( vertices : Array.<number>, indices : Array.<number>, radius : number, detail : number )

Constructs a new polyhedron geometry.

**vertices**

A flat array of vertices describing the base shape.

**indices**

A flat array of indices describing the base shape.

**radius**

The radius of the shape.

Default is `1`.

**detail**

How many levels to subdivide the geometry. The more detail, the smoother the shape.

Default is `0`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

## Static Methods

### .fromJSON( data : Object ) : PolyhedronGeometry

Factory method for creating an instance of this class from the given JSON object.

**data**

A JSON object representing the serialized geometry.

**Returns:** A new instance.

## Source

[src/geometries/PolyhedronGeometry.js](https://github.com/mrdoob/three.js/blob/master/src/geometries/PolyhedronGeometry.js)