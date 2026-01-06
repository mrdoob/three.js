*Inheritance: EventDispatcher → BufferGeometry → PolyhedronGeometry →*

# IcosahedronGeometry

A geometry class for representing an icosahedron.

## Code Example

```js
const geometry = new THREE.IcosahedronGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const icosahedron = new THREE.Mesh( geometry, material );
scene.add( icosahedron );
```

## Constructor

### new IcosahedronGeometry( radius : number, detail : number )

Constructs a new icosahedron geometry.

**radius**

Radius of the icosahedron.

Default is `1`.

**detail**

Setting this to a value greater than `0` adds vertices making it no longer a icosahedron.

Default is `0`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

**Overrides:** [PolyhedronGeometry#parameters](PolyhedronGeometry.html#parameters)

## Static Methods

### .fromJSON( data : Object ) : IcosahedronGeometry

Factory method for creating an instance of this class from the given JSON object.

**data**

A JSON object representing the serialized geometry.

**Returns:** A new instance.

## Source

[src/geometries/IcosahedronGeometry.js](https://github.com/mrdoob/three.js/blob/master/src/geometries/IcosahedronGeometry.js)