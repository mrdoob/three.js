import { Matrix3, NodeMaterial, Vector3 } from 'three/webgpu';
import { clamp, Fn, vec4, uv, uniform, max } from 'three/tsl';
import StereoCompositePassNode from './StereoCompositePassNode.js';
import { frameCorners } from '../../utils/CameraUtils.js';

const _eyeL = /*@__PURE__*/ new Vector3();
const _eyeR = /*@__PURE__*/ new Vector3();
const _screenBottomLeft = /*@__PURE__*/ new Vector3();
const _screenBottomRight = /*@__PURE__*/ new Vector3();
const _screenTopLeft = /*@__PURE__*/ new Vector3();
const _right = /*@__PURE__*/ new Vector3();
const _up = /*@__PURE__*/ new Vector3();
const _forward = /*@__PURE__*/ new Vector3();
const _screenCenter = /*@__PURE__*/ new Vector3();

/**
 * Anaglyph algorithm types.
 * @readonly
 * @enum {string}
 */
const AnaglyphAlgorithm = {
	TRUE: 'true',
	GREY: 'grey',
	COLOUR: 'colour',
	HALF_COLOUR: 'halfColour',
	DUBOIS: 'dubois',
	OPTIMISED: 'optimised',
	COMPROMISE: 'compromise'
};

/**
 * Anaglyph color modes.
 * @readonly
 * @enum {string}
 */
const AnaglyphColorMode = {
	RED_CYAN: 'redCyan',
	MAGENTA_CYAN: 'magentaCyan',
	MAGENTA_GREEN: 'magentaGreen'
};

/**
 * Standard luminance coefficients (ITU-R BT.601).
 * @private
 */
const LUMINANCE = { R: 0.299, G: 0.587, B: 0.114 };

/**
 * Creates an anaglyph matrix pair from left and right channel specifications.
 * This provides a more intuitive way to define how source RGB channels map to output RGB channels.
 *
 * Each specification object has keys 'r', 'g', 'b' for output channels.
 * Each output channel value is [rCoef, gCoef, bCoef] defining how much of each input channel contributes.
 *
 * @private
 * @param {Object} leftSpec - Specification for left eye contribution
 * @param {Object} rightSpec - Specification for right eye contribution
 * @returns {{left: number[], right: number[]}} Column-major arrays for Matrix3
 */
function createMatrixPair( leftSpec, rightSpec ) {

	// Convert row-major specification to column-major array for Matrix3
	// Matrix3.fromArray expects [col0row0, col0row1, col0row2, col1row0, col1row1, col1row2, col2row0, col2row1, col2row2]
	// Which represents:
	// | col0row0  col1row0  col2row0 |   | m[0]  m[3]  m[6] |
	// | col0row1  col1row1  col2row1 | = | m[1]  m[4]  m[7] |
	// | col0row2  col1row2  col2row2 |   | m[2]  m[5]  m[8] |

	function specToColumnMajor( spec ) {

		const r = spec.r || [ 0, 0, 0 ]; // Output red channel coefficients [fromR, fromG, fromB]
		const g = spec.g || [ 0, 0, 0 ]; // Output green channel coefficients
		const b = spec.b || [ 0, 0, 0 ]; // Output blue channel coefficients

		// Row-major matrix would be:
		// | r[0]  r[1]  r[2] |  (how input RGB maps to output R)
		// | g[0]  g[1]  g[2] |  (how input RGB maps to output G)
		// | b[0]  b[1]  b[2] |  (how input RGB maps to output B)

		// Column-major for Matrix3:
		return [
			r[ 0 ], g[ 0 ], b[ 0 ], // Column 0: coefficients for input R
			r[ 1 ], g[ 1 ], b[ 1 ], // Column 1: coefficients for input G
			r[ 2 ], g[ 2 ], b[ 2 ] // Column 2: coefficients for input B
		];

	}

	return {
		left: specToColumnMajor( leftSpec ),
		right: specToColumnMajor( rightSpec )
	};

}

/**
 * Shorthand for luminance coefficients.
 * @private
 */
const LUM = [ LUMINANCE.R, LUMINANCE.G, LUMINANCE.B ];

/**
 * Conversion matrices for different anaglyph algorithms.
 * Based on research from "Introducing a New Anaglyph Method: Compromise Anaglyph" by Jure Ahtik
 * and various other sources.
 *
 * Matrices are defined using createMatrixPair for clarity:
 * - Each spec object defines how input RGB maps to output RGB
 * - Keys 'r', 'g', 'b' represent output channels
 * - Values are [rCoef, gCoef, bCoef] for input channel contribution
 *
 * @private
 */
const ANAGLYPH_MATRICES = {

	// True Anaglyph - Red channel from left, luminance to cyan channel for right
	// Paper: Left=[R,0,0], Right=[0,0,Lum]
	[ AnaglyphAlgorithm.TRUE ]: {
		[ AnaglyphColorMode.RED_CYAN ]: createMatrixPair(
			{ r: [ 1, 0, 0 ] }, // Left: R -> outR
			{ g: LUM, b: LUM } // Right: Lum -> outG, Lum -> outB
		),
		[ AnaglyphColorMode.MAGENTA_CYAN ]: createMatrixPair(
			{ r: [ 1, 0, 0 ], b: [ 0, 0, 0.5 ] }, // Left: R -> outR, partial B -> outB
			{ g: LUM, b: [ 0, 0, 0.5 ] } // Right: Lum -> outG, partial B
		),
		[ AnaglyphColorMode.MAGENTA_GREEN ]: createMatrixPair(
			{ r: [ 1, 0, 0 ], b: LUM }, // Left: R -> outR, Lum -> outB
			{ g: LUM } // Right: Lum -> outG
		)
	},

	// Grey Anaglyph - Luminance-based, no color, minimal ghosting
	// Paper: Left=[Lum,0,0], Right=[0,0,Lum]
	[ AnaglyphAlgorithm.GREY ]: {
		[ AnaglyphColorMode.RED_CYAN ]: createMatrixPair(
			{ r: LUM }, // Left: Lum -> outR
			{ g: LUM, b: LUM } // Right: Lum -> outG, Lum -> outB
		),
		[ AnaglyphColorMode.MAGENTA_CYAN ]: createMatrixPair(
			{ r: LUM, b: [ 0.15, 0.29, 0.06 ] }, // Left: Lum -> outR, half-Lum -> outB
			{ g: LUM, b: [ 0.15, 0.29, 0.06 ] } // Right: Lum -> outG, half-Lum -> outB
		),
		[ AnaglyphColorMode.MAGENTA_GREEN ]: createMatrixPair(
			{ r: LUM, b: LUM }, // Left: Lum -> outR, Lum -> outB
			{ g: LUM } // Right: Lum -> outG
		)
	},

	// Colour Anaglyph - Full color, high retinal rivalry
	// Paper: Left=[R,0,0], Right=[0,G,B]
	[ AnaglyphAlgorithm.COLOUR ]: {
		[ AnaglyphColorMode.RED_CYAN ]: createMatrixPair(
			{ r: [ 1, 0, 0 ] }, // Left: R -> outR
			{ g: [ 0, 1, 0 ], b: [ 0, 0, 1 ] } // Right: G -> outG, B -> outB
		),
		[ AnaglyphColorMode.MAGENTA_CYAN ]: createMatrixPair(
			{ r: [ 1, 0, 0 ], b: [ 0, 0, 0.5 ] }, // Left: R -> outR, partial B -> outB
			{ g: [ 0, 1, 0 ], b: [ 0, 0, 0.5 ] } // Right: G -> outG, partial B -> outB
		),
		[ AnaglyphColorMode.MAGENTA_GREEN ]: createMatrixPair(
			{ r: [ 1, 0, 0 ], b: [ 0, 0, 1 ] }, // Left: R -> outR, B -> outB
			{ g: [ 0, 1, 0 ] } // Right: G -> outG
		)
	},

	// Half-Colour Anaglyph - Luminance for left red, full color for right cyan
	// Paper: Left=[Lum,0,0], Right=[0,G,B]
	[ AnaglyphAlgorithm.HALF_COLOUR ]: {
		[ AnaglyphColorMode.RED_CYAN ]: createMatrixPair(
			{ r: LUM }, // Left: Lum -> outR
			{ g: [ 0, 1, 0 ], b: [ 0, 0, 1 ] } // Right: G -> outG, B -> outB
		),
		[ AnaglyphColorMode.MAGENTA_CYAN ]: createMatrixPair(
			{ r: LUM, b: [ 0.15, 0.29, 0.06 ] }, // Left: Lum -> outR, half-Lum -> outB
			{ g: [ 0, 1, 0 ], b: [ 0.15, 0.29, 0.06 ] } // Right: G -> outG, half-Lum -> outB
		),
		[ AnaglyphColorMode.MAGENTA_GREEN ]: createMatrixPair(
			{ r: LUM, b: LUM }, // Left: Lum -> outR, Lum -> outB
			{ g: [ 0, 1, 0 ] } // Right: G -> outG
		)
	},

	// Dubois Anaglyph - Least-squares optimized for specific glasses
	// From https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.7.6968&rep=rep1&type=pdf
	[ AnaglyphAlgorithm.DUBOIS ]: {
		[ AnaglyphColorMode.RED_CYAN ]: createMatrixPair(
			{
				r: [ 0.4561, 0.500484, 0.176381 ],
				g: [ - 0.0400822, - 0.0378246, - 0.0157589 ],
				b: [ - 0.0152161, - 0.0205971, - 0.00546856 ]
			},
			{
				r: [ - 0.0434706, - 0.0879388, - 0.00155529 ],
				g: [ 0.378476, 0.73364, - 0.0184503 ],
				b: [ - 0.0721527, - 0.112961, 1.2264 ]
			}
		),
		[ AnaglyphColorMode.MAGENTA_CYAN ]: createMatrixPair(
			{
				r: [ 0.4561, 0.500484, 0.176381 ],
				g: [ - 0.0400822, - 0.0378246, - 0.0157589 ],
				b: [ 0.088, 0.088, - 0.003 ]
			},
			{
				r: [ - 0.0434706, - 0.0879388, - 0.00155529 ],
				g: [ 0.378476, 0.73364, - 0.0184503 ],
				b: [ 0.088, 0.088, 0.613 ]
			}
		),
		[ AnaglyphColorMode.MAGENTA_GREEN ]: createMatrixPair(
			{
				r: [ 0.4561, 0.500484, 0.176381 ],
				b: [ - 0.0434706, - 0.0879388, - 0.00155529 ]
			},
			{
				g: [ 0.378476 + 0.4561, 0.73364 + 0.500484, - 0.0184503 + 0.176381 ]
			}
		)
	},

	// Optimised Anaglyph - Improved color with reduced retinal rivalry
	// Paper: Left=[0,0.7G+0.3B,0,0], Right=[0,G,B]
	[ AnaglyphAlgorithm.OPTIMISED ]: {
		[ AnaglyphColorMode.RED_CYAN ]: createMatrixPair(
			{ r: [ 0, 0.7, 0.3 ] }, // Left: 0.7G+0.3B -> outR
			{ g: [ 0, 1, 0 ], b: [ 0, 0, 1 ] } // Right: G -> outG, B -> outB
		),
		[ AnaglyphColorMode.MAGENTA_CYAN ]: createMatrixPair(
			{ r: [ 0, 0.7, 0.3 ], b: [ 0, 0, 0.5 ] }, // Left: 0.7G+0.3B -> outR, partial B
			{ g: [ 0, 1, 0 ], b: [ 0, 0, 0.5 ] } // Right: G -> outG, partial B
		),
		[ AnaglyphColorMode.MAGENTA_GREEN ]: createMatrixPair(
			{ r: [ 0, 0.7, 0.3 ], b: [ 0, 0, 1 ] }, // Left: 0.7G+0.3B -> outR, B -> outB
			{ g: [ 0, 1, 0 ] } // Right: G -> outG
		)
	},

	// Compromise Anaglyph - Best balance of color and stereo effect
	// From Ahtik, J., "Techniques of Rendering Anaglyphs for Use in Art"
	// Paper matrix [8]: Left=[0.439R+0.447G+0.148B, 0, 0], Right=[0, 0.095R+0.934G+0.005B, 0.018R+0.028G+1.057B]
	[ AnaglyphAlgorithm.COMPROMISE ]: {
		[ AnaglyphColorMode.RED_CYAN ]: createMatrixPair(
			{ r: [ 0.439, 0.447, 0.148 ] }, // Left: weighted RGB -> outR
			{
				g: [ 0.095, 0.934, 0.005 ], // Right: weighted RGB -> outG
				b: [ 0.018, 0.028, 1.057 ] // Right: weighted RGB -> outB
			}
		),
		[ AnaglyphColorMode.MAGENTA_CYAN ]: createMatrixPair(
			{
				r: [ 0.439, 0.447, 0.148 ],
				b: [ 0.009, 0.014, 0.074 ] // Partial blue from left
			},
			{
				g: [ 0.095, 0.934, 0.005 ],
				b: [ 0.009, 0.014, 0.528 ] // Partial blue from right
			}
		),
		[ AnaglyphColorMode.MAGENTA_GREEN ]: createMatrixPair(
			{
				r: [ 0.439, 0.447, 0.148 ],
				b: [ 0.018, 0.028, 1.057 ]
			},
			{
				g: [ 0.095 + 0.439, 0.934 + 0.447, 0.005 + 0.148 ]
			}
		)
	}
};

/**
 * A render pass node that creates an anaglyph effect using physically-correct
 * off-axis stereo projection.
 *
 * This implementation uses CameraUtils.frameCorners() to align stereo
 * camera frustums to a virtual screen plane, providing accurate depth
 * perception with zero parallax at the plane distance.
 *
 * @augments StereoCompositePassNode
 * @three_import import { anaglyphPass, AnaglyphAlgorithm, AnaglyphColorMode } from 'three/addons/tsl/display/AnaglyphPassNode.js';
 */
class AnaglyphPassNode extends StereoCompositePassNode {

	static get type() {

		return 'AnaglyphPassNode';

	}

	/**
	 * Constructs a new anaglyph pass node.
	 *
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to render the scene with.
	 */
	constructor( scene, camera ) {

		super( scene, camera );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isAnaglyphPassNode = true;

		/**
		 * The interpupillary distance (eye separation) in world units.
		 * Typical human IPD is 0.064 meters (64mm).
		 *
		 * @type {number}
		 * @default 0.064
		 */
		this.eyeSep = 0.064;

		/**
		 * The distance in world units from the viewer to the virtual
		 * screen plane where zero parallax (screen depth) occurs.
		 * Objects at this distance appear at the screen surface.
		 * Objects closer appear in front of the screen (negative parallax).
		 * Objects further appear behind the screen (positive parallax).
		 *
		 * The screen dimensions are derived from the camera's FOV and aspect ratio
		 * at this distance, ensuring the stereo view matches the camera's field of view.
		 *
		 * @type {number}
		 * @default 0.5
		 */
		this.planeDistance = 0.5;

		/**
		 * The current anaglyph algorithm.
		 *
		 * @private
		 * @type {string}
		 * @default 'dubois'
		 */
		this._algorithm = AnaglyphAlgorithm.DUBOIS;

		/**
		 * The current color mode.
		 *
		 * @private
		 * @type {string}
		 * @default 'redCyan'
		 */
		this._colorMode = AnaglyphColorMode.RED_CYAN;

		/**
		 * Color matrix node for the left eye.
		 *
		 * @private
		 * @type {UniformNode<mat3>}
		 */
		this._colorMatrixLeft = uniform( new Matrix3() );

		/**
		 * Color matrix node for the right eye.
		 *
		 * @private
		 * @type {UniformNode<mat3>}
		 */
		this._colorMatrixRight = uniform( new Matrix3() );

		// Initialize with default matrices
		this._updateMatrices();

	}

	/**
	 * Gets the current anaglyph algorithm.
	 *
	 * @type {string}
	 */
	get algorithm() {

		return this._algorithm;

	}

	/**
	 * Sets the anaglyph algorithm.
	 *
	 * @type {string}
	 */
	set algorithm( value ) {

		if ( this._algorithm !== value ) {

			this._algorithm = value;
			this._updateMatrices();

		}

	}

	/**
	 * Gets the current color mode.
	 *
	 * @type {string}
	 */
	get colorMode() {

		return this._colorMode;

	}

	/**
	 * Sets the color mode.
	 *
	 * @type {string}
	 */
	set colorMode( value ) {

		if ( this._colorMode !== value ) {

			this._colorMode = value;
			this._updateMatrices();

		}

	}

	/**
	 * Updates the color matrices based on current algorithm and color mode.
	 *
	 * @private
	 */
	_updateMatrices() {

		const matrices = ANAGLYPH_MATRICES[ this._algorithm ][ this._colorMode ];

		this._colorMatrixLeft.value.fromArray( matrices.left );
		this._colorMatrixRight.value.fromArray( matrices.right );

	}

	/**
	 * Updates the internal stereo camera using frameCorners for
	 * physically-correct off-axis projection.
	 *
	 * @param {number} coordinateSystem - The current coordinate system.
	 */
	updateStereoCamera( coordinateSystem ) {

		const { stereo, camera } = this;

		stereo.cameraL.coordinateSystem = coordinateSystem;
		stereo.cameraR.coordinateSystem = coordinateSystem;

		// Get the camera's local coordinate axes from its world matrix
		camera.matrixWorld.extractBasis( _right, _up, _forward );
		_right.normalize();
		_up.normalize();
		_forward.normalize();

		// Calculate eye positions
		const halfSep = this.eyeSep / 2;
		_eyeL.copy( camera.position ).addScaledVector( _right, - halfSep );
		_eyeR.copy( camera.position ).addScaledVector( _right, halfSep );

		// Calculate screen center (at planeDistance in front of the camera center)
		_screenCenter.copy( camera.position ).addScaledVector( _forward, - this.planeDistance );

		// Calculate screen dimensions from camera FOV and aspect ratio
		const DEG2RAD = Math.PI / 180;
		const halfHeight = this.planeDistance * Math.tan( DEG2RAD * camera.fov / 2 );
		const halfWidth = halfHeight * camera.aspect;

		// Calculate screen corners
		_screenBottomLeft.copy( _screenCenter )
			.addScaledVector( _right, - halfWidth )
			.addScaledVector( _up, - halfHeight );

		_screenBottomRight.copy( _screenCenter )
			.addScaledVector( _right, halfWidth )
			.addScaledVector( _up, - halfHeight );

		_screenTopLeft.copy( _screenCenter )
			.addScaledVector( _right, - halfWidth )
			.addScaledVector( _up, halfHeight );

		// Set up left eye camera
		stereo.cameraL.position.copy( _eyeL );
		stereo.cameraL.near = camera.near;
		stereo.cameraL.far = camera.far;
		frameCorners( stereo.cameraL, _screenBottomLeft, _screenBottomRight, _screenTopLeft, true );
		stereo.cameraL.matrixWorld.compose( stereo.cameraL.position, stereo.cameraL.quaternion, stereo.cameraL.scale );
		stereo.cameraL.matrixWorldInverse.copy( stereo.cameraL.matrixWorld ).invert();

		// Set up right eye camera
		stereo.cameraR.position.copy( _eyeR );
		stereo.cameraR.near = camera.near;
		stereo.cameraR.far = camera.far;
		frameCorners( stereo.cameraR, _screenBottomLeft, _screenBottomRight, _screenTopLeft, true );
		stereo.cameraR.matrixWorld.compose( stereo.cameraR.position, stereo.cameraR.quaternion, stereo.cameraR.scale );
		stereo.cameraR.matrixWorldInverse.copy( stereo.cameraR.matrixWorld ).invert();

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PassTextureNode}
	 */
	setup( builder ) {

		const uvNode = uv();

		const anaglyph = Fn( () => {

			const colorL = this._mapLeft.sample( uvNode );
			const colorR = this._mapRight.sample( uvNode );

			const color = clamp( this._colorMatrixLeft.mul( colorL.rgb ).add( this._colorMatrixRight.mul( colorR.rgb ) ) );

			return vec4( color.rgb, max( colorL.a, colorR.a ) );

		} );

		const material = this._material || ( this._material = new NodeMaterial() );
		material.fragmentNode = anaglyph().context( builder.getSharedContext() );
		material.name = 'Anaglyph';
		material.needsUpdate = true;

		return super.setup( builder );

	}

}

export default AnaglyphPassNode;

export { AnaglyphAlgorithm, AnaglyphColorMode };

/**
 * TSL function for creating an anaglyph pass node.
 *
 * @tsl
 * @function
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to render the scene with.
 * @returns {AnaglyphPassNode}
 */
export const anaglyphPass = ( scene, camera ) => new AnaglyphPassNode( scene, camera );
