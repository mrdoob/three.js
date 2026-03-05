*Inheritance: EventDispatcher → Object3D → Group →*

# CSMHelper

A helper for visualizing the cascades of a CSM instance.

## Import

CSMHelper is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { CSMHelper } from 'three/addons/csm/CSMHelper.js';
```

## Constructor

### new CSMHelper( csm : CSM | CSMShadowNode )

Constructs a new CSM helper.

**csm**

The CSM instance to visualize.

## Properties

### .csm : CSM | CSMShadowNode

The CSM instance to visualize.

### .displayFrustum : boolean

Whether to display the CSM frustum or not.

Default is `true`.

### .displayPlanes : boolean

Whether to display the cascade planes or not.

Default is `true`.

### .displayShadowBounds : boolean

Whether to display the shadow bounds or not.

Default is `true`.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .update()

Updates the helper. This method should be called in the app's animation loop.

### .updateVisibility()

This method must be called if one of the `display*` properties is changed at runtime.

## Source

[examples/jsm/csm/CSMHelper.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/csm/CSMHelper.js)