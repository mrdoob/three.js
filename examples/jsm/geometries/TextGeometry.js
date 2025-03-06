import {
	ExtrudeGeometry
} from 'three';

/**
 * A class for generating text as a single geometry. It is constructed by providing a string of text, and a set of
 * parameters consisting of a loaded font and extrude settings.
 *
 * See the {@link FontLoader} page for additional details.
 *
 * `TextGeometry` uses [typeface.json]{@link http://gero3.github.io/facetype.js/} generated fonts.
 * Some existing fonts can be found located in `/examples/fonts`.
 *
 * ```js
 * const loader = new FontLoader();
 * const font = await loader.loadAsync( 'fonts/helvetiker_regular.typeface.json' );
 * const geometry = new TextGeometry( 'Hello three.js!', {
 * 	font: font,
 * 	size: 80,
 * 	depth: 5,
 * 	curveSegments: 12
 * } );
 * ```
 *
 * @augments ExtrudeGeometry
 */
class TextGeometry extends ExtrudeGeometry {

	/**
	 * Constructs a new text geometry.
	 *
	 * @param {string} text - The text that should be transformed into a geometry.
	 * @param {TextGeometry~Options} [parameters] - The text settings.
	 */
	constructor( text, parameters = {} ) {

		const font = parameters.font;

		if ( font === undefined ) {

			super(); // generate default extrude geometry

		} else {

			const shapes = font.generateShapes( text, parameters.size );

			// defaults

			if ( parameters.depth === undefined ) parameters.depth = 50;
			if ( parameters.bevelThickness === undefined ) parameters.bevelThickness = 10;
			if ( parameters.bevelSize === undefined ) parameters.bevelSize = 8;
			if ( parameters.bevelEnabled === undefined ) parameters.bevelEnabled = false;

			super( shapes, parameters );

		}

		this.type = 'TextGeometry';

	}

}

/**
 * Represents the `options` type of the geometry's constructor.
 *
 * @typedef {Object} TextGeometry~Options
 * @property {Font} [font] - The font.
 * @property {number} [size=100] - The text size.
 * @property {number} [depth=50] - Depth to extrude the shape.
 * @property {number} [curveSegments=12] - Number of points on the curves.
 * @property {number} [steps=1] - Number of points used for subdividing segments along the depth of the extruded spline.
 * @property {boolean} [bevelEnabled=false] - Whether to beveling to the shape or not.
 * @property {number} [bevelThickness=10] - How deep into the original shape the bevel goes.
 * @property {number} [bevelSize=8] - Distance from the shape outline that the bevel extends.
 * @property {number} [bevelOffset=0] - Distance from the shape outline that the bevel starts.
 * @property {number} [bevelSegments=3] - Number of bevel layers.
 * @property {?Curve} [extrudePath=null] - A 3D spline path along which the shape should be extruded. Bevels not supported for path extrusion.
 * @property {Object} [UVGenerator] - An object that provides UV generator functions for custom UV generation.
 **/

export { TextGeometry };
