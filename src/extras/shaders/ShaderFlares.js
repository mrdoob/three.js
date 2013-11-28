/**
 * @author mikael emtinger / http://gomo.se/
 */

THREE.ShaderFlares = {

	'lensFlareVertexTexture': {

		vertexShader: [

			"uniform lowp int renderType;",

			"uniform vec3 screenPosition;",
			"uniform vec2 scale;",
			"uniform float rotation;",

			"uniform sampler2D occlusionMap;",

			"attribute vec2 position;",
			"attribute vec2 uv;",

			"varying vec2 vUV;",
			"varying float vVisibility;",

			"void main() {",

				"vUV = uv;",

				"vec2 pos = position;",

				"if( renderType == 2 ) {",

					"vec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) );",
					"visibility += texture2D( occlusionMap, vec2( 0.5, 0.1 ) );",
					"visibility += texture2D( occlusionMap, vec2( 0.9, 0.1 ) );",
					"visibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) );",
					"visibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );",
					"visibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );",
					"visibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );",
					"visibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );",
					"visibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );",

					"vVisibility =        visibility.r / 9.0;",
					"vVisibility *= 1.0 - visibility.g / 9.0;",
					"vVisibility *=       visibility.b / 9.0;",
					"vVisibility *= 1.0 - visibility.a / 9.0;",

					"pos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;",
					"pos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;",

				"}",

				"gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform lowp int renderType;",

			"uniform sampler2D map;",
			"uniform float opacity;",
			"uniform vec3 color;",

			"varying vec2 vUV;",
			"varying float vVisibility;",

			"void main() {",

				// pink square

				"if( renderType == 0 ) {",

					"gl_FragColor = vec4( 1.0, 0.0, 1.0, 0.0 );",

				// restore

				"} else if( renderType == 1 ) {",

					"gl_FragColor = texture2D( map, vUV );",

				// flare

				"} else {",

					"vec4 texture = texture2D( map, vUV );",
					"texture.a *= opacity * vVisibility;",
					"gl_FragColor = texture;",
					"gl_FragColor.rgb *= color;",

				"}",

			"}"
		].join( "\n" )

	},


	'lensFlare': {

		vertexShader: [

			"uniform lowp int renderType;",

			"uniform vec3 screenPosition;",
			"uniform vec2 scale;",
			"uniform float rotation;",

			"attribute vec2 position;",
			"attribute vec2 uv;",

			"varying vec2 vUV;",

			"void main() {",

				"vUV = uv;",

				"vec2 pos = position;",

				"if( renderType == 2 ) {",

					"pos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;",
					"pos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;",

				"}",

				"gl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"precision mediump float;",

			"uniform lowp int renderType;",

			"uniform sampler2D map;",
			"uniform sampler2D occlusionMap;",
			"uniform float opacity;",
			"uniform vec3 color;",

			"varying vec2 vUV;",

			"void main() {",

				// pink square

				"if( renderType == 0 ) {",

					"gl_FragColor = vec4( texture2D( map, vUV ).rgb, 0.0 );",

				// restore

				"} else if( renderType == 1 ) {",

					"gl_FragColor = texture2D( map, vUV );",

				// flare

				"} else {",

					"float visibility = texture2D( occlusionMap, vec2( 0.5, 0.1 ) ).a;",
					"visibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) ).a;",
					"visibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) ).a;",
					"visibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) ).a;",
					"visibility = ( 1.0 - visibility / 4.0 );",

					"vec4 texture = texture2D( map, vUV );",
					"texture.a *= opacity * visibility;",
					"gl_FragColor = texture;",
					"gl_FragColor.rgb *= color;",

				"}",

			"}"

		].join( "\n" )

	}

};
