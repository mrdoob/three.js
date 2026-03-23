# MD2Character

This class represents a management component for animated MD2 character assets.

## Import

MD2Character is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { MD2Character } from 'three/addons/misc/MD2Character.js';
```

## Constructor

### new MD2Character()

Constructs a new MD2 character.

## Properties

### .activeAnimationClipName : string

The name of the active animation clip.

Default is `null`.

### .animationFPS : number

The FPS

Default is `6`.

### .meshBody : Mesh

The body mesh.

Default is `null`.

### .meshWeapon : Mesh

The weapon mesh.

Default is `null`.

### .mixer : AnimationMixer

The animation mixer.

Default is `null`.

### .root : Object3D

The root 3D object

### .scale : number

The mesh scale.

Default is `1`.

### .skinsBody : Array.<Texture>

The body skins.

### .skinsWeapon : Array.<Texture>

The weapon skins.

### .weapons : Array.<Mesh>

The weapon meshes.

## Methods

### .loadParts( config : Object )

Loads the character model for the given config.

**config**

The config which defines the model and textures paths.

### .onLoadComplete()

The `onLoad` callback function.

### .setAnimation( clipName : string )

Sets the defined animation clip as the active animation.

**clipName**

The name of the animation clip.

### .setPlaybackRate( rate : number )

Sets the animation playback rate.

**rate**

The playback rate to set.

### .setSkin( index : number )

Sets the skin defined by the given skin index. This will result in a different texture for the body mesh.

**index**

The skin index.

### .setWeapon( index : number )

Sets the weapon defined by the given weapon index. This will result in a different weapon hold by the character.

**index**

The weapon index.

### .setWireframe( wireframeEnabled : boolean )

Sets the wireframe material flag.

**wireframeEnabled**

Whether to enable wireframe rendering or not.

### .syncWeaponAnimation()

Synchronizes the weapon with the body animation.

### .update( delta : number )

Updates the animations of the mesh. Must be called inside the animation loop.

**delta**

The delta time in seconds.

## Source

[examples/jsm/misc/MD2Character.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/misc/MD2Character.js)