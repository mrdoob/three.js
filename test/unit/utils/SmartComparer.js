// Smart comparison of three.js objects.
// Identifies significant differences between two objects.
// Performs deep comparison.
// Comparison stops after the first difference is found.
// Provides an explanation for the failure.
function SmartComparer() {

	'use strict';

	// Diagnostic message, when comparison fails.
	var message;

	return {

		areEqual: areEqual,

		getDiagnostic: function () {

			return message;

		}

	};


	// val1 - first value to compare (typically the actual value)
	// val2 - other value to compare (typically the expected value)
	function areEqual( val1, val2 ) {

		// Values are strictly equal.
		if ( val1 === val2 ) return true;

		// Null or undefined values.
		/* jshint eqnull:true */
		if ( val1 == null || val2 == null ) {

			if ( val1 != val2 ) {

				return makeFail( 'One value is undefined or null', val1, val2 );

			}

			// Both null / undefined.
			return true;

		}

		// Don't compare functions.
		if ( isFunction( val1 ) && isFunction( val2 ) ) return true;

		// Array comparison.
		var arrCmp = compareArrays( val1, val2 );
		if ( arrCmp !== undefined ) return arrCmp;

		// Has custom equality comparer.
		if ( val1.equals ) {

			if ( val1.equals( val2 ) ) return true;

			return makeFail( 'Comparison with .equals method returned false' );

		}

		// Object comparison.
		var objCmp = compareObjects( val1, val2 );
		if ( objCmp !== undefined ) return objCmp;

		// if (JSON.stringify( val1 ) == JSON.stringify( val2 ) ) return true;

		// Object differs (unknown reason).
		return makeFail( 'Values differ', val1, val2 );

	}

	function isFunction( value ) {

		// The use of `Object#toString` avoids issues with the `typeof` operator
		// in Safari 8 which returns 'object' for typed array constructors, and
		// PhantomJS 1.9 which returns 'function' for `NodeList` instances.
		var tag = isObject( value ) ? Object.prototype.toString.call( value ) : '';

		return tag == '[object Function]' || tag == '[object GeneratorFunction]';

	}

	function isObject( value ) {

		// Avoid a V8 JIT bug in Chrome 19-20.
		// See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
		var type = typeof value;

		return !! value && ( type == 'object' || type == 'function' );

	}

	function compareArrays( val1, val2 ) {

		var isArr1 = Array.isArray( val1 );
		var isArr2 = Array.isArray( val2 );

		// Compare type.
		if ( isArr1 !== isArr2 ) return makeFail( 'Values are not both arrays' );

		// Not arrays. Continue.
		if ( ! isArr1 ) return undefined;

		// Compare length.
		var N1 = val1.length;
		var N2 = val2.length;
		if ( N1 !== val2.length ) return makeFail( 'Array length differs', N1, N2 );

		// Compare content at each index.
		for ( var i = 0; i < N1; i ++ ) {

			var cmp = areEqual( val1[ i ], val2[ i ] );
			if ( ! cmp )	return addContext( 'array index "' + i + '"' );

		}

		// Arrays are equal.
		return true;

	}


	function compareObjects( val1, val2 ) {

		var isObj1 = isObject( val1 );
		var isObj2 = isObject( val2 );

		// Compare type.
		if ( isObj1 !== isObj2 ) return makeFail( 'Values are not both objects' );

		// Not objects. Continue.
		if ( ! isObj1 ) return undefined;

		// Compare keys.
		var keys1 = Object.keys( val1 );
		var keys2 = Object.keys( val2 );

		for ( var i = 0, l = keys1.length; i < l; i ++ ) {

			if ( keys2.indexOf( keys1[ i ] ) < 0 ) {

				return makeFail( 'Property "' + keys1[ i ] + '" is unexpected.' );

			}

		}

		for ( var i = 0, l = keys2.length; i < l; i ++ ) {

			if ( keys1.indexOf( keys2[ i ] ) < 0 ) {

				return makeFail( 'Property "' + keys2[ i ] + '" is missing.' );

			}

		}

		// Keys are the same. For each key, compare content until a difference is found.
		var hadDifference = false;

		for ( var i = 0, l = keys1.length; i < l; i ++ ) {

			var key = keys1[ i ];

			if ( key === "uuid" || key === "id" ) {

				continue;

			}

			var prop1 = val1[ key ];
			var prop2 = val2[ key ];

			// Compare property content.
			var eq = areEqual( prop1, prop2 );

			// In case of failure, an message should already be set.
			// Add context to low level message.
			if ( ! eq ) {

				addContext( 'property "' + key + '"' );
				hadDifference = true;

			}

		}

		return ! hadDifference;

	}


	function makeFail( msg, val1, val2 ) {

		message = msg;
		if ( arguments.length > 1 ) message += " (" + val1 + " vs " + val2 + ")";

		return false;

	}

	function addContext( msg ) {

		// There should already be a validation message. Add more context to it.
		message = message || "Error";
		message += ", at " + msg;

		return false;

	}

}

export { SmartComparer };
