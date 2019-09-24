import { LOD } from "../objects/LOD.js";

Object.defineProperties( LOD.prototype, {

	objects: {
		get: function () {

			console.warn( 'THREE.LOD: .objects has been renamed to .levels.' );
			return this.levels;

		}
	}

} );
