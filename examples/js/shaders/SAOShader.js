/**
 * @author bhouston / http://clara.io/
 *
 * Scalable Ambient Occlusion
 *
 */

THREE.SAOShader = {

	defines: {
		'NUM_SAMPLES': 7,
		'NUM_RINGS': 3,
		"MODE": 0,
		"NORMAL_TEXTURE": 0,
		"DIFFUSE_TEXTURE": 1
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

		"uniform sampler2D tDepth;",

		"#if DIFFUSE_TEXTURE == 1",
			"uniform sampler2D tDiffuse;",
		"#endif",

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

		"vec3 getViewPosition( vec2 screenPosition ) {",
			"float perspectiveDepth = unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );",
			"float viewZ = perspectiveDepthToViewZ( perspectiveDepth, cameraNear, cameraFar );",
			"float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];",
			"vec4 clipPosition = vec4( ( vec3( screenPosition, perspectiveDepth ) - 0.5 ) * 2.0, clipW );",
			"clipPosition.xyz *= clipW;", // unproject to homogeneous coordinates
			"return ( cameraInverseProjectionMatrix * clipPosition ).xyz;",
		"}",

		"vec3 getViewNormal( vec3 viewPosition, vec2 screenPosition ) {",
			"#if NORMAL_TEXTURE == 1",
				"return -unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );",
			"#else",
				"return normalize( cross( dFdx( viewPosition ), dFdy( viewPosition ) ) );",
			"#endif",
		"}",

	 "float getOcclusion( vec3 viewPosition, vec3 viewNormal, vec3 viewPositionOffset ) {",
			"vec3 viewDelta = viewPositionOffset - viewPosition;",
			"float viewDistance = length( viewDelta );",
			"float scaledScreenDistance = scale * viewDistance / cameraFar;",
			"return intensity * max(0.0, (dot(viewNormal, viewDelta) - minResolution * cameraFar) / scaledScreenDistance - bias) / (1.0 + pow2( scaledScreenDistance ) );",
		"}",

		"float basicPattern( vec3 viewPosition ) {",

			"vec3 viewNormal = getViewNormal( viewPosition, vUv );",

			"float random = rand( vUv + randomSeed );",
			"vec2 radius = vec2( kernelRadius ) / size;",
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

			"#if DIFFUSE_TEXTURE == 1",
				"vec4 color = texture2D( tDiffuse, vUv );",
			"#else",
				"vec4 color = vec4( 1.0 );",
			"#endif",

			"vec3 viewPosition = getViewPosition( vUv );",

			"#if MODE == 3", // display normals
				"vec3 viewNormal = getViewNormal( viewPosition, vUv );",
				"gl_FragColor = vec4( packNormalToRGB( viewNormal ), 1.0 );",
				"return;",
			"#elif MODE == 4", // display depth
				"float perspectiveDepth = viewZToPerspectiveDepth( viewPosition.z, cameraNear, cameraFar );",
				"gl_FragColor = vec4( vec3( perspectiveDepth ), 1.0 );",
				"return;",
			"#endif",

			"gl_FragColor = color;",

			"#if MODE == 1", // display original color
				"return;",
			"#endif",

			"if( -viewPosition.z >= cameraFar ) {",
				"return;",
			"}",

			"float occlusion = basicPattern( viewPosition );",

			"#if MODE == 2", // display only ao
				"gl_FragColor.xyz = vec3( 1.0 - occlusion );",
			"#elif MODE == 0", // display original color + ao (normal mode)
				"gl_FragColor.xyz *= 1.0 - occlusion;",
			"#endif",

		"}"

	].join( "\n" )

};
