/**
 * @author bhouston / http://clara.io/
 *
 * Scalable Ambient Occlusion
 *
 */

THREE.SAOShader = {

	defines: {
		'NUM_SAMPLES': 64,
		'NUM_RINGS': 5,
	},

	uniforms: {

		"tDiffuse":     { type: "t", value: null },
		"tDepth":       { type: "t", value: null },
		"size":         { type: "v2", value: new THREE.Vector2( 512, 512 ) },

		"cameraNear":   { type: "f", value: 1 },
		"cameraFar":    { type: "f", value: 100 },
		"cameraProjectionMatrix": { type: "m4", value: new THREE.Matrix4() },
		"cameraInverseProjectionMatrix": { type: "m4", value: new THREE.Matrix4() },

		"scale":   { type: "f", value: 100.0 },
		"intensity":   { type: "f", value: 1.5 },
		"bias":   { type: "f", value: 0.00 },

		"sampleRadiusPixels":   { type: "f", value: 20.0 },
		"randomSeed": { type: "f", value: 0.0 }
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		// total number of samples at each fragment",
		"#extension GL_OES_standard_derivatives : enable",

		"#include <common>",

		"#define MIN_RESOLUTION      0.000",

		"varying vec2 vUv;",

		"uniform sampler2D tDepth;",
		"uniform sampler2D tDiffuse;",

		"uniform float cameraNear;",
		"uniform float cameraFar;",
		"uniform mat4 cameraProjectionMatrix;",
		"uniform mat4 cameraInverseProjectionMatrix;",

		"uniform float scale;",
		"uniform float intensity;",
		"uniform float bias;",
		"uniform float sampleRadiusPixels;",
		"uniform vec2 size;",
		"uniform float randomSeed;",

		// RGBA depth

		"#include <packing>",

		"vec3 getViewPosition( vec2 screenPosition ) {",
			"float perspectiveDepth = unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );",
			"float viewZ = perspectiveDepthToViewZ( perspectiveDepth, cameraNear, cameraFar );",
			"float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];",
			"vec4 clipPosition = vec4( ( vec3( screenPosition, perspectiveDepth ) - 0.5 ) * 2.0, clipW );",
			"clipPosition.xyz *= clipW;", // unproject to homogeneous coordinates
			"return ( cameraInverseProjectionMatrix * clipPosition ).xyz;",
		"}",

		"vec3 getViewNormalFromDepthDerivatives( vec3 viewPosition ) {",
			"return normalize( cross( dFdx( viewPosition ), dFdy( viewPosition ) ) );",
		"}",

	 "float getOcclusion( vec3 viewPosition, vec3 viewNormal, vec3 viewPositionOffset ) {",
			"vec3 viewDelta = viewPositionOffset - viewPosition;",
			"float viewDistance = length( viewDelta );",
			"float distance = scale * viewDistance / cameraFar;",
			"return intensity * max(0.0, (dot(viewNormal, viewDelta) - MIN_RESOLUTION * cameraFar) / viewDistance - bias) / (1.0 + pow2( viewDistance ) );",
		"}",

		"float basicPattern( vec3 viewPosition ) {",

			"vec3 viewNormal = getViewNormalFromDepthDerivatives( viewPosition );",

			"float random = 0.0;//rand( vUv + randomSeed );",
			"vec2 radius = vec2( sampleRadiusPixels ) / size;",
			"float numSamples = float( NUM_SAMPLES );",
			"float numRings = float( NUM_RINGS );",
			"float alphaStep = 1.0 / numSamples;",

			// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/

			"float occlusionSum = 0.0;",
			"float alpha = 0.0;",
			"float weight = 0.0;",

			"for( int i = 0; i < NUM_SAMPLES; i ++ ) {",
				"float angle = PI2 * ( numRings * alpha + random );",
				"vec2 currentRadius = radius * ( 0.01 + alpha * 0.99 );",
				"vec2 offset = vec2( cos(angle), sin(angle) ) * currentRadius;",
				"alpha += alphaStep;",

				"vec3 viewPositionOffset = getViewPosition( vUv + offset );",
				"if( -viewPositionOffset.z >= cameraFar ) {",
					"continue;",
				"}",

				"occlusionSum += getOcclusion( viewPosition, viewNormal, viewPositionOffset );",
				"weight += 1.0;",

			"}",

			"if( weight == 0.0 ) return 0.0;",
			"return occlusionSum / weight;",

		"}",


		"void main() {",

			"vec4 color = texture2D( tDiffuse, vUv );",
			"vec3 viewPosition = getViewPosition( vUv );",
			/*"vec3 viewNormal = getViewNormalFromDepthDerivatives( viewPosition );",
			"gl_FragColor = vec4( viewNormal * 0.5 + 0.5, 1.0 );",
			"return;",*/
			"gl_FragColor = color;",

			"if( -viewPosition.z >= cameraFar ) {",
				"return;",
			"}",

			"float occlusion = basicPattern( viewPosition );",
			"gl_FragColor.xyz *= 1.0 - occlusion;",

		"}"

	].join( "\n" )

};
