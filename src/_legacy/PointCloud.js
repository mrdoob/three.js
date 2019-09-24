import { Points } from "../objects/Points.js";

export function PointCloud( geometry, material ) {

	console.warn( 'THREE.PointCloud has been renamed to THREE.Points.' );
	return new Points( geometry, material );

}
