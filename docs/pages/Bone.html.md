*Inheritance: EventDispatcher → Object3D →*

# Bone

A bone which is part of a [Skeleton](Skeleton.html). The skeleton in turn is used by the [SkinnedMesh](SkinnedMesh.html).

## Code Example

```js
const root = new THREE.Bone();
const child = new THREE.Bone();
root.add( child );
child.position.y = 5;
```

## Constructor

### new Bone()

Constructs a new bone.

## Properties

### .isBone : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Source

[src/objects/Bone.js](https://github.com/mrdoob/three.js/blob/master/src/objects/Bone.js)