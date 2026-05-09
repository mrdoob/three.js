*Inheritance: EventDispatcher → Object3D →*

# SVGObject

Can be used to wrap SVG elements into a 3D object.

## Import

SVGObject is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { SVGObject } from 'three/addons/renderers/SVGRenderer.js';
```

## Constructor

### new SVGObject( node : SVGElement )

Constructs a new SVG object.

**node**

The SVG element.

## Properties

### .isSVGObject : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .node : SVGElement

This SVG element.

## Source

[examples/jsm/renderers/SVGRenderer.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/renderers/SVGRenderer.js)