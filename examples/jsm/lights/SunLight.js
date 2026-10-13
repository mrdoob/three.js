import { Light, Object3D } from 'three';
import { SunLightShadow } from './SunLightShadow.js';

/**
 * A sun-like light that gets emitted in a specific direction, with rays that
 * are all parallel, and casts Cascaded Shadow Maps (CSM) via {@link SunLightShadow},
 * suited for lighting large scenes.
 *
 * Please be aware that `SunLight` is not a good fit for small, bounded scenes like
 * dioramas, single rooms or model-viewers. Small scenes don't benefit from
 * CSM because most content will be located in the last shadow cascade with the
 * lowest shadow map resolution.
 *
 * Unlike {@link DirectionalLight}, the light has no target: like
 * {@link HemisphereLight}, its direction is defined by its position. The
 * light shines from its position towards the origin and points straight
 * down by default.
 *
 * ```js
 * const sun = new SunLight( 0xfff2e3, 3 );
 * sun.position.set( 1, 1, 1 );
 * sun.castShadow = true;
 * scene.add( sun );
 * ```
 *
 * When used with `WebGPURenderer`, the light must be assigned its node
 * implementation first:
 * ```js
 * SunLight.registerNode( SunLightNode );
 * ```
 *
 * @augments Light
 * @three_import import { SunLight } from 'three/addons/lights/SunLight.js';
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

		this.position.copy( Object3D.DEFAULT_UP );
		this.updateMatrix();

		/**
		 * This property holds the light's shadow configuration.
		 *
		 * @type {SunLightShadow}
		 */
		this.shadow = new SunLightShadow();

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
