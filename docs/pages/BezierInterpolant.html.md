*Inheritance: Interpolant →*

# BezierInterpolant

A Bezier interpolant using cubic Bezier curves with 2D control points.

This interpolant supports the COLLADA/Maya style of Bezier animation where each keyframe has explicit in/out tangent control points specified as 2D coordinates (time, value).

Tangent data is read from `inTangents` and `outTangents` on the interpolant (populated by `KeyframeTrack.InterpolantFactoryMethodBezier`).

For a track with N keyframes and stride S:

*   Each tangent array has N \* S \* 2 values
*   Layout: \[k0\_c0\_time, k0\_c0\_value, k0\_c1\_time, k0\_c1\_value, ..., k0\_cS\_time, k0\_cS\_value, k1\_c0\_time, k1\_c0\_value, ...\]

## Constructor

### new BezierInterpolant()

## Source

[src/math/interpolants/BezierInterpolant.js](https://github.com/mrdoob/three.js/blob/master/src/math/interpolants/BezierInterpolant.js)