# AnimationMixer

`AnimationMixer` is a player for animations on a particular object in the scene. When multiple objects in the scene are animated independently, one `AnimationMixer` may be used for each object.

## Constructor

### new AnimationMixer( root : Object3D )

Constructs a new animation mixer.

**root**

The object whose animations shall be played by this mixer.

## Properties

### .time : number

The global mixer time (in seconds; starting with `0` on the mixer's creation).

Default is `0`.

### .timeScale : number

A scaling factor for the global time.

Note: Setting this member to `0` and later back to `1` is a possibility to pause/unpause all actions that are controlled by this mixer.

Default is `1`.

## Methods

### .clipAction( clip : AnimationClip | string, optionalRoot : Object3D, blendMode : NormalAnimationBlendMode | AdditiveAnimationBlendMode ) : AnimationAction

Returns an instance of [AnimationAction](AnimationAction.html) for the passed clip.

If an action fitting the clip and root parameters doesn't yet exist, it will be created by this method. Calling this method several times with the same clip and root parameters always returns the same action.

**clip**

An animation clip or alternatively the name of the animation clip.

**optionalRoot**

An alternative root object.

**blendMode**

The blend mode.

**Returns:** The animation action.

### .existingAction( clip : AnimationClip | string, optionalRoot : Object3D ) : AnimationAction

Returns an existing animation action for the passed clip.

**clip**

An animation clip or alternatively the name of the animation clip.

**optionalRoot**

An alternative root object.

**Returns:** The animation action. Returns `null` if no action was found.

### .getRoot() : Object3D

Returns this mixer's root object.

**Returns:** The mixer's root object.

### .setTime( time : number ) : AnimationMixer

Sets the global mixer to a specific time and updates the animation accordingly.

This is useful when you need to jump to an exact time in an animation. The input parameter will be scaled by [AnimationMixer#timeScale](AnimationMixer.html#timeScale)

**time**

The time to set in seconds.

**Returns:** A reference to this animation mixer.

### .stopAllAction() : AnimationMixer

Deactivates all previously scheduled actions on this mixer.

**Returns:** A reference to this animation mixer.

### .uncacheAction( clip : AnimationClip | string, optionalRoot : Object3D )

Deallocates all memory resources for an action. The action is identified by the given clip and an optional root object. Before using this method make sure to call [AnimationAction#stop](AnimationAction.html#stop) to deactivate the action.

**clip**

An animation clip or alternatively the name of the animation clip.

**optionalRoot**

An alternative root object.

### .uncacheClip( clip : AnimationClip )

Deallocates all memory resources for a clip. Before using this method make sure to call [AnimationAction#stop](AnimationAction.html#stop) for all related actions.

**clip**

The clip to uncache.

### .uncacheRoot( root : Object3D )

Deallocates all memory resources for a root object. Before using this method make sure to call [AnimationAction#stop](AnimationAction.html#stop) for all related actions or alternatively [AnimationMixer#stopAllAction](AnimationMixer.html#stopAllAction) when the mixer operates on a single root.

**root**

The root object to uncache.

### .update( deltaTime : number ) : AnimationMixer

Advances the global mixer time and updates the animation.

This is usually done in the render loop by passing the delta time from [Clock](Clock.html) or [Timer](Timer.html).

**deltaTime**

The delta time in seconds.

**Returns:** A reference to this animation mixer.

## Source

[src/animation/AnimationMixer.js](https://github.com/mrdoob/three.js/blob/master/src/animation/AnimationMixer.js)