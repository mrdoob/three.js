import {
	Matrix4,
	Vector2
} from 'three';

/**
 * Shaders for {@link SSISPass}.
 *
 * @module SSISShader
 * @three_import import * as SSISShader from 'three/addons/shaders/SSISShader.js';
 */

const vertexShader = /* glsl */`

	varying vec2 vUv;

	void main() {

		vUv = uv;

		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

	}

`;

/**
 * Traces reflection rays through the depth buffer. The result is the incoming radiance along
 * the reflection direction: the lit scene color at the hit, faded to the environment map
 * (sampled at the surface roughness) on a miss or near the screen border.
 *
 * With `STOCHASTIC`, each pixel averages `rayCount` rays importance-sampled from the GGX
 * distribution of visible normals (Eto and Tokuyoshi 2023, as in SSRNode), so rough
 * surfaces see a cone of directions and a reflected object's silhouette softens through
 * partial coverage. Otherwise a single mirror ray is traced and the cone footprint is
 * written to alpha so the resolve pass can blur it.
 *
 * @constant
 * @type {ShaderMaterial~Shader}
 */
const SSISTraceShader = {

	name: 'SSISTraceShader',

	defines: {
		MAX_STEP: 0,
		MAX_RAYS: 64,
		MAX_RAY_STEPS: 64,
		STEP_EXPONENT: '2.0',
		USE_ENV: false,
		STOCHASTIC: true
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
		'thickness': { value: 0.01 },
		'screenEdgeFade': { value: 0.2 },
		'rayCount': { value: 16 },
		'quality': { value: 1 },
		'frame': { value: 0 }

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
		uniform float screenEdgeFade;
		uniform int rayCount;
		uniform float quality;
		uniform float frame;
		#include <packing>

		vec3 getViewPosition( const in vec2 uv, const in float depth ) {
			vec4 clip = vec4( vec3( uv, depth ) * 2.0 - 1.0, 1.0 );
			vec4 view = cameraInverseProjectionMatrix * clip;
			return view.xyz / view.w;
		}

		// view-space point on the ray at a screen uv and view depth (symmetric perspective projection)
		vec3 getViewPointAtZ( const in vec2 uv, const in float viewZ ) {
			float w = - viewZ;
			vec2 ndc = uv * 2.0 - 1.0;
			vec4 view = cameraInverseProjectionMatrix * vec4( ndc * w, 0.0, w );
			return vec3( view.xy, viewZ );
		}

		float pointToLineDistance( vec3 x0, vec3 x1, vec3 x2 ) {
			return length( cross( x0 - x1, x0 - x2 ) ) / length( x2 - x1 );
		}

		// interleaved gradient noise (Jimenez 2014)
		float ign( const in vec2 p ) {
			return fract( 52.9829189 * fract( dot( p, vec2( 0.06711056, 0.00583715 ) ) ) );
		}

		// Bounded VNDF sampling of the GGX distribution (Eto and Tokuyoshi 2023), isotropic.
		// V is the view direction in the tangent frame, alpha = roughness^2.
		vec3 sampleGGXVNDF( const in vec3 V, const in float alpha, const in vec2 xi ) {
			vec3 wiStd = normalize( vec3( alpha * V.x, alpha * V.y, V.z ) );
			float s = 1.0 + length( V.xy );
			float a2 = alpha * alpha;
			float s2 = s * s;
			float k = ( 1.0 - a2 ) * s2 / ( s2 + a2 * V.z * V.z );
			float b = wiStd.z * k;
			float phi = 6.283185307179586 * xi.x;
			float z = ( 1.0 - xi.y ) * ( 1.0 + b ) - b;
			float sinTheta = sqrt( max( 0.0, 1.0 - z * z ) );
			vec3 wm = vec3( sinTheta * cos( phi ), sinTheta * sin( phi ), z ) + wiStd;
			return normalize( vec3( alpha * wm.x, alpha * wm.y, max( 0.0, wm.z ) ) );
		}

		// a reflection direction drawn from the GGX lobe; falls back to the mirror direction
		vec3 sampleGGXReflection( const in vec3 I, const in vec3 N, const in float alpha, const in vec2 xi ) {
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 T = normalize( cross( up, N ) );
			vec3 B = cross( N, T );
			vec3 V = - I;
			vec3 Vl = vec3( dot( V, T ), dot( V, B ), max( dot( V, N ), 0.01 ) );
			vec3 Ne = sampleGGXVNDF( normalize( Vl ), alpha, xi );
			vec3 H = T * Ne.x + B * Ne.y + N * Ne.z;
			vec3 L = reflect( I, H );
			return dot( L, N ) > 0.0 ? L : reflect( I, N );
		}

		// Marches the ray through the depth buffer. On a hit returns true with the hit uv;
		// rayLen and endZ describe the traversed segment (used for the cone footprint).
		bool traceRay( const in vec3 viewPosition, const in vec3 viewNormal, const in vec3 dir, const in float jitter, out vec2 hitUv, out float rayLen, out float endZ ) {

			float maxRayLen = maxDistance / max( dot( dir, viewNormal ), 0.05 );
			vec3 d1viewPosition = viewPosition + dir * maxRayLen;

			// clip the ray at the near plane
			if ( d1viewPosition.z > - cameraNear ) {
				float t = ( - cameraNear - viewPosition.z ) / dir.z;
				d1viewPosition = viewPosition + dir * t;
			}

			vec4 d1clip = cameraProjectionMatrix * vec4( d1viewPosition, 1.0 );
			vec2 d0 = gl_FragCoord.xy;
			vec2 d1 = ( d1clip.xy / d1clip.w * 0.5 + 0.5 ) * resolution;

			float totalStep = max( abs( d1.x - d0.x ), abs( d1.y - d0.y ) );
			vec2 span = ( d1 - d0 ) / totalStep;

			#ifdef STOCHASTIC

				// bounded sample count (as SSRNode): quality * MAX_RAY_STEPS samples per ray, spaced as
				// (i / count) ^ STEP_EXPONENT so they concentrate near the origin, at least one pixel apart
				float totalSamples = max( floor( quality * float( MAX_RAY_STEPS ) + 0.5 ), 1.0 );
				float stepLimit = float( MAX_RAY_STEPS );

			#else

				// one sample every 1 / quality pixels along the ray
				float stride = 1.0 / max( quality, 0.05 );
				float stepLimit = float( MAX_STEP );

			#endif

			float s = 0.0;

			// 1 / z is linear along the ray in screen space (perspective-correct depth)
			float recipZ = 1.0 / viewPosition.z;
			float recipZStep = 1.0 / d1viewPosition.z - recipZ;

			hitUv = vec2( 0.0 );

			vec2 prevUv = vUv;
			float prevRayZ = viewPosition.z;

			for ( float i = 1.0; i < stepLimit; i ++ ) {

				#ifdef STOCHASTIC

					if ( i > totalSamples ) break;
					s = clamp( max( pow( ( i + jitter - 0.5 ) / totalSamples, float( STEP_EXPONENT ) ), i / totalStep ), 0.0, 1.0 );

				#else

					s = i * stride / totalStep;
					if ( s >= 1.0 ) break;

				#endif

				vec2 xy = d0 + s * ( d1 - d0 );
				if ( xy.x < 0.0 || xy.x > resolution.x || xy.y < 0.0 || xy.y > resolution.y ) break;

				vec2 uv = xy / resolution;
				float d = texture2D( tDepth, uv ).x;

				// cheap view-space depth first; the position is only rebuilt on a crossing
				float rayZ = 1.0 / ( recipZ + s * recipZStep );

				if ( d < 1.0 ) {

					if ( rayZ <= perspectiveDepthToViewZ( d, cameraNear, cameraFar ) ) {

						vec3 vP = getViewPosition( uv, d );
						float away = pointToLineDistance( vP, viewPosition, d1viewPosition );

						// A ray crossing a surface between two samples can be up to one 3D ray step away
						// from it at the first sample past it, so that step is the minimum tolerance. This
						// keeps coverage independent of the resolution, the sample spacing and the angle.
						float stepLength = length( getViewPointAtZ( uv, rayZ ) - getViewPointAtZ( prevUv, prevRayZ ) );
						float tk = max( thickness, 2.0 * stepLength );

						if ( away <= tk ) {

							vec3 hitNormal = normalize( texture2D( tNormal, uv ).xyz * 2.0 - 1.0 );

							// rays pass through back-facing surfaces
							if ( dot( dir, hitNormal ) < 0.0 ) {

								rayLen = length( vP - viewPosition );
								if ( rayLen > maxDistance ) break;

								endZ = vP.z;
								hitUv = uv;
								return true;

							}

						}

					}

				}

				prevUv = uv;
				prevRayZ = rayZ;

			}

			float t = clamp( s, 0.0, 1.0 );
			rayLen = maxRayLen * t;
			endZ = mix( viewPosition.z, d1viewPosition.z, t );
			return false;

		}

		float hitEdgeFactor( const in vec2 uv ) {
			vec2 e = min( uv, 1.0 - uv );
			return screenEdgeFade > 0.0 ? smoothstep( 0.0, screenEdgeFade, min( e.x, e.y ) ) : 1.0;
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
			vec3 mirrorDir = reflect( viewIncidentDir, viewNormal );

			vec3 envColor = vec3( 0.0 );

			#ifdef USE_ENV
				float envMip = envMaxLod * roughness * ( 2.0 - roughness );
				envColor = textureLod( envMap, ( cameraWorldMatrix * vec4( mirrorDir, 0.0 ) ).xyz, envMip ).rgb * envIntensity;
			#endif

			vec3 result = envColor;
			float alphaOut = 0.0; // non-stochastic: reflection cone blur lod

			vec2 hitUv;
			float rayLen;
			float endZ;

			#ifdef STOCHASTIC

				float alpha = max( roughness * roughness, 0.002 );
				vec2 p = gl_FragCoord.xy + 5.588238 * frame;
				vec2 n = vec2( ign( p ), ign( p.yx + vec2( 47.0, 13.0 ) ) );
				vec3 sum = vec3( 0.0 );

				for ( int k = 0; k < MAX_RAYS; k ++ ) {

					if ( k >= rayCount ) break;

					// per-pixel noise rotated by an R2 sequence across the rays of the pixel
					vec2 xi = fract( n + vec2( 0.7548776662, 0.5698402909 ) * float( k ) );
					vec3 dir = sampleGGXReflection( viewIncidentDir, viewNormal, alpha, xi );

					float jitter = fract( n.x + 0.61803398875 * float( k ) );

					if ( traceRay( viewPosition, viewNormal, dir, jitter, hitUv, rayLen, endZ ) ) {

						sum += mix( envColor, texture2D( tColor, hitUv ).rgb, hitEdgeFactor( hitUv ) );

					} else {

						sum += envColor;

					}

				}

				result = sum / float( max( rayCount, 1 ) );

			#else

				if ( traceRay( viewPosition, viewNormal, mirrorDir, 0.5, hitUv, rayLen, endZ ) ) {

					result = mix( envColor, texture2D( tColor, hitUv ).rgb, hitEdgeFactor( hitUv ) );

				}

				// footprint of the GGX cone (half angle ~ roughness^2) over the traversed segment, in pixels
				float conePx = rayLen * roughness * roughness * cameraProjectionMatrix[ 1 ][ 1 ] * resolution.y / max( - endZ, 1e-4 );
				alphaOut = log2( max( conePx, 1.0 ) );

			#endif

			gl_FragColor = vec4( result, alphaOut );

		}
	`

};

/**
 * Resolves the traced radiance for roughness: samples the mip chain of the traced
 * texture at the per-pixel level the trace stored in alpha (the reflection cone
 * footprint, so reflections are sharp near contact and blur with hit distance).
 *
 * @constant
 * @type {ShaderMaterial~Shader}
 */
const SSISResolveShader = {

	name: 'SSISResolveShader',

	uniforms: {

		'tRadiance': { value: null },
		'resolution': { value: new Vector2() },
		'maxMip': { value: 0 }

	},

	vertexShader,

	fragmentShader: /* glsl */`
		varying vec2 vUv;
		uniform sampler2D tRadiance;
		uniform vec2 resolution;
		uniform float maxMip;

		void main() {

			float lod = clamp( textureLod( tRadiance, vUv, 0.0 ).a, 0.0, maxMip );

			if ( lod < 0.05 ) {

				gl_FragColor = vec4( textureLod( tRadiance, vUv, 0.0 ).rgb, 1.0 );
				return;

			}

			// a few taps at the chosen mip hide the blockiness of the box-filtered chain
			vec2 o = exp2( lod - 1.0 ) / resolution;
			vec3 c = textureLod( tRadiance, vUv, lod ).rgb * 2.0;
			c += textureLod( tRadiance, vUv + vec2( o.x, o.y ) * 0.5, lod ).rgb;
			c += textureLod( tRadiance, vUv + vec2( - o.x, o.y ) * 0.5, lod ).rgb;
			c += textureLod( tRadiance, vUv + vec2( o.x, - o.y ) * 0.5, lod ).rgb;
			c += textureLod( tRadiance, vUv + vec2( - o.x, - o.y ) * 0.5, lod ).rgb;

			gl_FragColor = vec4( c / 6.0, 1.0 );

		}
	`

};

export { SSISTraceShader, SSISResolveShader };
