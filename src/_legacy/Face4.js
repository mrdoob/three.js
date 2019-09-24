import { Face3 } from "../core/Face3.js";

export function Face4( a, b, c, d, normal, color, materialIndex ) {

	console.warn( 'THREE.Face4 has been removed. A THREE.Face3 will be created instead.' );
	return new Face3( a, b, c, normal, color, materialIndex );

}
