*Inheritance: EventDispatcher → BufferGeometry →*

# CapsuleGeometry

A geometry class for representing a capsule.

## Code Example

```js
const geometry = new THREE.CapsuleGeometry( 1, 1, 4, 8, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const capsule = new THREE.Mesh( geometry, material );
scene.add( capsule );
```

## Constructor

### new CapsuleGeometry( radius : number, height : number, capSegments : number, radialSegments : number, heightSegments : number )

Constructs a new capsule geometry.

**radius**

Radius of the capsule.

Default is `1`.

**height**

Height of the middle section.

Default is `1`.

**capSegments**

Number of curve segments used to build each cap.

Default is `4`.

**radialSegments**

Number of segmented faces around the circumference of the capsule. Must be an integer >= 3.

Default is `8`.

**heightSegments**

Number of rows of faces along the height of the middle section. Must be an integer >= 1.

Default is `1`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

## Static Methods

### .fromJSON( data : Object ) : CapsuleGeometry

Factory method for creating an instance of this class from the given JSON object.

**data**

A JSON object representing the serialized geometry.

**Returns:** A new instance.

## Source

[src/geometries/CapsuleGeometry.js](https://github.com/mrdoob/three.js/blob/master/src/geometries/CapsuleGeometry.js)