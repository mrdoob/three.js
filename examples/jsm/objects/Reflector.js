import {
	Mesh,
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderTarget,
	HalfFloatType,
	colorSet,
	mat4Copy,
	mat4Create,
	mat4ExtractRotation,
	mat4Multiply,
	mat4Set,
	planeApplyMatrix4,
	planeCreate,
	planeSetFromNormalAndCoplanarPoint,
	vec3Add,
	vec3ApplyMatrix4,
	vec3Copy,
	vec3Create,
	vec3Dot,
	vec3Negate,
	vec3Reflect,
	vec3Set,
	vec3SetFromMatrixPosition,
	vec3SubVectors,
	vec4Create,
	vec4Dot,
	vec4MultiplyScalar,
	vec4Set
} from 'three';

/**
 * Can be used to create a flat, reflective surface like a mirror.
 *
 * Note that this class can only be used with {@link WebGLRenderer}.
 * When using {@link WebGPURenderer}, use {@link ReflectorNode}.
 *
 * ```js
 * const geometry = new THREE.PlaneGeometry( 100, 100 );
 *
 * const reflector = new Reflector( geometry, {
 * 	clipBias: 0.003,
 * 	textureWidth: window.innerWidth * window.devicePixelRatio,
 * 	textureHeight: window.innerHeight * window.devicePixelRatio,
 * 	color: 0xc1cbcb
 * } );
 *
 * scene.add( reflector );
 * ```
 *
 * @augments Mesh
 * @three_import import { Reflector } from 'three/addons/objects/Reflector.js';
 */
class Reflector extends Mesh {

	/**
	 * Constructs a new reflector.
	 *
	 * @param {BufferGeometry} geometry - The reflector's geometry.
	 * @param {Reflector~Options} [options] - The configuration options.
	 */
	constructor( geometry, options = {} ) {

		super( geometry );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isReflector = true;

		this.type = 'Reflector';

		/**
		 * Whether to force an update, no matter if the reflector
		 * is in view or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.forceUpdate = false;

		/**
		 * Weak map for managing reflection cameras.
		 *
		 * @private
		 * @type {WeakMap<Camera, Camera>}
		 */
		this._reflectionCameras = new WeakMap();

		const scope = this;

		const color = colorSet( options.color !== undefined ? options.color : 0x7F7F7F );
		const textureWidth = options.textureWidth || 512;
		const textureHeight = options.textureHeight || 512;
		const clipBias = options.clipBias || 0;
		const shader = options.shader || Reflector.ReflectorShader;
		const multisample = ( options.multisample !== undefined ) ? options.multisample : 4;

		//

		const reflectorPlane = planeCreate();
		const normal = vec3Create();
		const reflectorWorldPosition = vec3Create();
		const cameraWorldPosition = vec3Create();
		const rotationMatrix = mat4Create();
		const lookAtPosition = vec3Set( vec3Create(), 0, 0, - 1 );
		const clipPlane = vec4Create();

		const view = vec3Create();
		const target = vec3Create();
		const q = vec4Create();

		const textureMatrix = mat4Create();

		const renderTarget = new WebGLRenderTarget( textureWidth, textureHeight, { samples: multisample, type: HalfFloatType } );

		const material = new ShaderMaterial( {
			name: ( shader.name !== undefined ) ? shader.name : 'unspecified',
			uniforms: UniformsUtils.clone( shader.uniforms ),
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader
		} );

		material.uniforms[ 'tDiffuse' ].value = renderTarget.texture;
		material.uniforms[ 'color' ].value = color;
		material.uniforms[ 'textureMatrix' ].value = textureMatrix;

		this.material = material;

		this.onBeforeRender = function ( renderer, scene, camera ) {

			const reflectionCamera = this.getReflectionCamera( camera );

			vec3SetFromMatrixPosition( scope.matrixWorld, reflectorWorldPosition );
			vec3SetFromMatrixPosition( camera.matrixWorld, cameraWorldPosition );

			mat4ExtractRotation( scope.matrixWorld, rotationMatrix );

			vec3Set( normal, 0, 0, 1 );
			vec3ApplyMatrix4( normal, rotationMatrix, normal );

			vec3SubVectors( reflectorWorldPosition, cameraWorldPosition, view );

			// Avoid rendering when reflector is facing away unless forcing an update
			const isFacingAway = vec3Dot( view, normal ) > 0;

			if ( isFacingAway === true && this.forceUpdate === false ) return;

			vec3Reflect( view, normal, view );
			vec3Negate( view, view );
			vec3Add( view, reflectorWorldPosition, view );

			mat4ExtractRotation( camera.matrixWorld, rotationMatrix );

			vec3Set( lookAtPosition, 0, 0, - 1 );
			vec3ApplyMatrix4( lookAtPosition, rotationMatrix, lookAtPosition );
			vec3Add( lookAtPosition, cameraWorldPosition, lookAtPosition );

			vec3SubVectors( reflectorWorldPosition, lookAtPosition, target );
			vec3Reflect( target, normal, target );
			vec3Negate( target, target );
			vec3Add( target, reflectorWorldPosition, target );

			vec3Copy( view, reflectionCamera.position );
			vec3Set( reflectionCamera.up, 0, 1, 0 );
			vec3ApplyMatrix4( reflectionCamera.up, rotationMatrix, reflectionCamera.up );
			vec3Reflect( reflectionCamera.up, normal, reflectionCamera.up );
			reflectionCamera.lookAt( target );

			reflectionCamera.far = camera.far; // Used in WebGLBackground

			reflectionCamera.updateMatrixWorld();
			mat4Copy( camera.projectionMatrix, reflectionCamera.projectionMatrix );

			// Update the texture matrix
			mat4Set(
				textureMatrix,
				0.5, 0.0, 0.0, 0.5,
				0.0, 0.5, 0.0, 0.5,
				0.0, 0.0, 0.5, 0.5,
				0.0, 0.0, 0.0, 1.0
			);
			mat4Multiply( textureMatrix, reflectionCamera.projectionMatrix, textureMatrix );
			mat4Multiply( textureMatrix, reflectionCamera.matrixWorldInverse, textureMatrix );
			mat4Multiply( textureMatrix, scope.matrixWorld, textureMatrix );

			// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
			// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
			planeSetFromNormalAndCoplanarPoint( normal, reflectorWorldPosition, reflectorPlane );
			planeApplyMatrix4( reflectorPlane, reflectionCamera.matrixWorldInverse, undefined, reflectorPlane );

			vec4Set( reflectorPlane.normal.x, reflectorPlane.normal.y, reflectorPlane.normal.z, reflectorPlane.constant, clipPlane );

			const projectionMatrix = reflectionCamera.projectionMatrix;

			if ( reflectionCamera.isOrthographicCamera ) {

				q.x = ( Math.sign( clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
				q.y = ( Math.sign( clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
				q.z = - camera.far; // actual view-space z at the far plane, no normalization needed
				q.w = 1.0; // w_clip = 1 in orthographic (no perspective division)

			} else {

				q.x = ( Math.sign( clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
				q.y = ( Math.sign( clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
				q.z = - 1.0;
				q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

			}

			// Calculate the scaled plane vector
			vec4MultiplyScalar( clipPlane, 2.0 / vec4Dot( clipPlane, q ), clipPlane );

			// Replacing the third row of the projection matrix
			projectionMatrix.elements[ 2 ] = clipPlane.x;
			projectionMatrix.elements[ 6 ] = clipPlane.y;

			if ( reflectionCamera.isOrthographicCamera ) {

				// For orthographic cameras, w_clip = 1 always (no perspective division),
				// so the -1 near-plane offset must go into the constant term (elements[14])
				// rather than the z coefficient (elements[10]).
				projectionMatrix.elements[ 10 ] = clipPlane.z - clipBias;
				projectionMatrix.elements[ 14 ] = clipPlane.w - 1.0;

			} else {

				projectionMatrix.elements[ 10 ] = clipPlane.z + 1.0 - clipBias;
				projectionMatrix.elements[ 14 ] = clipPlane.w;

			}

			// Render
			scope.visible = false;

			const currentRenderTarget = renderer.getRenderTarget();

			const currentXrEnabled = renderer.xr.enabled;
			const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

			renderer.xr.enabled = false; // Avoid camera modification
			renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

			renderer.setRenderTarget( renderTarget );

			renderer.state.buffers.depth.setMask( true ); // make sure the depth buffer is writable so it can be properly cleared, see #18897

			if ( renderer.autoClear === false ) renderer.clear();
			renderer.render( scene, reflectionCamera );

			renderer.xr.enabled = currentXrEnabled;
			renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

			renderer.setRenderTarget( currentRenderTarget );

			// Restore viewport

			const viewport = camera.viewport;

			if ( viewport !== undefined ) {

				renderer.state.viewport( viewport );

			}

			scope.visible = true;
			this.forceUpdate = false;

		};

		/**
		 * Returns the reflector's internal render target.
		 *
		 * @return {WebGLRenderTarget} The internal render target
		 */
		this.getRenderTarget = function () {

			return renderTarget;

		};

		/**
		 * Frees the GPU-related resources allocated by this instance. Call this
		 * method whenever this instance is no longer used in your app.
		 */
		this.dispose = function () {

			renderTarget.dispose();
			scope.material.dispose();

		};

		/**
		 * Returns a reflection camera for the given camera. The reflection camera is used to
		 * render the scene from the reflector's view so correct reflections can be produced.
		 *
		 * @param {Camera} camera - The scene's camera.
		 * @return {Camera} The corresponding reflection camera.
		 */
		this.getReflectionCamera = function ( camera ) {

			let reflectionCamera = this._reflectionCameras.get( camera );

			if ( reflectionCamera === undefined ) {

				reflectionCamera = camera.clone();

				this._reflectionCameras.set( camera, reflectionCamera );

			}

			return reflectionCamera;

		};

	}

}

Reflector.ReflectorShader = {

	name: 'ReflectorShader',

	uniforms: {

		'color': {
			value: null
		},

		'tDiffuse': {
			value: null
		},

		'textureMatrix': {
			value: null
		}

	},

	vertexShader: /* glsl */`
		uniform mat4 textureMatrix;
		varying vec4 vUv;

		#include <common>
		#include <logdepthbuf_pars_vertex>

		void main() {

			vUv = textureMatrix * vec4( position, 1.0 );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			#include <logdepthbuf_vertex>

		}`,

	fragmentShader: /* glsl */`
		uniform vec3 color;
		uniform sampler2D tDiffuse;
		varying vec4 vUv;

		#include <logdepthbuf_pars_fragment>

		float blendOverlay( float base, float blend ) {

			return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );

		}

		vec3 blendOverlay( vec3 base, vec3 blend ) {

			return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );

		}

		void main() {

			#include <logdepthbuf_fragment>

			vec4 base = texture2DProj( tDiffuse, vUv );
			gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`
};

/**
 * Constructor options of `Reflector`.
 *
 * @typedef {Object} Reflector~Options
 * @property {number|Color|string} [color=0x7F7F7F] - The reflector's color.
 * @property {number} [textureWidth=512] - The texture width. A higher value results in more clear reflections but is also more expensive.
 * @property {number} [textureHeight=512] - The texture height. A higher value results in more clear reflections but is also more expensive.
 * @property {number} [clipBias=0] - The clip bias.
 * @property {Object} [shader] - Can be used to pass in a custom shader that defines how the reflective view is projected onto the reflector's geometry.
 * @property {number} [multisample=4] - How many samples to use for MSAA. `0` disables MSAA.
 **/

export { Reflector };
