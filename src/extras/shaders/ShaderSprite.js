/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 *
 */

THREE.ShaderSprite = {

	'sprite': {

		vertexShader: [

			"uniform int useScreenCoordinates;",
			"uniform int sizeAttenuation;",
			"uniform vec3 screenPosition;",
			"uniform mat4 modelViewMatrix;",
			"uniform mat4 projectionMatrix;",
			"uniform float rotation;",
			"uniform vec2 scale;",
			"uniform vec2 alignment;",
			"uniform vec2 uvOffset;",
			"uniform vec2 uvScale;",
			"uniform vec2 halfViewport;",

			"attribute vec2 position;",
			"attribute vec2 uv;",

			"varying vec2 vUV;",

			"void main() {",

				"vUV = uvOffset + uv * uvScale;",

				"vec2 alignedPosition = ( position + alignment ) * scale;",

				"vec2 rotatedPosition;",
				"rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;",
				"rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;",

				"vec4 finalPosition;",

				"if( useScreenCoordinates != 0 ) {",

					"finalPosition = vec4( screenPosition.xy + ( rotatedPosition / halfViewport ), screenPosition.z, 1.0 );",

				"} else {",

					"finalPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );",
					"finalPosition.xy += rotatedPosition * ( sizeAttenuation == 1 ? 1.0 : finalPosition.z );",
					"finalPosition = projectionMatrix * finalPosition;",

				"}",

				"gl_Position = finalPosition;",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform vec3 color;",
			"uniform sampler2D map;",
			"uniform float opacity;",

			"uniform int fogType;",
			"uniform vec3 fogColor;",
			"uniform float fogDensity;",
			"uniform float fogNear;",
			"uniform float fogFar;",
			"uniform float alphaTest;",

			"varying vec2 vUV;",

			"void main() {",

				"vec4 texture = texture2D( map, vUV );",

				"if ( texture.a < alphaTest ) discard;",

				"gl_FragColor = vec4( color * texture.xyz, texture.a * opacity );",

				"if ( fogType > 0 ) {",

					"float depth = gl_FragCoord.z / gl_FragCoord.w;",
					"float fogFactor = 0.0;",

					"if ( fogType == 1 ) {",

						"fogFactor = smoothstep( fogNear, fogFar, depth );",

					"} else {",

						"const float LOG2 = 1.442695;",
						"float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );",
						"fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );",

					"}",

					"gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );",

				"}",

			"}"

		].join( "\n" )

	}

};
