*Inheritance: EventDispatcher → BufferGeometry → PolyhedronGeometry →*

# DodecahedronGeometry

A geometry class for representing a dodecahedron.

## Code Example

```js
const geometry = new THREE.DodecahedronGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const dodecahedron = new THREE.Mesh( geometry, material );
scene.add( dodecahedron );
```

## Constructor

### new DodecahedronGeometry( radius : number, detail : number )

Constructs a new dodecahedron geometry.

**radius**

Radius of the dodecahedron.

Default is `1`.

**detail**

Setting this to a value greater than `0` adds vertices making it no longer a dodecahedron.

Default is `0`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

**Overrides:** [PolyhedronGeometry#parameters](PolyhedronGeometry.html#parameters)

## Static Methods

### .fromJSON( data : Object ) : DodecahedronGeometry

Factory method for creating an instance of this class from the given JSON object.

**data**

A JSON object representing the serialized geometry.

**Returns:** A new instance.

## Source

[src/geometries/DodecahedronGeometry.js](https://github.com/mrdoob/three.js/blob/master/src/geometries/DodecahedronGeometry.js)