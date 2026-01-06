*Inheritance: EventDispatcher → BufferGeometry → CylinderGeometry →*

# ConeGeometry

A geometry class for representing a cone.

## Code Example

```js
const geometry = new THREE.ConeGeometry( 5, 20, 32 );
const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const cone = new THREE.Mesh(geometry, material );
scene.add( cone );
```

## Constructor

### new ConeGeometry( radius : number, height : number, radialSegments : number, heightSegments : number, openEnded : boolean, thetaStart : number, thetaLength : number )

Constructs a new cone geometry.

**radius**

Radius of the cone base.

Default is `1`.

**height**

Height of the cone.

Default is `1`.

**radialSegments**

Number of segmented faces around the circumference of the cone.

Default is `32`.

**heightSegments**

Number of rows of faces along the height of the cone.

Default is `1`.

**openEnded**

Whether the base of the cone is open or capped.

Default is `false`.

**thetaStart**

Start angle for first segment, in radians.

Default is `0`.

**thetaLength**

The central angle, often called theta, of the circular sector, in radians. The default value results in a complete cone.

Default is `Math.PI*2`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

**Overrides:** [CylinderGeometry#parameters](CylinderGeometry.html#parameters)

## Static Methods

### .fromJSON( data : Object ) : ConeGeometry

Factory method for creating an instance of this class from the given JSON object.

**data**

A JSON object representing the serialized geometry.

**Returns:** A new instance.

## Source

[src/geometries/ConeGeometry.js](https://github.com/mrdoob/three.js/blob/master/src/geometries/ConeGeometry.js)