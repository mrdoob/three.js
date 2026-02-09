# ARButton

A utility class for creating a button that allows to initiate immersive AR sessions based on WebXR. The button can be created with a factory method and then appended ot the website's DOM.

## Code Example

```js
document.body.appendChild( ARButton.createButton( renderer ) );
```

## Import

ARButton is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ARButton } from 'three/addons/webxr/ARButton.js';
```

## Static Methods

### .createButton( renderer : WebGLRenderer | WebGPURenderer, sessionInit : XRSessionInit ) : HTMLElement

Constructs a new AR button.

**renderer**

The renderer.

**sessionInit**

The a configuration object for the AR session.

**Returns:** The button or an error message if `immersive-ar` isn't supported.

## Source

[examples/jsm/webxr/ARButton.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/webxr/ARButton.js)