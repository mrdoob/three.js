*Inheritance: EventDispatcher → BufferGeometry →*

# ConvexGeometry

This class can be used to generate a convex hull for a given array of 3D points. The average time complexity for this task is considered to be O(nlog(n)).

## Code Example

```js
const geometry = new ConvexGeometry( points );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );
```

## Import

ConvexGeometry is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
```

## Constructor

### new ConvexGeometry( points : Array.<Vector3> )

Constructs a new convex geometry.

**points**

An array of points in 3D space which should be enclosed by the convex hull.

## Source

[examples/jsm/geometries/ConvexGeometry.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/geometries/ConvexGeometry.js)