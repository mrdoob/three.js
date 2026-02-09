# CSS3DRenderer

This renderer can be used to apply hierarchical 3D transformations to DOM elements via the CSS3 [transform](https://www.w3schools.com/cssref/css3_pr_transform.asp) property. `CSS3DRenderer` is particularly interesting if you want to apply 3D effects to a website without canvas based rendering. It can also be used in order to combine DOM elements with WebGLcontent.

There are, however, some important limitations:

*   It's not possible to use the material system of _three.js_.
*   It's also not possible to use geometries.
*   The renderer only supports 100% browser and display zoom.

So `CSS3DRenderer` is just focused on ordinary DOM elements. These elements are wrapped into special 3D objects ([CSS3DObject](CSS3DObject.html) or [CSS3DSprite](CSS3DSprite.html)) and then added to the scene graph.

## Import

CSS3DRenderer is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
```

## Constructor

### new CSS3DRenderer( parameters : CSS3DRenderer~Parameters )

Constructs a new CSS3D renderer.

**parameters**

The parameters.

## Properties

### .domElement : HTMLElement

The DOM where the renderer appends its child-elements.

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

Constructor parameters of `CSS3DRenderer`.

**element**  
HTMLElement

A DOM element where the renderer appends its child-elements. If not passed in here, a new div element will be created.

## Source

[examples/jsm/renderers/CSS3DRenderer.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/renderers/CSS3DRenderer.js)