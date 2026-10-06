import {
	Matrix4,
	Vector2
} from 'three';

/**
 * Shaders for {@link SSR2Pass}.
 *
 * @module SSR2Shader
 * @three_import import * as SSR2Shader from 'three/addons/shaders/SSR2Shader.js';
 */

const vertexShader = /* glsl */`

	varying vec2 vUv;

	void main() {

		vUv = uv;

		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

	}

`;

/**
 * Traces a mirror reflection ray per pixel through the depth buffer. The result is the
 * incoming radiance along the reflection direction: the lit scene color at the hit,
 * faded to the environment map (sampled at the surface roughness) on a miss or near
 * the screen border.
 *
 * @constant
 * @type {ShaderMaterial~Shader}
 */
const SSR2TraceShader = {

	name: 'SSR2TraceShader',

	defines: {
		MAX_STEP: 0,
		USE_ENV: false
	},

	uniforms: {

		'tColor': { value: null },
		'tDepth': { value: null },
		'tNormal': { value: null },
		'tMaterial': { value: null },
		'envMap': { value: null },
		'envMaxLod': { value: 0 },
		'envIntensity': { value: 1 },
		'cameraNear': { value: 0.1 },
		'cameraFar': { value: 1000 },
		'resolution': { value: new Vector2() },
		'cameraProjectionMatrix': { value: new Matrix4() },
		'cameraInverseProjectionMatrix': { value: new Matrix4() },
		'cameraWorldMatrix': { value: new Matrix4() },
		'maxDistance': { value: 10 },
		'thickness': { value: 0.1 },
		'maxRoughness': { value: 0.5 },
		'screenEdgeFade': { value: 0.2 }

	},

	vertexShader,

	fragmentShader: /* glsl */`
		precision highp float;
		precision highp sampler2D;
		varying vec2 vUv;
		uniform sampler2D tColor;
		uniform sampler2D tDepth;
		uniform sampler2D tNormal;
		uniform sampler2D tMaterial;
		#ifdef USE_ENV
			uniform samplerCube envMap;
		#endif
		uniform float envMaxLod;
		uniform float envIntensity;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform vec2 resolution;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraInverseProjectionMatrix;
		uniform mat4 cameraWorldMatrix;
		uniform float maxDistance;
		uniform float thickness;
		uniform float maxRoughness;
		uniform float screenEdgeFade;
		#include <packing>

		vec3 getViewPosition( const in vec2 uv, const in float depth ) {
			vec4 clip = vec4( vec3( uv, depth ) * 2.0 - 1.0, 1.0 );
			vec4 view = cameraInverseProjectionMatrix * clip;
			return view.xyz / view.w;
		}

		float pointToLineDistance( vec3 x0, vec3 x1, vec3 x2 ) {
			return length( cross( x0 - x1, x0 - x2 ) ) / length( x2 - x1 );
		}

		void main() {

			float depth = texture2D( tDepth, vUv ).x;

			if ( depth >= 1.0 ) {

				gl_FragColor = vec4( 0.0 );
				return;

			}

			vec3 viewPosition = getViewPosition( vUv, depth );
			vec3 viewNormal = normalize( texture2D( tNormal, vUv ).xyz * 2.0 - 1.0 );
			float roughness = texture2D( tMaterial, vUv ).r;

			vec3 viewIncidentDir = normalize( viewPosition );
			vec3 viewReflectDir = reflect( viewIncidentDir, viewNormal );

			vec3 envColor = vec3( 0.0 );

			#ifdef USE_ENV
				float envMip = envMaxLod * roughness * ( 2.0 - roughness );
				envColor = textureLod( envMap, ( cameraWorldMatrix * vec4( viewReflectDir, 0.0 ) ).xyz, envMip ).rgb * envIntensity;
			#endif

			vec3 result = envColor;

			if ( roughness <= maxRoughness ) {

				float maxReflectRayLen = maxDistance / max( dot( - viewIncidentDir, viewNormal ), 0.05 );
				vec3 d1viewPosition = viewPosition + viewReflectDir * maxReflectRayLen;

				// clip the ray at the near plane
				if ( d1viewPosition.z > - cameraNear ) {
					float t = ( - cameraNear - viewPosition.z ) / viewReflectDir.z;
					d1viewPosition = viewPosition + viewReflectDir * t;
				}

				vec4 d1clip = cameraProjectionMatrix * vec4( d1viewPosition, 1.0 );
				vec2 d0 = gl_FragCoord.xy;
				vec2 d1 = ( d1clip.xy / d1clip.w * 0.5 + 0.5 ) * resolution;

				float totalStep = max( abs( d1.x - d0.x ), abs( d1.y - d0.y ) );
				vec2 span = ( d1 - d0 ) / totalStep;
				float sStep = 1.0 / totalStep;
				float s = sStep;

				for ( float i = 1.0; i < float( MAX_STEP ); i ++ ) {

					if ( i >= totalStep ) break;

					vec2 xy = d0 + i * span;
					if ( xy.x < 0.0 || xy.x > resolution.x || xy.y < 0.0 || xy.y > resolution.y ) break;

					vec2 uv = xy / resolution;
					float d = texture2D( tDepth, uv ).x;

					if ( d < 1.0 ) {

						vec3 vP = getViewPosition( uv, d );

						// perspective-correct ray depth at this step
						float recipZ = 1.0 / viewPosition.z;
						float rayZ = 1.0 / ( recipZ + s * ( 1.0 / d1viewPosition.z - recipZ ) );

						if ( rayZ <= vP.z ) {

							float away = pointToLineDistance( vP, viewPosition, d1viewPosition );
							vec3 vPNeighbor = getViewPosition( ( xy + vec2( 1.0, 0.0 ) ) / resolution, d );
							float tk = max( ( vPNeighbor.x - vP.x ) * 3.0, thickness );

							if ( away <= tk ) {

								vec3 hitNormal = normalize( texture2D( tNormal, uv ).xyz * 2.0 - 1.0 );

								// rays pass through back-facing surfaces
								if ( dot( viewReflectDir, hitNormal ) < 0.0 ) {

									if ( length( vP - viewPosition ) > maxDistance ) break;

									vec2 e = min( uv, 1.0 - uv );
									float edge = screenEdgeFade > 0.0 ? smoothstep( 0.0, screenEdgeFade, min( e.x, e.y ) ) : 1.0;
									result = mix( envColor, texture2D( tColor, uv ).rgb, edge );
									break;

								}

							}

						}

					}

					s += sStep;

				}

			}

			gl_FragColor = vec4( result, 1.0 );

		}
	`

};

/**
 * Resolves the traced radiance for roughness: samples the mip chain of the traced
 * texture at a per-pixel level derived from the G-buffer roughness.
 *
 * @constant
 * @type {ShaderMaterial~Shader}
 */
const SSR2ResolveShader = {

	name: 'SSR2ResolveShader',

	uniforms: {

		'tRadiance': { value: null },
		'tMaterial': { value: null },
		'maxMip': { value: 0 }

	},

	vertexShader,

	fragmentShader: /* glsl */`
		varying vec2 vUv;
		uniform sampler2D tRadiance;
		uniform sampler2D tMaterial;
		uniform float maxMip;

		void main() {

			float roughness = texture2D( tMaterial, vUv ).r;

			gl_FragColor = vec4( textureLod( tRadiance, vUv, clamp( roughness * roughness * maxMip, 0.0, maxMip ) ).rgb, 1.0 );

		}
	`

};

export { SSR2TraceShader, SSR2ResolveShader };
