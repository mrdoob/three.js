# GroundedSkybox

## Import

GroundedSkybox is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { getGroundProjectedNormal } from 'three/addons/tsl/utils/GroundedSkybox.js';
```

## Static Methods

### .getGroundProjectedNormal( radiusNode : Node.<float>, heightNode : Node.<float> ) : Node.<vec3>

Projects the world position onto a sphere whose bottom is clipped by a ground disk, then returns a vector usable for sampling an environment cube map.

**radiusNode**

The radius of the projection sphere. Must be large enough to ensure the scene's camera stays inside.

**heightNode**

The height is how far the camera that took the photo was above the ground. A larger value will magnify the downward part of the image.

**Returns:** A direction vector for sampling the environment cube map.

## Source

[examples/jsm/tsl/utils/GroundedSkybox.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/utils/GroundedSkybox.js)