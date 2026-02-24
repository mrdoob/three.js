*Inheritance: EventDispatcher → BufferGeometry →*

# LatheGeometry

Creates meshes with axial symmetry like vases. The lathe rotates around the Y axis.

## Code Example

```js
const points = [];
for ( let i = 0; i < 10; i ++ ) {
	points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 10 + 5, ( i - 5 ) * 2 ) );
}
const geometry = new THREE.LatheGeometry( points );
const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const lathe = new THREE.Mesh( geometry, material );
scene.add( lathe );
```

## Constructor

### new LatheGeometry( points : Array.<(Vector2|Vector3)>, segments : number, phiStart : number, phiLength : number )

Constructs a new lathe geometry.

**points**

An array of points in 2D space. The x-coordinate of each point must be greater than zero.

**segments**

The number of circumference segments to generate.

Default is `12`.

**phiStart**

The starting angle in radians.

Default is `0`.

**phiLength**

The radian (0 to 2PI) range of the lathed section 2PI is a closed lathe, less than 2PI is a portion.

Default is `Math.PI*2`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

## Static Methods

### .fromJSON( data : Object ) : LatheGeometry

Factory method for creating an instance of this class from the given JSON object.

**data**

A JSON object representing the serialized geometry.

**Returns:** A new instance.

## Source

[src/geometries/LatheGeometry.js](https://github.com/mrdoob/three.js/blob/master/src/geometries/LatheGeometry.js)