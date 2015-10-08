/**
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.AnimationUtils = {

	getEqualsFunc: function( exemplarValue ) {

		if ( exemplarValue.equals ) {
			return function equals_object( a, b ) {
				return a.equals( b );
			}
		}

		return function equals_primitive( a, b ) {
			return ( a === b );
		};

	},

	clone: function( exemplarValue ) {

		var typeName = typeof exemplarValue;
		if ( typeName === "object" ) {
			if ( exemplarValue.clone ) {
				return exemplarValue.clone();
			}
			console.error( "can not figure out how to copy exemplarValue", exemplarValue );
		}

		return exemplarValue;

	},

	lerp: function( a, b, alpha, interTrack ) {

		var lerpFunc = THREE.AnimationUtils.getLerpFunc( a, interTrack );

		return lerpFunc( a, b, alpha );

	},

	lerp_object: function( a, b, alpha ) {
		return a.lerp( b, alpha );
	},

	slerp_object: function( a, b, alpha ) {
		return a.slerp( b, alpha );
	},

	lerp_number: function( a, b, alpha ) {
		return a * ( 1 - alpha ) + b * alpha;
	},

	lerp_boolean: function( a, b, alpha ) {
		return ( alpha < 0.5 ) ? a : b;
	},

	lerp_boolean_immediate: function( a, b, alpha ) {
		return a;
	},

	lerp_string: function( a, b, alpha ) {
		return ( alpha < 0.5 ) ? a : b;
	},

	lerp_string_immediate: function( a, b, alpha ) {
 		return a;
 	},

	// NOTE: this is an accumulator function that modifies the first argument (e.g. a).	This is to minimize memory alocations.
	getLerpFunc: function( exemplarValue, interTrack ) {

		if ( exemplarValue === undefined || exemplarValue === null ) throw new Error( "examplarValue is null" );

		var typeName = typeof exemplarValue;

		switch( typeName ) {

			case "object":
				if ( exemplarValue.lerp ) {
					return THREE.AnimationUtils.lerp_object;
				}

				if ( exemplarValue.slerp ) {
					return THREE.AnimationUtils.slerp_object;
				}
				break;

			case "number":
				return THREE.AnimationUtils.lerp_number;

			case "boolean":
				if ( interTrack ) {
					return THREE.AnimationUtils.lerp_boolean;
				} else {
					return THREE.AnimationUtils.lerp_boolean_immediate;
				}

			case "string":
				if ( interTrack ) {
					return THREE.AnimationUtils.lerp_string;
				} else {
					return THREE.AnimationUtils.lerp_string_immediate;
				}

		}

	}

};
