*Inheritance: EventDispatcher → Object3D →*

# Group

This is almost identical to an [Object3D](Object3D.html). Its purpose is to make working with groups of objects syntactically clearer.

## Code Example

```js
// Create a group and add the two cubes.
// These cubes can now be rotated / scaled etc as a group.
const group = new THREE.Group();
group.add( meshA );
group.add( meshB );
scene.add( group );
```

## Constructor

### new Group()

## Properties

### .isGroup : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Source

[src/objects/Group.js](https://github.com/mrdoob/three.js/blob/master/src/objects/Group.js)