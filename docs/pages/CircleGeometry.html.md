*Inheritance: EventDispatcher → BufferGeometry →*

# CircleGeometry

A simple shape of Euclidean geometry. It is constructed from a number of triangular segments that are oriented around a central point and extend as far out as a given radius. It is built counter-clockwise from a start angle and a given central angle. It can also be used to create regular polygons, where the number of segments determines the number of sides.

## Code Example

```js
const geometry = new THREE.CircleGeometry( 5, 32 );
const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const circle = new THREE.Mesh( geometry, material );
scene.add( circle )
```

## Constructor

### new CircleGeometry( radius : number, segments : number, thetaStart : number, thetaLength : number )

Constructs a new circle geometry.

**radius**

Radius of the circle.

Default is `1`.

**segments**

Number of segments (triangles), minimum = `3`.

Default is `32`.

**thetaStart**

Start angle for first segment in radians.

Default is `0`.

**thetaLength**

The central angle, often called theta, of the circular sector in radians. The default value results in a complete circle.

Default is `Math.PI*2`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

## Static Methods

### .fromJSON( data : Object ) : CircleGeometry

Factory method for creating an instance of this class from the given JSON object.

**data**

A JSON object representing the serialized geometry.

**Returns:** A new instance.

## Source

[src/geometries/CircleGeometry.js](https://github.com/mrdoob/three.js/blob/master/src/geometries/CircleGeometry.js)