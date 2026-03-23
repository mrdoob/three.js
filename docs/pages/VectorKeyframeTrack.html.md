*Inheritance: KeyframeTrack →*

# VectorKeyframeTrack

A track for vector keyframe values.

## Constructor

### new VectorKeyframeTrack( name : string, times : Array.<number>, values : Array.<number>, interpolation : InterpolateLinear | InterpolateDiscrete | InterpolateSmooth )

Constructs a new vector keyframe track.

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

Default is `'vector'`.

**Overrides:** [KeyframeTrack#ValueTypeName](KeyframeTrack.html#ValueTypeName)

## Source

[src/animation/tracks/VectorKeyframeTrack.js](https://github.com/mrdoob/three.js/blob/master/src/animation/tracks/VectorKeyframeTrack.js)