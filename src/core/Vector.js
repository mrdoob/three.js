/**
 * THREE._Vector is an interface and not instantiable
 * it provides methods not limited to the number of dimensions
 *
 * @author egraether / http://egraether.com/
 */

THREE._Vector = ( function() {

	function negate() {

		return this.multiplyScalar( -1 );

	}

	function isZero() {

		return this.lengthSq() < 0.0001; // almostZero

	}


	function length() {

		return Math.sqrt( this.lengthSq() );

	}

	function normalize() {

		return this.divideScalar( this.length() );

	}

	function setLength( l ) {

		return this.normalize().multiplyScalar( l );

	}


	function distanceToSquared( v ) {

		return this.clone().subSelf( v ).lengthSq();

	}

	function distanceTo( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	}


	return function() {

		this.negate = negate;
		this.isZero = isZero;

		this.length = length;
		this.setLength = setLength;

		// deprecated unit is reference to normalize
		this.normalize = this.unit = normalize;

		this.distanceToSquared = distanceToSquared;
		this.distanceTo = distanceTo;

	};

})();
