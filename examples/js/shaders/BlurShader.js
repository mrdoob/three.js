/**
 * @author bhouston / http://clara.io
 *
 * For a horizontal blur, use X_STEP 1, Y_STEP 0
 * For a vertical blur, use X_STEP 0, Y_STEP 1
 *
 * For speed, this shader precomputes uv offsets in vert shader to allow for prefetching
 *
 */

THREE.BlurShader = {

	defines: {

		"NUM_SAMPLES": 4

	},

	uniforms: {

		"tDiffuse":         { type: "t", value: null },
		"size":             { type: "v2", value: new THREE.Vector2( 512, 512 ) },
		"sampleUvOffsets":  { type: "v2v", value: [ new THREE.Vector2( 0, 0 ) ] },
		"sampleWeights":    { type: "1fv", value: [ 1.0 ] },

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

		"uniform sampler2D tDiffuse;",

		"uniform vec2 sampleUvOffsets[ NUM_SAMPLES ];",
		"uniform float sampleWeights[ NUM_SAMPLES ];",

		"varying vec2 vUv;",
		"varying vec2 vInvSize;",

		"void main() {",

			"vec4 diffuseSum = vec4( 0.0 );",
			"float weightSum = 0.0;",

			"for( int i = 0; i < NUM_SAMPLES; i ++ ) {",

				"float weight = sampleWeights[i];",
				"diffuseSum += texture2D( tDiffuse, vUv + sampleUvOffsets[i] * vInvSize ) * weight;",
				"weightSum += weight;",

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

	reorderFromCenter: function( array ) {
		var centerIndex = Math.floor( array.length / 2 );
		var element = array[ centerIndex ];
		array.slice( centerIndex, 1 );
		array.unshift( element );
		return array;
	},

	configure: function( material, numSamples, uvIncrement, stdDev ) {

		var oddNumSamples = Math.floor( numSamples / 2 ) * 2 + 1;
		material.defines[ 'NUM_SAMPLES' ] = oddNumSamples;
		material.uniforms[ 'sampleUvOffsets' ].value = THREE.BlurShaderUtils.reorderFromCenter( THREE.BlurShaderUtils.createSampleOffsets( oddNumSamples, uvIncrement ) );
		material.uniforms[ 'sampleWeights' ].value = THREE.BlurShaderUtils.reorderFromCenter( THREE.BlurShaderUtils.createSampleWeights( oddNumSamples, stdDev ) );

	}

};
