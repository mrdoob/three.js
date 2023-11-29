import {
	Matrix4,
	Vector2,
} from 'three';

/**
 * References:
 * https://github.com/0beqz/realism-effects
 * https://github.com/N8python/n8ao
 */

const PoissonDenoiseShader = {

	name: 'PoissonDenoiseShader',

	defines: {
		'SAMPLES': 16,
		'SAMPLE_VECTORS': generatePdSamplePointInitializer( 16, 4 ),
		'NORMAL_VECTOR_TYPE': 1,
		'DEPTH_VALUE_SOURCE': 0,
	},

	uniforms: {
		'tDiffuse': { value: null },
		'tNormal': { value: null },
		'tDepth': { value: null },
		'tNoise': { value: null },
		'resolution': { value: new Vector2() },
		'cameraProjectionMatrixInverse': { value: new Matrix4() },
		'lumaPhi': { value: 5. },
		'depthPhi': { value: 5. },
		'normalPhi': { value: 5. },
		'radius': { value: 10. },
		'index': { value: 0 }
	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		varying vec2 vUv;

		uniform sampler2D tDiffuse;
		uniform sampler2D tNormal;
		uniform sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform float lumaPhi;
		uniform float depthPhi;
		uniform float normalPhi;
		uniform float radius;
		uniform int index;
		
		#include <common>
		#include <packing>

		#ifndef SAMPLE_LUMINANCE
		#define SAMPLE_LUMINANCE dot(vec3(0.2125, 0.7154, 0.0721), a)
		#endif

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(denoised, 1.)
		#endif

		float getLuminance(const in vec3 a) {
			return SAMPLE_LUMINANCE;
		}

		const vec2 poissonDisk[SAMPLES] = SAMPLE_VECTORS;

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
		
		float distToPlane(const vec3 viewPos, const vec3 neighborViewPos, const vec3 viewNormal) {
			return abs(dot(viewPos - neighborViewPos, viewNormal));
		}
		
		void main() {
			float depth = getDepth(vUv.xy);	
			vec3 viewNormal = getViewNormal(vUv);	
			if (depth == 1. || dot(viewNormal, viewNormal) == 0.) {
				discard;
				return;
			}
			vec4 texel = textureLod(tDiffuse, vUv, 0.0);
			vec3 denoised = texel.rgb;
			vec3 center = texel.rgb;
			vec3 viewPos = getViewPosition(vUv, depth);

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
      		//vec2 noiseVec = normalize((index % 2 == 0 ? noiseTexel.xy : noiseTexel.yz) * 2.0 - 1.0);
			vec2 noiseVec = vec2(sin(noiseTexel[index % 4] * 2. * PI), cos(noiseTexel[index % 4] * 2. * PI));
    		mat2 rotationMatrix = mat2(noiseVec.x, -noiseVec.y, noiseVec.x, noiseVec.y);
		
			float totalWeight = 1.0;
			for (int i = 0; i < SAMPLES; i++) {
				vec2 offset = rotationMatrix * (poissonDisk[i] * radius / resolution);
				vec2 sampleUv = vUv + offset;
				vec4 sampleTexel = textureLod(tDiffuse, sampleUv, 0.0);
				float sampleDepth = getDepth(sampleUv);
				vec3 sampleNormal = getViewNormal(sampleUv);
				vec3 neighborColor = sampleTexel.rgb;
		
				vec3 viewPosSample = getViewPosition(sampleUv, sampleDepth);
				
				float normalDiff = dot(viewNormal, sampleNormal);
				float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
		
				float lumaDiff = abs(getLuminance(neighborColor) - getLuminance(center));
				float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
		
				float depthDiff = 1. - distToPlane(viewPos, viewPosSample, viewNormal);
				float depthSimilarity = max(depthDiff / depthPhi, 0.);
		
				float w = lumaSimilarity * depthSimilarity * normalSimilarity;
		
				denoised += w * neighborColor;
				totalWeight += w;
			}
		
			if (totalWeight > 0.) { 
				denoised /= totalWeight;
			}
			gl_FragColor = FRAGMENT_OUTPUT;
		}`

};

function generatePdSamplePointInitializer( samples, rings ) {

	const poissonDisk = generateDenoiseSamples(
		samples,
		rings,

	);

	let glslCode = 'vec2[SAMPLES](';

	for ( let i = 0; i < samples; i ++ ) {

		const sample = poissonDisk[ i ];
		glslCode += `vec2(${sample.x}, ${sample.y})`;

		if ( i < samples - 1 ) {

			glslCode += ',';

		}

	}

	glslCode += ')';

	return glslCode;

}

function generateDenoiseSamples( numSamples, numRings ) {

	const angleStep = ( 2 * Math.PI * numRings ) / numSamples;
	const invNumSamples = 1.0 / numSamples;
	const radiusStep = invNumSamples;
	const samples = [];
	let radius = invNumSamples;
	let angle = 0;

	for ( let i = 0; i < numSamples; i ++ ) {

		const v = new Vector2( Math.cos( angle ), Math.sin( angle ) )
			.multiplyScalar( Math.pow( radius, 0.75 ) );

		samples.push( v );
		radius += radiusStep;
		angle += angleStep;

	}

	return samples;

}

export { generatePdSamplePointInitializer, PoissonDenoiseShader };
