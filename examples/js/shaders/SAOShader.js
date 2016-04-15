/**
 * @author bhouston / http://clara.io/
 *
 * Scalable Ambient Occlusion
 *
 */

THREE.SAOShader = {

	defines: {
		'NUM_SAMPLES': 7,
		'NUM_RINGS': 4,
		"MODE": 0,
		"NORMAL_TEXTURE": 0,
		"DIFFUSE_TEXTURE": 1,
		"DEPTH_PACKING": 1,
		"PERSPECTIVE_CAMERA": 1
	},

	uniforms: {

		"tDepth":       { type: "t", value: null },
		"tDiffuse":     { type: "t", value: null },
		"tNormal":      { type: "t", value: null },
		"size":         { type: "v2", value: new THREE.Vector2( 512, 512 ) },

		"cameraNear":   { type: "f", value: 1 },
		"cameraFar":    { type: "f", value: 100 },
		"cameraProjectionMatrix": { type: "m4", value: new THREE.Matrix4() },
		"cameraInverseProjectionMatrix": { type: "m4", value: new THREE.Matrix4() },

		"scale":        { type: "f", value: 1.0 },
		"intensity":    { type: "f", value: 0.1 },
		"bias":         { type: "f", value: 0.5 },

		"minResolution": { type: "f", value: 0.0 },
		"kernelRadius": { type: "f", value: 100.0 },
		"randomSeed":   { type: "f", value: 0.0 }
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

		"varying vec2 vUv;",

		"#if DIFFUSE_TEXTURE == 1",
			"uniform sampler2D tDiffuse;",
		"#endif",

		"uniform sampler2D tDepth;",

		"#if NORMAL_TEXTURE == 1",
			"uniform sampler2D tNormal;",
		"#endif",

		"uniform float cameraNear;",
		"uniform float cameraFar;",
		"uniform mat4 cameraProjectionMatrix;",
		"uniform mat4 cameraInverseProjectionMatrix;",

		"uniform float scale;",
		"uniform float intensity;",
		"uniform float bias;",
		"uniform float kernelRadius;",
		"uniform float minResolution;",
		"uniform vec2 size;",
		"uniform float randomSeed;",

		// RGBA depth

		"#include <packing>",

		"vec4 getDefaultColor( const in vec2 screenPosition ) {",

			"#if DIFFUSE_TEXTURE == 1",
				"return texture2D( tDiffuse, vUv );",
			"#else",
				"return vec4( 1.0 );",
			"#endif",

		"}",

		"float getDepth( const in vec2 screenPosition ) {",

			"#if DEPTH_PACKING == 1",
				"return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );",
			"#else",
				"return texture2D( tDepth, screenPosition ).x;",
			"#endif",

		"}",

		"float getViewZ( const in float depth ) {",

			"#if PERSPECTIVE_CAMERA == 1",
				"float viewZ = perspectiveDepthToViewZ( depth, cameraNear, cameraFar );",
			"#else",
				"float viewZ = orthoDepthToViewZ( depth, cameraNear, cameraFar );",
			"#endif",

			"return viewZ;",

		"}",

		"vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {",

			"float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];",
			"vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, clipW );",
			"clipPosition.xyz *= clipW;", // unproject to homogeneous coordinates
			"return ( cameraInverseProjectionMatrix * clipPosition ).xyz;",

		"}",

		"vec3 getViewNormal( const in vec3 viewPosition, const in vec2 screenPosition ) {",

			"#if NORMAL_TEXTURE == 1",
				"return -unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );",
			"#else",
				"return normalize( cross( dFdx( viewPosition ), dFdy( viewPosition ) ) );",
			"#endif",

		"}",

		"float scaleDividedByCameraFar = scale / cameraFar;",
		"float minResolutionMultipliedByCameraFar = minResolution * cameraFar;",

		"float getOcclusion( const in vec3 centerViewPosition, const in vec3 centerViewNormal, const in vec3 sampleViewPosition ) {",

			"vec3 viewDelta = sampleViewPosition - centerViewPosition;",
			"float viewDistance = length( viewDelta );",
			"float scaledScreenDistance = scaleDividedByCameraFar * viewDistance;",
			"return max(0.0, (dot(centerViewNormal, viewDelta) - minResolutionMultipliedByCameraFar) / scaledScreenDistance - bias) / (1.0 + pow2( scaledScreenDistance ) );",

		"}",

		"const float numSamples = float( NUM_SAMPLES );",
		"const float numRings = float( NUM_RINGS );",
		"const float alphaStep = 1.0 / numSamples;",
		"vec2 radius = vec2( kernelRadius ) / size;",

		"float getAmbientOcclusion( const in vec3 centerViewPosition ) {",

			"vec3 centerViewNormal = getViewNormal( centerViewPosition, vUv );",

			"float random = rand( vUv + randomSeed );",

			// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
			"float alpha = 0.0;",
			"float occlusionSum = 0.0;",
			"float weightSum = 0.0;",

			"for( int i = 0; i < NUM_SAMPLES; i ++ ) {",
				"float angle = PI2 * ( numRings * alpha + random );",
				"vec2 currentRadius = radius * ( 0.02 + alpha * 0.99 );",
				"vec2 sampleUv = vUv + vec2( cos(angle), sin(angle) ) * currentRadius;",
				"alpha += alphaStep;",

				"float sampleDepth = getDepth( sampleUv );",
				"if( sampleDepth >= 1.0 ) {",
					"continue;",
				"}",

				"float sampleViewZ = getViewZ( sampleDepth );",
				"vec3 sampleViewPosition = getViewPosition( sampleUv, sampleDepth, sampleViewZ );",
				"occlusionSum += getOcclusion( centerViewPosition, centerViewNormal, sampleViewPosition );",
				"weightSum += 1.0;",

			"}",

			"return ( weightSum == 0.0 ) ? occlusionSum : ( occlusionSum * ( intensity / weightSum ) );",

		"}",


		"void main() {",

			"float centerDepth = getDepth( vUv );",
			"if( centerDepth >= 1.0 ) {",
				"discard;",
			"}",

			"float centerViewZ = getViewZ( centerDepth );",
			"vec3 viewPosition = getViewPosition( vUv, centerDepth, centerViewZ );",

			"gl_FragColor = getDefaultColor( vUv );",
			"gl_FragColor.xyz *= 1.0 - getAmbientOcclusion( viewPosition );",

		"}"

	].join( "\n" )

};
