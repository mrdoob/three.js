import { MeshPhongMaterial } from "../materials/MeshPhongMaterial.js";

Object.defineProperties( MeshPhongMaterial.prototype, {

	metal: {
		get: function () {

			console.warn( 'THREE.MeshPhongMaterial: .metal has been removed. Use THREE.MeshStandardMaterial instead.' );
			return false;

		},
		set: function () {

			console.warn( 'THREE.MeshPhongMaterial: .metal has been removed. Use THREE.MeshStandardMaterial instead' );

		}
	}

} );
