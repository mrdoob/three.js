# VRButton

A utility class for creating a button that allows to initiate immersive VR sessions based on WebXR. The button can be created with a factory method and then appended ot the website's DOM.

## Code Example

```js
document.body.appendChild( VRButton.createButton( renderer ) );
```

## Import

VRButton is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { VRButton } from 'three/addons/webxr/VRButton.js';
```

## Properties

### .xrSessionIsGranted : boolean

Whether a XR session has been granted or not.

Default is `false`.

## Static Methods

### .createButton( renderer : WebGLRenderer | WebGPURenderer, sessionInit : XRSessionInit ) : HTMLElement

Constructs a new VR button.

**renderer**

The renderer.

**sessionInit**

The a configuration object for the AR session.

**Returns:** The button or an error message if `immersive-ar` isn't supported.

### .registerSessionGrantedListener()

Registers a `sessiongranted` event listener. When a session is granted, the VRButton#xrSessionIsGranted flag will evaluate to `true`. This method is automatically called by the module itself so there should be no need to use it on app level.

## Source

[examples/jsm/webxr/VRButton.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/webxr/VRButton.js)