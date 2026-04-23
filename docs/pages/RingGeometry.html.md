*Inheritance: EventDispatcher → BufferGeometry →*

# RingGeometry

A class for generating a two-dimensional ring geometry.

## Code Example

```js
const geometry = new THREE.RingGeometry( 1, 5, 32 );
const material = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );
```

## Constructor

### new RingGeometry( innerRadius : number, outerRadius : number, thetaSegments : number, phiSegments : number, thetaStart : number, thetaLength : number )

Constructs a new ring geometry.

**innerRadius**

The inner radius of the ring.

Default is `0.5`.

**outerRadius**

The outer radius of the ring.

Default is `1`.

**thetaSegments**

Number of segments. A higher number means the ring will be more round. Minimum is `3`.

Default is `32`.

**phiSegments**

Number of segments per ring segment. Minimum is `1`.

Default is `1`.

**thetaStart**

Starting angle in radians.

Default is `0`.

**thetaLength**

Central angle in radians.

Default is `Math.PI*2`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

## Static Methods

### .fromJSON( data : Object ) : RingGeometry

Factory method for creating an instance of this class from the given JSON object.

**data**

A JSON object representing the serialized geometry.

**Returns:** A new instance.

## Source

[src/geometries/RingGeometry.js](https://github.com/mrdoob/three.js/blob/master/src/geometries/RingGeometry.js)