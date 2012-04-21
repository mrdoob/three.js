/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ParallaxBarrierEffect = function ( renderer ) {

	var shader = [

		"uniform sampler2D mapLeft;",
		"uniform sampler2D mapRight;",
		"varying vec2 vUv;",

		"void main() {",

		"	vec2 uv = vUv;",

		"	if ( ( mod( gl_FragCoord.x, 2.0 ) ) > 1.00 ) {",

		"		gl_FragColor = texture2D( mapLeft, uv );",

		"	} else {",

		"		gl_FragColor = texture2D( mapRight, uv );",

		"	}",

		"}"

	].join("\n");

	return new THREE.StereoEffect( renderer, shader );

};
