import { Material } from './Material.js';
import { Color } from '../math/Color.js';

/**
 * A material for rendering line primitives.
 *
 * Materials define the appearance of renderable 3D objects.
 *
 * ```js
 * const material = new THREE.LineBasicMaterial( { color: 0xffffff } );
 * ```
 *
 * @augments Material
 */
class LineBasicMaterial extends Material {

	/**
	 * Constructs a new line basic material.
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
		this.isLineBasicMaterial = true;

		this.type = 'LineBasicMaterial';

		/**
		 * Color of the material.
		 *
		 * @type {Color}
		 * @default (1,1,1)
		 */
		this.color = new Color( 0xffffff );

		/**
		 * Sets the color of the lines using data from a texture. The texture map
		 * color is modulated by the diffuse `color`.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.map = null;

		/**
		 * Controls line thickness or lines.
		 *
		 * Can only be used with {@link SVGRenderer}. WebGL and WebGPU
		 * ignore this setting and always render line primitives with a
		 * width of one pixel.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.linewidth = 1;

		/**
		 * Defines appearance of line ends.
		 *
		 * Can only be used with {@link SVGRenderer}.
		 *
		 * @type {('butt'|'round'|'square')}
		 * @default 'round'
		 */
		this.linecap = 'round';

		/**
		 * Defines appearance of line joints.
		 *
		 * Can only be used with {@link SVGRenderer}.
		 *
		 * @type {('round'|'bevel'|'miter')}
		 * @default 'round'
		 */
		this.linejoin = 'round';

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

		this.map = source.map;

		this.linewidth = source.linewidth;
		this.linecap = source.linecap;
		this.linejoin = source.linejoin;

		this.fog = source.fog;

		return this;

	}

}

export { LineBasicMaterial };
