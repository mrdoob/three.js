import NodeMaterial from './NodeMaterial.js';

import { LineBasicMaterial } from '../LineBasicMaterial.js';

const _defaultValues = /*@__PURE__*/ new LineBasicMaterial();

/**
 * Node material version of `LineBasicMaterial`.
 *
 * @augments NodeMaterial
 */
class LineBasicNodeMaterial extends NodeMaterial {

	static get type() {

		return 'LineBasicNodeMaterial';

	}

	/**
	 * Constructs a new line basic node material.
	 *
	 * @param {?Object} parameters - The configuration parameter.
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
		this.isLineBasicNodeMaterial = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

}

export default LineBasicNodeMaterial;
