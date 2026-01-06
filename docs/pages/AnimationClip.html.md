# AnimationClip

A reusable set of keyframe tracks which represent an animation.

## Constructor

### new AnimationClip( name : string, duration : number, tracks : Array.<KeyframeTrack>, blendMode : NormalAnimationBlendMode | AdditiveAnimationBlendMode )

Constructs a new animation clip.

Note: Instead of instantiating an AnimationClip directly with the constructor, you can use the static interface of this class for creating clips. In most cases though, animation clips will automatically be created by loaders when importing animated 3D assets.

**name**

The clip's name.

Default is `''`.

**duration**

The clip's duration in seconds. If a negative value is passed, the duration will be calculated from the passed keyframes.

Default is `-1`.

**tracks**

An array of keyframe tracks.

**blendMode**

Defines how the animation is blended/combined when two or more animations are simultaneously played.

Default is `NormalAnimationBlendMode`.

## Properties

### .blendMode : NormalAnimationBlendMode | AdditiveAnimationBlendMode

Defines how the animation is blended/combined when two or more animations are simultaneously played.

### .duration : number

The clip's duration in seconds.

### .name : string

The clip's name.

### .tracks : Array.<KeyframeTrack>

An array of keyframe tracks.

### .userData : Object

An object that can be used to store custom data about the animation clip. It should not hold references to functions as these will not be cloned.

### .uuid : string (readonly)

The UUID of the animation clip.

## Methods

### .clone() : AnimationClip

Returns a new animation clip with copied values from this instance.

**Returns:** A clone of this instance.

### .optimize() : AnimationClip

Optimizes each track by removing equivalent sequential keys (which are common in morph target sequences).

**Returns:** A reference to this animation clip.

### .resetDuration() : AnimationClip

Sets the duration of this clip to the duration of its longest keyframe track.

**Returns:** A reference to this animation clip.

### .toJSON() : Object

Serializes this animation clip into JSON.

**Returns:** The JSON object.

### .trim() : AnimationClip

Trims all tracks to the clip's duration.

**Returns:** A reference to this animation clip.

### .validate() : boolean

Performs minimal validation on each track in the clip. Returns `true` if all tracks are valid.

**Returns:** Whether the clip's keyframes are valid or not.

## Static Methods

### .CreateClipsFromMorphTargetSequences( morphTargets : Array.<Object>, fps : number, noLoop : boolean ) : Array.<AnimationClip>

Returns an array of new AnimationClips created from the morph target sequences of a geometry, trying to sort morph target names into animation-group-based patterns like "Walk\_001, Walk\_002, Run\_001, Run\_002...".

See [MD2Loader#parse](MD2Loader.html#parse) as an example for how the method should be used.

**morphTargets**

A sequence of morph targets.

**fps**

The Frames-Per-Second value.

**noLoop**

Whether the clip should be no loop or not.

**Returns:** An array of new animation clips.

### .CreateFromMorphTargetSequence( name : string, morphTargetSequence : Array.<Object>, fps : number, noLoop : boolean ) : AnimationClip

Returns a new animation clip from the passed morph targets array of a geometry, taking a name and the number of frames per second.

Note: The fps parameter is required, but the animation speed can be overridden via [AnimationAction#setDuration](AnimationAction.html#setDuration).

**name**

The name of the animation clip.

**morphTargetSequence**

A sequence of morph targets.

**fps**

The Frames-Per-Second value.

**noLoop**

Whether the clip should be no loop or not.

**Returns:** The new animation clip.

### .findByName( objectOrClipArray : Array.<AnimationClip> | Object3D, name : string ) : AnimationClip

Searches for an animation clip by name, taking as its first parameter either an array of clips, or a mesh or geometry that contains an array named "animations" property.

**objectOrClipArray**

The array or object to search through.

**name**

The name to search for.

**Returns:** The found animation clip. Returns `null` if no clip has been found.

### .parse( json : Object ) : AnimationClip

Factory method for creating an animation clip from the given JSON.

**json**

The serialized animation clip.

**Returns:** The new animation clip.

### .parseAnimation( animation : Object, bones : Array.<Bones> ) : AnimationClip

Parses the `animation.hierarchy` format and returns a new animation clip.

**animation**

A serialized animation clip as JSON.

**bones**

An array of bones.

**Deprecated:** since r175.

**Returns:** The new animation clip.

### .toJSON( clip : AnimationClip ) : Object

Serializes the given animation clip into JSON.

**clip**

The animation clip to serialize.

**Returns:** The JSON object.

## Source

[src/animation/AnimationClip.js](https://github.com/mrdoob/three.js/blob/master/src/animation/AnimationClip.js)