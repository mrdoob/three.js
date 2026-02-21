*Inheritance: EventDispatcher → BufferGeometry →*

# TubeGeometry

Creates a tube that extrudes along a 3D curve.

## Code Example

```js
class CustomSinCurve extends THREE.Curve {
	getPoint( t, optionalTarget = new THREE.Vector3() ) {
		const tx = t * 3 - 1.5;
		const ty = Math.sin( 2 * Math.PI * t );
		const tz = 0;
		return optionalTarget.set( tx, ty, tz );
	}
}
const path = new CustomSinCurve( 10 );
const geometry = new THREE.TubeGeometry( path, 20, 2, 8, false );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );
```

## Constructor

### new TubeGeometry( path : Curve, tubularSegments : number, radius : number, radialSegments : number, closed : boolean )

Constructs a new tube geometry.

**path**

A 3D curve defining the path of the tube.

Default is `QuadraticBezierCurve3`.

**tubularSegments**

The number of segments that make up the tube.

Default is `64`.

**radius**

The radius of the tube.

Default is `1`.

**radialSegments**

The number of segments that make up the cross-section.

Default is `8`.

**closed**

Whether the tube is closed or not.

Default is `false`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

## Static Methods

### .fromJSON( data : Object ) : TubeGeometry

Factory method for creating an instance of this class from the given JSON object.

**data**

A JSON object representing the serialized geometry.

**Returns:** A new instance.

## Source

[src/geometries/TubeGeometry.js](https://github.com/mrdoob/three.js/blob/master/src/geometries/TubeGeometry.js)