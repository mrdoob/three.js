*Inheritance: EventDispatcher → BufferGeometry →*

# TorusKnotGeometry

Creates a torus knot, the particular shape of which is defined by a pair of coprime integers, p and q. If p and q are not coprime, the result will be a torus link.

## Code Example

```js
const geometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 );
const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const torusKnot = new THREE.Mesh( geometry, material );
scene.add( torusKnot );
```

## Constructor

### new TorusKnotGeometry( radius : number, tube : number, tubularSegments : number, radialSegments : number, p : number, q : number )

Constructs a new torus knot geometry.

**radius**

Radius of the torus knot.

Default is `1`.

**tube**

Radius of the tube.

Default is `0.4`.

**tubularSegments**

The number of tubular segments.

Default is `64`.

**radialSegments**

The number of radial segments.

Default is `8`.

**p**

This value determines, how many times the geometry winds around its axis of rotational symmetry.

Default is `2`.

**q**

This value determines, how many times the geometry winds around a circle in the interior of the torus.

Default is `3`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

## Static Methods

### .fromJSON( data : Object ) : TorusKnotGeometry

Factory method for creating an instance of this class from the given JSON object.

**data**

A JSON object representing the serialized geometry.

**Returns:** A new instance.

## Source

[src/geometries/TorusKnotGeometry.js](https://github.com/mrdoob/three.js/blob/master/src/geometries/TorusKnotGeometry.js)