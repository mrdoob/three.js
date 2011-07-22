/**
 * THREE._Vector is an interface and not instantiable
 * it provides methods not limited to the number of dimensions
 *
 * @author egraether / http://egraether.com/
 */

THREE._Vector = {

	negate : function() {

		return this.multiplyScalar( -1 );

	},

	isZero : function() {

		return this.lengthSq() < 0.0001; // almostZero

	},


	length : function() {

		return Math.sqrt( this.lengthSq() );

	},

	normalize : function() {

		return this.divideScalar( this.length() );

	},

	setLength : function( l ) {

		return this.normalize().multiplyScalar( l );

	},


	distanceToSquared : function( v ) {

		return this.clone().subSelf( v ).lengthSq();

	},

	distanceTo : function( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	}

};
