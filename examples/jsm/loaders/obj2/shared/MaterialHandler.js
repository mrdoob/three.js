/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

import {
	LineBasicMaterial,
	MaterialLoader,
	MeshStandardMaterial,
	PointsMaterial,
	VertexColors
} from "../../../../../build/three.module.js";


const MaterialHandler = function () {
	this.logging = {
		enabled: true,
		debug: false
	};

	this.callbacks = {
		onLoadMaterials: null
	};
	this.materials = {};
	this._createDefaultMaterials();
};

MaterialHandler.prototype = {

	constructor: MaterialHandler,

	/**
	 * Enable or disable logging in general (except warn and error), plus enable or disable debug logging.
	 *
	 * @param {boolean} enabled True or false.
	 * @param {boolean} debug True or false.
	 */
	setLogging:	function ( enabled, debug ) {
		this.logging.enabled = enabled === true;
		this.logging.debug = debug === true;
	},

	_setCallbacks: function ( onLoadMaterials ) {
		if ( onLoadMaterials !== undefined && onLoadMaterials !== null ) {

			this.callbacks.onLoadMaterials = onLoadMaterials;

		}
	},

	_createDefaultMaterials: function () {
		let defaultMaterial = new MeshStandardMaterial( { color: 0xDCF1FF } );
		defaultMaterial.name = 'defaultMaterial';

		let defaultVertexColorMaterial = new MeshStandardMaterial( { color: 0xDCF1FF } );
		defaultVertexColorMaterial.name = 'defaultVertexColorMaterial';
		defaultVertexColorMaterial.vertexColors = VertexColors;

		let defaultLineMaterial = new LineBasicMaterial();
		defaultLineMaterial.name = 'defaultLineMaterial';

		let defaultPointMaterial = new PointsMaterial( { size: 0.1 } );
		defaultPointMaterial.name = 'defaultPointMaterial';

		let runtimeMaterials = {};
		runtimeMaterials[ defaultMaterial.name ] = defaultMaterial;
		runtimeMaterials[ defaultVertexColorMaterial.name ] = defaultVertexColorMaterial;
		runtimeMaterials[ defaultLineMaterial.name ] = defaultLineMaterial;
		runtimeMaterials[ defaultPointMaterial.name ] = defaultPointMaterial;

		this.addMaterials( runtimeMaterials );
	},

	/**
	 * Updates the materials with contained material objects (sync) or from alteration instructions (async).
	 *
	 * @param {Object} materialPayload Material update instructions
	 * @returns {Object} Map of {@link Material}
	 */
	addPayloadMaterials: function ( materialPayload ) {
		let material, materialName;
		let materialCloneInstructions = materialPayload.materials.materialCloneInstructions;
		let newMaterials = {};

		if ( materialCloneInstructions !== undefined && materialCloneInstructions !== null ) {

			let materialNameOrg = materialCloneInstructions.materialNameOrg;
			if ( materialNameOrg !== undefined && materialNameOrg !== null ) {

				let materialOrg = this.materials[ materialNameOrg ];
				material = materialOrg.clone();

				materialName = materialCloneInstructions.materialName;
				material.name = materialName;

				let materialProperties = materialCloneInstructions.materialProperties;
				for ( let key in materialProperties ) {

					if ( material.hasOwnProperty( key ) && materialProperties.hasOwnProperty( key ) ) {

						material[ key ] = materialProperties[ key ];

					}

				}
				this.materials[ materialName ] = material;
				newMaterials[ materialName ] = material;

			} else {

				console.info( 'Requested material "' + materialNameOrg + '" is not available!' );

			}
		}

		let materials = materialPayload.materials.serializedMaterials;
		if ( materials !== undefined && materials !== null && Object.keys( materials ).length > 0 ) {

			let loader = new MaterialLoader();
			let materialJson;
			for ( materialName in materials ) {

				materialJson = materials[ materialName ];
				if ( materialJson !== undefined && materialJson !== null ) {

					material = loader.parse( materialJson );
					if ( this.logging.enabled ) console.info( 'De-serialized material with name "' + materialName + '" will be added.' );
					this.materials[ materialName ] = material;
					newMaterials[ materialName ] = material;

				}

			}

		}
		materials = materialPayload.materials.runtimeMaterials;
		newMaterials = this.addMaterials( materials, newMaterials );

		return newMaterials;
	},

	/**
	 * Set materials loaded by any supplier of an Array of {@link Material}.
	 *
	 * @param materials Object with named {@link Material}
	 * @param newMaterials [Object] with named {@link Material}
	 */
	addMaterials: function ( materials, newMaterials ) {
		if ( newMaterials === undefined || newMaterials === null ) {

			newMaterials = {};

		}
		if ( materials !== undefined && materials !== null && Object.keys( materials ).length > 0 ) {

			let material;
			for ( let materialName in materials ) {

				material = materials[ materialName ];
				this.materials[ materialName ] = material;
				newMaterials[ materialName ] = material;
				if ( this.logging.enabled ) console.info( 'Material with name "' + materialName + '" was added.' );

			}

		}
		return newMaterials;
	},

	/**
	 * Returns the mapping object of material name and corresponding material.
	 *
	 * @returns {Object} Map of {@link Material}
	 */
	getMaterials: function () {
		return this.materials;
	},

	/**
	 *
	 * @param {String} materialName
	 * @returns {Material}
	 */
	getMaterial: function ( materialName ) {
		return this.materials[ materialName ];
	},

	/**
	 * Returns the mapping object of material name and corresponding jsonified material.
	 *
	 * @returns {Object} Map of Materials in JSON representation
	 */
	getMaterialsJSON: function () {
		let materialsJSON = {};
		let material;
		for ( let materialName in this.materials ) {

			material = this.materials[ materialName ];
			materialsJSON[ materialName ] = material.toJSON();
		}

		return materialsJSON;
	}

};

export { MaterialHandler }
