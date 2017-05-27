import { Vector3 } from '../../math/Vector3';
import { Curve } from '../core/Curve';


function LineCurve3( v1, v2 ) {

	Curve.call( this );

	this.v1 = v1;
	this.v2 = v2;

}

LineCurve3.prototype = Object.create( Curve.prototype );
LineCurve3.prototype.constructor = LineCurve3;

LineCurve3.prototype.getPoint = function ( t ) {

	if ( t === 1 ) {

		return this.v2.clone();

	}

	var vector = new Vector3();

	vector.subVectors( this.v2, this.v1 ); // diff
	vector.multiplyScalar( t );
	vector.add( this.v1 );

	return vector;

};


export { LineCurve3 };
