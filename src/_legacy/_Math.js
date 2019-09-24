import { _Math } from "../math/Math.js";

Object.assign( _Math, {

	random16: function () {

		console.warn( 'THREE.Math: .random16() has been deprecated. Use Math.random() instead.' );
		return Math.random();

	},

	nearestPowerOfTwo: function ( value ) {

		console.warn( 'THREE.Math: .nearestPowerOfTwo() has been renamed to .floorPowerOfTwo().' );
		return _Math.floorPowerOfTwo( value );

	},

	nextPowerOfTwo: function ( value ) {

		console.warn( 'THREE.Math: .nextPowerOfTwo() has been renamed to .ceilPowerOfTwo().' );
		return _Math.ceilPowerOfTwo( value );

	}

} );
