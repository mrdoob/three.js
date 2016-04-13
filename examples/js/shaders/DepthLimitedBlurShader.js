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

		"NUM_SAMPLES": 4

	},

	uniforms: {

		"tDiffuse":         { type: "t", value: null },
		"size":             { type: "v2", value: new THREE.Vector2( 512, 512 ) },
		"sampleUvOffsets":  { type: "v2v", value: [ new THREE.Vector2( 0, 0 ) ] },
		"sampleWeights":    { type: "1fv", value: [ 1.0 ] },
		"tDepth":           { type: "t", value: null },
		"cameraNear":       { type: "f", value: 10 },
		"cameraFar":        { type: "f", value: 1000 },

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

		"uniform vec2 sampleUvOffsets[ NUM_SAMPLES ];",
		"uniform float sampleWeights[ NUM_SAMPLES ];",

		"varying vec2 vUv;",
		"varying vec2 vInvSize;",

		"void main() {",

			"vec4 diffuseSum = vec4( 0.0 );",
			"float weightSum = 0.0;",

			"float perspectiveDepth = unpackRGBAToDepth( texture2D( tDepth, vUv ) );",
			"float viewZ = -perspectiveDepthToViewZ( perspectiveDepth, cameraNear, cameraFar );",
			"float centerViewZ = viewZ;",

			"for( int i = 0; i < NUM_SAMPLES; i ++ ) {",

				"float sampleWeight = sampleWeights[i];",
				"vec2 sampleUv = vUv + sampleUvOffsets[i] * vInvSize;",

				"perspectiveDepth = unpackRGBAToDepth( texture2D( tDepth, sampleUv ) );",
				"viewZ = -perspectiveDepthToViewZ( perspectiveDepth, cameraNear, cameraFar );",

				"if( abs( viewZ - centerViewZ ) < 0.1 * abs( cameraFar - cameraNear ) ) {",
					"diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;",
					"weightSum += sampleWeight;",
				"}",

			"}",

			"gl_FragColor = ( weightSum > 0.0 ) ? diffuseSum / weightSum : diffuseSum;",

		"}"

	].join( "\n" )

};


THREE.BlurShaderUtils = {

	createSampleWeights: function( numSamples, stdDev ) {

		var gaussian = function( x, stdDev ) {
			return Math.exp( - ( x*x ) / ( 2.0 * ( stdDev * stdDev ) ) ) / ( Math.sqrt( 2.0 * Math.PI ) * stdDev );
		};

		var weights = [];

		for( var i = 0; i < numSamples; i ++ ) {
			var x = i - 0.5 * ( numSamples - 1 );
			weights.push( gaussian( x, stdDev ) );
		}

		return weights;
	},

	createSampleOffsets: function( numSamples, uvIncrement ) {

		var offsets = [];

		for( var i = 0; i < numSamples; i ++ ) {
			var x = i - 0.5 * ( numSamples - 1 );
			offsets.push( uvIncrement.clone().multiplyScalar( x ) );
		}

		return offsets;

	},

	configure: function( material, numSamples, uvIncrement, stdDev ) {

		material.defines[ 'NUM_SAMPLES' ] = numSamples;
		material.uniforms[ 'sampleUvOffsets' ].value = THREE.BlurShaderUtils.createSampleOffsets( numSamples, uvIncrement );
		material.uniforms[ 'sampleWeights' ].value = THREE.BlurShaderUtils.createSampleWeights( numSamples, stdDev );

	}

};
