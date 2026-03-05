*Inheritance: Curve →*

# CatmullRomCurve3

A curve representing a Catmull-Rom spline.

## Code Example

```js
//Create a closed wavey loop
const curve = new THREE.CatmullRomCurve3( [
	new THREE.Vector3( -10, 0, 10 ),
	new THREE.Vector3( -5, 5, 5 ),
	new THREE.Vector3( 0, 0, 0 ),
	new THREE.Vector3( 5, -5, 5 ),
	new THREE.Vector3( 10, 0, 10 )
] );
const points = curve.getPoints( 50 );
const geometry = new THREE.BufferGeometry().setFromPoints( points );
const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
// Create the final object to add to the scene
const curveObject = new THREE.Line( geometry, material );
```

## Constructor

### new CatmullRomCurve3( points : Array.<Vector3>, closed : boolean, curveType : 'centripetal' | 'chordal' | 'catmullrom', tension : number )

Constructs a new Catmull-Rom curve.

**points**

An array of 3D points defining the curve.

**closed**

Whether the curve is closed or not.

Default is `false`.

**curveType**

The curve type.

Default is `'centripetal'`.

**tension**

Tension of the curve.

Default is `0.5`.

## Properties

### .closed : boolean

Whether the curve is closed or not.

Default is `false`.

### .curveType : 'centripetal' | 'chordal' | 'catmullrom'

The curve type.

Default is `'centripetal'`.

### .isCatmullRomCurve3 : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .points : Array.<Vector3>

An array of 3D points defining the curve.

### .tension : number

Tension of the curve.

Default is `0.5`.

## Methods

### .getPoint( t : number, optionalTarget : Vector3 ) : Vector3

Returns a point on the curve.

**t**

A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.

**optionalTarget**

The optional target vector the result is written to.

**Overrides:** [Curve#getPoint](Curve.html#getPoint)

**Returns:** The position on the curve.

## Source

[src/extras/curves/CatmullRomCurve3.js](https://github.com/mrdoob/three.js/blob/master/src/extras/curves/CatmullRomCurve3.js)