/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery
 * @author nwoeanhinnogaehr
 * 
 * All gltransitions are rewrited from https://gl-transitions.com/
 * 
 * License: MIT
 */

THREE.KaleidoscopeTransitionShader = {

	uniforms: {

		speed: { value: 1 },
		angle: { value: 1 },
		power: { value: 1 },

	},

	fragmentShader: [
	
		"uniform float speed;",
		"uniform float angle;",
		"uniform float power;",

		"vec4 transition( vec2 uv ) {",

			"vec2 p = uv.xy / vec2( 1.0 ).xy;",
			"vec2 q = p;",
			"float t = pow( progress, power ) * speed;",
			"p = p - 0.5;",

			"for (int i = 0; i < 7; i++) {",

				"p = vec2( sin( t ) * p.x + cos( t ) * p.y, sin( t ) * p.y - cos( t ) * p.x );",
				"t += angle;",
				"p = abs( mod( p, 2.0 ) - 1.0 );",

			"}",

			"return mix (",

				"mix( getFromColor( q ), getToColor( q ), progress ),",
				"mix( getFromColor( p ), getToColor( p ), progress ),",
				"1.0 - 2.0 * abs( progress - 0.5 )",

			");",

		"}"

	].join( "\n" )

};
