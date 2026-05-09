*Inheritance: KeyframeTrack →*

# BooleanKeyframeTrack

A track for boolean keyframe values.

## Constructor

### new BooleanKeyframeTrack( name : string, times : Array.<number>, values : Array.<boolean> )

Constructs a new boolean keyframe track.

This keyframe track type has no `interpolation` parameter because the interpolation is always discrete.

**name**

The keyframe track's name.

**times**

A list of keyframe times.

**values**

A list of keyframe values.

## Properties

### .DefaultInterpolation : InterpolateLinear | InterpolateDiscrete | InterpolateSmooth

The default interpolation type of this keyframe track.

Default is `InterpolateDiscrete`.

**Overrides:** [KeyframeTrack#DefaultInterpolation](KeyframeTrack.html#DefaultInterpolation)

### .ValueBufferType : TypedArray | Array

The value buffer type of this keyframe track.

Default is `Array.constructor`.

**Overrides:** [KeyframeTrack#ValueBufferType](KeyframeTrack.html#ValueBufferType)

### .ValueTypeName : string

The value type name.

Default is `'bool'`.

**Overrides:** [KeyframeTrack#ValueTypeName](KeyframeTrack.html#ValueTypeName)

## Source

[src/animation/tracks/BooleanKeyframeTrack.js](https://github.com/mrdoob/three.js/blob/master/src/animation/tracks/BooleanKeyframeTrack.js)