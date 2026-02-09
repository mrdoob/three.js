*Inheritance: EventDispatcher → BufferGeometry →*

# TorusGeometry

A geometry class for representing an torus.

## Code Example

```js
const geometry = new THREE.TorusGeometry( 10, 3, 16, 100 );
const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const torus = new THREE.Mesh( geometry, material );
scene.add( torus );
```

## Constructor

### new TorusGeometry( radius : number, tube : number, radialSegments : number, tubularSegments : number, arc : number )

Constructs a new torus geometry.

**radius**

Radius of the torus, from the center of the torus to the center of the tube.

Default is `1`.

**tube**

Radius of the tube. Must be smaller than `radius`.

Default is `0.4`.

**radialSegments**

The number of radial segments.

Default is `12`.

**tubularSegments**

The number of tubular segments.

Default is `48`.

**arc**

Central angle in radians.

Default is `Math.PI*2`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

## Static Methods

### .fromJSON( data : Object ) : TorusGeometry

Factory method for creating an instance of this class from the given JSON object.

**data**

A JSON object representing the serialized geometry.

**Returns:** A new instance.

## Source

[src/geometries/TorusGeometry.js](https://github.com/mrdoob/three.js/blob/master/src/geometries/TorusGeometry.js)