# WebGL

A utility module with basic WebGL 2 capability testing.

## Import

WebGL is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import WebGL from 'three/addons/capabilities/WebGL.js';
```

## Static Methods

### .getWebGL2ErrorMessage() : HTMLDivElement

Returns a `div` element representing a formatted error message that can be appended in web sites if WebGL 2 isn't supported.

**Returns:** A `div` element representing a formatted error message that WebGL 2 isn't supported.

### .isColorSpaceAvailable( colorSpace : string ) : boolean

Returns `true` if the given color space is available. This method can only be used if WebGL 2 is supported.

**colorSpace**

The color space to test.

**Returns:** Whether the given color space is available or not.

### .isWebGL2Available() : boolean

Returns `true` if WebGL 2 is available.

**Returns:** Whether WebGL 2 is available or not.

## Source

[examples/jsm/capabilities/WebGL.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/capabilities/WebGL.js)