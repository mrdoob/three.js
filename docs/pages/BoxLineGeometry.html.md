*Inheritance: EventDispatcher → BufferGeometry →*

# BoxLineGeometry

A special type of box geometry intended for [LineSegments](LineSegments.html).

## Code Example

```js
const geometry = new THREE.BoxLineGeometry();
const material = new THREE.LineBasicMaterial( { color: 0x00ff00 } );
const lines = new THREE.LineSegments( geometry, material );
scene.add( lines );
```

## Import

BoxLineGeometry is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { BoxLineGeometry } from 'three/addons/geometries/BoxLineGeometry.js';
```

## Constructor

### new BoxLineGeometry( width : number, height : number, depth : number, widthSegments : number, heightSegments : number, depthSegments : number )

Constructs a new box line geometry.

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

Number of segmented rectangular sections along the width of the sides.

Default is `1`.

**heightSegments**

Number of segmented rectangular sections along the height of the sides.

Default is `1`.

**depthSegments**

Number of segmented rectangular sections along the depth of the sides.

Default is `1`.

## Source

[examples/jsm/geometries/BoxLineGeometry.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/geometries/BoxLineGeometry.js)