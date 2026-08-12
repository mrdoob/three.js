import { Light } from './Light.js';
import { SunLightShadow } from './SunLightShadow.js';
import { Vector3 } from '../math/Vector3.js';

const _direction = /*@__PURE__*/ new Vector3();
const _zAxis = /*@__PURE__*/ new Vector3( 0, 0, 1 );

/**
 * A sun-like light that gets emitted in a specific direction, with rays that
 * are all parallel, and casts cascaded shadow maps via {@link SunLightShadow},
 * suited for lighting large scenes.
 *
 * Unlike {@link DirectionalLight}, the light has no target: it shines along
 * its local negative z-axis, like a camera, and points straight down by
 * default. Use {@link SunLight#setFromSphericalAngles} to orient it from sky
 * coordinates.
 *
 * ```js
 * const sun = new SunLight( 0xfff2e3, 3 );
 * sun.castShadow = true;
 * sun.setFromSphericalAngles( Math.PI / 4, Math.PI / 2 );
 * scene.add( sun );
 * ```
 *
 * This light is only supported by `WebGLRenderer`. When using `WebGPURenderer`,
 * use {@link DirectionalLight} with `CSMShadowNode` instead.
 *
 * @augments Light
 */
class SunLight extends Light {

	/**
	 * Constructs a new sun light.
	 *
	 * @param {(number|Color|string)} [color=0xffffff] - The light's color.
	 * @param {number} [intensity=1] - The light's strength/intensity.
	 */
	constructor( color, intensity ) {

		super( color, intensity );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSunLight = true;

		this.type = 'SunLight';

		/**
		 * The light's shadow configuration.
		 *
		 * @type {SunLightShadow}
		 */
		this.shadow = new SunLightShadow();

		this.setFromSphericalAngles( Math.PI / 2, 0 );
		this.updateMatrix();

	}

	/**
	 * Orients the light from sky coordinates.
	 *
	 * @param {number} elevation - The angle above the horizon, in radians.
	 * @param {number} azimuth - The angle around the up axis, in radians.
	 * @return {SunLight} A reference to this light.
	 */
	setFromSphericalAngles( elevation, azimuth ) {

		_direction.setFromSphericalCoords( 1, Math.PI / 2 - elevation, azimuth );

		this.quaternion.setFromUnitVectors( _zAxis, _direction );

		return this;

	}

	dispose() {

		super.dispose();

		this.shadow.dispose();

	}

	copy( source ) {

		super.copy( source );

		this.shadow = source.shadow.clone();

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.shadow = this.shadow.toJSON();

		return data;

	}

}

export { SunLight };
