/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.AnaglyphEffect = function ( renderer ) {

	var shader = [

		"uniform sampler2D mapLeft;",
		"uniform sampler2D mapRight;",
		"varying vec2 vUv;",

		"void main() {",

		"	vec4 colorL, colorR;",
		"	vec2 uv = vUv;",

		"	colorL = texture2D( mapLeft, uv );",
		"	colorR = texture2D( mapRight, uv );",

			// http://3dtv.at/Knowhow/AnaglyphComparison_en.aspx

		"	gl_FragColor = vec4( colorL.g * 0.7 + colorL.b * 0.3, colorR.g, colorR.b, colorL.a + colorR.a ) * 1.1;",

		"}"

	].join("\n");

	return new THREE.StereoEffect( renderer, shader );

};
