import {
	LightProbe,
	warnOnce
} from 'three';

/**
 * Utility class for creating instances of {@link LightProbe}.
 *
 * @deprecated since r188. Use {@link LightProbeGrid} or {@link Scene#environment} instead.
 * @hideconstructor
 * @three_import import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js';
 */
class LightProbeGenerator {

	/**
	 * @deprecated since r188. Use {@link LightProbeGrid} or {@link Scene#environment} instead.
	 * @return {LightProbe} An empty light probe.
	 */
	static fromCubeTexture() {

		warnOnce( 'LightProbeGenerator: "LightProbeGenerator" has been removed. Use "LightProbeGrid" or "Scene.environment" instead.' ); // @deprecated r188

		return new LightProbe();

	}

	/**
	 * @async
	 * @deprecated since r188. Use {@link LightProbeGrid} or {@link Scene#environment} instead.
	 * @return {Promise<LightProbe>} A Promise that resolves with an empty light probe.
	 */
	static async fromCubeRenderTarget() {

		warnOnce( 'LightProbeGenerator: "LightProbeGenerator" has been removed. Use "LightProbeGrid" or "Scene.environment" instead.' ); // @deprecated r188

		return new LightProbe();

	}

}

export { LightProbeGenerator };
