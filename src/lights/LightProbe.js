import { SphericalHarmonics3 } from '../math/SphericalHarmonics3.js';
import { warnOnce } from '../utils.js';
import { Light } from './Light.js';

/**
 * Light probes are an alternative way of adding light to a 3D scene. Unlike
 * classical light sources (e.g. directional, point or spot lights), light
 * probes do not emit light. Instead they store information about light
 * passing through 3D space.
 *
 * Note: Light probes are no longer evaluated by `WebGLRenderer` or `WebGPURenderer`,
 * so adding one to a scene has no effect. Use {@link LightProbeGrid} or
 * {@link Scene#environment} instead.
 *
 * @deprecated since r188.
 * @augments Light
 */
class LightProbe extends Light {

	/**
	 * Constructs a new light probe.
	 *
	 * @deprecated since r188.
	 * @param {SphericalHarmonics3} [sh] - The spherical harmonics which represents encoded lighting information.
	 * @param {number} [intensity=1] - The light's strength/intensity.
	 */
	constructor( sh = new SphericalHarmonics3(), intensity = 1 ) {

		super( undefined, intensity );

		warnOnce( 'LightProbe: "LightProbe" has been removed. Use "LightProbeGrid" or "Scene.environment" instead.' ); // @deprecated r188

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLightProbe = true;

		this.type = 'LightProbe';

		/**
		 * A light probe uses spherical harmonics to encode lighting information.
		 *
		 * @type {SphericalHarmonics3}
		 */
		this.sh = sh;

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.sh.copy( source.sh );

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.sh = this.sh.toArray();

		return data;

	}

}

export { LightProbe };
