import {
	Mesh,
	NodeMaterial,
	SphereGeometry
} from 'three/webgpu';
import { float, Fn, getShIrradianceAt, normalWorld, uniformArray, uniform, vec4 } from 'three/tsl';

/**
 * Renders a sphere to visualize a light probe in the scene.
 *
 * This helper can only be used with {@link WebGPURenderer}.
 * When using {@link WebGLRenderer}, import from `LightProbeHelper.js`.
 *
 * ```js
 * const helper = new LightProbeHelper( lightProbe );
 * scene.add( helper );
 * ```
 *
 * @private
 * @augments Mesh
 * @three_import import { LightProbeHelper } from 'three/addons/helpers/LightProbeHelperGPU.js';
 */
class LightProbeHelper extends Mesh {

	/**
	 * Constructs a new light probe helper.
	 *
	 * @param {LightProbe} lightProbe - The light probe to visualize.
	 * @param {number} [size=1] - The size of the helper.
	 */
	constructor( lightProbe, size = 1 ) {

		const sh = uniformArray( lightProbe.sh.coefficients );
		const intensity = uniform( lightProbe.intensity );

		const RECIPROCAL_PI = float( 1 / Math.PI );

		const fragmentNode = Fn( () => {

			const irradiance = getShIrradianceAt( normalWorld, sh );

			const outgoingLight = RECIPROCAL_PI.mul( irradiance ).mul( intensity );

			return vec4( outgoingLight, 1.0 );

		} )();

		const material = new NodeMaterial();
		material.fragmentNode = fragmentNode;

		const geometry = new SphereGeometry( 1, 32, 16 );

		super( geometry, material );

		/**
		 * The light probe to visualize.
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

		this._intensity = intensity;
		this._sh = sh;

		this.onBeforeRender();

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

	onBeforeRender() {

		this.position.copy( this.lightProbe.position );

		this.scale.set( 1, 1, 1 ).multiplyScalar( this.size );

		this._intensity.value = this.lightProbe.intensity;
		this._sh.array = this.lightProbe.sh.coefficients;

	}

}

export { LightProbeHelper };
