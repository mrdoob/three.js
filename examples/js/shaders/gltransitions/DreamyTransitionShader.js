/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery
 * @author mikolalysenko
 * 
 * All gltransitions are rewrited from https://gl-transitions.com/
 * 
 * License: MIT
 */

THREE.DreamyTransitionShader = {

	uniforms: {},

	fragmentShader: [
	
		"vec2 offset( float progress, float x, float theta ) {",

			"float phase = progress * progress + progress + theta;",
			"float shifty = 0.03 * progress * cos( 10.0 * ( progress+x ) );",

			"return vec2( 0, shifty );",

		"}",

		"vec4 transition( vec2 p ) {",

			"return mix(",

				"getFromColor( p + offset( progress, p.x, 0.0 ) ),",
				"getToColor( p + offset( 1.0-progress, p.x, 3.14 ) ),",
				"progress",
				
			");",

		"}"

	].join( "\n" )

};
