import NodeMaterial from './NodeMaterial.js';
import VolumetricLightingModel from '../../nodes/functions/VolumetricLightingModel.js';
import { BackSide } from '../../constants.js';

/**
 * Volume node material.
 *
 * @augments NodeMaterial
 */
class VolumeNodeMaterial extends NodeMaterial {

	static get type() {

		return 'VolumeNodeMaterial';

	}

	/**
	 * Constructs a new volume node material.
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
		this.isVolumeNodeMaterial = true;

		/**
		 * Number of steps used for raymarching.
		 *
		 * @type {number}
		 * @default 25
		 */
		this.steps = 25;

		/**
		 * Node used for scattering calculations.
		 *
		 * @type {Function|FunctionNode<vec4>}
		 * @default null
		 */
		this.scatteringNode = null;

		this.lights = true;

		this.transparent = true;
		this.side = BackSide;

		this.depthTest = false;
		this.depthWrite = false;

		this.setValues( parameters );

	}

	setupLightingModel() {

		return new VolumetricLightingModel();

	}

}

export default VolumeNodeMaterial;
