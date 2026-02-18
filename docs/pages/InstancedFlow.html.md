*Inheritance: Flow →*

# InstancedFlow

An instanced version of [Flow](Flow.html) for making meshes bend around curves, where the instances are placed on the curve.

This module can only be used with [WebGLRenderer](WebGLRenderer.html).

## Import

InstancedFlow is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { InstancedFlow } from 'three/addons/modifiers/CurveModifier.js';
```

## Constructor

### new InstancedFlow( count : number, curveCount : number, geometry : Geometry, material : Material )

Constructs a new InstancedFlow instance.

**count**

The number of instanced elements.

**curveCount**

The number of curves to preallocate for.

**geometry**

The geometry to use for the instanced mesh.

**material**

The material to use for the instanced mesh.

## Classes

[InstancedFlow](InstancedFlow.html)

## Methods

### .moveIndividualAlongCurve( index : number, offset : number )

Move an individual element along the curve by a specific amount.

**index**

Which element to update.

**offset**

The offset.

### .setCurve( index : number, curveNo : number )

Select which curve to use for an element.

**index**

The index of the instanced element to update.

**curveNo**

The index of the curve it should use.

### .writeChanges( index : number )

The extra information about which curve and curve position is stored in the translation components of the matrix for the instanced objects This writes that information to the matrix and marks it as needing update.

**index**

The index of tge instanced element to update.

## Source

[examples/jsm/modifiers/CurveModifier.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/modifiers/CurveModifier.js)