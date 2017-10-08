import { Vector3 } from '../../math/Vector3.js';
import { Curve } from '../core/Curve.js';


function LineCurve3( v1, v2 ) {

	Curve.call( this );

	this.v1 = v1;
	this.v2 = v2;

}

LineCurve3.prototype = Object.create( Curve.prototype );
LineCurve3.prototype.constructor = LineCurve3;

LineCurve3.prototype.isLineCurve3 = true;

LineCurve3.prototype.getPoint = function ( t, optionalTarget ) {

	var point = optionalTarget || new Vector3();

	if ( t === 1 ) {

		point.copy( this.v2 );

	} else {

		point.copy( this.v2 ).sub( this.v1 );
		point.multiplyScalar( t ).add( this.v1 );

	}

	return point;

};

// Line curve is linear, so we can overwrite default getPointAt

LineCurve3.prototype.getPointAt = function ( u, optionalTarget ) {

	return this.getPoint( u, optionalTarget );

};


export { LineCurve3 };
