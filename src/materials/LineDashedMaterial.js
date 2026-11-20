import { LineBasicMaterial } from './LineBasicMaterial.js';

/**
 * A material for rendering dashed line primitives.
 *
 * Materials define the appearance of renderable 3D objects.
 *
 * The material requires the `lineDistance` attribute, so call
 * {@link Line#computeLineDistances} on the line. Otherwise, it renders solid.
 *
 * ```js
 * const material = new THREE.LineDashedMaterial( {
 * 	color: 0xffffff,
 * 	scale: 1,
 * 	dashSize: 3,
 * 	gapSize: 1,
 * } );
 *
 * const line = new THREE.Line( geometry, material );
 * line.computeLineDistances();
 * ```
 *
 * @augments LineBasicMaterial
 */
class LineDashedMaterial extends LineBasicMaterial {

	/**
	 * Constructs a new line dashed material.
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
		this.isLineDashedMaterial = true;
		this.type = 'LineDashedMaterial';

		/**
		 * Scales the line distances before dashing. Values greater than `1`
		 * make dashes and gaps shorter.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.scale = 1;

		/**
		 * The length of each dash.
		 *
		 * @type {number}
		 * @default 3
		 */
		this.dashSize = 3;

		/**
		 * The size of the gap.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.gapSize = 1;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.scale = source.scale;
		this.dashSize = source.dashSize;
		this.gapSize = source.gapSize;

		return this;

	}

}

export { LineDashedMaterial };
