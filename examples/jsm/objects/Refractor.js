import {
	Mesh,
	PerspectiveCamera,
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderTarget,
	HalfFloatType,
	colorSet,
	mat4Copy,
	mat4Create,
	mat4Decompose,
	mat4ExtractRotation,
	mat4Invert,
	mat4Multiply,
	mat4Set,
	planeApplyMatrix4,
	planeCopy,
	planeCreate,
	planeSetFromNormalAndCoplanarPoint,
	quatCreate,
	vec3ApplyMatrix4,
	vec3ApplyQuaternion,
	vec3Create,
	vec3Dot,
	vec3Negate,
	vec3Normalize,
	vec3Set,
	vec3SetFromMatrixPosition,
	vec3SubVectors,
	vec4Create,
	vec4Dot,
	vec4MultiplyScalar,
	vec4Set
} from 'three';

/**
 * Can be used to create a flat, refractive surface like for special
 * windows or water effects.
 *
 * Note that this class can only be used with {@link WebGLRenderer}.
 * When using {@link WebGPURenderer}, use {@link viewportSharedTexture}.
 *
 * ```js
 * const geometry = new THREE.PlaneGeometry( 100, 100 );
 *
 * const refractor = new Refractor( refractorGeometry, {
 * 	color: 0xcbcbcb,
 * 	textureWidth: 1024,
 * 	textureHeight: 1024
 * } );
 *
 * scene.add( refractor );
 * ```
 *
 * @augments Mesh
 * @three_import import { Refractor } from 'three/addons/objects/Refractor.js';
 */
class Refractor extends Mesh {

	/**
	 * Constructs a new refractor.
	 *
	 * @param {BufferGeometry} geometry - The refractor's geometry.
	 * @param {Refractor~Options} [options] - The configuration options.
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
		this.isRefractor = true;

		this.type = 'Refractor';

		/**
		 * The reflector's virtual camera.
		 *
		 * @type {PerspectiveCamera}
		 */
		this.camera = new PerspectiveCamera();

		const scope = this;

		const color = colorSet( options.color !== undefined ? options.color : 0x7F7F7F );
		const textureWidth = options.textureWidth || 512;
		const textureHeight = options.textureHeight || 512;
		const clipBias = options.clipBias || 0;
		const shader = options.shader || Refractor.RefractorShader;
		const multisample = ( options.multisample !== undefined ) ? options.multisample : 4;

		//

		const virtualCamera = this.camera;
		virtualCamera.matrixAutoUpdate = false;
		virtualCamera.userData.refractor = true;

		//

		const refractorPlane = planeCreate();
		const textureMatrix = mat4Create();

		// render target

		const renderTarget = new WebGLRenderTarget( textureWidth, textureHeight, { samples: multisample, type: HalfFloatType } );

		// material

		this.material = new ShaderMaterial( {
			name: ( shader.name !== undefined ) ? shader.name : 'unspecified',
			uniforms: UniformsUtils.clone( shader.uniforms ),
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			transparent: true // ensures, refractors are drawn from farthest to closest
		} );

		this.material.uniforms[ 'color' ].value = color;
		this.material.uniforms[ 'tDiffuse' ].value = renderTarget.texture;
		this.material.uniforms[ 'textureMatrix' ].value = textureMatrix;

		// functions

		const visible = ( function () {

			const refractorWorldPosition = vec3Create();
			const cameraWorldPosition = vec3Create();
			const rotationMatrix = mat4Create();

			const view = vec3Create();
			const normal = vec3Create();

			return function visible( camera ) {

				vec3SetFromMatrixPosition( scope.matrixWorld, refractorWorldPosition );
				vec3SetFromMatrixPosition( camera.matrixWorld, cameraWorldPosition );

				vec3SubVectors( refractorWorldPosition, cameraWorldPosition, view );

				mat4ExtractRotation( scope.matrixWorld, rotationMatrix );

				vec3Set( normal, 0, 0, 1 );
				vec3ApplyMatrix4( normal, rotationMatrix, normal );

				return vec3Dot( view, normal ) < 0;

			};

		} )();

		const updateRefractorPlane = ( function () {

			const normal = vec3Create();
			const position = vec3Create();
			const quaternion = quatCreate();
			const scale = vec3Create();

			return function updateRefractorPlane() {

				mat4Decompose( scope.matrixWorld, position, quaternion, scale );
				vec3Set( normal, 0, 0, 1 );
				vec3ApplyQuaternion( normal, quaternion, normal );
				vec3Normalize( normal, normal );

				// flip the normal because we want to cull everything above the plane

				vec3Negate( normal, normal );

				planeSetFromNormalAndCoplanarPoint( normal, position, refractorPlane );

			};

		} )();

		const updateVirtualCamera = ( function () {

			const clipPlane = planeCreate();
			const clipVector = vec4Create();
			const q = vec4Create();

			return function updateVirtualCamera( camera ) {

				mat4Copy( camera.matrixWorld, virtualCamera.matrixWorld );
				mat4Copy( virtualCamera.matrixWorld, virtualCamera.matrixWorldInverse );
				mat4Invert( virtualCamera.matrixWorldInverse, virtualCamera.matrixWorldInverse );
				mat4Copy( camera.projectionMatrix, virtualCamera.projectionMatrix );
				virtualCamera.far = camera.far; // used in WebGLBackground

				// The following code creates an oblique view frustum for clipping.
				// see: Lengyel, Eric. “Oblique View Frustum Depth Projection and Clipping”.
				// Journal of Game Development, Vol. 1, No. 2 (2005), Charles River Media, pp. 5–16

				planeCopy( refractorPlane, clipPlane );
				planeApplyMatrix4( clipPlane, virtualCamera.matrixWorldInverse, undefined, clipPlane );

				vec4Set( clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.constant, clipVector );

				// calculate the clip-space corner point opposite the clipping plane and
				// transform it into camera space by multiplying it by the inverse of the projection matrix

				const projectionMatrix = virtualCamera.projectionMatrix;

				q.x = ( Math.sign( clipVector.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
				q.y = ( Math.sign( clipVector.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
				q.z = - 1.0;
				q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

				// calculate the scaled plane vector

				vec4MultiplyScalar( clipVector, 2.0 / vec4Dot( clipVector, q ), clipVector );

				// replacing the third row of the projection matrix

				projectionMatrix.elements[ 2 ] = clipVector.x;
				projectionMatrix.elements[ 6 ] = clipVector.y;
				projectionMatrix.elements[ 10 ] = clipVector.z + 1.0 - clipBias;
				projectionMatrix.elements[ 14 ] = clipVector.w;

			};

		} )();

		// This will update the texture matrix that is used for projective texture mapping in the shader.
		// see: http://developer.download.nvidia.com/assets/gamedev/docs/projective_texture_mapping.pdf

		function updateTextureMatrix( camera ) {

			// this matrix does range mapping to [ 0, 1 ]

			mat4Set(
				textureMatrix,
				0.5, 0.0, 0.0, 0.5,
				0.0, 0.5, 0.0, 0.5,
				0.0, 0.0, 0.5, 0.5,
				0.0, 0.0, 0.0, 1.0
			);

			// we use "Object Linear Texgen", so we need to multiply the texture matrix T
			// (matrix above) with the projection and view matrix of the virtual camera
			// and the model matrix of the refractor

			mat4Multiply( textureMatrix, camera.projectionMatrix, textureMatrix );
			mat4Multiply( textureMatrix, camera.matrixWorldInverse, textureMatrix );
			mat4Multiply( textureMatrix, scope.matrixWorld, textureMatrix );

		}

		//

		function render( renderer, scene, camera ) {

			scope.visible = false;

			const currentRenderTarget = renderer.getRenderTarget();
			const currentXrEnabled = renderer.xr.enabled;
			const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

			renderer.xr.enabled = false; // avoid camera modification
			renderer.shadowMap.autoUpdate = false; // avoid re-computing shadows

			renderer.setRenderTarget( renderTarget );
			if ( renderer.autoClear === false ) renderer.clear();
			renderer.render( scene, virtualCamera );

			renderer.xr.enabled = currentXrEnabled;
			renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
			renderer.setRenderTarget( currentRenderTarget );

			// restore viewport

			const viewport = camera.viewport;

			if ( viewport !== undefined ) {

				renderer.state.viewport( viewport );

			}

			scope.visible = true;

		}

		//

		this.onBeforeRender = function ( renderer, scene, camera ) {

			// ensure refractors are rendered only once per frame

			if ( camera.userData.refractor === true ) return;

			// avoid rendering when the refractor is viewed from behind

			if ( ! visible( camera ) === true ) return;

			// update

			updateRefractorPlane();

			updateTextureMatrix( camera );

			updateVirtualCamera( camera );

			render( renderer, scene, camera );

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

	}

}

Refractor.RefractorShader = {

	name: 'RefractorShader',

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

		void main() {

			vUv = textureMatrix * vec4( position, 1.0 );
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform vec3 color;
		uniform sampler2D tDiffuse;

		varying vec4 vUv;

		float blendOverlay( float base, float blend ) {

			return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );

		}

		vec3 blendOverlay( vec3 base, vec3 blend ) {

			return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );

		}

		void main() {

			vec4 base = texture2DProj( tDiffuse, vUv );
			gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`

};

/**
 * Constructor options of `Refractor`.
 *
 * @typedef {Object} Refractor~Options
 * @property {number|Color|string} [color=0x7F7F7F] - The refractor's color.
 * @property {number} [textureWidth=512] - The texture width. A higher value results in more clear refractions but is also more expensive.
 * @property {number} [textureHeight=512] - The texture height. A higher value results in more clear refractions but is also more expensive.
 * @property {number} [clipBias=0] - The clip bias.
 * @property {Object} [shader] - Can be used to pass in a custom shader that defines how the refractive view is projected onto the reflector's geometry.
 * @property {number} [multisample=4] - How many samples to use for MSAA. `0` disables MSAA.
 **/

export { Refractor };
