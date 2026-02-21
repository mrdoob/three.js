*Inheritance: KeyframeTrack →*

# QuaternionKeyframeTrack

A track for Quaternion keyframe values.

## Constructor

### new QuaternionKeyframeTrack( name : string, times : Array.<number>, values : Array.<number>, interpolation : InterpolateLinear | InterpolateDiscrete | InterpolateSmooth )

Constructs a new Quaternion keyframe track.

**name**

The keyframe track's name.

**times**

A list of keyframe times.

**values**

A list of keyframe values.

**interpolation**

The interpolation type.

## Properties

### .ValueTypeName : string

The value type name.

Default is `'quaternion'`.

**Overrides:** [KeyframeTrack#ValueTypeName](KeyframeTrack.html#ValueTypeName)

## Methods

### .InterpolantFactoryMethodLinear( result : TypedArray ) : QuaternionLinearInterpolant

Overwritten so the method returns Quaternion based interpolant.

**result**

The result buffer.

**Overrides:** [KeyframeTrack#InterpolantFactoryMethodLinear](KeyframeTrack.html#InterpolantFactoryMethodLinear)

**Returns:** The new interpolant.

## Source

[src/animation/tracks/QuaternionKeyframeTrack.js](https://github.com/mrdoob/three.js/blob/master/src/animation/tracks/QuaternionKeyframeTrack.js)