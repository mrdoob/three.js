import { Vector2 } from '../../math/Vector2.js';
import { Curve } from '../core/Curve.js';


function LineCurve( v1, v2 ) {

	Curve.call( this );

	this.type = 'LineCurve';

	this.v1 = v1 || new Vector2();
	this.v2 = v2 || new Vector2();

}

LineCurve.prototype = Object.create( Curve.prototype );
LineCurve.prototype.constructor = LineCurve;

LineCurve.prototype.isLineCurve = true;

LineCurve.prototype.getPoint = function ( t, optionalTarget ) {

	var point = optionalTarget || new Vector2();

	if ( t === 1 ) {

		point.copy( this.v2 );

	} else {

		point.copy( this.v2 ).sub( this.v1 );
		point.multiplyScalar( t ).add( this.v1 );

	}

	return point;

};

// Line curve is linear, so we can overwrite default getPointAt

LineCurve.prototype.getPointAt = function ( u, optionalTarget ) {

	return this.getPoint( u, optionalTarget );

};

LineCurve.prototype.getTangent = function ( /* t */ ) {

	var tangent = this.v2.clone().sub( this.v1 );

	return tangent.normalize();

};

LineCurve.prototype.copy = function ( source ) {

	Curve.prototype.copy.call( this, source );

	this.v1.copy( source.v1 );
	this.v2.copy( source.v2 );

	return this;

};


export { LineCurve };
