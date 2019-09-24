import { CatmullRomCurve3 } from "../extras/curves/CatmullRomCurve3.js";

Object.assign( Spline.prototype, {

	initFromArray: function ( /* a */ ) {

		console.error( 'THREE.Spline: .initFromArray() has been removed.' );

	},
	getControlPointsArray: function ( /* optionalTarget */ ) {

		console.error( 'THREE.Spline: .getControlPointsArray() has been removed.' );

	},
	reparametrizeByArcLength: function ( /* samplingCoef */ ) {

		console.error( 'THREE.Spline: .reparametrizeByArcLength() has been removed.' );

	}

} );

Spline.prototype = Object.create( CatmullRomCurve3.prototype );

export function Spline( points ) {

	console.warn( 'THREE.Spline has been removed. Use THREE.CatmullRomCurve3 instead.' );

	CatmullRomCurve3.call( this, points );
	this.type = 'catmullrom';

}
