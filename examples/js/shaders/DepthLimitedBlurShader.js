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

		"KERNEL_RADIUS": 4

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

		"void main() {",

			"float weightSum = sampleWeights[0];",
			"vec4 diffuseSum = texture2D( tDiffuse, vUv ) * weightSum;",

			"float perspectiveDepth = unpackRGBAToDepth( texture2D( tDepth, vUv ) );",
			"float viewZ = -perspectiveDepthToViewZ( perspectiveDepth, cameraNear, cameraFar );",
			"float rViewZ = viewZ, lViewZ = viewZ;",

			"for( int i = 1; i <= KERNEL_RADIUS; i ++ ) {",

				"float sampleWeight = sampleWeights[i];",
				"vec2 sampleUvOffset = sampleUvOffsets[i] * vInvSize;",

				"vec2 sampleUv = vUv + sampleUvOffset;",
				"perspectiveDepth = unpackRGBAToDepth( texture2D( tDepth, sampleUv ) );",
				"viewZ = -perspectiveDepthToViewZ( perspectiveDepth, cameraNear, cameraFar );",

				"if( abs( viewZ - rViewZ ) <= depthCutoff ) {",
					"diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;",
					"weightSum += sampleWeight;",
					//"rViewZ = viewZ;",
				"}",
				"else {",
					"break;",
				"}",
			"}",

			"for( int i = 1; i <= KERNEL_RADIUS; i ++ ) {",

				"float sampleWeight = sampleWeights[i];",
				"vec2 sampleUvOffset = sampleUvOffsets[i] * vInvSize;",

				"vec2 sampleUv = vUv - sampleUvOffset;",
				"perspectiveDepth = unpackRGBAToDepth( texture2D( tDepth, sampleUv ) );",
				"viewZ = -perspectiveDepthToViewZ( perspectiveDepth, cameraNear, cameraFar );",

				"if( abs( viewZ - lViewZ ) <= depthCutoff ) {",
					"diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;",
					"weightSum += sampleWeight;",
					//"lViewZ = viewZ;",
				"}",
				"else {",
					"break;",
				"}",

			"}",

			"gl_FragColor = ( weightSum > 0.0 ) ? diffuseSum / weightSum : diffuseSum;",

		"}"

	].join( "\n" )

};
