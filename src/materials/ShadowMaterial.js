import { Material } from './Material.js';
import { Color } from '../math/Color.js';

/**
 * This material can receive shadows, but otherwise is completely transparent.
 *
 * ```js
 * const geometry = new THREE.PlaneGeometry( 2000, 2000 );
 * geometry.rotateX( - Math.PI / 2 );
 *
 * const material = new THREE.ShadowMaterial();
 * material.opacity = 0.2;
 *
 * const plane = new THREE.Mesh( geometry, material );
 * plane.position.y = -200;
 * plane.receiveShadow = true;
 * scene.add( plane );
 * ```
 *
 * @augments Material
 */
class ShadowMaterial extends Material {

	/**
	 * Constructs a new shadow material.
	 *
	 * @param {Object} [parameters] - An object with one or more properties
	 * defining the material's appearance. Any property of the material
	 * (including any property from inherited materials) can be passed
	 * in here. Color values can be passed any type of value accepted
	 * by {@link Color#set}.
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
		this.isShadowMaterial = true;

		this.type = 'ShadowMaterial';

		/**
		 * Color of the material.
		 *
		 * @type {Color}
		 * @default (0,0,0)
		 */
		this.color = new Color( 0x000000 );

		/**
		 * Overwritten since shadow materials are transparent
		 * by default.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.transparent = true;

		/**
		 * Whether the material is affected by fog or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.fog = true;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.color.copy( source.color );

		this.fog = source.fog;

		return this;

	}

}

export { ShadowMaterial };
