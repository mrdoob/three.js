/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeLib = {
	nodes: {},
	add: function( node ) {

		this.nodes[ node.name ] = node;

	},
	remove: function( node ) {

		delete this.nodes[ node.name ];

	},
	get: function( name ) {

		return this.nodes[ name ];

	},
	contains: function( name ) {

		return this.nodes[ name ] != undefined;

	}
};

//
//	Luma
//

THREE.NodeLib.add( new THREE.ConstNode( "vec3 LUMA = vec3(0.2125, 0.7154, 0.0721);" ) );

//
//	DepthColor
//

THREE.NodeLib.add( new THREE.FunctionNode( [
"float depthcolor( float mNear, float mFar ) {",

	"#ifdef USE_LOGDEPTHBUF_EXT",
		"float depth = gl_FragDepthEXT / gl_FragCoord.w;",
	"#else",
		"float depth = gl_FragCoord.z / gl_FragCoord.w;",
	"#endif",

	"return 1.0 - smoothstep( mNear, mFar, depth );",
"}"
].join( "\n" ) ) );

//
//	NormalMap
//

THREE.NodeLib.add( new THREE.FunctionNode( [
// Per-Pixel Tangent Space Normal Mapping
// http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html
"vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 map, vec2 mUv, float scale ) {",
	"vec3 q0 = dFdx( eye_pos );",
	"vec3 q1 = dFdy( eye_pos );",
	"vec2 st0 = dFdx( mUv.st );",
	"vec2 st1 = dFdy( mUv.st );",
	"vec3 S = normalize( q0 * st1.t - q1 * st0.t );",
	"vec3 T = normalize( -q0 * st1.s + q1 * st0.s );",
	"vec3 N = normalize( surf_norm );",
	"vec3 mapN = map * 2.0 - 1.0;",
	"mapN.xy = scale * mapN.xy;",
	"mat3 tsn = mat3( S, T, N );",
	"return normalize( tsn * mapN );",
"}"
].join( "\n" ), null, { derivatives: true } ) );

//
//	Saturation
//

THREE.NodeLib.add( new THREE.FunctionNode( [
// Algorithm from Chapter 16 of OpenGL Shading Language
"vec3 saturation_rgb(vec3 rgb, float adjustment) {",
	"vec3 intensity = vec3(dot(rgb, LUMA));",
	"return mix(intensity, rgb, adjustment);",
"}"
].join( "\n" ) ) );

//
//	Luminance
//

THREE.NodeLib.add( new THREE.FunctionNode( [
// Algorithm from Chapter 10 of Graphics Shaders.
"float luminance_rgb(vec3 rgb) {",
	"return dot(rgb, LUMA);",
"}"
].join( "\n" ) ) );
