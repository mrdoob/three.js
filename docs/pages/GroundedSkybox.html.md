*Inheritance: EventDispatcher → Object3D → Mesh →*

# GroundedSkybox

A ground-projected skybox.

By default the object is centered at the camera, so it is often helpful to set `skybox.position.y = height` to put the ground at the origin.

## Code Example

```js
const height = 15, radius = 100;
const skybox = new GroundedSkybox( envMap, height, radius );
skybox.position.y = height;
scene.add( skybox );
```

## Import

GroundedSkybox is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js';
```

## Constructor

### new GroundedSkybox( map : Texture, height : number, radius : number, resolution : number )

Constructs a new ground-projected skybox.

**map**

The environment map to use.

**height**

The height is how far the camera that took the photo was above the ground. A larger value will magnify the downward part of the image.

**radius**

The radius of the skybox. Must be large enough to ensure the scene's camera stays inside.

**resolution**

The geometry resolution of the skybox.

Default is `128`.

## Source

[examples/jsm/objects/GroundedSkybox.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/objects/GroundedSkybox.js)