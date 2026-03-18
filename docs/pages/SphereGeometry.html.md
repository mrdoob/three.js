*Inheritance: EventDispatcher → BufferGeometry →*

# SphereGeometry

A class for generating a sphere geometry.

## Code Example

```js
const geometry = new THREE.SphereGeometry( 15, 32, 16 );
const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );
```

## Constructor

### new SphereGeometry( radius : number, widthSegments : number, heightSegments : number, phiStart : number, phiLength : number, thetaStart : number, thetaLength : number )

Constructs a new sphere geometry.

**radius**

The sphere radius.

Default is `1`.

**widthSegments**

The number of horizontal segments. Minimum value is `3`.

Default is `32`.

**heightSegments**

The number of vertical segments. Minimum value is `2`.

Default is `16`.

**phiStart**

The horizontal starting angle in radians.

Default is `0`.

**phiLength**

The horizontal sweep angle size.

Default is `Math.PI*2`.

**thetaStart**

The vertical starting angle in radians.

Default is `0`.

**thetaLength**

The vertical sweep angle size.

Default is `Math.PI`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

## Static Methods

### .fromJSON( data : Object ) : SphereGeometry

Factory method for creating an instance of this class from the given JSON object.

**data**

A JSON object representing the serialized geometry.

**Returns:** A new instance.

## Source

[src/geometries/SphereGeometry.js](https://github.com/mrdoob/three.js/blob/master/src/geometries/SphereGeometry.js)