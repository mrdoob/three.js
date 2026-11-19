import {
	Mesh,
	warnOnce
} from 'three';

/**
 * This helper no longer renders anything.
 *
 * @deprecated since r188. Use {@link LightProbeGridHelperWebGL} instead.
 * @augments Mesh
 * @three_import import { LightProbeHelper } from 'three/addons/helpers/LightProbeHelper.js';
 */
class LightProbeHelper extends Mesh {

	/**
	 * Constructs a new light probe helper.
	 *
	 * @deprecated since r188. Use {@link LightProbeGridHelperWebGL} instead.
	 * @param {LightProbe} lightProbe - The light probe.
	 * @param {number} [size=1] - The size of the helper.
	 */
	constructor( lightProbe, size = 1 ) {

		super();

		warnOnce( 'LightProbeHelper: "LightProbeHelper" has been removed. Use "LightProbeGridHelperWebGL" instead.' ); // @deprecated r188

		/**
		 * The light probe.
		 *
		 * @type {LightProbe}
		 */
		this.lightProbe = lightProbe;

		/**
		 * The size of the helper.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.size = size;
		this.type = 'LightProbeHelper';

		this.visible = false;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

export { LightProbeHelper };
