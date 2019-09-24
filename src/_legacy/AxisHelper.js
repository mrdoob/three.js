import { AxesHelper } from "../helpers/AxesHelper.js";

export function AxisHelper( size ) {

	console.warn( 'THREE.AxisHelper has been renamed to THREE.AxesHelper.' );
	return new AxesHelper( size );

}
