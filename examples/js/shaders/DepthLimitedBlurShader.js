/**
 * @author bhouston / http://clara.io
 *
 * For a horizontal blur, use X_STEP 1, Y_STEP 0
 * For a vertical blur, use X_STEP 0, Y_STEP 1
 *
 * For speed, this shader precomputes uv offsets in vert shader to allow for prefetching
 *
 */

THREE.DepthLimitedBlurShader = {

	defines: {

		"KERNEL_RADIUS": 4,
		"DEPTH_PACKING": 1,
		"PERSPECTIVE_CAMERA": 1


	},

	uniforms: {

		"tDiffuse":         { type: "t", value: null },
		"size":             { type: "v2", value: new THREE.Vector2( 512, 512 ) },
		"sampleUvOffsets":  { type: "v2v", value: [ new THREE.Vector2( 0, 0 ) ] },
		"sampleWeights":    { type: "1fv", value: [ 1.0 ] },
		"tDepth":           { type: "t", value: null },
		"cameraNear":       { type: "f", value: 10 },
		"cameraFar":        { type: "f", value: 1000 },
		"depthCutoff":      { type: "f", value: 10 },

	},

	vertexShader: [

		"#include <common>",

		"uniform vec2 size;",

		"varying vec2 vUv;",
		"varying vec2 vInvSize;",

		"void main() {",

			"vUv = uv;",
			"vInvSize = 1.0 / size;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"#include <common>",
		"#include <packing>",

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tDepth;",

		"uniform float cameraNear;",
		"uniform float cameraFar;",
		"uniform float depthCutoff;",

		"uniform vec2 sampleUvOffsets[ KERNEL_RADIUS + 1 ];",
		"uniform float sampleWeights[ KERNEL_RADIUS + 1 ];",

		"varying vec2 vUv;",
		"varying vec2 vInvSize;",

		"float getDepth( const in vec2 screenPosition ) {",

			"#if DEPTH_PACKING == 1",
				"return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );",
			"#else",
				"return texture2D( tDepth, screenPosition ).x;",
			"#endif",

		"}",

		"float getViewZ( const in float depth ) {",

			"#if PERSPECTIVE_CAMERA == 1",
				"return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );",
			"#else",
				"return orthoDepthToViewZ( depth, cameraNear, cameraFar );",
			"#endif",

		"}",

		"void main() {",

			"float depth = getDepth( vUv );",
			"if( depth >= ( 1.0 - EPSILON ) ) {",
				"discard;",
			"}",

			"float centerViewZ = -getViewZ( depth );",
			"bool rBreak = false, lBreak = false;",

			"float weightSum = sampleWeights[0];",
			"vec4 diffuseSum = texture2D( tDiffuse, vUv ) * weightSum;",

			"for( int i = 1; i <= KERNEL_RADIUS; i ++ ) {",

				"float sampleWeight = sampleWeights[i];",
				"vec2 sampleUvOffset = sampleUvOffsets[i] * vInvSize;",

				"vec2 sampleUv = vUv + sampleUvOffset;",
				"float viewZ = -getViewZ( getDepth( sampleUv ) );",

				"if( abs( viewZ - centerViewZ ) > depthCutoff ) rBreak = true;",

				"if( ! rBreak ) {",
					"diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;",
					"weightSum += sampleWeight;",
				"}",

				"sampleUv = vUv - sampleUvOffset;",
				"viewZ = -getViewZ( getDepth( sampleUv ) );",

				"if( abs( viewZ - centerViewZ ) > depthCutoff ) lBreak = true;",

				"if( ! lBreak ) {",
					"diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;",
					"weightSum += sampleWeight;",
				"}",

			"}",

			"gl_FragColor = diffuseSum / weightSum;",

		"}"

	].join( "\n" )

};
