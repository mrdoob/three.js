# UVsDebug

## Import

UVsDebug is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { UVsDebug } from 'three/addons/utils/UVsDebug.js';
```

## Methods

### .UVsDebug( geometry : BufferGeometry, size : number ) : HTMLCanvasElement (inner)

Function for "unwrapping" and debugging three.js geometries UV mapping.

```js
document.body.appendChild( UVsDebug( new THREE.SphereGeometry() ) );
```

**geometry**

The geometry whose uv coordinates should be inspected.

**size**

The size of the debug canvas.

Default is `1024`.

**Returns:** A canvas element with visualized uv coordinates.

## Source

[examples/jsm/utils/UVsDebug.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/utils/UVsDebug.js)