# KeyframeTrack

Represents s a timed sequence of keyframes, which are composed of lists of times and related values, and which are used to animate a specific property of an object.

## Constructor

### new KeyframeTrack( name : string, times : Array.<number>, values : Array.<(number|string|boolean)>, interpolation : InterpolateLinear | InterpolateDiscrete | InterpolateSmooth )

Constructs a new keyframe track.

**name**

The keyframe track's name.

**times**

A list of keyframe times.

**values**

A list of keyframe values.

**interpolation**

The interpolation type.

## Properties

### .DefaultInterpolation : InterpolateLinear | InterpolateDiscrete | InterpolateSmooth

The default interpolation type of this keyframe track.

Default is `InterpolateLinear`.

### .TimeBufferType : TypedArray | Array

The time buffer type of this keyframe track.

Default is `Float32Array.constructor`.

### .ValueBufferType : TypedArray | Array

The value buffer type of this keyframe track.

Default is `Float32Array.constructor`.

### .ValueTypeName : string

The value type name.

Default is `''`.

### .name : string

The track's name can refer to morph targets or bones or possibly other values within an animated object. See PropertyBinding#parseTrackName for the forms of strings that can be parsed for property binding.

### .times : Float32Array

The keyframe times.

### .values : Float32Array

The keyframe values.

## Methods

### .InterpolantFactoryMethodDiscrete( result : TypedArray ) : DiscreteInterpolant

Factory method for creating a new discrete interpolant.

**result**

The result buffer.

**Returns:** The new interpolant.

### .InterpolantFactoryMethodLinear( result : TypedArray ) : LinearInterpolant

Factory method for creating a new linear interpolant.

**result**

The result buffer.

**Returns:** The new interpolant.

### .InterpolantFactoryMethodSmooth( result : TypedArray ) : CubicInterpolant

Factory method for creating a new smooth interpolant.

**result**

The result buffer.

**Returns:** The new interpolant.

### .clone() : KeyframeTrack

Returns a new keyframe track with copied values from this instance.

**Returns:** A clone of this instance.

### .getInterpolation() : InterpolateLinear | InterpolateDiscrete | InterpolateSmooth

Returns the current interpolation type.

**Returns:** The interpolation type.

### .getValueSize() : number

Returns the value size.

**Returns:** The value size.

### .optimize() : AnimationClip

Optimizes this keyframe track by removing equivalent sequential keys (which are common in morph target sequences).

**Returns:** A reference to this animation clip.

### .scale( timeScale : number ) : KeyframeTrack

Scale all keyframe times by a factor (useful for frame - seconds conversions).

**timeScale**

The time scale.

**Returns:** A reference to this keyframe track.

### .setInterpolation( interpolation : InterpolateLinear | InterpolateDiscrete | InterpolateSmooth ) : KeyframeTrack

Defines the interpolation factor method for this keyframe track.

**interpolation**

The interpolation type.

**Returns:** A reference to this keyframe track.

### .shift( timeOffset : number ) : KeyframeTrack

Moves all keyframes either forward or backward in time.

**timeOffset**

The offset to move the time values.

**Returns:** A reference to this keyframe track.

### .trim( startTime : number, endTime : number ) : KeyframeTrack

Removes keyframes before and after animation without changing any values within the defined time range.

Note: The method does not shift around keys to the start of the track time, because for interpolated keys this will change their values

**startTime**

The start time.

**endTime**

The end time.

**Returns:** A reference to this keyframe track.

### .validate() : boolean

Performs minimal validation on the keyframe track. Returns `true` if the values are valid.

**Returns:** Whether the keyframes are valid or not.

## Static Methods

### .toJSON( track : KeyframeTrack ) : Object

Converts the keyframe track to JSON.

**track**

The keyframe track to serialize.

**Returns:** The serialized keyframe track as JSON.

## Source

[src/animation/KeyframeTrack.js](https://github.com/mrdoob/three.js/blob/master/src/animation/KeyframeTrack.js)