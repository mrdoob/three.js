# WebGPU

A utility module with basic WebGPU capability testing.

## Import

WebGPU is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import WebGPU from 'three/addons/capabilities/WebGPU.js';
```

## Static Methods

### .getErrorMessage() : HTMLDivElement

Returns a `div` element representing a formatted error message that can be appended in web sites if WebGPU isn't supported.

**Returns:** A `div` element representing a formatted error message that WebGPU isn't supported.

### .isAvailable() : boolean

Returns `true` if WebGPU is available.

**Returns:** Whether WebGPU is available or not.

## Source

[examples/jsm/capabilities/WebGPU.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/capabilities/WebGPU.js)