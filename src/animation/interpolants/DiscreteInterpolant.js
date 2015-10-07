/**
 *
 * Interpolant that yields the keyframe value at the start of its interval.
 *
 *
 * @author tschw
 */

THREE.DiscreteInterpolant = function( times, values, stride, result ) {

	THREE.Interpolant.call( this, times, values, stride, result );

};

Object.assign( THREE.DiscreteInterpolant.prototype, THREE.Interpolant.prototype, {

	constructor: THREE.DiscreteInterpolant,

	_interpolate: function( i1, t0, t, t1 ) {

		return this._copyKeyframe( i1 - 1 );

	}

} );
