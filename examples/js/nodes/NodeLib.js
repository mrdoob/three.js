/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeLib = {

	nodes: {},
	keywords: {},

	add: function ( node ) {

		this.nodes[ node.name ] = node;

	},

	addKeyword: function ( name, callback, cache ) {

		cache = cache !== undefined ? cache : true;

		this.keywords[ name ] = { callback: callback, cache: cache };

	},

	remove: function ( node ) {

		delete this.nodes[ node.name ];

	},

	removeKeyword: function ( name ) {

		delete this.keywords[ name ];

	},

	get: function ( name ) {

		return this.nodes[ name ];

	},

	getKeyword: function ( name, material ) {

		return this.keywords[ name ].callback.call( this, material );

	},

	getKeywordData: function ( name ) {

		return this.keywords[ name ];

	},

	contains: function ( name ) {

		return this.nodes[ name ] != undefined;

	},

	containsKeyword: function ( name ) {

		return this.keywords[ name ] != undefined;

	}

};

//
//	Keywords
//

THREE.NodeLib.addKeyword( 'uv', function () {

	return new THREE.UVNode();

} );

THREE.NodeLib.addKeyword( 'uv2', function () {

	return new THREE.UVNode( 1 );

} );

THREE.NodeLib.addKeyword( 'position', function () {

	return new THREE.PositionNode();

} );

THREE.NodeLib.addKeyword( 'worldPosition', function () {

	return new THREE.PositionNode( THREE.PositionNode.WORLD );

} );

THREE.NodeLib.addKeyword( 'normal', function () {

	return new THREE.NormalNode();

} );

THREE.NodeLib.addKeyword( 'worldNormal', function () {

	return new THREE.NormalNode( THREE.NormalNode.WORLD );

} );

THREE.NodeLib.addKeyword( 'viewPosition', function () {

	return new THREE.PositionNode( THREE.NormalNode.VIEW );

} );

THREE.NodeLib.addKeyword( 'viewNormal', function () {

	return new THREE.NormalNode( THREE.NormalNode.VIEW );

} );

THREE.NodeLib.addKeyword( 'time', function () {

	return new THREE.TimerNode();

} );

//
//	Luma
//

THREE.NodeLib.add( new THREE.ConstNode( "vec3 LUMA vec3(0.2125, 0.7154, 0.0721)" ) );

//
//	NormalMap
//

THREE.NodeLib.add( new THREE.FunctionNode( [
// Per-Pixel Tangent Space Normal Mapping
// http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html
	"vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 map, vec2 mUv, vec2 scale ) {",
	"	vec3 q0 = dFdx( eye_pos );",
	"	vec3 q1 = dFdy( eye_pos );",
	"	vec2 st0 = dFdx( mUv.st );",
	"	vec2 st1 = dFdy( mUv.st );",
	"	float factor = sign( st1.t * st0.s - st0.t * st1.s );",
	"	factor *= float( gl_FrontFacing ) * 2.0 - 1.0;",
	"	vec3 S = normalize( ( q0 * st1.t - q1 * st0.t ) * factor );",
	"	vec3 T = normalize( ( -q0 * st1.s + q1 * st0.s ) * factor );",
	"	vec3 N = normalize( surf_norm );",
	"	vec3 mapN = map * 2.0 - 1.0;",
	"	mapN.xy = scale * mapN.xy;",
	"	mat3 tsn = mat3( S, T, N );",
	"	return normalize( tsn * mapN );",
	"}"
].join( "\n" ), null, { derivatives: true } ) );

//
//	Noise
//

THREE.NodeLib.add( new THREE.FunctionNode( [
	"float snoise(vec2 co) {",
	"	return fract( sin( dot(co.xy, vec2(12.9898,78.233) ) ) * 43758.5453 );",
	"}"
].join( "\n" ) ) );

//
//	Hue
//

THREE.NodeLib.add( new THREE.FunctionNode( [
	"vec3 hue_rgb(vec3 rgb, float adjustment) {",
	"	const mat3 RGBtoYIQ = mat3(0.299, 0.587, 0.114, 0.595716, -0.274453, -0.321263, 0.211456, -0.522591, 0.311135);",
	"	const mat3 YIQtoRGB = mat3(1.0, 0.9563, 0.6210, 1.0, -0.2721, -0.6474, 1.0, -1.107, 1.7046);",
	"	vec3 yiq = RGBtoYIQ * rgb;",
	"	float hue = atan(yiq.z, yiq.y) + adjustment;",
	"	float chroma = sqrt(yiq.z * yiq.z + yiq.y * yiq.y);",
	"	return YIQtoRGB * vec3(yiq.x, chroma * cos(hue), chroma * sin(hue));",
	"}"
].join( "\n" ) ) );

//
//	Saturation
//

THREE.NodeLib.add( new THREE.FunctionNode( [
// Algorithm from Chapter 16 of OpenGL Shading Language
	"vec3 saturation_rgb(vec3 rgb, float adjustment) {",
	"	vec3 intensity = vec3(dot(rgb, LUMA));",
	"	return mix(intensity, rgb, adjustment);",
	"}"
].join( "\n" ) ) );

//
//	Luminance
//

THREE.NodeLib.add( new THREE.FunctionNode( [
// Algorithm from Chapter 10 of Graphics Shaders
	"float luminance_rgb(vec3 rgb) {",
	"	return dot(rgb, LUMA);",
	"}"
].join( "\n" ) ) );

//
//	Vibrance
//

THREE.NodeLib.add( new THREE.FunctionNode( [
// Shader by Evan Wallace adapted by @lo-th
	"vec3 vibrance_rgb(vec3 rgb, float adjustment) {",
	"	float average = (rgb.r + rgb.g + rgb.b) / 3.0;",
	"	float mx = max(rgb.r, max(rgb.g, rgb.b));",
	"	float amt = (mx - average) * (-3.0 * adjustment);",
	"	return mix(rgb.rgb, vec3(mx), amt);",
	"}"
].join( "\n" ) ) );
