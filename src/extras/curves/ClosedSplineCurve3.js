import { CatmullRomCurve3 } from './CatmullRomCurve3';

/**************************************************************
 *	Closed Spline 3D curve
 **************************************************************/


function ClosedSplineCurve3 ( points ) {
	this.isClosedSplineCurve3 = this.isCatmullRomCurve3 = true;

	console.warn( 'THREE.ClosedSplineCurve3 has been deprecated. Please use THREE.CatmullRomCurve3.' );

	CatmullRomCurve3.call( this, points );
	this.type = 'catmullrom';
	this.closed = true;

};

ClosedSplineCurve3.prototype = Object.create( CatmullRomCurve3.prototype );


export { ClosedSplineCurve3 };