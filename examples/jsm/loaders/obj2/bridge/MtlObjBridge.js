/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

import { MTLLoader } from "../../../../jsm/loaders/MTLLoader.js";


const MtlObjBridge = {

	/**
	 *
	 * @param processResult
	 * @param assetLoader
	 */
	link: function ( processResult, assetLoader ) {

		if ( typeof assetLoader.addMaterials === 'function' ) {

			assetLoader.addMaterials( this.addMaterialsFromMtlLoader( processResult ) );

		}

	},

	/**
	 * Returns the array instance of {@link MTLLoader.MaterialCreator}.
	 *
	 * @param Instance of {@link MTLLoader.MaterialCreator}
	 */
	addMaterialsFromMtlLoader: function ( materialCreator ) {

		let newMaterials = {};
		if ( materialCreator instanceof MTLLoader.MaterialCreator ) {

			materialCreator.preload();
			newMaterials = materialCreator.materials;

		}
		return newMaterials;

	}
};

export { MtlObjBridge };
