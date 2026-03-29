*Inheritance: EventDispatcher → BufferGeometry → BoxGeometry →*

# RoundedBoxGeometry

A special type of box geometry with rounded corners and edges.

## Code Example

```js
const geometry = new THREE.RoundedBoxGeometry();
const material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
```

## Import

RoundedBoxGeometry is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
```

## Constructor

### new RoundedBoxGeometry( width : number, height : number, depth : number, segments : number, radius : number )

Constructs a new rounded box geometry.

**width**

The width. That is, the length of the edges parallel to the X axis.

Default is `1`.

**height**

The height. That is, the length of the edges parallel to the Y axis.

Default is `1`.

**depth**

The depth. That is, the length of the edges parallel to the Z axis.

Default is `1`.

**segments**

Number of segments that form the rounded corners.

Default is `2`.

**radius**

The radius of the rounded corners.

Default is `0.1`.

## Properties

### .parameters : Object

Holds the constructor parameters that have been used to generate the geometry. Any modification after instantiation does not change the geometry.

**Overrides:** [BoxGeometry#parameters](BoxGeometry.html#parameters)

## Static Methods

### .fromJSON( data : Object ) : RoundedBoxGeometry

Factory method for creating an instance of this class from the given JSON object.

**data**

A JSON object representing the serialized geometry.

**Returns:** A new instance.

## Source

[examples/jsm/geometries/RoundedBoxGeometry.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/geometries/RoundedBoxGeometry.js)