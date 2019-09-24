import { Line3 } from "../math/Line3.js";

Line3.prototype.center = function ( optionalTarget ) {

	console.warn( 'THREE.Line3: .center() has been renamed to .getCenter().' );
	return this.getCenter( optionalTarget );

};
