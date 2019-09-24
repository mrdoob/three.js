import { CatmullRomCurve3 } from "../extras/curves/CatmullRomCurve3.js";

SplineCurve3.prototype = Object.create( CatmullRomCurve3.prototype );

export function SplineCurve3( points ) {

	console.warn( 'THREE.SplineCurve3 has been deprecated. Use THREE.CatmullRomCurve3 instead.' );

	CatmullRomCurve3.call( this, points );
	this.type = 'catmullrom';

}
