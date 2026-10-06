import { Object3D } from '../core/Object3D.js';
import { Euler } from '../math/Euler.js';

/**
 * Scenes allow you to set up what is to be rendered and where by three.js.
 * This is where you place 3D objects like meshes, lines or lights.
 *
 * @augments Object3D
 */
class Scene extends Object3D {

	/**
	 * Constructs a new scene.
	 */
	constructor() {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isScene = true;

		this.type = 'Scene';

		/**
		 * Defines the background of the scene. Valid inputs are:
		 *
		 * - A color for defining a uniform colored background.
		 * - A texture for defining a (flat) textured background.
		 * - Cube textures or equirectangular textures for defining a skybox.
		 *
		 * @type {?(Color|Texture)}
		 * @default null
		 */
		this.background = null;

		/**
		 * Sets the environment map for all physical materials in the scene. However,
		 * it's not possible to overwrite an existing texture assigned to the `envMap`
		 * material property.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.environment = null;

		/**
		 * A screen-space ambient occlusion map (for example the output of a GTAO pass),
		 * where the red channel is the visibility (1 = unoccluded). It is applied inside the
		 * material lighting like {@link MeshStandardMaterial#aoMap}: it scales indirect diffuse
		 * (and, for standard materials, indirect specular through specular occlusion) but never
		 * direct light. If a material also has an `aoMap`, the stronger occlusion of the two wins.
		 * Applies to standard, Lambert, Phong and toon materials.
		 *
		 * The texture is sampled at `gl_FragCoord / textureSize` so it must match the
		 * dimensions of the render target being drawn to. It is not cloned or serialized.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.ambientOcclusionMap = null;

		/**
		 * A fog instance defining the type of fog that affects everything
		 * rendered in the scene.
		 *
		 * @type {?(Fog|FogExp2)}
		 * @default null
		 */
		this.fog = null;

		/**
		 * Sets the blurriness of the background. Only influences environment maps
		 * assigned to {@link Scene#background}. Valid input is a float between `0`
		 * and `1`.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.backgroundBlurriness = 0;

		/**
		 * Attenuates the color of the background. Only applies to background textures.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.backgroundIntensity = 1;

		/**
		 * The rotation of the background in radians. Only influences environment maps
		 * assigned to {@link Scene#background}.
		 *
		 * @type {Euler}
		 * @default (0,0,0)
		 */
		this.backgroundRotation = new Euler();

		/**
		 * Attenuates the color of the environment. Only influences environment maps
		 * assigned to {@link Scene#environment}.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.environmentIntensity = 1;

		/**
		 * The rotation of the environment map in radians. Only influences physical materials
		 * in the scene when {@link Scene#environment} is used.
		 *
		 * @type {Euler}
		 * @default (0,0,0)
		 */
		this.environmentRotation = new Euler();

		/**
		 * Forces everything in the scene to be rendered with the defined material. It is possible
		 * to exclude materials from override by setting {@link Material#allowOverride} to `false`.
		 *
		 * @type {?Material}
		 * @default null
		 */
		this.overrideMaterial = null;

		if ( typeof __THREE_DEVTOOLS__ !== 'undefined' ) {

			__THREE_DEVTOOLS__.dispatchEvent( new CustomEvent( 'observe', { detail: this } ) );

		}

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.background = source.background !== null ? source.background.clone() : null;
		this.environment = source.environment !== null ? source.environment.clone() : null;
		this.ambientOcclusionMap = source.ambientOcclusionMap;
		this.fog = source.fog !== null ? source.fog.clone() : null;

		this.backgroundBlurriness = source.backgroundBlurriness;
		this.backgroundIntensity = source.backgroundIntensity;
		this.backgroundRotation.copy( source.backgroundRotation );

		this.environmentIntensity = source.environmentIntensity;
		this.environmentRotation.copy( source.environmentRotation );

		this.overrideMaterial = source.overrideMaterial !== null ? source.overrideMaterial.clone() : null;

		this.matrixAutoUpdate = source.matrixAutoUpdate;

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		if ( this.fog !== null ) data.object.fog = this.fog.toJSON();

		data.object.backgroundBlurriness = this.backgroundBlurriness;
		data.object.backgroundIntensity = this.backgroundIntensity;
		data.object.backgroundRotation = this.backgroundRotation.toArray();

		data.object.environmentIntensity = this.environmentIntensity;
		data.object.environmentRotation = this.environmentRotation.toArray();

		return data;

	}

}

export { Scene };
