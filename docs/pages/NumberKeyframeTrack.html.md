*Inheritance: KeyframeTrack →*

# NumberKeyframeTrack

A track for numeric keyframe values.

## Constructor

### new NumberKeyframeTrack( name : string, times : Array.<number>, values : Array.<number>, interpolation : InterpolateLinear | InterpolateDiscrete | InterpolateSmooth )

Constructs a new number keyframe track.

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

Default is `'number'`.

**Overrides:** [KeyframeTrack#ValueTypeName](KeyframeTrack.html#ValueTypeName)

## Source

[src/animation/tracks/NumberKeyframeTrack.js](https://github.com/mrdoob/three.js/blob/master/src/animation/tracks/NumberKeyframeTrack.js)