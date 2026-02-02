import { Matrix3, NodeMaterial, Vector3 } from 'three/webgpu';
import { clamp, nodeObject, Fn, vec4, uv, uniform, max } from 'three/tsl';
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
 * A render pass node that creates an anaglyph effect using physically-correct
 * off-axis stereo projection.
 *
 * This implementation uses CameraUtils.frameCorners() to align stereo
 * camera frustums to a virtual screen plane, providing accurate depth
 * perception with zero parallax at the screen distance.
 *
 * @augments StereoCompositePassNode
 * @three_import import { anaglyphPass } from 'three/addons/tsl/display/AnaglyphPassNode.js';
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
		 * The distance from the viewer to the virtual screen plane
		 * where zero parallax (screen depth) occurs.
		 * Objects at this distance appear at the screen surface.
		 * Objects closer appear in front of the screen (negative parallax).
		 * Objects further appear behind the screen (positive parallax).
		 *
		 * @type {number}
		 * @default 0.5
		 */
		this.screenDistance = 0.5;

		/**
		 * The physical width of the virtual screen in world units.
		 * This affects the field of view and depth perception.
		 *
		 * @type {number}
		 * @default 0.5
		 */
		this.screenWidth = 0.5;

		// Dubois matrices from https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.7.6968&rep=rep1&type=pdf#page=4

		/**
		 * Color matrix node for the left eye.
		 *
		 * @private
		 * @type {UniformNode<mat3>}
		 */
		this._colorMatrixLeft = uniform( new Matrix3().fromArray( [
			0.456100, - 0.0400822, - 0.0152161,
			0.500484, - 0.0378246, - 0.0205971,
			0.176381, - 0.0157589, - 0.00546856
		] ) );

		/**
		 * Color matrix node for the right eye.
		 *
		 * @private
		 * @type {UniformNode<mat3>}
		 */
		this._colorMatrixRight = uniform( new Matrix3().fromArray( [
			- 0.0434706, 0.378476, - 0.0721527,
			- 0.0879388, 0.73364, - 0.112961,
			- 0.00155529, - 0.0184503, 1.2264
		] ) );

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
		const e = camera.matrixWorld.elements;
		_right.set( e[ 0 ], e[ 1 ], e[ 2 ] ).normalize();
		_up.set( e[ 4 ], e[ 5 ], e[ 6 ] ).normalize();
		_forward.set( - e[ 8 ], - e[ 9 ], - e[ 10 ] ).normalize();

		// Calculate eye positions
		const halfSep = this.eyeSep / 2;
		_eyeL.copy( camera.position ).addScaledVector( _right, - halfSep );
		_eyeR.copy( camera.position ).addScaledVector( _right, halfSep );

		// Calculate screen center (at screenDistance in front of the camera center)
		_screenCenter.copy( _forward ).multiplyScalar( this.screenDistance ).add( camera.position );

		// Calculate screen dimensions based on render target aspect ratio
		const aspect = this._renderTargetL.width / this._renderTargetL.height;
		const halfWidth = this.screenWidth / 2;
		const halfHeight = halfWidth / aspect;

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
		stereo.cameraL.matrixWorld.copy( camera.matrixWorld );
		stereo.cameraL.matrixWorld.setPosition( _eyeL );
		stereo.cameraL.matrixWorldInverse.copy( stereo.cameraL.matrixWorld ).invert();

		// Set up right eye camera
		stereo.cameraR.position.copy( _eyeR );
		stereo.cameraR.near = camera.near;
		stereo.cameraR.far = camera.far;
		frameCorners( stereo.cameraR, _screenBottomLeft, _screenBottomRight, _screenTopLeft, true );
		stereo.cameraR.matrixWorld.copy( camera.matrixWorld );
		stereo.cameraR.matrixWorld.setPosition( _eyeR );
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

/**
 * TSL function for creating an anaglyph pass node.
 *
 * @tsl
 * @function
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to render the scene with.
 * @returns {AnaglyphPassNode}
 */
export const anaglyphPass = ( scene, camera ) => nodeObject( new AnaglyphPassNode( scene, camera ) );
