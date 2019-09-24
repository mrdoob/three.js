import { CatmullRomCurve3 } from "../extras/curves/CatmullRomCurve3.js";

ClosedSplineCurve3.prototype = Object.create( CatmullRomCurve3.prototype );

export function ClosedSplineCurve3( points ) {

	console.warn( 'THREE.ClosedSplineCurve3 has been deprecated. Use THREE.CatmullRomCurve3 instead.' );

	CatmullRomCurve3.call( this, points );
	this.type = 'catmullrom';
	this.closed = true;

}
