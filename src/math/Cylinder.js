import { Vector3 } from "./Vector3";

/**
 *  @param {Vector3} v The cylinder origin
 *  @param {Vector3} axis The axis, normalized.
 *  @param {number} radius The cylinder radius
 *  @param {number} sup The maximum distance from v in the axis direction (truncated cylinder). If null or undefined, will be +infinity
 *  @param {number} inf The minimum distance from v in the axis direction (truncated cylinder). if null or undefined, will be 0
 */
export function Cylinder( v, axis, radius, inf, sup ) {

	this.v = v || new Vector3();
	this.axis = axis || new Vector3( 1, 0, 0 );
	this.radius = radius;
	this.inf = inf || 0;
	this.sup = sup || + Infinity;

}


Object.assign( Cylinder.prototype, {

	set: function ( v, axis, radius, inf, sup ) {

		this.v.copy( v );
		this.axis.copy( axis );
		this.radius = radius || 0;
		this.inf = inf || 0;
		this.sup = sup || + Infinity;

		return this;

	},

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( cylinder ) {

		this.v.copy( cylinder.v );
		this.axis.copy( cylinder.axis );
		this.radius = cylinder.radius;
		this.inf = cylinder.inf;
		this.sup = cylinder.sup;

		return this;

	},

	empty: function () {

		return ( this.radius <= 0 || this.inf >= this.sup );

	},

	getBoundingBox: function ( target ) {

		throw "not implemented yet, todo";

		return target;

	},

	equals: function ( cylinder ) {

		return cylinder.v.equals( this.v ) &&
			cylinder.axis.equals( this.axis ) &&
			cylinder.radius === this.radius &&
			cylinder.inf === this.inf &&
			cylinder.sup === this.sup;

	}

} );
