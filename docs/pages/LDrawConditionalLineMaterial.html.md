*Inheritance: EventDispatcher → Material → ShaderMaterial →*

# LDrawConditionalLineMaterial

A special line material for meshes loaded via [LDrawLoader](LDrawLoader.html).

This module can only be used with [WebGLRenderer](WebGLRenderer.html). When using [WebGPURenderer](WebGPURenderer.html), import the class from `LDrawConditionalLineNodeMaterial.js`.

## Import

LDrawConditionalLineMaterial is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { LDrawConditionalLineMaterial } from 'three/addons/materials/LDrawConditionalLineMaterial.js';
```

## Constructor

### new LDrawConditionalLineMaterial( parameters : Object )

Constructs a new conditional line material.

**parameters**

An object with one or more properties defining the material's appearance. Any property of the material (including any property from inherited materials) can be passed in here. Color values can be passed any type of value accepted by [Color#set](Color.html#set).

## Properties

### .color : Color

The material's color.

Default is `(1,1,1)`.

### .isLDrawConditionalLineMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .opacity : number

The material's opacity.

Default is `1`.

**Overrides:** [ShaderMaterial#opacity](ShaderMaterial.html#opacity)

## Source

[examples/jsm/materials/LDrawConditionalLineMaterial.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/materials/LDrawConditionalLineMaterial.js)