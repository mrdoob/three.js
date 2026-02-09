*Inheritance: EventDispatcher → BufferGeometry →*

# CylinderGeometry

A geometry class for representing a cylinder.

## Code Example

```js
const geometry = new THREE.CylinderGeometry( 5, 5, 20, 32 );
const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const cylinder = new THREE.Mesh( geometry, material );
scene.add( cylinder );
```

## Constructor

### new CylinderGeometry( radiusTop : number, radiusBottom : number, height : number, radialSegments : number, heightSegments : number, openEnded : boolean, thetaStart : number, thetaLength : number )

Constructs a new cylinder geometry.

**radiusTop**

Radius of the cylinder at the top.

Default is `1`.

**radiusBottom**

Radius of the cylinder at the bottom.

Default is `1`.

**height**

Height of the cylinder.

Default is `1`.

**radialSegments**

Number of segmented faces around the circumference of the cylinder.

Default is `32`.

**heightSegments**

Number of rows of faces along the height of the cylinder.

Default is `1`.

**openEnded**

Whether the base of the cylinder is open or capped.

Default is `false`.

**thetaStart**

Start angle for first segment, in radians.

Default is `0`.

**thetaLength**

The central angle, often called theta, of the circular sector, in radians. The default value results in a complete cylinder.

Default is `Math.PI*2`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

## Static Methods

### .fromJSON( data : Object ) : CylinderGeometry

Factory method for creating an instance of this class from the given JSON object.

**data**

A JSON object representing the serialized geometry.

**Returns:** A new instance.

## Source

[src/geometries/CylinderGeometry.js](https://github.com/mrdoob/three.js/blob/master/src/geometries/CylinderGeometry.js)