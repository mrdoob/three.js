/**
 * @author Kai Salmen / www.kaisalmen.de
 */

import { Material } from "../../../../../build/three.module.js";

class MaterialUtils {

	/**
	 *
	 * @param {object} materialsObject
	 * @param {Material|MaterialCloneInstruction} material
	 * @param {string} materialName
	 * @param {boolean} force
	 * @param {boolena} [log]
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
	 * Returns the mapping object of material name and corresponding jsonified material.
	 *
	 * @param {object.<string,Material>}
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
	 *
	 * @param {object.<String, Material>} materials
	 * @param {MaterialCloneInstruction} materialCloneInstruction
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

class MaterialCloneInstruction {

	/**
	 *
	 * @param {string} materialNameOrg
	 * @param {string} materialNameNew
	 * @param {boolean} haveVertexColors
	 * @param {boolean} flatShading
	 */
	constructor ( materialNameOrg, materialNameNew, haveVertexColors, flatShading ) {
		this.materialNameOrg = materialNameOrg;
		this.materialProperties = {
			name: materialNameNew,
			vertexColors: haveVertexColors ? 2 : 0,
			flatShading: flatShading
		};
	}

}

export {
	MaterialUtils,
	MaterialCloneInstruction
}
