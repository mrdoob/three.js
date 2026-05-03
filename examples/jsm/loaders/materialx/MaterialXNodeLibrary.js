import {
	abs,
	add,
	clamp,
	floor,
	ceil,
	round,
	sign,
	sin,
	cos,
	tan,
	asin,
	acos,
	sqrt,
	log,
	exp,
	min,
	max,
	normalize,
	length,
	dot,
	cross,
	mul,
	div,
	pow,
	distance,
	remap,
	luminance,
	mx_rgbtohsv,
	mx_hsvtorgb,
	mix,
	saturation as mx_saturation,
	transpose,
	determinant,
	inverse,
	normalMap,
	mat3,
	mx_ramp4,
	mx_ramplr,
	mx_ramptb,
	mx_splitlr,
	mx_splittb,
	mx_fractal_noise_float,
	mx_fractal_noise_vec3,
	mx_noise_float,
	mx_noise_vec3,
	mx_cell_noise_float,
	mx_cell_noise_vec3,
	mx_smoothstep,
	mx_worley_noise_float_2d,
	mx_worley_noise_float_3d,
	mx_worley_noise_vec3_style,
	mx_unifiednoise2d,
	mx_unifiednoise3d,
	mx_modulo,
	mx_invert,
	mx_place2d,
	mx_rotate2d,
	mx_rotate3d,
	mx_safepower,
	mx_contrast,
	element,
	reflect,
	refract,
	mx_timer,
	mx_frame,
	mx_ifgreater,
	mx_ifgreatereq,
	mx_ifequal,
	mx_atan2,
	positionLocal,
	positionWorld,
	mx_heighttonormal,
	float,
	int,
	bool,
	color,
	modelNormalMatrix,
	modelWorldMatrix,
	modelWorldMatrixInverse,
	vec2,
	vec3,
	vec4,
	checker,
	fract,
	sub,
	step,
	and as tslAnd,
	or as tslOr,
	xor as tslXor,
	not as tslNot,
	Fn,
	Loop,
} from 'three/tsl';
import { normalizeSpaceName } from './MaterialXUtils.js';

const createMXElement = ( name, nodeFunc, params = [], defaults = {}, usesNode = false ) => ( { name, nodeFunc, params, defaults, usesNode } );

const mx_range = ( inNode, inLow, inHigh, outLow, outHigh, gamma = 1 ) => {

	const inSpan = max( sub( inHigh, inLow ), 1e-6 );
	const normalized = div( sub( inNode, inLow ), inSpan );
	const reciprocalGamma = div( 1, gamma );
	const gammaApplied = mul( pow( abs( normalized ), reciprocalGamma ), sign( normalized ) );
	return add( outLow, mul( gammaApplied, sub( outHigh, outLow ) ) );

};

const mx_open_pbr_anisotropy = ( roughness = 0, anisotropy = 0 ) => {

	const anisoInvert = sub( float( 1 ), anisotropy );
	const anisoInvertSq = mul( anisoInvert, anisoInvert );
	const denom = add( anisoInvertSq, float( 1 ) );
	const fraction = div( float( 2 ), denom );
	const sqrtFraction = sqrt( fraction );
	const roughSq = mul( roughness, roughness );
	const alphaX = mul( roughSq, sqrtFraction );
	const alphaY = mul( anisoInvert, alphaX );
	return vec2( alphaX, alphaY );

};

const BOOLEAN_OPERATOR_OPS = new Set( [ '&&', '||', '^^', '!', '==', '!=', '<', '>', '<=', '>=' ] );
const isBooleanNode = ( node ) => node && ( node.nodeType === 'bool' || ( node.isOperatorNode && BOOLEAN_OPERATOR_OPS.has( node.op ) ) );
const mx_boolean = ( inNode ) => {

	if ( typeof inNode === 'boolean' ) return bool( inNode );
	if ( typeof inNode === 'number' ) return bool( inNode !== 0 );
	if ( isBooleanNode( inNode ) ) return inNode;
	return inNode.notEqual( float( 0 ) );

};
const mx_and = ( in1, in2 ) => tslAnd( mx_boolean( in1 ), mx_boolean( in2 ) );
const mx_or = ( in1, in2 ) => tslOr( mx_boolean( in1 ), mx_boolean( in2 ) );
const mx_xor = ( in1, in2 ) => tslXor( mx_boolean( in1 ), mx_boolean( in2 ) );
const mx_not = ( inNode ) => tslNot( mx_boolean( inNode ) );
const mx_checkerboard = ( color1, color2, texcoord ) => mix( color1, color2, clamp( checker( texcoord ), 0, 1 ) );

const mx_circle = ( texcoord, center, radius ) => {

	const delta = sub( texcoord, center );
	const distanceSquared = dot( delta, delta );
	const radiusSquared = mul( radius, radius );
	return mx_ifgreater( distanceSquared, radiusSquared, 0, 1 );

};

const mx_bump = ( height, scale = 1 ) => normalMap( mx_heighttonormal( height, 1 ), scale );
const mx_dot = ( inNode ) => inNode;
const mx_viewdirection = () => normalize( mul( positionWorld, float( - 1 ) ) );
const getRGBChannels = ( input ) => vec3( element( input, 0 ), element( input, 1 ), element( input, 2 ) );
const mx_blackbody = ( temperature = 5000 ) => {

	const temperatureKelvin = clamp( temperature, float( 800 ), float( 25000 ) );
	const t = div( float( 1000 ), temperatureKelvin );
	const t2 = mul( t, t );
	const t3 = mul( t2, t );
	const lowX = add( add( mul( float( - 0.2661239 ), t3 ), mul( float( - 0.234358 ), t2 ) ), add( mul( float( 0.8776956 ), t ), float( 0.17991 ) ) );
	const highX = add(
		add( mul( float( - 3.0258469 ), t3 ), mul( float( 2.1070379 ), t2 ) ),
		add( mul( float( 0.2226347 ), t ), float( 0.24039 ) ),
	);
	const xc = mx_ifgreatereq( temperatureKelvin, float( 4000 ), highX, lowX );
	const xc2 = mul( xc, xc );
	const xc3 = mul( xc2, xc );
	const ycLow = add(
		add( mul( float( - 1.1063814 ), xc3 ), mul( float( - 1.3481102 ), xc2 ) ),
		add( mul( float( 2.18555832 ), xc ), float( - 0.20219683 ) ),
	);
	const ycMid = add(
		add( mul( float( - 0.9549476 ), xc3 ), mul( float( - 1.37418593 ), xc2 ) ),
		add( mul( float( 2.09137015 ), xc ), float( - 0.16748867 ) ),
	);
	const ycHigh = add(
		add( mul( float( 3.081758 ), xc3 ), mul( float( - 5.8733867 ), xc2 ) ),
		add( mul( float( 3.75112997 ), xc ), float( - 0.37001483 ) ),
	);
	const ycLowMid = mx_ifgreatereq( temperatureKelvin, float( 2222 ), ycMid, ycLow );
	const yc = mx_ifgreatereq( temperatureKelvin, float( 4000 ), ycHigh, ycLowMid );
	const safeYc = max( yc, float( 1e-6 ) );
	const xyz = vec3( div( xc, safeYc ), float( 1 ), div( sub( sub( float( 1 ), xc ), yc ), safeYc ) );
	const rgb = vec3(
		add( add( mul( float( 3.2406 ), element( xyz, 0 ) ), mul( float( - 1.5372 ), element( xyz, 1 ) ) ), mul( float( - 0.4986 ), element( xyz, 2 ) ) ),
		add( add( mul( float( - 0.9689 ), element( xyz, 0 ) ), mul( float( 1.8758 ), element( xyz, 1 ) ) ), mul( float( 0.0415 ), element( xyz, 2 ) ) ),
		add( add( mul( float( 0.0557 ), element( xyz, 0 ) ), mul( float( - 0.204 ), element( xyz, 1 ) ) ), mul( float( 1.057 ), element( xyz, 2 ) ) ),
	);
	const clampedRgb = max( rgb, vec3( 0, 0, 0 ) );
	const validYcMask = step( float( 1e-6 ), yc );
	return mix( vec3( 1, 1, 1 ), clampedRgb, validYcMask );

};

const mx_unpremult = ( input ) => {

	const alpha = element( input, 3 );
	const rgb = getRGBChannels( input );
	const unpremultiplied = alpha.equal( 0 ).mix( rgb, div( rgb, alpha ) );
	return vec4( unpremultiplied, alpha );

};

const mx_colorcorrect = (
	input,
	hue = 0,
	saturationAmount = 1,
	gamma = 1,
	lift = 0,
	gain = 1,
	contrast = 1,
	contrastPivot = 0.5,
	exposure = 0,
) => {

	const rgbInput = getRGBChannels( input );
	const hsv = mx_rgbtohsv( rgbInput );
	const hueAdjusted = mx_hsvtorgb( add( hsv, vec3( hue, 0, 0 ) ) );
	const saturationAdjusted = mx_saturation( hueAdjusted, saturationAmount );
	const gammaAdjusted = mx_range( saturationAdjusted, 0, 1, 0, 1, gamma );
	const liftApplied = add( mul( gammaAdjusted, sub( 1, lift ) ), lift );
	const gainApplied = mul( liftApplied, gain );
	const contrastApplied = mx_contrast( gainApplied, contrast, contrastPivot );
	const exposureApplied = mul( contrastApplied, pow( 2, exposure ) );
	const preserveAlpha = input && ( input.nodeType === 'vec4' || input.nodeType === 'color4' );
	return preserveAlpha ? vec4( exposureApplied, element( input, 3 ) ) : exposureApplied;

};

const mx_minus = ( fg, bg, mixval = 1 ) => add( mul( mixval, sub( bg, fg ) ), mul( sub( 1, mixval ), bg ) );
const mx_difference = ( fg, bg, mixval = 1 ) => add( mul( mixval, abs( sub( bg, fg ) ) ), mul( sub( 1, mixval ), bg ) );
const mx_screen = ( fg, bg, mixval = 1 ) => {

	const screened = sub( 1, mul( sub( 1, fg ), sub( 1, bg ) ) );
	return mix( bg, screened, mixval );

};

const mx_overlay = ( fg, bg, mixval = 1 ) => {

	const lowBranch = mul( mul( 2, fg ), bg );
	const highBranch = sub( 1, mul( mul( 2, sub( 1, fg ) ), sub( 1, bg ) ) );
	const overlayed = mix( lowBranch, highBranch, step( 0.5, bg ) );
	return mix( bg, overlayed, mixval );

};

const mx_transformnormal = ( inNode = vec3( 0, 0, 1 ), fromspace = 'world', tospace = 'world' ) => {

	const from = normalizeSpaceName( fromspace, 'world' );
	const to = normalizeSpaceName( tospace, 'world' );
	const inNormal = vec3( inNode );

	if ( from === to ) {

		return normalize( inNormal );

	}

	if ( from === 'object' && to === 'world' ) {

		return normalize( mul( inNormal, modelNormalMatrix ) );

	}

	return normalize( mul( inNormal, mat3( modelWorldMatrix ) ) );

};

const mx_transformvector = ( inNode = vec3( 0, 0, 0 ), fromspace = 'world', tospace = 'world' ) => {

	const from = normalizeSpaceName( fromspace, 'world' );
	const to = normalizeSpaceName( tospace, 'world' );
	const inVector = vec3( inNode );

	if ( from === to ) {

		return inVector;

	}

	if ( from === 'object' && to === 'world' ) {

		return mul( inVector, mat3( modelWorldMatrix ) );

	}

	return mul( inVector, mat3( modelWorldMatrixInverse ) );

};

const mx_transformpoint = ( inNode = vec3( 0, 0, 0 ), fromspace = 'world', tospace = 'world' ) => {

	const from = normalizeSpaceName( fromspace, 'world' );
	const to = normalizeSpaceName( tospace, 'world' );
	const inPoint = vec3( inNode );

	if ( from === to ) {

		return inPoint;

	}

	const point4 = vec4( inPoint, 1 );
	const matrix = from === 'object' && to === 'world' ? modelWorldMatrix : modelWorldMatrixInverse;
	const transformed4 = mul( point4, matrix );
	return vec3( element( transformed4, 0 ), element( transformed4, 1 ), element( transformed4, 2 ) );

};

const mx_burn_channel = ( fg, bg, mixval = 1 ) => {

	const composed = add( mul( mixval, sub( 1, div( sub( 1, bg ), fg ) ) ), mul( sub( 1, mixval ), bg ) );
	return mul( composed, step( float( 1e-6 ), abs( fg ) ) );

};

const mx_dodge_channel = ( fg, bg, mixval = 1 ) => {

	const composed = add( mul( mixval, div( bg, sub( 1, fg ) ) ), mul( sub( 1, mixval ), bg ) );
	return mul( composed, step( float( 1e-6 ), abs( sub( 1, fg ) ) ) );

};

const isVec3Like = ( node ) =>
	node && ( node.nodeType === 'vec3' || node.nodeType === 'color' || node.nodeType === 'color3' );
const isVec4Like = ( node ) => node && ( node.nodeType === 'vec4' || node.nodeType === 'color4' );

const applyBlendByChannel = ( channelFunc, fg, bg, mixval = 1 ) => {

	if ( isVec4Like( fg ) || isVec4Like( bg ) ) {

		return vec4(
			channelFunc( element( fg, 0 ), element( bg, 0 ), mixval ),
			channelFunc( element( fg, 1 ), element( bg, 1 ), mixval ),
			channelFunc( element( fg, 2 ), element( bg, 2 ), mixval ),
			channelFunc( element( fg, 3 ), element( bg, 3 ), mixval ),
		);

	}

	if ( isVec3Like( fg ) || isVec3Like( bg ) ) {

		return vec3(
			channelFunc( element( fg, 0 ), element( bg, 0 ), mixval ),
			channelFunc( element( fg, 1 ), element( bg, 1 ), mixval ),
			channelFunc( element( fg, 2 ), element( bg, 2 ), mixval ),
		);

	}

	return channelFunc( fg, bg, mixval );

};

const mx_burn = ( fg, bg, mixval = 1 ) => applyBlendByChannel( mx_burn_channel, fg, bg, mixval );
const mx_dodge = ( fg, bg, mixval = 1 ) => applyBlendByChannel( mx_dodge_channel, fg, bg, mixval );

const mixColor4 = ( bg, fg, factor ) =>
	vec4(
		mix( element( bg, 0 ), element( fg, 0 ), factor ),
		mix( element( bg, 1 ), element( fg, 1 ), factor ),
		mix( element( bg, 2 ), element( fg, 2 ), factor ),
		mix( element( bg, 3 ), element( fg, 3 ), factor ),
	);

const mxRampSegment = ( x, color1, color2, interval1, interval2, interpolation ) => {

	const linearClamped = clamp( x, interval1, interval2 );
	const rangeSize = sub( interval2, interval1 );
	const safeRange = max( rangeSize, float( 1e-6 ) );
	const linearRemap = div( sub( linearClamped, interval1 ), safeRange );
	const smoothVal = mx_smoothstep( x, interval1, interval2 );
	const interpolationDistanceToLinear = abs( sub( interpolation, float( 0 ) ) );
	const useLinear = sub( float( 1 ), step( float( 0.5 ), interpolationDistanceToLinear ) );
	const interpFactor = mix( smoothVal, linearRemap, useLinear );
	const mixedColor = mixColor4( color1, color2, interpFactor );
	const stepColor = mixColor4( color1, color2, step( interval2, x ) );
	const interpolationDistanceToStep = abs( sub( interpolation, float( 2 ) ) );
	const useStep = sub( float( 1 ), step( float( 0.5 ), interpolationDistanceToStep ) );
	return mixColor4( mixedColor, stepColor, useStep );

};

const mx_ramp_gradient = (
	x = 0,
	interval1 = 0,
	interval2 = 1,
	color1 = vec4( 0, 0, 0, 1 ),
	color2 = vec4( 1, 1, 1, 1 ),
	interpolation = 1,
	prevColor = vec4( 0, 0, 0, 1 ),
	intervalNum = 1,
	numIntervals = 2,
) => {

	const xFloat = float( x );
	const interval1Float = float( interval1 );
	const interval2Float = float( interval2 );
	const interpolationFloat = float( interpolation );
	const intervalNumFloat = float( intervalNum );
	const numIntervalsFloat = float( numIntervals );
	const interpolated = mxRampSegment( xFloat, color1, color2, interval1Float, interval2Float, interpolationFloat );
	const withinInterval = mixColor4( prevColor, interpolated, step( add( interval1Float, float( 1e-6 ) ), xFloat ) );
	return mixColor4( withinInterval, prevColor, step( numIntervalsFloat, intervalNumFloat ) );

};

const mx_ramp = ( texcoord = vec2( 0, 0 ), type = 0, interpolation = 1, numIntervals = 2, ...rest ) => {

	const rampTypeFloat = float( type );
	const interpolationFloat = float( interpolation );
	const numIntervalsFloat = float( numIntervals );

	const clamped = clamp( texcoord, vec2( 0, 0 ), vec2( 1, 1 ) );
	const s = element( clamped, 0 );
	const t = element( clamped, 1 );

	const centeredS = sub( s, float( 0.5 ) );
	const centeredT = sub( t, float( 0.5 ) );

	const radialDist = sqrt( add( mul( centeredS, centeredS ), mul( centeredT, centeredT ) ) );
	const radialVal = clamp( mul( radialDist, float( 2 ) ), float( 0 ), float( 1 ) );
	const circularAngle = add( div( mx_atan2( centeredT, centeredS ), float( Math.PI * 2 ) ), float( 0.5 ) );
	const boxVal = clamp( mul( max( abs( centeredS ), abs( centeredT ) ), float( 2 ) ), float( 0 ), float( 1 ) );

	const typeDistanceToRadial = abs( sub( rampTypeFloat, float( 1 ) ) );
	const typeDistanceToCircular = abs( sub( rampTypeFloat, float( 2 ) ) );
	const typeDistanceToBox = abs( sub( rampTypeFloat, float( 3 ) ) );
	const useRadial = sub( float( 1 ), step( float( 0.5 ), typeDistanceToRadial ) );
	const useCircular = sub( float( 1 ), step( float( 0.5 ), typeDistanceToCircular ) );
	const useBox = sub( float( 1 ), step( float( 0.5 ), typeDistanceToBox ) );
	const afterRadial = mix( s, radialVal, useRadial );
	const afterCircular = mix( afterRadial, circularAngle, useCircular );
	const rampX = mix( afterCircular, boxVal, useBox );

	const intervals = [];
	const colors = [];
	for ( let i = 0; i < 10; i += 1 ) {

		const intervalInput = rest[ i * 2 ];
		const colorInput = rest[ i * 2 + 1 ];
		intervals.push( intervalInput ?? float( i <= 1 ? i : 1 ) );
		colors.push( colorInput ?? vec4( i === 0 ? 0 : 1, i === 0 ? 0 : 1, i === 0 ? 0 : 1, 1 ) );

	}

	let result = colors[ 0 ];
	for ( let i = 0; i < 9; i += 1 ) {

		const iv1 = intervals[ i ];
		const iv2 = intervals[ i + 1 ];
		const c1 = colors[ i ];
		const c2 = colors[ i + 1 ];
		const intNum = float( i + 1 );

		const interpolated = mxRampSegment( rampX, c1, c2, iv1, iv2, interpolationFloat );
		const withinInterval = mixColor4( result, interpolated, step( add( iv1, float( 1e-6 ) ), rampX ) );
		result = mixColor4( withinInterval, result, step( numIntervalsFloat, intNum ) );

	}

	return result;

};

const defaultFloat = ( value ) => () => float( value );
const defaultInt = ( value ) => () => int( value );
const defaultBool = ( value ) => () => bool( value );
const defaultColor = ( r, g, b ) => () => color( r, g, b );
const defaultVec2 = ( x, y ) => () => vec2( x, y );
const defaultVec3 = ( x, y, z ) => () => vec3( x, y, z );
const defaultVec4 = ( x, y, z, w ) => () => vec4( x, y, z, w );
const usesVec2Noise = ( nodeX ) => nodeX && nodeX.type === 'vector2';
const usesVec3Noise = ( nodeX ) => nodeX && ( nodeX.type === 'vector3' || nodeX.type === 'color3' );

const mx_noise_materialx = ( texcoord, amplitude, pivot, nodeX ) =>
	usesVec3Noise( nodeX ) ? mx_noise_vec3( texcoord, vec3( amplitude ), pivot ) : mx_noise_float( texcoord, amplitude, pivot );

const mx_fractal_noise_materialx_2d = ( texcoord, octaves, lacunarity, diminish, amplitude, nodeX ) =>
	usesVec3Noise( nodeX ) ? mx_fractal_noise_vec3_materialx_2d( texcoord, octaves, lacunarity, diminish, amplitude ) : mx_fractal_noise_float_materialx_2d( texcoord, octaves, lacunarity, diminish, amplitude );

const mx_fractal_noise_materialx_3d = ( position, octaves, lacunarity, diminish, amplitude, nodeX ) =>
	usesVec3Noise( nodeX ) ? mx_fractal_noise_vec3( position, octaves, lacunarity, diminish, vec3( amplitude ) ) : mx_fractal_noise_float( position, octaves, lacunarity, diminish, amplitude );

const mx_cell_noise_materialx = ( position, nodeX ) =>
	usesVec3Noise( nodeX ) ? mx_cell_noise_vec3( position ) : mx_cell_noise_float( position );

const mx_worley_noise_vec2_style = ( position, jitter, style ) => {

	const result = mx_worley_noise_vec3_style( position, jitter, style, 0 );
	return vec2( element( result, 0 ), element( result, 1 ) );

};

const mx_worley_noise_materialx_2d = ( texcoord, jitter, style, nodeX ) =>
	usesVec3Noise( nodeX ) ? mx_worley_noise_vec3_style( texcoord, jitter, style, 0 ) : usesVec2Noise( nodeX ) ? mx_worley_noise_vec2_style( texcoord, jitter, style ) : mx_worley_noise_float_2d( texcoord, jitter, style );

const mx_worley_noise_materialx_3d = ( position, jitter, style, nodeX ) =>
	usesVec3Noise( nodeX ) ? mx_worley_noise_vec3_style( position, jitter, style, 0 ) : usesVec2Noise( nodeX ) ? mx_worley_noise_vec2_style( position, jitter, style ) : mx_worley_noise_float_3d( position, jitter, style );

const mx_fractal_noise_float_materialx_2d = Fn( ( [ texcoordInput, octavesInput, lacunarityInput, diminishInput, amplitudeInput ] ) => {

	const texcoord = vec2( texcoordInput ).toVar();
	const octaves = int( octavesInput ).toVar();
	const lacunarity = float( lacunarityInput ).toVar();
	const diminish = float( diminishInput ).toVar();
	const amplitude = float( amplitudeInput ).toVar();
	const result = float( 0 ).toVar();
	const octaveAmplitude = float( 1 ).toVar();

	Loop( octaves, () => {

		result.addAssign( mul( octaveAmplitude, mx_noise_float( texcoord, float( 1 ), float( 0 ) ) ) );
		octaveAmplitude.mulAssign( diminish );
		texcoord.mulAssign( lacunarity );

	} );

	return mul( result, amplitude );

} );

const mx_fractal_noise_vec3_materialx_2d = Fn( ( [ texcoordInput, octavesInput, lacunarityInput, diminishInput, amplitudeInput ] ) => {

	const texcoord = vec2( texcoordInput ).toVar();
	const octaves = int( octavesInput ).toVar();
	const lacunarity = float( lacunarityInput ).toVar();
	const diminish = float( diminishInput ).toVar();
	const amplitude = vec3( amplitudeInput ).toVar();
	const result = vec3( 0 ).toVar();
	const octaveAmplitude = float( 1 ).toVar();

	Loop( octaves, () => {

		result.addAssign( mul( octaveAmplitude, mx_noise_vec3( texcoord, vec3( 1 ), float( 0 ) ) ) );
		octaveAmplitude.mulAssign( diminish );
		texcoord.mulAssign( lacunarity );

	} );

	return mul( result, amplitude );

} );

const MXElements = [
	createMXElement( 'add', add, [ 'in1', 'in2' ], { in1: defaultFloat( 0 ), in2: defaultFloat( 0 ) } ),
	createMXElement( 'subtract', sub, [ 'in1', 'in2' ], { in1: defaultFloat( 0 ), in2: defaultFloat( 0 ) } ),
	createMXElement( 'multiply', mul, [ 'in1', 'in2' ], { in1: defaultFloat( 0 ), in2: defaultFloat( 1 ) } ),
	createMXElement( 'divide', div, [ 'in1', 'in2' ], { in1: defaultFloat( 0 ), in2: defaultFloat( 1 ) } ),
	createMXElement( 'modulo', mx_modulo, [ 'in1', 'in2' ], { in1: defaultFloat( 0 ), in2: defaultFloat( 1 ) } ),
	createMXElement( 'absval', abs, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'sign', sign, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'floor', floor, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'ceil', ceil, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'round', round, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'power', pow, [ 'in1', 'in2' ], { in1: defaultFloat( 0 ), in2: defaultFloat( 1 ) } ),
	createMXElement( 'sin', sin, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'cos', cos, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'tan', tan, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'asin', asin, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'acos', acos, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'atan2', mx_atan2, [ 'iny', 'inx' ], { iny: defaultFloat( 0 ), inx: defaultFloat( 1 ) } ),
	createMXElement( 'sqrt', sqrt, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'ln', log, [ 'in' ], { in: defaultFloat( 1 ) } ),
	createMXElement( 'exp', exp, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'fract', fract, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'clamp', clamp, [ 'in', 'low', 'high' ], {
		in: defaultFloat( 0 ),
		low: defaultFloat( 0 ),
		high: defaultFloat( 1 ),
	} ),
	createMXElement( 'min', min, [ 'in1', 'in2' ], { in1: defaultFloat( 0 ), in2: defaultFloat( 0 ) } ),
	createMXElement( 'max', max, [ 'in1', 'in2' ], { in1: defaultFloat( 0 ), in2: defaultFloat( 0 ) } ),
	createMXElement( 'normalize', normalize, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'magnitude', length, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'length', length, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'dot', mx_dot, [ 'in' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'dotproduct', dot, [ 'in1', 'in2' ], { in1: defaultFloat( 0 ), in2: defaultFloat( 0 ) } ),
	createMXElement( 'viewdirection', mx_viewdirection ),
	createMXElement( 'crossproduct', cross, [ 'in1', 'in2' ], { in1: defaultVec3( 0, 0, 0 ), in2: defaultVec3( 0, 0, 0 ) } ),
	createMXElement( 'distance', distance, [ 'in1', 'in2' ], { in1: defaultFloat( 0 ), in2: defaultFloat( 0 ) } ),
	createMXElement( 'invert', mx_invert, [ 'in', 'amount' ], { in: defaultFloat( 0 ), amount: defaultFloat( 1 ) } ),
	createMXElement( 'transformmatrix', mul, [ 'in', 'mat' ], { in: defaultFloat( 0 ) } ),
	createMXElement( 'transformnormal', mx_transformnormal, [ 'in', 'fromspace', 'tospace' ], {
		in: defaultVec3( 0, 0, 1 ),
		fromspace: () => 'world',
		tospace: () => 'world',
	} ),
	createMXElement( 'transformpoint', mx_transformpoint, [ 'in', 'fromspace', 'tospace' ], {
		in: defaultVec3( 0, 0, 0 ),
		fromspace: () => 'world',
		tospace: () => 'world',
	} ),
	createMXElement( 'transformvector', mx_transformvector, [ 'in', 'fromspace', 'tospace' ], {
		in: defaultVec3( 0, 0, 0 ),
		fromspace: () => 'world',
		tospace: () => 'world',
	} ),
	createMXElement( 'normalmap', normalMap, [ 'in', 'scale' ], { in: defaultVec3( 0.5, 0.5, 1.0 ), scale: defaultFloat( 1 ) } ),
	createMXElement( 'transpose', transpose, [ 'in' ] ),
	createMXElement( 'determinant', determinant, [ 'in' ] ),
	createMXElement( 'invertmatrix', inverse, [ 'in' ] ),
	createMXElement( 'creatematrix', mat3, [ 'in1', 'in2', 'in3' ], {
		in1: defaultVec3( 1, 0, 0 ),
		in2: defaultVec3( 0, 1, 0 ),
		in3: defaultVec3( 0, 0, 1 ),
	} ),
	createMXElement( 'remap', remap, [ 'in', 'inlow', 'inhigh', 'outlow', 'outhigh' ], {
		in: defaultFloat( 0 ),
		inlow: defaultFloat( 0 ),
		inhigh: defaultFloat( 1 ),
		outlow: defaultFloat( 0 ),
		outhigh: defaultFloat( 1 ),
	} ),
	createMXElement( 'range', mx_range, [ 'in', 'inlow', 'inhigh', 'outlow', 'outhigh', 'gamma' ], {
		in: defaultFloat( 0 ),
		inlow: defaultFloat( 0 ),
		inhigh: defaultFloat( 1 ),
		outlow: defaultFloat( 0 ),
		outhigh: defaultFloat( 1 ),
		gamma: defaultFloat( 1 ),
	} ),
	createMXElement( 'open_pbr_anisotropy', mx_open_pbr_anisotropy, [ 'roughness', 'anisotropy' ], {
		roughness: defaultFloat( 0 ),
		anisotropy: defaultFloat( 0 ),
	} ),
	createMXElement( 'smoothstep', mx_smoothstep, [ 'in', 'low', 'high' ], {
		in: defaultFloat( 0 ),
		low: defaultFloat( 0 ),
		high: defaultFloat( 1 ),
	} ),
	createMXElement( 'luminance', luminance, [ 'in', 'lumacoeffs' ], {
		in: defaultColor( 0, 0, 0 ),
		lumacoeffs: defaultColor( 0.2722287, 0.6740818, 0.0536895 ),
	} ),
	createMXElement( 'rgbtohsv', mx_rgbtohsv, [ 'in' ], { in: defaultColor( 0, 0, 0 ) } ),
	createMXElement( 'hsvtorgb', mx_hsvtorgb, [ 'in' ], { in: defaultColor( 0, 0, 0 ) } ),
	createMXElement( 'mix', mix, [ 'bg', 'fg', 'mix' ], { bg: defaultFloat( 0 ), fg: defaultFloat( 0 ), mix: defaultFloat( 0 ) } ),
	createMXElement( 'minus', mx_minus, [ 'fg', 'bg', 'mix' ], {
		fg: defaultFloat( 0 ),
		bg: defaultFloat( 0 ),
		mix: defaultFloat( 1 ),
	} ),
	createMXElement( 'difference', mx_difference, [ 'fg', 'bg', 'mix' ], {
		fg: defaultFloat( 0 ),
		bg: defaultFloat( 0 ),
		mix: defaultFloat( 1 ),
	} ),
	createMXElement( 'screen', mx_screen, [ 'fg', 'bg', 'mix' ], {
		fg: defaultFloat( 0 ),
		bg: defaultFloat( 0 ),
		mix: defaultFloat( 1 ),
	} ),
	createMXElement( 'overlay', mx_overlay, [ 'fg', 'bg', 'mix' ], {
		fg: defaultFloat( 0 ),
		bg: defaultFloat( 0 ),
		mix: defaultFloat( 1 ),
	} ),
	createMXElement( 'burn', mx_burn, [ 'fg', 'bg', 'mix' ], {
		fg: defaultFloat( 0 ),
		bg: defaultFloat( 0 ),
		mix: defaultFloat( 1 ),
	} ),
	createMXElement( 'dodge', mx_dodge, [ 'fg', 'bg', 'mix' ], {
		fg: defaultFloat( 0 ),
		bg: defaultFloat( 0 ),
		mix: defaultFloat( 1 ),
	} ),
	createMXElement(
		'colorcorrect',
		mx_colorcorrect,
		[ 'in', 'hue', 'saturation', 'gamma', 'lift', 'gain', 'contrast', 'contrastpivot', 'exposure' ],
		{
			in: defaultColor( 1, 1, 1 ),
			hue: defaultFloat( 0 ),
			saturation: defaultFloat( 1 ),
			gamma: defaultFloat( 1 ),
			lift: defaultFloat( 0 ),
			gain: defaultFloat( 1 ),
			contrast: defaultFloat( 1 ),
			contrastpivot: defaultFloat( 0.5 ),
			exposure: defaultFloat( 0 ),
		},
	),
	createMXElement( 'unpremult', mx_unpremult, [ 'in' ], { in: defaultVec4( 0, 0, 0, 1 ) } ),
	createMXElement( 'combine2', vec2, [ 'in1', 'in2' ], { in1: defaultFloat( 0 ), in2: defaultFloat( 0 ) } ),
	createMXElement( 'combine3', vec3, [ 'in1', 'in2', 'in3' ], {
		in1: defaultFloat( 0 ),
		in2: defaultFloat( 0 ),
		in3: defaultFloat( 0 ),
	} ),
	createMXElement( 'combine4', vec4, [ 'in1', 'in2', 'in3', 'in4' ], {
		in1: defaultFloat( 0 ),
		in2: defaultFloat( 0 ),
		in3: defaultFloat( 0 ),
		in4: defaultFloat( 0 ),
	} ),
	createMXElement( 'ramplr', mx_ramplr, [ 'valuel', 'valuer', 'texcoord' ], {
		valuel: defaultFloat( 0 ),
		valuer: defaultFloat( 0 ),
	} ),
	createMXElement( 'ramptb', mx_ramptb, [ 'valuet', 'valueb', 'texcoord' ], {
		valuet: defaultFloat( 0 ),
		valueb: defaultFloat( 0 ),
	} ),
	createMXElement( 'ramp4', mx_ramp4, [ 'valuetl', 'valuetr', 'valuebl', 'valuebr', 'texcoord' ], {
		valuetl: defaultColor( 0, 0, 0 ),
		valuetr: defaultColor( 0, 0, 0 ),
		valuebl: defaultColor( 0, 0, 0 ),
		valuebr: defaultColor( 0, 0, 0 ),
		texcoord: defaultVec2( 0, 0 ),
	} ),
	createMXElement(
		'ramp_gradient',
		mx_ramp_gradient,
		[ 'x', 'interval1', 'interval2', 'color1', 'color2', 'interpolation', 'prev_color', 'interval_num', 'num_intervals' ],
		{
			x: defaultFloat( 0 ),
			interval1: defaultFloat( 0 ),
			interval2: defaultFloat( 1 ),
			color1: defaultVec4( 0, 0, 0, 1 ),
			color2: defaultVec4( 1, 1, 1, 1 ),
			interpolation: defaultFloat( 1 ),
			prev_color: defaultVec4( 0, 0, 0, 1 ),
			interval_num: defaultFloat( 1 ),
			num_intervals: defaultFloat( 2 ),
		},
	),
	createMXElement(
		'ramp',
		mx_ramp,
		[
			'texcoord',
			'type',
			'interpolation',
			'num_intervals',
			'interval1',
			'color1',
			'interval2',
			'color2',
			'interval3',
			'color3',
			'interval4',
			'color4',
			'interval5',
			'color5',
			'interval6',
			'color6',
			'interval7',
			'color7',
			'interval8',
			'color8',
			'interval9',
			'color9',
			'interval10',
			'color10',
		],
		{
			texcoord: defaultVec2( 0, 0 ),
			type: defaultFloat( 0 ),
			interpolation: defaultFloat( 1 ),
			num_intervals: defaultFloat( 2 ),
			interval1: defaultFloat( 0 ),
			color1: defaultVec4( 0, 0, 0, 1 ),
			interval2: defaultFloat( 1 ),
			color2: defaultVec4( 1, 1, 1, 1 ),
			interval3: defaultFloat( 1 ),
			color3: defaultVec4( 1, 1, 1, 1 ),
			interval4: defaultFloat( 1 ),
			color4: defaultVec4( 1, 1, 1, 1 ),
			interval5: defaultFloat( 1 ),
			color5: defaultVec4( 1, 1, 1, 1 ),
			interval6: defaultFloat( 1 ),
			color6: defaultVec4( 1, 1, 1, 1 ),
			interval7: defaultFloat( 1 ),
			color7: defaultVec4( 1, 1, 1, 1 ),
			interval8: defaultFloat( 1 ),
			color8: defaultVec4( 1, 1, 1, 1 ),
			interval9: defaultFloat( 1 ),
			color9: defaultVec4( 1, 1, 1, 1 ),
			interval10: defaultFloat( 1 ),
			color10: defaultVec4( 1, 1, 1, 1 ),
		},
	),
	createMXElement( 'splitlr', mx_splitlr, [ 'valuel', 'valuer', 'center', 'texcoord' ], {
		valuel: defaultFloat( 0 ),
		valuer: defaultFloat( 0 ),
		center: defaultFloat( 0.5 ),
	} ),
	createMXElement( 'splittb', mx_splittb, [ 'valuet', 'valueb', 'center', 'texcoord' ], {
		valuet: defaultFloat( 0 ),
		valueb: defaultFloat( 0 ),
		center: defaultFloat( 0.5 ),
	} ),
	createMXElement( 'noise2d', mx_noise_materialx, [ 'texcoord', 'amplitude', 'pivot' ], {
		texcoord: defaultVec2( 0, 0 ),
		amplitude: defaultFloat( 1 ),
		pivot: defaultFloat( 0 ),
	}, true ),
	createMXElement( 'noise3d', mx_noise_materialx, [ 'position', 'amplitude', 'pivot' ], {
		position: () => positionLocal,
		amplitude: defaultFloat( 1 ),
		pivot: defaultFloat( 0 ),
	}, true ),
	createMXElement( 'fractal2d', mx_fractal_noise_materialx_2d, [ 'texcoord', 'octaves', 'lacunarity', 'diminish', 'amplitude' ], {
		texcoord: defaultVec2( 0, 0 ),
		octaves: defaultInt( 3 ),
		lacunarity: defaultFloat( 2.0 ),
		diminish: defaultFloat( 0.5 ),
		amplitude: defaultFloat( 1.0 ),
	}, true ),
	createMXElement( 'fractal3d', mx_fractal_noise_materialx_3d, [ 'position', 'octaves', 'lacunarity', 'diminish', 'amplitude' ], {
		position: () => positionLocal,
		octaves: defaultInt( 3 ),
		lacunarity: defaultFloat( 2.0 ),
		diminish: defaultFloat( 0.5 ),
		amplitude: defaultFloat( 1.0 ),
	}, true ),
	createMXElement( 'cellnoise2d', mx_cell_noise_materialx, [ 'texcoord' ], { texcoord: defaultVec2( 0, 0 ) }, true ),
	createMXElement( 'cellnoise3d', mx_cell_noise_materialx, [ 'position' ], { position: () => positionLocal }, true ),
	createMXElement( 'worleynoise2d', mx_worley_noise_materialx_2d, [ 'texcoord', 'jitter', 'style' ], {
		texcoord: defaultVec2( 0, 0 ),
		jitter: defaultFloat( 1 ),
		style: defaultInt( 0 ),
	}, true ),
	createMXElement( 'worleynoise3d', mx_worley_noise_materialx_3d, [ 'position', 'jitter', 'style' ], {
		position: () => positionLocal,
		jitter: defaultFloat( 1 ),
		style: defaultInt( 0 ),
	}, true ),
	createMXElement(
		'unifiednoise2d',
		mx_unifiednoise2d,
		[
			'type',
			'texcoord',
			'freq',
			'offset',
			'jitter',
			'outmin',
			'outmax',
			'clampoutput',
			'octaves',
			'lacunarity',
			'diminish',
			'style',
		],
		{
			type: defaultInt( 0 ),
			texcoord: defaultVec2( 0, 0 ),
			freq: defaultVec2( 1, 1 ),
			offset: defaultVec2( 0, 0 ),
			jitter: defaultFloat( 1 ),
			outmin: defaultFloat( 0 ),
			outmax: defaultFloat( 1 ),
			clampoutput: defaultBool( true ),
			octaves: defaultInt( 3 ),
			lacunarity: defaultFloat( 2 ),
			diminish: defaultFloat( 0.5 ),
			style: defaultInt( 0 ),
		},
	),
	createMXElement(
		'unifiednoise3d',
		mx_unifiednoise3d,
		[
			'type',
			'position',
			'freq',
			'offset',
			'jitter',
			'outmin',
			'outmax',
			'clampoutput',
			'octaves',
			'lacunarity',
			'diminish',
			'style',
		],
		{
			type: defaultInt( 0 ),
			position: () => positionLocal,
			freq: defaultVec3( 1, 1, 1 ),
			offset: defaultVec3( 0, 0, 0 ),
			jitter: defaultFloat( 1 ),
			outmin: defaultFloat( 0 ),
			outmax: defaultFloat( 1 ),
			clampoutput: defaultBool( true ),
			octaves: defaultInt( 3 ),
			lacunarity: defaultFloat( 2 ),
			diminish: defaultFloat( 0.5 ),
			style: defaultInt( 0 ),
		},
	),
	createMXElement( 'place2d', mx_place2d, [ 'texcoord', 'pivot', 'scale', 'rotate', 'offset', 'operationorder' ], {
		texcoord: defaultVec2( 0, 0 ),
		pivot: defaultVec2( 0, 0 ),
		scale: defaultVec2( 1, 1 ),
		rotate: defaultFloat( 0 ),
		offset: defaultVec2( 0, 0 ),
		operationorder: defaultInt( 0 ),
	} ),
	createMXElement( 'safepower', mx_safepower, [ 'in1', 'in2' ], { in1: defaultFloat( 0 ), in2: defaultFloat( 1 ) } ),
	createMXElement( 'contrast', mx_contrast, [ 'in', 'amount', 'pivot' ], {
		in: defaultFloat( 0 ),
		amount: defaultFloat( 1 ),
		pivot: defaultFloat( 0.5 ),
	} ),
	createMXElement( 'saturate', mx_saturation, [ 'in', 'amount' ], { in: defaultColor( 0, 0, 0 ), amount: defaultFloat( 1 ) } ),
	createMXElement( 'extract', element, [ 'in', 'index' ], { in: defaultFloat( 0 ), index: defaultInt( 0 ) } ),
	createMXElement( 'separate2', element, [ 'in' ], { in: defaultVec2( 0, 0 ) } ),
	createMXElement( 'separate3', element, [ 'in' ], { in: defaultVec3( 0, 0, 0 ) } ),
	createMXElement( 'separate4', element, [ 'in' ], { in: defaultVec4( 0, 0, 0, 0 ) } ),
	createMXElement( 'reflect', reflect, [ 'in', 'normal' ], { in: defaultVec3( 1, 0, 0 ) } ),
	createMXElement( 'refract', refract, [ 'in', 'normal', 'ior' ], { in: defaultVec3( 1, 0, 0 ), ior: defaultFloat( 1 ) } ),
	createMXElement( 'time', mx_timer ),
	createMXElement( 'frame', mx_frame ),
	createMXElement( 'ifgreater', mx_ifgreater, [ 'value1', 'value2', 'in1', 'in2' ], {
		value1: defaultFloat( 1 ),
		value2: defaultFloat( 0 ),
		in1: defaultFloat( 0 ),
		in2: defaultFloat( 0 ),
	} ),
	createMXElement( 'ifgreatereq', mx_ifgreatereq, [ 'value1', 'value2', 'in1', 'in2' ], {
		value1: defaultFloat( 1 ),
		value2: defaultFloat( 0 ),
		in1: defaultFloat( 0 ),
		in2: defaultFloat( 0 ),
	} ),
	createMXElement( 'ifequal', mx_ifequal, [ 'value1', 'value2', 'in1', 'in2' ], {
		value1: defaultFloat( 0 ),
		value2: defaultFloat( 0 ),
		in1: defaultFloat( 0 ),
		in2: defaultFloat( 0 ),
	} ),
	createMXElement( 'rotate2d', mx_rotate2d, [ 'in', 'amount' ], { in: defaultVec2( 0, 0 ), amount: defaultFloat( 0 ) } ),
	createMXElement( 'rotate3d', mx_rotate3d, [ 'in', 'amount', 'axis' ], {
		in: defaultVec3( 0, 0, 0 ),
		amount: defaultFloat( 0 ),
		axis: defaultVec3( 0, 1, 0 ),
	} ),
	createMXElement( 'heighttonormal', mx_heighttonormal, [ 'in', 'scale', 'texcoord' ], {
		in: defaultFloat( 0 ),
		scale: defaultFloat( 1 ),
	} ),
	createMXElement( 'and', mx_and, [ 'in1', 'in2' ], { in1: defaultBool( false ), in2: defaultBool( false ) } ),
	createMXElement( 'or', mx_or, [ 'in1', 'in2' ], { in1: defaultBool( false ), in2: defaultBool( false ) } ),
	createMXElement( 'xor', mx_xor, [ 'in1', 'in2' ], { in1: defaultBool( false ), in2: defaultBool( false ) } ),
	createMXElement( 'not', mx_not, [ 'in' ], { in: defaultBool( false ) } ),
	createMXElement( 'checkerboard', mx_checkerboard, [ 'color1', 'color2', 'texcoord' ], {
		color1: defaultColor( 1, 1, 1 ),
		color2: defaultColor( 0, 0, 0 ),
		texcoord: defaultVec2( 0, 0 ),
	} ),
	createMXElement( 'circle', mx_circle, [ 'texcoord', 'center', 'radius' ], {
		center: defaultVec2( 0, 0 ),
		radius: defaultFloat( 0.5 ),
	} ),
	createMXElement( 'bump', mx_bump, [ 'height', 'scale' ], { height: defaultFloat( 0 ), scale: defaultFloat( 1 ) } ),
	createMXElement( 'blackbody', mx_blackbody, [ 'temperature' ], { temperature: defaultFloat( 5000 ) } ),
];

const MtlXLibrary = Object.fromEntries( MXElements.map( ( entry ) => [ entry.name, entry ] ) );

export { MtlXLibrary };
