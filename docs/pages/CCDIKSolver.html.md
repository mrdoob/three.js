# CCDIKSolver

This class solves the Inverse Kinematics Problem with a [CCD Algorithm](https://web.archive.org/web/20221206080850/https://sites.google.com/site/auraliusproject/ccd-algorithm).

`CCDIKSolver` is designed to work with instances of [SkinnedMesh](SkinnedMesh.html).

## Import

CCDIKSolver is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { CCDIKSolver } from 'three/addons/animation/CCDIKSolver.js';
```

## Constructor

### new CCDIKSolver( mesh : SkinnedMesh, iks : Array.<CCDIKSolver~IK> )

**mesh**

The skinned mesh.

**iks**

The IK objects.

Default is `[]`.

## Properties

### .iks : Array.<CCDIKSolver~IK>

The IK objects.

### .mesh : SkinnedMesh

The skinned mesh.

## Methods

### .createHelper( sphereSize : number ) : CCDIKHelper

Creates a helper for visualizing the CCDIK.

**sphereSize**

The sphere size.

**Returns:** The created helper.

### .update( globalBlendFactor : number ) : CCDIKSolver

Updates all IK bones by solving the CCD algorithm.

**globalBlendFactor**

Blend factor applied if an IK chain doesn't have its own .blendFactor.

Default is `1.0`.

**Returns:** A reference to this instance.

### .updateOne( ik : CCDIKSolver~IK, overrideBlend : number ) : CCDIKSolver

Updates one IK bone solving the CCD algorithm.

**ik**

The IK to update.

**overrideBlend**

If the IK object does not define `blendFactor`, this value is used.

Default is `1.0`.

**Returns:** A reference to this instance.

## Type Definitions

### .BoneLink

This type represents bone links.

**index**  
number

The index of a linked bone which refers to a bone in the `Skeleton.bones` array.

**limitation**  
number

Rotation axis.

**rotationMin**  
number

Rotation minimum limit.

**rotationMax**  
number

Rotation maximum limit.

**enabled**  
boolean

Whether the link is enabled or not.

Default is `true`.

### .IK

This type represents IK configuration objects.

**target**  
number

The target bone index which refers to a bone in the `Skeleton.bones` array.

**effector**  
number

The effector bone index which refers to a bone in the `Skeleton.bones` array.

**links**  
Array.<[CCDIKSolver~BoneLink](CCDIKSolver.html#~BoneLink)\>

An array of bone links.

**iteration**  
number

Iteration number of calculation. Smaller is faster but less precise.

Default is `1`.

**minAngle**  
number

Minimum rotation angle in a step in radians.

**maxAngle**  
number

Minimum rotation angle in a step in radians.

**blendFactor**  
number

The blend factor.

## Source

[examples/jsm/animation/CCDIKSolver.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/animation/CCDIKSolver.js)