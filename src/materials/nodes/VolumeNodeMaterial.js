import NodeMaterial from './NodeMaterial.js';
import VolumetricLightingModel from '../../nodes/functions/VolumetricLightingModel.js';
import { AdditiveBlending, BackSide } from '../../constants.js';


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

		this.steps = 25;
		this.stepSize = 1.0;

		this.scatteringNode = null;

		this.lights = true;

		this.transparent = true;
		this.side = BackSide;
		this.blending = AdditiveBlending;
		this.depthTest = false;
		this.depthWrite = false;

		this.setValues( parameters );

	}

	setupLightingModel() {

		return new VolumetricLightingModel();

	}

}

export default VolumeNodeMaterial;
