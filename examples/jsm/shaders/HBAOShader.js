import {
	Matrix4,
	Vector2,
	Vector4,
} from 'three';

/**
 * References:
 * http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.577.2286&rep=rep1&type=pdf
 * https://ceur-ws.org/Vol-3027/paper5.pdf
 * http://www.derschmale.com/2013/12/20/an-alternative-implementation-for-hbao-2
 * https://github.com/N8python/n8ao
 * https://github.com/0beqz/realism-effects
 * https://github.com/scanberg/hbao/blob/master/resources/shaders/hbao_frag.glsl
 * https://github.com/nvpro-samples/gl_ssao/blob/master/hbao.frag.glsl
 */

const HBAOShader = {

	name: 'HBAOShader',

	defines: {
		'PERSPECTIVE_CAMERA': 1,
		'SAMPLES': 16,
		'SAMPLE_VECTORS': generateHaboSampleKernelInitializer( 16 ),
		'NORMAL_VECTOR_TYPE': 1,
		'DEPTH_VALUE_SOURCE': 0,
		'SAMPLING_FROM_NOISE': 0,
	},

	uniforms: {
		'tNormal': { value: null },
		'tDepth': { value: null },
		'tNoise': { value: null },
		'resolution': { value: new Vector2() },
		'cameraNear': { value: null },
		'cameraFar': { value: null },
		'cameraProjectionMatrix': { value: new Matrix4() },
		'cameraProjectionMatrixInverse': { value: new Matrix4() },
		'radius': { value: 2. },
		'distanceExponent': { value: 1. },
		'bias': { value: 0.01 },
	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		varying vec2 vUv;

		uniform sampler2D tNormal;
		uniform sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraProjectionMatrixInverse;		
		uniform float radius;
		uniform float distanceExponent;
		uniform float bias;
		
		#include <common>
		#include <packing>

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(vec3(ao), 1.)
		#endif

		const vec4 sampleKernel[SAMPLES] = SAMPLE_VECTORS;

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
		#if DEPTH_VALUE_SOURCE == 1    
			return textureLod(tDepth, uv.xy, 0.0).a;
		#else
			return textureLod(tDepth, uv.xy, 0.0).r;
		#endif
		}

		float fetchDepth(const ivec2 uv) {
			#if DEPTH_VALUE_SOURCE == 1    
				return texelFetch(tDepth, uv.xy, 0).a;
			#else
				return texelFetch(tDepth, uv.xy, 0).r;
			#endif
		}

		float getViewZ(const in float depth) {
			#if PERSPECTIVE_CAMERA == 1
				return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
			#else
				return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
            vec2 size = vec2(textureSize(tDepth, 0));
            ivec2 p = ivec2(uv * size);
            float c0 = fetchDepth(p);
            float l2 = fetchDepth(p - ivec2(2, 0));
            float l1 = fetchDepth(p - ivec2(1, 0));
            float r1 = fetchDepth(p + ivec2(1, 0));
            float r2 = fetchDepth(p + ivec2(2, 0));
            float b2 = fetchDepth(p - ivec2(0, 2));
            float b1 = fetchDepth(p - ivec2(0, 1));
            float t1 = fetchDepth(p + ivec2(0, 1));
            float t2 = fetchDepth(p + ivec2(0, 2));
            float dl = abs((2.0 * l1 - l2) - c0);
            float dr = abs((2.0 * r1 - r2) - c0);
            float db = abs((2.0 * b1 - b2) - c0);
            float dt = abs((2.0 * t1 - t2) - c0);
            vec3 ce = getViewPosition(uv, c0).xyz;
            vec3 dpdx = (dl < dr) ?  ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz
                                  : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
            vec3 dpdy = (db < dt) ?  ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz
                                  : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
            return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
		#if NORMAL_VECTOR_TYPE == 2
			return normalize(textureLod(tNormal, uv, 0.).rgb);
		#elif NORMAL_VECTOR_TYPE == 1
			return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
		#else
			return computeNormalFromDepth(uv);
		#endif
		}
		
		float getOcclusion(const vec2 uv, const vec3 viewPos, const vec3 viewNormal, const float depth, const vec4 sampleViewDir, inout float totalWeight) {
			
			vec3 sampleViewPos = viewPos + sampleViewDir.xyz * radius * pow(sampleViewDir.w, distanceExponent);
			vec4 sampleClipPos = cameraProjectionMatrix * vec4(sampleViewPos, 1.);
			vec2 sampleUv = sampleClipPos.xy / sampleClipPos.w * 0.5 + 0.5;
			float sampleDepth = getDepth(sampleUv);
			float distSample = abs(getViewZ(sampleDepth));
			float distWorld = abs(sampleViewPos.z);
			float distanceFalloffToUse = radius;
			float rangeCheck = smoothstep(0.0, 1.0, distanceFalloffToUse / (abs(distSample - distWorld)));
			float weight = dot(viewNormal, sampleViewDir.xyz);
			vec2 diff = (uv - sampleUv) * resolution;
			vec2 clipRangeCheck = step(0., sampleUv) * step(sampleUv, vec2(1.));
			float occlusion = rangeCheck * weight * step(distSample + bias, distWorld) * step(0.707, dot(diff, diff)) * clipRangeCheck.x * clipRangeCheck.y;
			totalWeight += weight;

			return occlusion;
		}
		
		void main() {
			float depth = getDepth(vUv.xy);
			if (depth == 1.0) {
				discard;
				return;
			}
			vec3 viewPos = getViewPosition(vUv, depth);
			vec3 viewNormal = getViewNormal(vUv);
			
			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
			vec3 randomVec = noiseTexel.xyz * 2.0 - 1.0;
  			vec3 tangent = normalize(randomVec - viewNormal * dot(randomVec, viewNormal));
      		vec3 bitangent = cross(viewNormal, tangent);
      		mat3 kernelMatrix = mat3(tangent, bitangent, viewNormal);

			float ao = 0.0, totalWeight = 0.0;
			for (int i = 0; i < SAMPLES; i++) {		
				#if SAMPLING_FROM_NOISE == 1
					vec4 sampleNoise = noiseTexel;
					if (i != 0) {
						const vec4 hn = vec4(0.618033988749895, 0.3247179572447458, 0.2207440846057596, 0.1673039782614187);
						sampleNoise = fract(sampleNoise + hn * float(i));
						sampleNoise = mix(sampleNoise, 1.0 - sampleNoise, step(0.5, sampleNoise)) * 2.0;
					}
					vec3 hemisphereDir = normalize(kernelMatrix * vec3(sampleNoise.xy * 2. - 1., sampleNoise.z));
					vec4 sampleViewDir = vec4(hemisphereDir, sampleNoise.a);
				#else
					vec4 sampleViewDir = sampleKernel[i];
					sampleViewDir.xyz = normalize(kernelMatrix * sampleViewDir.xyz);
				#endif
				float occlusion = getOcclusion(vUv, viewPos, viewNormal, depth, sampleViewDir, totalWeight);
				ao += occlusion;
			}		
			if (totalWeight > 0.) { 
				ao /= totalWeight;
			}
			ao = clamp(1. - ao, 0., 1.);
			gl_FragColor = FRAGMENT_OUTPUT;
		}`

};

const HBAODepthShader = {

	name: 'HBAODepthShader',

	defines: {
		'PERSPECTIVE_CAMERA': 1
	},

	uniforms: {

		'tDepth': { value: null },
		'cameraNear': { value: null },
		'cameraFar': { value: null },

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform sampler2D tDepth;

		uniform float cameraNear;
		uniform float cameraFar;

		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {

			#if PERSPECTIVE_CAMERA == 1

				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

			#else

				return texture2D( tDepth, screenPosition ).x;

			#endif

		}

		void main() {

			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`

};

function generateHaboSampleKernelInitializer( samples ) {

	const poissonDisk = generateHaboSamples( samples );

	let glslCode = 'vec4[SAMPLES](';

	for ( let i = 0; i < samples; i ++ ) {

		const sample = poissonDisk[ i ];
		glslCode += `vec4(${sample.x}, ${sample.y}, ${sample.z}, ${sample.w})`;

		if ( i < samples - 1 ) {

			glslCode += ',';

		}

	}

	glslCode += ')';

	return glslCode;

}

function generateHaboSamples( samples ) {

	const kernel = [];
	for ( let kernelIndex = 0; kernelIndex < samples; kernelIndex ++ ) {

		const spiralAngle = kernelIndex * Math.PI * ( 3 - Math.sqrt( 5 ) );
		const z = Math.sqrt( 0.99 - ( kernelIndex / ( samples - 1 ) ) * 0.98 );
		const radius = Math.sqrt( 1 - z * z );
		const x = Math.cos( spiralAngle ) * radius;
		const y = Math.sin( spiralAngle ) * radius;
		const scaleStep = 8;
		const scaleRange = Math.floor( samples / scaleStep );
		const scaleIndex =
			Math.floor( kernelIndex / scaleStep ) +
			( kernelIndex % scaleStep ) * scaleRange;
		let scale = 1 - scaleIndex / samples;
		scale = 0.1 + 0.9 * scale;
		kernel.push( new Vector4( x, y, z, scale ) );

	}

	return kernel;

}

export { generateHaboSampleKernelInitializer, HBAOShader, HBAODepthShader };
