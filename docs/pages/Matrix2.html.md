# Matrix2

Represents a 2x2 matrix.

A Note on Row-Major and Column-Major Ordering:

The constructor and [Matrix2#set](Matrix2.html#set) method take arguments in [row-major](https://en.wikipedia.org/wiki/Row-_and_column-major_order#Column-major_order) order, while internally they are stored in the [Matrix2#elements](Matrix2.html#elements) array in column-major order. This means that calling:

will result in the elements array containing:

```js
m.elements = [ 11, 21,
               12, 22 ];
```

and internally all calculations are performed using column-major ordering. However, as the actual ordering makes no difference mathematically and most people are used to thinking about matrices in row-major order, the three.js documentation shows matrices in row-major order. Just bear in mind that if you are reading the source code, you'll have to take the transpose of any matrices outlined here to make sense of the calculations.

## Code Example

```js
const m = new THREE.Matrix2();
m.set( 11, 12,
       21, 22 );
```

## Constructor

### new Matrix2( n11 : number, n12 : number, n21 : number, n22 : number )

Constructs a new 2x2 matrix. The arguments are supposed to be in row-major order. If no arguments are provided, the constructor initializes the matrix as an identity matrix.

**n11**

1-1 matrix element.

**n12**

1-2 matrix element.

**n21**

2-1 matrix element.

**n22**

2-2 matrix element.

## Classes

[Matrix2](Matrix2.html)

## Properties

### .elements : Array.<number>

A column-major list of matrix values.

### .isMatrix2 : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .fromArray( array : Array.<number>, offset : number ) : Matrix2

Sets the elements of the matrix from the given array.

**array**

The matrix elements in column-major order.

**offset**

Index of the first element in the array.

Default is `0`.

**Returns:** A reference to this matrix.

### .identity() : Matrix2

Sets this matrix to the 2x2 identity matrix.

**Returns:** A reference to this matrix.

### .set( n11 : number, n12 : number, n21 : number, n22 : number ) : Matrix2

Sets the elements of the matrix.The arguments are supposed to be in row-major order.

**n11**

1-1 matrix element.

**n12**

1-2 matrix element.

**n21**

2-1 matrix element.

**n22**

2-2 matrix element.

**Returns:** A reference to this matrix.

## Source

[src/math/Matrix2.js](https://github.com/mrdoob/three.js/blob/master/src/math/Matrix2.js)