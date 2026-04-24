import { SphericalHarmonics3 } from '../math/SphericalHarmonics3.js';
import { Light } from './Light.js';

/**
 * Light probes are an alternative way of adding light to a 3D scene. Unlike
 * classical light sources (e.g. directional, point or spot lights), light
 * probes do not emit light. Instead they store information about light
 * passing through 3D space. During rendering, the light that hits a 3D
 * object is approximated by using the data from the light probe.
 *
 * Light probes are usually created from (radiance) environment maps. The
 * class {@link LightProbeGenerator} can be used to create light probes from
 * cube textures or render targets. However, light estimation data could also
 * be provided in other forms e.g. by WebXR. This enables the rendering of
 * augmented reality content that reacts to real world lighting.
 *
 * The current probe implementation in three.js supports so-called diffuse
 * light probes. This type of light probe is functionally equivalent to an
 * irradiance environment map.
 *
 * @augments Light
 */
class LightProbe extends Light {

	/**
	 * Constructs a new light probe.
	 *
	 * @param {SphericalHarmonics3} sh - The spherical harmonics which represents encoded lighting information.
	 * @param {number} [intensity=1] - The light's strength/intensity.
	 */
	constructor( sh = new SphericalHarmonics3(), intensity = 1 ) {

		super( undefined, intensity );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLightProbe = true;

		/**
		 * A light probe uses spherical harmonics to encode lighting information.
		 *
		 * @type {SphericalHarmonics3}
		 */
		this.sh = sh;

	}

	copy( source ) {

		super.copy( source );

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
