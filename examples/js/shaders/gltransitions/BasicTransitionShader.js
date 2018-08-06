/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery
 * All gltransitions are rewrited from https://gl-transitions.com/
 * 
 * License: MIT
 */

THREE.BasicTransitionShader = {

	uniforms: {},

	fragmentShader: [

		"vec4 transition (vec2 uv) {",

			"return mix (",
			
				"getFromColor( uv ),",
				"getToColor( uv ),",
				"progress",
		
			");",

		"}"

	].join( "\n" )

};
