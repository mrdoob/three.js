import { BoxHelper } from "../helpers/BoxHelper.js";

export function BoundingBoxHelper( object, color ) {

	console.warn( 'THREE.BoundingBoxHelper has been deprecated. Creating a THREE.BoxHelper instead.' );
	return new BoxHelper( object, color );

}
