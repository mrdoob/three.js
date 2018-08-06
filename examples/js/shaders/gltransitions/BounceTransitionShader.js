/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery
 * @author Adrian Purser
 * 
 * All gltransitions are rewrited from https://gl-transitions.com/
 * 
 * License: MIT
 */

THREE.BounceTransitionShader = {

	uniforms: {

		shadowColour: { value: new THREE.Vector4() },
		shadowHeight: { value: 0.075 },
		bounces: { value: 3 }

	},

	fragmentShader: [
		
		"uniform vec4 shadowColour;",
		"uniform float shadowHeight;",
		"uniform float bounces;",
		
		"const float PI = 3.14159265358;",

		"vec4 transition ( vec2 uv ) {",
		
			"float time = progress;",
			"float stime = sin( time * PI / 2.0 );",
			"float phase = time * PI * bounces;",

			"float y = ( abs( cos( phase ) ) ) * ( 1.0 - stime );",
			"float d = uv.y - y;",

			"return mix (",
			
				"mix(",
					"getToColor( uv ),",
					"shadowColour,",
					"step( d, shadowHeight ) * ( 1.0 - mix(",

						"( ( d / shadowHeight ) * shadowColour.a ) + ( 1.0 - shadowColour.a ),",
						"1.0,",
						"smoothstep( 0.95, 1., progress ) // fade-out the shadow at the end",

					"))",

				"),",

				"getFromColor( vec2( uv.x, uv.y + ( 1.0 - y ) ) ),",
				"step( d, 0.0 )",
		
			");",

		"}"

	].join( "\n" )

};
