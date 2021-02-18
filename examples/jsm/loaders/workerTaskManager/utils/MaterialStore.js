/**
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

import {
	Material,
	MeshStandardMaterial,
	LineBasicMaterial,
	PointsMaterial,
	VertexColors
} from "../../../../../build/three.module.js";
import { MaterialUtils } from "./MaterialUtils.js";

/**
 * Helper class around an object storing materials by name.
 * Optionally, create and store default materials.
 */
class MaterialStore {

	/**
	 * Creates a new {@link MaterialStore}.
	 * @param {boolean} createDefaultMaterials
	 */
	constructor( createDefaultMaterials ) {

		this.materials = {};
		if ( createDefaultMaterials ) {

			const defaultMaterial = new MeshStandardMaterial( { color: 0xDCF1FF } );
			defaultMaterial.name = 'defaultMaterial';

			const defaultVertexColorMaterial = new MeshStandardMaterial( { color: 0xDCF1FF } );
			defaultVertexColorMaterial.name = 'defaultVertexColorMaterial';
			defaultVertexColorMaterial.vertexColors = VertexColors;

			const defaultLineMaterial = new LineBasicMaterial();
			defaultLineMaterial.name = 'defaultLineMaterial';

			const defaultPointMaterial = new PointsMaterial( { size: 0.1 } );
			defaultPointMaterial.name = 'defaultPointMaterial';

			this.materials[ defaultMaterial.name ] = defaultMaterial;
			this.materials[ defaultVertexColorMaterial.name ] = defaultVertexColorMaterial;
			this.materials[ defaultLineMaterial.name ] = defaultLineMaterial;
			this.materials[ defaultPointMaterial.name ] = defaultPointMaterial;

		}

	}

	/**
	 * Set materials loaded by any supplier of an Array of {@link Material}.
	 *
	 * @param {object<string, Material>} newMaterials Object with named {@link Material}
	 * @param {boolean} forceOverrideExisting boolean Override existing material
	 */
	addMaterials ( newMaterials, forceOverrideExisting ) {

		if ( newMaterials === undefined || newMaterials === null ) newMaterials = {};
		if ( Object.keys( newMaterials ).length > 0 ) {

			let material;
			for ( const materialName in newMaterials ) {

				material = newMaterials[ materialName ];
				MaterialUtils.addMaterial( this.materials, material, materialName, forceOverrideExisting === true );

			}

		}

	}

	/**
	 * Returns the mapping object of material name and corresponding material.
	 *
	 * @returns {Object} Map of {@link Material}
	 */
	getMaterials () {

		return this.materials;

	}

	/**
	 *
	 * @param {String} materialName
	 * @returns {Material}
	 */
	getMaterial ( materialName ) {

		return this.materials[ materialName ];

	}

	/**
	 * Removes all materials
	 */
	clearMaterials () {

		this.materials = {};

	}

}

export { MaterialStore }
