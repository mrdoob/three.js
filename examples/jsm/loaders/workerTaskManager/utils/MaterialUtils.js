/**
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

import { Material } from "../../../../../build/three.module.js";

/**
 * Static functions useful in the context of handling materials.
 */
class MaterialUtils {

	/**
	 * Adds the provided material to the provided materials object if the material does not exists.
	 * Use force override existing material.
	 *
	 * @param {object.<string, Material>} materialsObject
	 * @param {Material} material
	 * @param {string} materialName
	 * @param {boolean} force
	 * @param {boolean} [log] Log messages to the console
	 */
	static addMaterial( materialsObject, material, materialName, force, log ) {
		let existingMaterial;
		// ensure materialName is set
		material.name = materialName;
		if ( ! force ) {

			existingMaterial = materialsObject[ materialName ];
			if ( existingMaterial ) {

				if ( existingMaterial.uuid !== existingMaterial.uuid ) {

					if ( log ) console.log( 'Same material name "' + existingMaterial.name + '" different uuid [' + existingMaterial.uuid + '|' + material.uuid + ']' );

				}

			} else {

				materialsObject[ materialName ] = material;
				if ( log ) console.info( 'Material with name "' + materialName + '" was added.' );

			}

		} else {

			materialsObject[ materialName ] = material;
			if ( log ) console.info( 'Material with name "' + materialName + '" was forcefully overridden.' );

		}
	}

	/**
	 * Transforms the named materials object to an object with named jsonified materials.
	 *
	 * @param {object.<string, Material>}
	 * @returns {Object} Map of Materials in JSON representation
	 */
	static getMaterialsJSON ( materialsObject ) {

		const materialsJSON = {};
		let material;
		for ( const materialName in materialsObject ) {

			material = materialsObject[ materialName ];
			if ( material instanceof Material ) materialsJSON[ materialName ] = material.toJSON();

		}
		return materialsJSON;

	}

	/**
	 * Clones a material according the provided instructions.
	 *
	 * @param {object.<String, Material>} materials
	 * @param {object} materialCloneInstruction
	 * @param {boolean} [log]
	 */
	static cloneMaterial ( materials, materialCloneInstruction, log ) {

		let material;
		if ( materialCloneInstruction ) {

			let materialNameOrg = materialCloneInstruction.materialNameOrg;
			materialNameOrg = ( materialNameOrg !== undefined && materialNameOrg !== null ) ? materialNameOrg : '';
			const materialOrg = materials[ materialNameOrg ];
			if ( materialOrg ) {

				material = materialOrg.clone();
				Object.assign( material, materialCloneInstruction.materialProperties );
				MaterialUtils.addMaterial( materials, material, materialCloneInstruction.materialProperties.name, true );

			}
			else {

				if ( log ) console.info( 'Requested material "' + materialNameOrg + '" is not available!' );

			}

		}
		return material;

	}

}

export { MaterialUtils }
