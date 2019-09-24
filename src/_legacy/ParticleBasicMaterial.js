import { PointsMaterial } from "../materials/PointsMaterial.js";

export function ParticleBasicMaterial( parameters ) {

	console.warn( 'THREE.ParticleBasicMaterial has been renamed to THREE.PointsMaterial.' );
	return new PointsMaterial( parameters );

}
