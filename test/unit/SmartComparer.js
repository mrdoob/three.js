// Smart comparison of three.js objects.
// Identifies significant differences between two objects.
// Performs deep comparison.
// Comparison stops after the first difference is found.
// Provides an explanation for the failure.
function SmartComparer() {
	'use strict';

	// Diagnostic message, when comparison fails.
	var message;

	// Keys to skip during object comparison.
	var omitKeys = [ 'id', 'uuid' ];

	return {

		areEqual: areEqual,

		getDiagnostic: function() {

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
		if ( _.isFunction( val1 ) && _.isFunction( val2 ) ) return true;

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

		// Continue with default comparison.
		if ( _.isEqual( val1, val2 ) ) return true;

		// Object differs (unknown reason).
		return makeFail( 'Values differ', val1, val2 );
	}


	function compareArrays( val1, val2 ) {

		var isArr1 = Array.isArray( val1 );
		var isArr2 = Array.isArray( val2 );

		// Compare type.
		if ( isArr1 !== isArr2 ) return makeFail( 'Values are not both arrays' );

		// Not arrays. Continue.
		if ( !isArr1 ) return undefined;

		// Compare length.
		var N1 = val1.length;
		var N2 = val2.length;
		if ( N1 !== val2.length ) return makeFail( 'Array length differs', N1, N2 );

		// Compare content at each index.
		for ( var i = 0; i < N1; i ++ ) {

			var cmp = areEqual( val1[ i ], val2[ i ] );
			if ( !cmp )	return addContext( 'array index "' + i + '"' );

		}

		// Arrays are equal.
		return true;
	}


	function compareObjects( val1, val2 ) {

		var isObj1 = _.isObject( val1 );
		var isObj2 = _.isObject( val2 );

		// Compare type.
		if ( isObj1 !== isObj2 ) return makeFail( 'Values are not both objects' );

		// Not objects. Continue.
		if ( !isObj1 ) return undefined;

		// Compare keys.
		var keys1 = _( val1 ).keys().difference( omitKeys ).value();
		var keys2 = _( val2 ).keys().difference( omitKeys ).value();

		var missingActual = _.difference( keys1, keys2 );
		if ( missingActual.length !== 0 ) {

			return makeFail( 'Property "' + missingActual[0] + '" is unexpected.' );

		}

		var missingExpected = _.difference( keys2, keys1 );
		if ( missingExpected.length !== 0 ) {

			return makeFail( 'Property "' + missingExpected[0] + '" is missing.' );

		}

		// Keys are the same. For each key, compare content until a difference is found.
		var hadDifference = _.any( keys1, function ( key ) {

			var prop1 = val1[key];
			var prop2 = val2[key];

			// Compare property content.
			var eq = areEqual( prop1, prop2 );

			// In case of failure, an message should already be set.
			// Add context to low level message.
			if ( !eq ) addContext( 'property "' + key + '"' );
			return !eq;

		});

		return ! hadDifference;

	}


	function makeFail( msg, val1, val2 ) {

		message = msg;
		if ( arguments.length > 1) message += " (" + val1 + " vs " + val2 + ")";

		return false;

	}

	function addContext( msg ) {

		// There should already be a validation message. Add more context to it.
		message = message || "Error";
		message += ", at " + msg;

		return false;

	}

}
