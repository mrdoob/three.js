*Inheritance: EventDispatcher → BufferGeometry →*

# DecalGeometry

This class can be used to create a decal mesh that serves different kinds of purposes e.g. adding unique details to models, performing dynamic visual environmental changes or covering seams.

Please not that decal projections can be distorted when used around corners. More information at this GitHub issue: [Decal projections without distortions](https://github.com/mrdoob/three.js/issues/21187).

Reference: [How to project decals](http://blog.wolfire.com/2009/06/how-to-project-decals/)

## Code Example

```js
const geometry = new DecalGeometry( mesh, position, orientation, size );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );
```

## Import

DecalGeometry is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
```

## Constructor

### new DecalGeometry( mesh : Mesh, position : Vector3, orientation : Euler, size : Vector3 )

Constructs a new decal geometry.

**mesh**

The base mesh the decal should be projected on.

**position**

The position of the decal projector.

**orientation**

The orientation of the decal projector.

**size**

The scale of the decal projector.

## Source

[examples/jsm/geometries/DecalGeometry.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/geometries/DecalGeometry.js)