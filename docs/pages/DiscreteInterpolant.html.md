*Inheritance: Interpolant →*

# DiscreteInterpolant

Interpolant that evaluates to the sample value at the position preceding the parameter.

## Constructor

### new DiscreteInterpolant( parameterPositions : TypedArray, sampleValues : TypedArray, sampleSize : number, resultBuffer : TypedArray )

Constructs a new discrete interpolant.

**parameterPositions**

The parameter positions hold the interpolation factors.

**sampleValues**

The sample values.

**sampleSize**

The sample size

**resultBuffer**

The result buffer.

## Source

[src/math/interpolants/DiscreteInterpolant.js](https://github.com/mrdoob/three.js/blob/master/src/math/interpolants/DiscreteInterpolant.js)