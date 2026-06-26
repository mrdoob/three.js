# DataUtils

A class containing utility functions for data.

## Static Methods

### .fromHalfFloat( val : number ) : number

Returns a single precision floating point value (FP32) from the given half precision floating point value (FP16).

**val**

A half precision floating point value.

**Returns:** The FP32 value.

### .toHalfFloat( val : number ) : number

Returns a half precision floating point value (FP16) from the given single precision floating point value (FP32).

**val**

A single precision floating point value.

**Returns:** The FP16 value.

## Source

[src/extras/DataUtils.js](https://github.com/mrdoob/three.js/blob/master/src/extras/DataUtils.js)