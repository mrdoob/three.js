# Raymarching

## Import

Raymarching is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { RaymarchingBox } from 'three/addons/tsl/utils/Raymarching.js';
```

## Static Methods

### .RaymarchingBox( steps : number | Node, callback : function | FunctionNode )

TSL function for performing raymarching in a box-area using the specified number of steps and a callback function.

```js
RaymarchingBox( count, ( { positionRay } ) => {
} );
```

**steps**

The number of steps for raymarching.

**callback**

The callback function to execute at each step.

## Source

[examples/jsm/tsl/utils/Raymarching.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/utils/Raymarching.js)