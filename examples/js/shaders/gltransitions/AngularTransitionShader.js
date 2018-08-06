/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery
 * @author Fernando Kuteken
 * 
 * All gltransitions are rewrited from https://gl-transitions.com/
 * 
 * a basic gltransition
 * 
 * License: MIT
 */

THREE.AngularTransitionShader = {

	uniforms: {

		startingAngle: { value: Math.PI / 2 }

	},

	fragmentShader: [
		
		"#define PI 3.141592653589",
		"uniform float startingAngle;",

		"vec4 transition (vec2 uv) {",
		
			"float angle = atan(uv.y - 0.5, uv.x - 0.5) + startingAngle;",
			"float normalizedAngle = (angle + PI) / (2.0 * PI);",

			"normalizedAngle = normalizedAngle - floor(normalizedAngle);",

			"return mix (",
			
				"getFromColor( uv ),",
				"getToColor( uv ),",
				"step(normalizedAngle, progress)",
		
			");",

		"}"

	].join( "\n" )

};
