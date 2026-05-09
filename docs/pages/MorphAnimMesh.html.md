*Inheritance: EventDispatcher → Object3D → Mesh →*

# MorphAnimMesh

A special type of an animated mesh with a simple interface for animation playback. It allows to playback just one animation without any transitions or fading between animation changes.

## Import

MorphAnimMesh is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { MorphAnimMesh } from 'three/addons/misc/MorphAnimMesh.js';
```

## Constructor

### new MorphAnimMesh( geometry : BufferGeometry, material : Material | Array.<Material> )

Constructs a new morph anim mesh.

**geometry**

The mesh geometry.

**material**

The mesh material.

## Properties

### .activeAction : AnimationAction

The current active animation action.

Default is `null`.

### .mixer : AnimationMixer

The internal animation mixer.

## Methods

### .playAnimation( label : string, fps : number )

Plays the defined animation clip. The implementation assumes the animation clips are stored in [Object3D#animations](Object3D.html#animations) or the geometry.

**label**

The name of the animation clip.

**fps**

The FPS of the animation clip.

### .setDirectionBackward()

Sets the animation playback direction to "backward".

### .setDirectionForward()

Sets the animation playback direction to "forward".

### .updateAnimation( delta : number )

Updates the animations of the mesh. Must be called inside the animation loop.

**delta**

The delta time in seconds.

## Source

[examples/jsm/misc/MorphAnimMesh.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/misc/MorphAnimMesh.js)