/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery
 * @author Sergey Kosarevsky / http://www.linderdaum.com
 * ported by gre from https://gist.github.com/corporateshark/cacfedb8cca0f5ce3f7c
 * 
 * All gltransitions are rewrited from https://gl-transitions.com/
 * 
 * License: MIT
 */

THREE.SwirlTransitionShader = {

	uniforms: {},

	fragmentShader: [

		"vec4 transition( vec2 uv ) {",

			"float radius = 1.0;",

			"uv -= vec2( 0.5, 0.5 );",

			"float dist = length( uv );",

			"if ( dist < radius ) {",

				"float percent = ( radius - dist ) / radius;",
				"float a = ( progress <= 0.5 ) ? mix( 0.0, 1.0, progress / 0.5 ) : mix( 1.0, 0.0, (progress - 0.5) / 0.5 );",
				"float theta = percent * percent * a * 8.0 * 3.14159;",
				"float y = sin( theta );",
				"float x = cos( theta );",
				"uv = vec2( dot( uv, vec2( x, -y ) ), dot( uv, vec2( y, x ) ) );",

			"}",
			"uv += vec2( 0.5, 0.5 );",

			"return mix( getFromColor( uv ), getToColor( uv ), progress );",

		"}"

	].join( "\n" )

};
