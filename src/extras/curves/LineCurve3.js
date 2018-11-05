import { Vector3 } from '../../math/Vector3.js';
import { Curve } from '../core/Curve.js';


function LineCurve3( v1, v2 ) {

	Curve.call( this );

	this.type = 'LineCurve3';

	this.v1 = v1 || new Vector3();
	this.v2 = v2 || new Vector3();

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

LineCurve3.prototype.copy = function ( source ) {

	Curve.prototype.copy.call( this, source );

	this.v1.copy( source.v1 );
	this.v2.copy( source.v2 );

	return this;

};

LineCurve3.prototype.toJSON = function () {

	var data = Curve.prototype.toJSON.call( this );

	data.v1 = this.v1.toArray();
	data.v2 = this.v2.toArray();

	return data;

};

LineCurve3.prototype.fromJSON = function ( json ) {

	Curve.prototype.fromJSON.call( this, json );

	this.v1.fromArray( json.v1 );
	this.v2.fromArray( json.v2 );

	return this;

};


export { LineCurve3 };
