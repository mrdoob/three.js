import { Curve } from "../extras/core/Curve.js";

Object.defineProperty( Curve.prototype, '__arcLengthDivisions', {

	get: function () {

		console.warn( 'THREE.Curve: .__arcLengthDivisions is now .arcLengthDivisions.' );
		return this.arcLengthDivisions;

	},
	set: function ( value ) {

		console.warn( 'THREE.Curve: .__arcLengthDivisions is now .arcLengthDivisions.' );
		this.arcLengthDivisions = value;

	}

} );

Curve.create = function ( construct, getPoint ) {

	console.log( 'THREE.Curve.create() has been deprecated' );

	construct.prototype = Object.create( Curve.prototype );
	construct.prototype.constructor = construct;
	construct.prototype.getPoint = getPoint;

	return construct;

};
