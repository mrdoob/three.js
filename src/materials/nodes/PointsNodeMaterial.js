import NodeMaterial from './NodeMaterial.js';

import { PointsMaterial } from '../PointsMaterial.js';

const _defaultValues = /*@__PURE__*/ new PointsMaterial();

/**
 * Node material version of `PointsMaterial`.
 *
 * Since WebGPU can render point primitives only with a size of one pixel,
 * this material type does not evaluate the `size` and `sizeAttenuation`
 * property of `PointsMaterial`. Use {@link InstancedPointsNodeMaterial}
 * instead if you need points with a size larger than one pixel.
 *
 * @augments NodeMaterial
 */
class PointsNodeMaterial extends NodeMaterial {

	static get type() {

		return 'PointsNodeMaterial';

	}

	/**
	 * Constructs a new points node material.
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
		this.isPointsNodeMaterial = true;

		this.setDefaultValues( _defaultValues );

		this.setValues( parameters );

	}

}

export default PointsNodeMaterial;
