*Inheritance: EventDispatcher → Object3D → Mesh →*

# HTMLMesh

This class can be used to render a DOM element onto a canvas and use it as a texture for a plane mesh.

A typical use case for this class is to render the GUI of `lil-gui` as a texture so it is compatible for VR.

## Code Example

```js
const gui = new GUI( { width: 300 } ); // create lil-gui instance
const mesh = new HTMLMesh( gui.domElement );
scene.add( mesh );
```

## Import

HTMLMesh is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { HTMLMesh } from 'three/addons/interactive/HTMLMesh.js';
```

## Constructor

### new HTMLMesh( dom : HTMLElement )

Constructs a new HTML mesh.

**dom**

The DOM element to display as a plane mesh.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance and removes all event listeners. Call this method whenever this instance is no longer used in your app.

## Source

[examples/jsm/interactive/HTMLMesh.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/interactive/HTMLMesh.js)