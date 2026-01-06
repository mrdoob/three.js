*Inheritance: EventDispatcher → Object3D →*

# ViewHelper

A special type of helper that visualizes the camera's transformation in a small viewport area as an axes helper. Such a helper is often wanted in 3D modeling tools or scene editors like the [three.js editor](https://threejs.org/editor).

The helper allows to click on the X, Y and Z axes which animates the camera so it looks along the selected axis.

## Import

ViewHelper is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ViewHelper } from 'three/addons/helpers/ViewHelper.js';
```

## Constructor

### new ViewHelper( camera : Camera, domElement : HTMLElement )

Constructs a new view helper.

**camera**

The camera whose transformation should be visualized.

**domElement**

The DOM element that is used to render the view.

## Properties

### .animating : boolean (readonly)

Whether the helper is currently animating or not.

Default is `false`.

### .center : Vector3

The helper's center point.

### .isViewHelper : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .handleClick( event : PointerEvent ) : boolean

This method should be called when a click or pointer event has happened in the app.

**event**

The event to process.

**Returns:** Whether an intersection with the helper has been detected or not.

### .render( renderer : WebGLRenderer | WebGPURenderer )

Renders the helper in a separate view in the bottom-right corner of the viewport.

**renderer**

The renderer.

### .setLabelStyle( font : string, color : string, radius : number )

Sets the label style. Has no effect when the axes are unlabeled.

**font**

The label font.

Default is `'24px Arial'`.

**color**

The label color.

Default is `'#000000'`.

**radius**

The label radius.

Default is `14`.

### .setLabels( labelX : string | undefined, labelY : string | undefined, labelZ : string | undefined )

Sets labels for each axis. By default, they are unlabeled.

**labelX**

The label for the x-axis.

**labelY**

The label for the y-axis.

**labelZ**

The label for the z-axis.

### .update( delta : number )

Updates the helper. This method should be called in the app's animation loop.

**delta**

The delta time in seconds.

## Source

[examples/jsm/helpers/ViewHelper.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/helpers/ViewHelper.js)