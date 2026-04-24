*Inheritance: EventDispatcher → BufferGeometry →*

# ExtrudeGeometry

Creates extruded geometry from a path shape.

## Code Example

```js
const length = 12, width = 8;
const shape = new THREE.Shape();
shape.moveTo( 0,0 );
shape.lineTo( 0, width );
shape.lineTo( length, width );
shape.lineTo( length, 0 );
shape.lineTo( 0, 0 );
const geometry = new THREE.ExtrudeGeometry( shape );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const mesh = new THREE.Mesh( geometry, material ) ;
scene.add( mesh );
```

## Constructor

### new ExtrudeGeometry( shapes : Shape | Array.<Shape>, options : ExtrudeGeometry~Options )

Constructs a new extrude geometry.

**shapes**

A shape or an array of shapes.

**options**

The extrude settings.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

## Static Methods

### .fromJSON( data : Object, shapes : Array.<Shape> ) : ExtrudeGeometry

Factory method for creating an instance of this class from the given JSON object.

**data**

A JSON object representing the serialized geometry.

**shapes**

An array of shapes.

**Returns:** A new instance.

## Type Definitions

### .Options

Represents the `options` type of the geometry's constructor.

**curveSegments**  
number

Number of points on the curves.

Default is `12`.

**steps**  
number

Number of points used for subdividing segments along the depth of the extruded spline.

Default is `1`.

**depth**  
number

Depth to extrude the shape.

Default is `1`.

**bevelEnabled**  
boolean

Whether to beveling to the shape or not.

Default is `true`.

**bevelThickness**  
number

How deep into the original shape the bevel goes.

Default is `0.2`.

**bevelSize**  
number

Distance from the shape outline that the bevel extends.

Default is `bevelThickness-0.1`.

**bevelOffset**  
number

Distance from the shape outline that the bevel starts.

Default is `0`.

**bevelSegments**  
number

Number of bevel layers.

Default is `3`.

**extrudePath**  
[Curve](Curve.html)

A 3D spline path along which the shape should be extruded. Bevels not supported for path extrusion.

Default is `null`.

**UVGenerator**  
Object

An object that provides UV generator functions for custom UV generation.

## Source

[src/geometries/ExtrudeGeometry.js](https://github.com/mrdoob/three.js/blob/master/src/geometries/ExtrudeGeometry.js)