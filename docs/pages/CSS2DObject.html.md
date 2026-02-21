*Inheritance: EventDispatcher → Object3D →*

# CSS2DObject

The only type of 3D object that is supported by [CSS2DRenderer](CSS2DRenderer.html).

## Import

CSS2DObject is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
```

## Constructor

### new CSS2DObject( element : HTMLElement )

Constructs a new CSS2D object.

**element**

The DOM element.

## Properties

### .center : Vector2

The 3D objects center point. `( 0, 0 )` is the lower left, `( 1, 1 )` is the top right.

Default is `(0.5,0.5)`.

### .element : HTMLElement (readonly)

The DOM element which defines the appearance of this 3D object.

Default is `true`.

### .isCSS2DObject : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Source

[examples/jsm/renderers/CSS2DRenderer.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/renderers/CSS2DRenderer.js)