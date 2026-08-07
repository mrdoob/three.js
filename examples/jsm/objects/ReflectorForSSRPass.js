import {
	Mesh,
	PerspectiveCamera,
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderTarget,
	DepthTexture,
	UnsignedShortType,
	NearestFilter,
	HalfFloatType,
	colorSet,
	mat4Copy,
	mat4Create,
	mat4ExtractRotation,
	mat4Multiply,
	mat4Set,
	planeSet,
	vec2Create,
	vec3Add,
	vec3ApplyMatrix4,
	vec3Copy,
	vec3Create,
	vec3Dot,
	vec3Negate,
	vec3Normalize,
	vec3Reflect,
	vec3Set,
	vec3SetFromMatrixPosition,
	vec3SubVectors
} from 'three';

/**
 * A special version of {@link Reflector} for usage with {@link SSRPass}.
 *
 * @augments Mesh
 * @three_import import { ReflectorForSSRPass } from 'three/addons/objects/ReflectorForSSRPass.js';
 */
class ReflectorForSSRPass extends Mesh {

	/**
	 * Constructs a new reflector.
	 *
	 * @param {BufferGeometry} geometry - The reflector's geometry.
	 * @param {ReflectorForSSRPass~Options} [options] - The configuration options.
	 */
	constructor( geometry, options = {} ) {

		super( geometry );

		this.isReflectorForSSRPass = true;

		this.type = 'ReflectorForSSRPass';

		const scope = this;

		const color = colorSet( options.color !== undefined ? options.color : 0x7F7F7F );
		const textureWidth = options.textureWidth || 512;
		const textureHeight = options.textureHeight || 512;
		const clipBias = options.clipBias || 0;
		const shader = options.shader || ReflectorForSSRPass.ReflectorShader;
		const useDepthTexture = options.useDepthTexture === true;
		const yAxis = vec3Set( vec3Create(), 0, 1, 0 );
		const vecTemp0 = vec3Create();
		const vecTemp1 = vec3Create();

		//

		scope.needsUpdate = false;
		scope.maxDistance = ReflectorForSSRPass.ReflectorShader.uniforms.maxDistance.value;
		scope.opacity = ReflectorForSSRPass.ReflectorShader.uniforms.opacity.value;
		scope.color = color;
		scope.resolution = options.resolution || vec2Create( window.innerWidth, window.innerHeight );


		scope._distanceAttenuation = ReflectorForSSRPass.ReflectorShader.defines.DISTANCE_ATTENUATION;
		Object.defineProperty( scope, 'distanceAttenuation', {
			get() {

				return scope._distanceAttenuation;

			},
			set( val ) {

				if ( scope._distanceAttenuation === val ) return;
				scope._distanceAttenuation = val;
				scope.material.defines.DISTANCE_ATTENUATION = val;
				scope.material.needsUpdate = true;

			}
		} );

		scope._fresnel = ReflectorForSSRPass.ReflectorShader.defines.FRESNEL;
		Object.defineProperty( scope, 'fresnel', {
			get() {

				return scope._fresnel;

			},
			set( val ) {

				if ( scope._fresnel === val ) return;
				scope._fresnel = val;
				scope.material.defines.FRESNEL = val;
				scope.material.needsUpdate = true;

			}
		} );

		const normal = vec3Create();
		const reflectorWorldPosition = vec3Create();
		const cameraWorldPosition = vec3Create();
		const rotationMatrix = mat4Create();
		const lookAtPosition = vec3Set( vec3Create(), 0, 0, - 1 );

		const view = vec3Create();
		const target = vec3Create();

		const textureMatrix = mat4Create();
		const virtualCamera = new PerspectiveCamera();

		let depthTexture;

		if ( useDepthTexture ) {

			depthTexture = new DepthTexture();
			depthTexture.type = UnsignedShortType;
			depthTexture.minFilter = NearestFilter;
			depthTexture.magFilter = NearestFilter;

		}

		const parameters = {
			depthTexture: useDepthTexture ? depthTexture : null,
			type: HalfFloatType
		};

		const renderTarget = new WebGLRenderTarget( textureWidth, textureHeight, parameters );

		const material = new ShaderMaterial( {
			name: ( shader.name !== undefined ) ? shader.name : 'unspecified',
			transparent: useDepthTexture,
			defines: Object.assign( {}, ReflectorForSSRPass.ReflectorShader.defines, {
				useDepthTexture
			} ),
			uniforms: UniformsUtils.clone( shader.uniforms ),
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader
		} );

		material.uniforms[ 'tDiffuse' ].value = renderTarget.texture;
		material.uniforms[ 'color' ].value = scope.color;
		material.uniforms[ 'textureMatrix' ].value = textureMatrix;
		if ( useDepthTexture ) {

			material.uniforms[ 'tDepth' ].value = renderTarget.depthTexture;

		}

		this.material = material;

		const globalPlane = planeSet( { x: 0, y: 1, z: 0 }, clipBias );
		const globalPlanes = [ globalPlane ];

		this.doRender = function ( renderer, scene, camera ) {

			material.uniforms[ 'maxDistance' ].value = scope.maxDistance;
			material.uniforms[ 'color' ].value = scope.color;
			material.uniforms[ 'opacity' ].value = scope.opacity;

			vec3Copy( camera.position, vecTemp0 );
			vec3Normalize( vecTemp0, vecTemp0 );
			vec3Copy( vecTemp0, vecTemp1 );
			vec3Reflect( vecTemp1, yAxis, vecTemp1 );
			material.uniforms[ 'fresnelCoe' ].value = ( vec3Dot( vecTemp0, vecTemp1 ) + 1. ) / 2.; // TODO: Also need to use glsl viewPosition and viewNormal per pixel.

			vec3SetFromMatrixPosition( scope.matrixWorld, reflectorWorldPosition );
			vec3SetFromMatrixPosition( camera.matrixWorld, cameraWorldPosition );

			mat4ExtractRotation( scope.matrixWorld, rotationMatrix );

			vec3Set( normal, 0, 0, 1 );
			vec3ApplyMatrix4( normal, rotationMatrix, normal );

			vec3SubVectors( reflectorWorldPosition, cameraWorldPosition, view );

			// Avoid rendering when reflector is facing away

			if ( vec3Dot( view, normal ) > 0 ) return;

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

			vec3Copy( view, virtualCamera.position );
			vec3Set( virtualCamera.up, 0, 1, 0 );
			vec3ApplyMatrix4( virtualCamera.up, rotationMatrix, virtualCamera.up );
			vec3Reflect( virtualCamera.up, normal, virtualCamera.up );
			virtualCamera.lookAt( target );

			virtualCamera.far = camera.far; // Used in WebGLBackground

			virtualCamera.updateMatrixWorld();
			mat4Copy( camera.projectionMatrix, virtualCamera.projectionMatrix );

			material.uniforms[ 'virtualCameraNear' ].value = camera.near;
			material.uniforms[ 'virtualCameraFar' ].value = camera.far;
			material.uniforms[ 'virtualCameraMatrixWorld' ].value = virtualCamera.matrixWorld;
			material.uniforms[ 'virtualCameraProjectionMatrix' ].value = camera.projectionMatrix;
			material.uniforms[ 'virtualCameraProjectionMatrixInverse' ].value = camera.projectionMatrixInverse;
			material.uniforms[ 'resolution' ].value = scope.resolution;

			// Update the texture matrix
			mat4Set(
				textureMatrix,
				0.5, 0.0, 0.0, 0.5,
				0.0, 0.5, 0.0, 0.5,
				0.0, 0.0, 0.5, 0.5,
				0.0, 0.0, 0.0, 1.0
			);
			mat4Multiply( textureMatrix, virtualCamera.projectionMatrix, textureMatrix );
			mat4Multiply( textureMatrix, virtualCamera.matrixWorldInverse, textureMatrix );
			mat4Multiply( textureMatrix, scope.matrixWorld, textureMatrix );

			// scope.visible = false;

			const currentRenderTarget = renderer.getRenderTarget();

			const currentXrEnabled = renderer.xr.enabled;
			const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
			const currentClippingPlanes = renderer.clippingPlanes;

			renderer.xr.enabled = false; // Avoid camera modification
			renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows
			renderer.clippingPlanes = globalPlanes;

			renderer.setRenderTarget( renderTarget );

			renderer.state.buffers.depth.setMask( true ); // make sure the depth buffer is writable so it can be properly cleared, see #18897

			if ( renderer.autoClear === false ) renderer.clear();
			renderer.render( scene, virtualCamera );

			renderer.xr.enabled = currentXrEnabled;
			renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
			renderer.clippingPlanes = currentClippingPlanes;

			renderer.setRenderTarget( currentRenderTarget );

			// Restore viewport

			const viewport = camera.viewport;

			if ( viewport !== undefined ) {

				renderer.state.viewport( viewport );

			}

			// scope.visible = true;

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

ReflectorForSSRPass.ReflectorShader = {

	name: 'ReflectorShader',

	defines: {
		DISTANCE_ATTENUATION: true,
		FRESNEL: true,
	},

	uniforms: {

		color: { value: null },
		tDiffuse: { value: null },
		tDepth: { value: null },
		textureMatrix: { value: mat4Create() },
		maxDistance: { value: 180 },
		opacity: { value: 0.5 },
		fresnelCoe: { value: null },
		virtualCameraNear: { value: null },
		virtualCameraFar: { value: null },
		virtualCameraProjectionMatrix: { value: mat4Create() },
		virtualCameraMatrixWorld: { value: mat4Create() },
		virtualCameraProjectionMatrixInverse: { value: mat4Create() },
		resolution: { value: vec2Create() },

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
		uniform sampler2D tDepth;
		uniform float maxDistance;
		uniform float opacity;
		uniform float fresnelCoe;
		uniform float virtualCameraNear;
		uniform float virtualCameraFar;
		uniform mat4 virtualCameraProjectionMatrix;
		uniform mat4 virtualCameraProjectionMatrixInverse;
		uniform mat4 virtualCameraMatrixWorld;
		uniform vec2 resolution;
		varying vec4 vUv;
		#include <packing>
		float blendOverlay( float base, float blend ) {
			return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );
		}
		vec3 blendOverlay( vec3 base, vec3 blend ) {
			return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );
		}
		float getDepth( const in vec2 uv ) {
			return texture2D( tDepth, uv ).x;
		}
		float getViewZ( const in float depth ) {
			return perspectiveDepthToViewZ( depth, virtualCameraNear, virtualCameraFar );
		}
		vec3 getViewPosition( const in vec2 uv, const in float depth/*clip space*/, const in float clipW ) {
			vec4 clipPosition = vec4( ( vec3( uv, depth ) - 0.5 ) * 2.0, 1.0 );//ndc
			clipPosition *= clipW; //clip
			return ( virtualCameraProjectionMatrixInverse * clipPosition ).xyz;//view
		}
		void main() {
			vec4 base = texture2DProj( tDiffuse, vUv );
			#ifdef useDepthTexture
				vec2 uv=(gl_FragCoord.xy-.5)/resolution.xy;
				uv.x=1.-uv.x;
				float depth = texture2DProj( tDepth, vUv ).r;
				float viewZ = getViewZ( depth );
				float clipW = virtualCameraProjectionMatrix[2][3] * viewZ+virtualCameraProjectionMatrix[3][3];
				vec3 viewPosition=getViewPosition( uv, depth, clipW );
				vec3 worldPosition=(virtualCameraMatrixWorld*vec4(viewPosition,1)).xyz;
				if(worldPosition.y>maxDistance) discard;
				float op=opacity;
				#ifdef DISTANCE_ATTENUATION
					float ratio=1.-(worldPosition.y/maxDistance);
					float attenuation=ratio*ratio;
					op=opacity*attenuation;
				#endif
				#ifdef FRESNEL
					op*=fresnelCoe;
				#endif
				gl_FragColor = vec4( blendOverlay( base.rgb, color ), op );
			#else
				gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );
			#endif
		}
	`,
};

/**
 * Constructor options of `ReflectorForSSRPass`.
 *
 * @typedef {Object} ReflectorForSSRPass~Options
 * @property {number|Color|string} [color=0x7F7F7F] - The reflector's color.
 * @property {number} [textureWidth=512] - The texture width. A higher value results in more clear reflections but is also more expensive.
 * @property {number} [textureHeight=512] - The texture height. A higher value results in more clear reflections but is also more expensive.
 * @property {number} [clipBias=0] - The clip bias.
 * @property {Object} [shader] - Can be used to pass in a custom shader that defines how the reflective view is projected onto the reflector's geometry.
 * @property {boolean} [useDepthTexture=true] - Whether to store depth values in a texture or not.
 * @property {Vector2} [resolution] - Resolution for the Reflector Pass.
 **/

export { ReflectorForSSRPass };
