import {
	LinearFilter,
	MathUtils,
	Matrix3,
	NearestFilter,
	PerspectiveCamera,
	RGBAFormat,
	ShaderMaterial,
	Vector3,
	WebGLRenderTarget
} from 'three';
import { FullScreenQuad } from '../postprocessing/Pass.js';
import { frameCorners } from '../utils/CameraUtils.js';

const _cameraL = /*@__PURE__*/ new PerspectiveCamera();
const _cameraR = /*@__PURE__*/ new PerspectiveCamera();

// Reusable vectors for screen corner calculations
const _eyeL = /*@__PURE__*/ new Vector3();
const _eyeR = /*@__PURE__*/ new Vector3();
const _screenCenter = /*@__PURE__*/ new Vector3();
const _screenBottomLeft = /*@__PURE__*/ new Vector3();
const _screenBottomRight = /*@__PURE__*/ new Vector3();
const _screenTopLeft = /*@__PURE__*/ new Vector3();
const _right = /*@__PURE__*/ new Vector3();
const _up = /*@__PURE__*/ new Vector3();
const _forward = /*@__PURE__*/ new Vector3();

/**
 * A class that creates an anaglyph effect using physically-correct
 * off-axis stereo projection.
 *
 * This implementation uses CameraUtils.frameCorners() to align stereo
 * camera frustums to a virtual screen plane, providing accurate depth
 * perception with zero parallax at the plane distance.
 *
 * Note that this class can only be used with {@link WebGLRenderer}.
 * When using {@link WebGPURenderer}, use {@link AnaglyphPassNode}.
 *
 * @three_import import { AnaglyphEffect } from 'three/addons/effects/AnaglyphEffect.js';
 */
class AnaglyphEffect {

	/**
	 * Constructs a new anaglyph effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {number} width - The width of the effect in physical pixels.
	 * @param {number} height - The height of the effect in physical pixels.
	 */
	constructor( renderer, width = 512, height = 512 ) {

		// Dubois matrices from https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.7.6968&rep=rep1&type=pdf#page=4

		this.colorMatrixLeft = new Matrix3().fromArray( [
			0.456100, - 0.0400822, - 0.0152161,
			0.500484, - 0.0378246, - 0.0205971,
			0.176381, - 0.0157589, - 0.00546856
		] );

		this.colorMatrixRight = new Matrix3().fromArray( [
			- 0.0434706, 0.378476, - 0.0721527,
			- 0.0879388, 0.73364, - 0.112961,
			- 0.00155529, - 0.0184503, 1.2264
		] );

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

		const _params = { minFilter: LinearFilter, magFilter: NearestFilter, format: RGBAFormat };

		const _renderTargetL = new WebGLRenderTarget( width, height, _params );
		const _renderTargetR = new WebGLRenderTarget( width, height, _params );

		_cameraL.layers.enable( 1 );
		_cameraR.layers.enable( 2 );

		const _material = new ShaderMaterial( {

			uniforms: {

				'mapLeft': { value: _renderTargetL.texture },
				'mapRight': { value: _renderTargetR.texture },

				'colorMatrixLeft': { value: this.colorMatrixLeft },
				'colorMatrixRight': { value: this.colorMatrixRight }

			},

			vertexShader: [

				'varying vec2 vUv;',

				'void main() {',

				'	vUv = vec2( uv.x, uv.y );',
				'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

				'}'

			].join( '\n' ),

			fragmentShader: [

				'uniform sampler2D mapLeft;',
				'uniform sampler2D mapRight;',
				'varying vec2 vUv;',

				'uniform mat3 colorMatrixLeft;',
				'uniform mat3 colorMatrixRight;',

				'void main() {',

				'	vec2 uv = vUv;',

				'	vec4 colorL = texture2D( mapLeft, uv );',
				'	vec4 colorR = texture2D( mapRight, uv );',

				'	vec3 color = clamp(',
				'			colorMatrixLeft * colorL.rgb +',
				'			colorMatrixRight * colorR.rgb, 0., 1. );',

				'	gl_FragColor = vec4(',
				'			color.r, color.g, color.b,',
				'			max( colorL.a, colorR.a ) );',

				'	#include <tonemapping_fragment>',
				'	#include <colorspace_fragment>',

				'}'

			].join( '\n' )

		} );

		const _quad = new FullScreenQuad( _material );

		/**
		 * Resizes the effect.
		 *
		 * @param {number} width - The width of the effect in logical pixels.
		 * @param {number} height - The height of the effect in logical pixels.
		 */
		this.setSize = function ( width, height ) {

			renderer.setSize( width, height );

			const pixelRatio = renderer.getPixelRatio();

			_renderTargetL.setSize( width * pixelRatio, height * pixelRatio );
			_renderTargetR.setSize( width * pixelRatio, height * pixelRatio );

		};

		/**
		 * When using this effect, this method should be called instead of the
		 * default {@link WebGLRenderer#render}.
		 *
		 * @param {Object3D} scene - The scene to render.
		 * @param {Camera} camera - The camera.
		 */
		this.render = function ( scene, camera ) {

			const currentRenderTarget = renderer.getRenderTarget();

			if ( scene.matrixWorldAutoUpdate === true ) scene.updateMatrixWorld();

			if ( camera.parent === null && camera.matrixWorldAutoUpdate === true ) camera.updateMatrixWorld();

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
			const halfHeight = this.planeDistance * Math.tan( MathUtils.DEG2RAD * camera.fov / 2 );
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
			_cameraL.position.copy( _eyeL );
			_cameraL.near = camera.near;
			_cameraL.far = camera.far;
			frameCorners( _cameraL, _screenBottomLeft, _screenBottomRight, _screenTopLeft, true );
			_cameraL.matrixWorld.compose( _cameraL.position, _cameraL.quaternion, _cameraL.scale );
			_cameraL.matrixWorldInverse.copy( _cameraL.matrixWorld ).invert();

			// Set up right eye camera
			_cameraR.position.copy( _eyeR );
			_cameraR.near = camera.near;
			_cameraR.far = camera.far;
			frameCorners( _cameraR, _screenBottomLeft, _screenBottomRight, _screenTopLeft, true );
			_cameraR.matrixWorld.compose( _cameraR.position, _cameraR.quaternion, _cameraR.scale );
			_cameraR.matrixWorldInverse.copy( _cameraR.matrixWorld ).invert();

			// Render left eye
			renderer.setRenderTarget( _renderTargetL );
			renderer.clear();
			renderer.render( scene, _cameraL );

			// Render right eye
			renderer.setRenderTarget( _renderTargetR );
			renderer.clear();
			renderer.render( scene, _cameraR );

			// Composite anaglyph
			renderer.setRenderTarget( null );
			_quad.render( renderer );

			renderer.setRenderTarget( currentRenderTarget );

		};

		/**
		 * Frees internal resources. This method should be called
		 * when the effect is no longer required.
		 */
		this.dispose = function () {

			_renderTargetL.dispose();
			_renderTargetR.dispose();

			_material.dispose();
			_quad.dispose();

		};

	}

}

export { AnaglyphEffect };
