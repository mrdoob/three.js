# SkeletonUtils

## Import

SkeletonUtils is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
```

## Methods

### .clone( source : Object3D ) : Object3D (inner)

Clones the given 3D object and its descendants, ensuring that any `SkinnedMesh` instances are correctly associated with their bones. Bones are also cloned, and must be descendants of the object passed to this method. Other data, like geometries and materials, are reused by reference.

**source**

The 3D object to clone.

**Returns:** The cloned 3D object.

### .retarget( target : Object3D, source : Object3D, options : module:SkeletonUtils~RetargetOptions ) (inner)

Retargets the skeleton from the given source 3D object to the target 3D object.

**target**

The target 3D object.

**source**

The source 3D object.

**options**

The options.

### .retargetClip( target : Object3D, source : Object3D, clip : AnimationClip, options : module:SkeletonUtils~RetargetOptions ) : AnimationClip (inner)

Retargets the animation clip of the source object to the target 3D object.

**target**

The target 3D object.

**source**

The source 3D object.

**clip**

The animation clip.

**options**

The options.

**Returns:** The retargeted animation clip.

## Type Definitions

### .RetargetOptions

Retarget options of `SkeletonUtils`.

**useFirstFramePosition**  
boolean

Whether to use the position of the first frame or not.

Default is `false`.

**fps**  
number

The FPS of the clip.

**names**  
Object.<string, string>

A dictionary for mapping target to source bone names.

**getBoneName**  
function

A function for mapping bone names. Alternative to `names`.

**trim**  
Array.<number>

Whether to trim the clip or not. If set the array should hold two values for the start and end.

**preserveBoneMatrix**  
boolean

Whether to preserve bone matrices or not.

Default is `true`.

**preserveBonePositions**  
boolean

Whether to preserve bone positions or not.

Default is `true`.

**useTargetMatrix**  
boolean

Whether to use the target matrix or not.

Default is `false`.

**hip**  
string

The name of the source's hip bone.

Default is `'hip'`.

**hipInfluence**  
[Vector3](Vector3.html)

The hip influence.

Default is `(1,1,1)`.

**scale**  
number

The scale.

Default is `1`.

## Source

[examples/jsm/utils/SkeletonUtils.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/utils/SkeletonUtils.js)