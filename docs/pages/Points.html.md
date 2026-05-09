*Inheritance: EventDispatcher → Object3D →*

# Points

A class for displaying points or point clouds.

## Constructor

### new Points( geometry : BufferGeometry, material : Material | Array.<Material> )

Constructs a new point cloud.

**geometry**

The points geometry.

**material**

The points material.

## Properties

### .geometry : BufferGeometry

The points geometry.

### .isPoints : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .material : Material | Array.<Material>

The line material.

Default is `PointsMaterial`.

### .morphTargetDictionary : Object.<string, number> | undefined

A dictionary representing the morph targets in the geometry. The key is the morph targets name, the value its attribute index. This member is `undefined` by default and only set when morph targets are detected in the geometry.

Default is `undefined`.

### .morphTargetInfluences : Array.<number> | undefined

An array of weights typically in the range `[0,1]` that specify how much of the morph is applied. This member is `undefined` by default and only set when morph targets are detected in the geometry.

Default is `undefined`.

## Methods

### .raycast( raycaster : Raycaster, intersects : Array.<Object> )

Computes intersection points between a casted ray and this point cloud.

**raycaster**

The raycaster.

**intersects**

The target array that holds the intersection points.

**Overrides:** [Object3D#raycast](Object3D.html#raycast)

### .updateMorphTargets()

Sets the values of [Points#morphTargetDictionary](Points.html#morphTargetDictionary) and [Points#morphTargetInfluences](Points.html#morphTargetInfluences) to make sure existing morph targets can influence this 3D object.

## Source

[src/objects/Points.js](https://github.com/mrdoob/three.js/blob/master/src/objects/Points.js)