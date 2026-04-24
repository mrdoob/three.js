# CSS2DRenderer

This renderer is a simplified version of [CSS3DRenderer](CSS3DRenderer.html). The only transformation that is supported is translation.

The renderer is very useful if you want to combine HTML based labels with 3D objects. Here too, the respective DOM elements are wrapped into an instance of [CSS2DObject](CSS2DObject.html) and added to the scene graph. All other types of renderable 3D objects (like meshes or point clouds) are ignored.

`CSS2DRenderer` only supports 100% browser and display zoom.

## Import

CSS2DRenderer is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
```

## Constructor

### new CSS2DRenderer( parameters : CSS2DRenderer~Parameters )

Constructs a new CSS2D renderer.

**parameters**

The parameters.

## Properties

### .domElement : HTMLElement

The DOM where the renderer appends its child-elements.

### .sortObjects : boolean

Controls whether the renderer assigns `z-index` values to CSS2DObject DOM elements. If set to `true`, z-index values are assigned first based on the `renderOrder` and secondly - the distance to the camera. If set to `false`, no z-index values are assigned.

Default is `true`.

## Methods

### .getSize() : Object

Returns an object containing the width and height of the renderer.

**Returns:** The size of the renderer.

### .render( scene : Object3D, camera : Camera )

Renders the given scene using the given camera.

**scene**

A scene or any other type of 3D object.

**camera**

The camera.

### .setSize( width : number, height : number )

Resizes the renderer to the given width and height.

**width**

The width of the renderer.

**height**

The height of the renderer.

## Type Definitions

### .Parameters

Constructor parameters of `CSS2DRenderer`.

**element**  
HTMLElement

A DOM element where the renderer appends its child-elements. If not passed in here, a new div element will be created.

## Source

[examples/jsm/renderers/CSS2DRenderer.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/renderers/CSS2DRenderer.js)