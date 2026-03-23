# XRButton

A utility class for creating a button that allows to initiate immersive XR sessions based on WebXR. The button can be created with a factory method and then appended ot the website's DOM.

Compared to [ARButton](ARButton.html) and [VRButton](VRButton.html), this class will try to offer an immersive AR session first. If the device does not support this type of session, it uses an immersive VR session.

## Code Example

```js
document.body.appendChild( XRButton.createButton( renderer ) );
```

## Import

XRButton is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { XRButton } from 'three/addons/webxr/XRButton.js';
```

## Static Methods

### .createButton( renderer : WebGLRenderer | WebGPURenderer, sessionInit : XRSessionInit ) : HTMLElement

Constructs a new XR button.

**renderer**

The renderer.

**sessionInit**

The a configuration object for the AR session.

**Returns:** The button or an error message if WebXR isn't supported.

## Source

[examples/jsm/webxr/XRButton.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/webxr/XRButton.js)