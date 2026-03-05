*Inheritance: EventDispatcher → BufferGeometry →*

# BoxGeometry

A geometry class for a rectangular cuboid with a given width, height, and depth. On creation, the cuboid is centred on the origin, with each edge parallel to one of the axes.

## Code Example

```js
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
```

## Constructor

### new BoxGeometry( width : number, height : number, depth : number, widthSegments : number, heightSegments : number, depthSegments : number )

Constructs a new box geometry.

**width**

The width. That is, the length of the edges parallel to the X axis.

Default is `1`.

**height**

The height. That is, the length of the edges parallel to the Y axis.

Default is `1`.

**depth**

The depth. That is, the length of the edges parallel to the Z axis.

Default is `1`.

**widthSegments**

Number of segmented rectangular faces along the width of the sides.

Default is `1`.

**heightSegments**

Number of segmented rectangular faces along the height of the sides.

Default is `1`.

**depthSegments**

Number of segmented rectangular faces along the depth of the sides.

Default is `1`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

## Static Methods

### .fromJSON( data : Object ) : BoxGeometry

Factory method for creating an instance of this class from the given JSON object.

**data**

A JSON object representing the serialized geometry.

**Returns:** A new instance.

## Source

[src/geometries/BoxGeometry.js](https://github.com/mrdoob/three.js/blob/master/src/geometries/BoxGeometry.js)