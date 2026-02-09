*Inheritance: EventDispatcher → Object3D → Line → LineSegments →*

# SkeletonHelper

A helper object to assist with visualizing a [Skeleton](Skeleton.html).

## Code Example

```js
const helper = new THREE.SkeletonHelper( skinnedMesh );
scene.add( helper );
```

## Constructor

### new SkeletonHelper( object : Object3D )

Constructs a new skeleton helper.

**object**

Usually an instance of [SkinnedMesh](SkinnedMesh.html). However, any 3D object can be used if it represents a hierarchy of bones (see [Bone](Bone.html)).

## Properties

### .bones : Array.<Bone>

The list of bones that the helper visualizes.

### .isSkeletonHelper : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .root : Object3D

The object being visualized.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .setColors( color1 : Color, color2 : Color ) : SkeletonHelper

Defines the colors of the helper.

**color1**

The first line color for each bone.

**color2**

The second line color for each bone.

**Returns:** A reference to this helper.

## Source

[src/helpers/SkeletonHelper.js](https://github.com/mrdoob/three.js/blob/master/src/helpers/SkeletonHelper.js)