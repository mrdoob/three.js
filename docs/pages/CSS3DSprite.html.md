*Inheritance: EventDispatcher → Object3D → CSS3DObject →*

# CSS3DSprite

A specialized version of [CSS3DObject](CSS3DObject.html) that represents DOM elements as sprites.

## Import

CSS3DSprite is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { CSS3DSprite } from 'three/addons/renderers/CSS3DRenderer.js';
```

## Constructor

### new CSS3DSprite( element : HTMLElement )

Constructs a new CSS3D sprite object.

**element**

The DOM element.

## Properties

### .isCSS3DSprite : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .rotation2D : number

The sprite's rotation in radians.

Default is `0`.

## Source

[examples/jsm/renderers/CSS3DRenderer.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/renderers/CSS3DRenderer.js)