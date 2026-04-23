# AnimationClipCreator

A utility class with factory methods for creating basic animation clips.

## Import

AnimationClipCreator is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { AnimationClipCreator } from 'three/addons/animation/AnimationClipCreator.js';
```

## Static Methods

### .CreateMaterialColorAnimation( duration : number, colors : Array.<Color> ) : AnimationClip

Creates an animation clip that animates the `color` property of a 3D object's material.

**duration**

The duration of the animation.

**colors**

An array of colors that should be sequentially animated.

**Returns:** The created animation clip.

### .CreatePulsationAnimation( duration : number, pulseScale : number ) : AnimationClip

Creates an animation clip that scales a 3D object in a pulse pattern in the given period.

**duration**

The duration of the animation.

**pulseScale**

The scale of the pulse.

**Returns:** The created animation clip.

### .CreateRotationAnimation( period : number, axis : 'x' | 'y' | 'z' ) : AnimationClip

Creates an animation clip that rotates a 3D object 360 degrees in the given period of time around the given axis.

**period**

The duration of the animation.

**axis**

The axis of rotation.

Default is `'x'`.

**Returns:** The created animation clip.

### .CreateScaleAxisAnimation( period : number, axis : 'x' | 'y' | 'z' ) : AnimationClip

Creates an animation clip that scales a 3D object from `0` to `1` in the given period of time along the given axis.

**period**

The duration of the animation.

**axis**

The axis to scale the 3D object along.

Default is `'x'`.

**Returns:** The created animation clip.

### .CreateShakeAnimation( duration : number, shakeScale : Vector3 ) : AnimationClip

Creates an animation clip that translates a 3D object in a shake pattern in the given period.

**duration**

The duration of the animation.

**shakeScale**

The scale of the shake.

**Returns:** The created animation clip.

### .CreateVisibilityAnimation( duration : number ) : AnimationClip

Creates an animation clip that toggles the visibility of a 3D object.

**duration**

The duration of the animation.

**Returns:** The created animation clip.

## Source

[examples/jsm/animation/AnimationClipCreator.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/animation/AnimationClipCreator.js)