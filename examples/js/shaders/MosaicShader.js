/**
 * @author HypnosNova / https://github.com/HypnosNova/Nova
 *
 * Mosaic effect shader
 */

THREE.MosaicShader = {

	uniforms: {

		"tDiffuse":	{ value: null },

		"tScaleX": { value: 0.5 },
		"tScaleY": { value: 0.5 },

		"vector1": { value: null },
		"vector2": { value: null },

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float tScaleX;",
		"uniform float tScaleY;",

		"uniform vec2 vector1;",
		"uniform vec2 vector2;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec2 minVec = min( vector1, vector2 );",
			"vec2 maxVec = max( vector1, vector2 );",
			
			"vec2 a;",

			"if( vUv.x >= minVec.x && vUv.x <= maxVec.x && vUv.y >= minVec.y && vUv.y <= maxVec.y ){",
			
				"a = vec2( floor( vUv.x / tScaleX + 0.5 ) * tScaleX, floor( vUv.y / tScaleY + 0.5 ) * tScaleY );",

			"} else {",

				"a = vec2( vUv.x, vUv.y );",

			"}",

			"gl_FragColor = texture2D( tDiffuse, a );",

		"}"

	].join( "\n" )

};
