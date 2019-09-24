import { PointsMaterial } from "../materials/PointsMaterial.js";

export function PointCloudMaterial( parameters ) {

	console.warn( 'THREE.PointCloudMaterial has been renamed to THREE.PointsMaterial.' );
	return new PointsMaterial( parameters );

}
