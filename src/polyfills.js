// Polyfills

if ( Number.EPSILON === undefined ) {

	Number.EPSILON = Math.pow( 2, - 52 );

}

if ( Number.isInteger === undefined ) {

	// Missing in IE
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger

	Number.isInteger = function ( value ) {

		return typeof value === 'number' && isFinite( value ) && Math.floor( value ) === value;

	};

}

//

if ( Math.sign === undefined ) {

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign

	Math.sign = function ( x ) {

		return ( x < 0 ) ? - 1 : ( x > 0 ) ? 1 : + x;

	};

}

if ( 'name' in Function.prototype === false ) {

	// Missing in IE
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name

	Object.defineProperty( Function.prototype, 'name', {

		get: function () {

			return this.toString().match( /^\s*function\s*([^\(\s]*)/ )[ 1 ];

		}

	} );

}

if ( Object.assign === undefined ) {

	// Missing in IE
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

	Object.assign = function ( target ) {

		'use strict';

		if ( target === undefined || target === null ) {

			throw new TypeError( 'Cannot convert undefined or null to object' );

		}

		const output = Object( target );

		for ( let index = 1; index < arguments.length; index ++ ) {

			const source = arguments[ index ];

			if ( source !== undefined && source !== null ) {

				for ( const nextKey in source ) {

					if ( Object.prototype.hasOwnProperty.call( source, nextKey ) ) {

						output[ nextKey ] = source[ nextKey ];

					}

				}

			}

		}

		return output;

	};

}
