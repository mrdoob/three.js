import NodeMaterial from './NodeMaterial.js';
import ShadowMaskModel from '../../nodes/functions/ShadowMaskModel.js';

import { ShadowMaterial } from '../ShadowMaterial.js';

const _defaultValues = /*@__PURE__*/ new ShadowMaterial();

/**
 * Node material version of `ShadowMaterial`.
 *
 * @augments NodeMaterial
 */
class ShadowNodeMaterial extends NodeMaterial {

	static get type() {

		return 'ShadowNodeMaterial';

	}

	/**
	 * Constructs a new shadow node material.
	 *
	 * @param {Object?} parameters - The configuration parameter.
	 */
	constructor( parameters ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isShadowNodeMaterial = true;

		/**
		 * Set to `true` because so it's possible to implement
		 * the shadow mask effect.
		 *
		 * @type {Boolean}
		 * @default true
		 */
		this.lights = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

	/**
	 * Setups the lighting model.
	 *
	 * @return {ShadowMaskModel} The lighting model.
	 */
	setupLightingModel( /*builder*/ ) {

		return new ShadowMaskModel();

	}

}

export default ShadowNodeMaterial;
