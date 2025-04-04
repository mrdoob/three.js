import NodeMaterial from './NodeMaterial.js';
import ToonLightingModel from '../../nodes/functions/ToonLightingModel.js';

import { MeshToonMaterial } from '../MeshToonMaterial.js';

const _defaultValues = /*@__PURE__*/ new MeshToonMaterial();

/**
 * Node material version of {@link MeshToonMaterial}.
 *
 * @augments NodeMaterial
 */
class MeshToonNodeMaterial extends NodeMaterial {

	static get type() {

		return 'MeshToonNodeMaterial';

	}

	/**
	 * Constructs a new mesh toon node material.
	 *
	 * @param {Object} [parameters] - The configuration parameter.
	 */
	constructor( parameters ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isMeshToonNodeMaterial = true;

		/**
		 * Set to `true` because toon materials react on lights.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.lights = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	/**
	 * Setups the lighting model.
	 *
	 * @return {ToonLightingModel} The lighting model.
	 */
	setupLightingModel( /*builder*/ ) {

		return new ToonLightingModel();

	}

}

export default MeshToonNodeMaterial;
