*Inheritance: EventDispatcher → Object3D →*

# CSS3DObject

The base 3D object that is supported by [CSS3DRenderer](CSS3DRenderer.html).

## Import

CSS3DObject is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
```

## Constructor

### new CSS3DObject( element : HTMLElement )

Constructs a new CSS3D object.

**element**

The DOM element.

## Properties

### .element : HTMLElement (readonly)

The DOM element which defines the appearance of this 3D object.

Default is `true`.

### .isCSS3DObject : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Source

[examples/jsm/renderers/CSS3DRenderer.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/renderers/CSS3DRenderer.js)