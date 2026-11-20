import NodeMaterial from './NodeMaterial.js';
import VolumetricLightingModel from '../../nodes/functions/VolumetricLightingModel.js';
import { BackSide } from '../../constants.js';

/**
 * Volume node material. Renders a raymarched volume that is only lit by
 * point, spot and rect area lights; directional, ambient and environment
 * lighting are ignored.
 *
 * If {@link NodeMaterial#depthNode} is set, it is interpreted as the scene
 * depth used to occlude the rays.
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
		this.isVolumeNodeMaterial = true;

		/**
		 * Number of steps used for raymarching.
		 *
		 * @type {number}
		 * @default 25
		 */
		this.steps = 25;

		/**
		 * Offsets the distance a ray has been traveled through a volume, as a
		 * fraction of one raymarching step. Can be used to implement dithering
		 * (e.g. per-pixel noise in the range `[0,1)`) to reduce banding.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.offsetNode = null;

		/**
		 * Function used for scattering calculations. It receives `{ positionRay }`,
		 * the current ray position in world space, and returns the scattering
		 * density for that raymarching step.
		 *
		 * @type {?(Function|FunctionNode)}
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
