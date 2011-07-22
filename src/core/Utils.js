/**
 * @author egraether / http://egraether.com/
 */

THREE.Utils = {

	extend : function( destination, source ) {

		for ( var key in source ) {

			if ( source.hasOwnProperty( key ) ) {

				destination[key] = source[key];

			}

		}

		return destination;

	}

};