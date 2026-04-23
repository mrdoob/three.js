# ColorSpaces

## Properties

### .DisplayP3ColorSpace : string (constant)

Display-P3 color space.

### .DisplayP3ColorSpaceImpl : module:ColorSpaces~ColorSpaceImpl (constant)

Implementation object for the Display-P3 color space.

### .ExtendedSRGBColorSpace : string (constant)

Extended-sRGB color space.

### .ExtendedSRGBColorSpaceImpl : module:ColorSpaces~ColorSpaceImpl (constant)

Implementation object for the Extended-sRGB color space.

### .LinearDisplayP3ColorSpace : string (constant)

Display-P3-Linear color space.

### .LinearDisplayP3ColorSpaceImpl : module:ColorSpaces~ColorSpaceImpl (constant)

Implementation object for the Display-P3-Linear color space.

### .LinearRec2020ColorSpace : string (constant)

Rec2020-Linear color space.

### .LinearRec2020ColorSpaceImpl : module:ColorSpaces~ColorSpaceImpl (constant)

Implementation object for the Rec2020-Linear color space.

## Type Definitions

### .ColorSpaceImpl

An object holding the color space implementation.

**primaries**  
Array.<number>

The primaries.

**whitePoint**  
Array.<number>

The white point.

**toXYZ**  
[Matrix3](Matrix3.html)

A color space conversion matrix, converting to CIE XYZ.

**fromXYZ**  
[Matrix3](Matrix3.html)

A color space conversion matrix, converting from CIE XYZ.

**luminanceCoefficients**  
Array.<number>

The luminance coefficients.

**workingColorSpaceConfig**  
Object

The working color space config.

**outputColorSpaceConfig**  
Object

The drawing buffer color space config.

## Source

[examples/jsm/math/ColorSpaces.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/math/ColorSpaces.js)