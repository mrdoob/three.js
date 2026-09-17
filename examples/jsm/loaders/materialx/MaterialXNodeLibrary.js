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
	positionWorld,
	cameraPosition,
	mx_heighttonormal,
	float,
	int,
	modelNormalMatrix,
	modelWorldMatrix,
	modelWorldMatrixInverse,
	vec2,
	vec3,
	vec4,
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
import { normalizeSpaceName, toBooleanNode, toVec3Channels } from './MaterialXUtils.js';

const createMXElement = ( name, nodeFunc, params = [], usesNode = false ) => ( { name, nodeFunc, params, usesNode } );

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

const mx_boolean = ( inNode ) => toBooleanNode( inNode );
const mx_and = ( in1, in2 ) => tslAnd( mx_boolean( in1 ), mx_boolean( in2 ) );
const mx_or = ( in1, in2 ) => tslOr( mx_boolean( in1 ), mx_boolean( in2 ) );
const mx_xor = ( in1, in2 ) => tslXor( mx_boolean( in1 ), mx_boolean( in2 ) );
const mx_not = ( inNode ) => tslNot( mx_boolean( inNode ) );
const mx_checkerboard = ( color1, color2, uvtiling, uvoffset, texcoord ) => {

	const tiledUv = sub( mul( texcoord, uvtiling ), uvoffset );
	const checkerMix = mx_modulo( dot( floor( tiledUv ), vec2( 1, 1 ) ), float( 2 ) );
	return mix( color2, color1, checkerMix );

};

const mx_circle = ( texcoord, center, radius ) => {

	const delta = sub( texcoord, center );
	const distanceSquared = dot( delta, delta );
	const radiusSquared = mul( radius, radius );
	return mx_ifgreater( distanceSquared, radiusSquared, 0, 1 );

};

const mx_normalmap = (
	value = vec3( 0.5, 0.5, 1.0 ),
	scale = 1.0,
	normal = vec3( 0.0, 0.0, 1.0 ),
	tangent = vec3( 1.0, 0.0, 0.0 ),
	bitangent = vec3( 0.0, 1.0, 0.0 ),
) => {

	const mapValue = toVec3Channels( value );
	const decoded = sub( mul( mapValue, 2.0 ), vec3( 1.0, 1.0, 1.0 ) );
	const safeValue = dot( mapValue, mapValue ).equal( 0 ).mix( decoded, vec3( 0.0, 0.0, 1.0 ) );
	const normalScale = vec2( scale );
	const blended =
		add(
			add(
				mul( tangent, mul( element( safeValue, 0 ), element( normalScale, 0 ) ) ),
				mul( bitangent, mul( element( safeValue, 1 ), element( normalScale, 1 ) ) ),
			),
			mul( normal, element( safeValue, 2 ) ),
		);
	return normalize( blended );

};

const mx_bump = (
	height,
	scale = 1,
	normal = vec3( 0.0, 0.0, 1.0 ),
	tangent = vec3( 1.0, 0.0, 0.0 ),
	bitangent = vec3( 0.0, 1.0, 0.0 ),
) => mx_normalmap( mx_heighttonormal( height, 1 ), scale, normal, tangent, bitangent );
const mx_dot = ( inNode ) => inNode;

const mx_viewdirection = ( space = 'world' ) => {

	const outputSpace = normalizeSpaceName( space, 'world' );
	const worldDirection = normalize( sub( positionWorld, cameraPosition ) );

	if ( outputSpace === 'world' ) {

		return worldDirection;

	}

	return mx_transformnormal( worldDirection, 'world', outputSpace );

};

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
	const rgb = toVec3Channels( input );
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

	const rgbInput = toVec3Channels( input );
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
	const transformed4 = mul( matrix, point4 );
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
	createMXElement( 'add', add, [ 'in1', 'in2' ] ),
	createMXElement( 'subtract', sub, [ 'in1', 'in2' ] ),
	createMXElement( 'multiply', mul, [ 'in1', 'in2' ] ),
	createMXElement( 'divide', div, [ 'in1', 'in2' ] ),
	createMXElement( 'modulo', mx_modulo, [ 'in1', 'in2' ] ),
	createMXElement( 'absval', abs, [ 'in' ] ),
	createMXElement( 'sign', sign, [ 'in' ] ),
	createMXElement( 'floor', floor, [ 'in' ] ),
	createMXElement( 'ceil', ceil, [ 'in' ] ),
	createMXElement( 'round', round, [ 'in' ] ),
	createMXElement( 'power', pow, [ 'in1', 'in2' ] ),
	createMXElement( 'sin', sin, [ 'in' ] ),
	createMXElement( 'cos', cos, [ 'in' ] ),
	createMXElement( 'tan', tan, [ 'in' ] ),
	createMXElement( 'asin', asin, [ 'in' ] ),
	createMXElement( 'acos', acos, [ 'in' ] ),
	createMXElement( 'atan2', mx_atan2, [ 'iny', 'inx' ] ),
	createMXElement( 'sqrt', sqrt, [ 'in' ] ),
	createMXElement( 'ln', log, [ 'in' ] ),
	createMXElement( 'exp', exp, [ 'in' ] ),
	createMXElement( 'fract', fract, [ 'in' ] ),
	createMXElement( 'clamp', clamp, [ 'in', 'low', 'high' ] ),
	createMXElement( 'min', min, [ 'in1', 'in2' ] ),
	createMXElement( 'max', max, [ 'in1', 'in2' ] ),
	createMXElement( 'normalize', normalize, [ 'in' ] ),
	createMXElement( 'magnitude', length, [ 'in' ] ),
	createMXElement( 'length', length, [ 'in' ] ),
	createMXElement( 'dot', mx_dot, [ 'in' ] ),
	createMXElement( 'dotproduct', dot, [ 'in1', 'in2' ] ),
	createMXElement( 'viewdirection', mx_viewdirection, [ 'space' ] ),
	createMXElement( 'crossproduct', cross, [ 'in1', 'in2' ] ),
	createMXElement( 'distance', distance, [ 'in1', 'in2' ] ),
	createMXElement( 'invert', mx_invert, [ 'in', 'amount' ] ),
	createMXElement( 'transformmatrix', mul, [ 'in', 'mat' ] ),
	createMXElement( 'transformnormal', mx_transformnormal, [ 'in', 'fromspace', 'tospace' ] ),
	createMXElement( 'transformpoint', mx_transformpoint, [ 'in', 'fromspace', 'tospace' ] ),
	createMXElement( 'transformvector', mx_transformvector, [ 'in', 'fromspace', 'tospace' ] ),
	createMXElement( 'normalmap', mx_normalmap, [ 'in', 'scale', 'normal', 'tangent', 'bitangent' ] ),
	createMXElement( 'transpose', transpose, [ 'in' ] ),
	createMXElement( 'determinant', determinant, [ 'in' ] ),
	createMXElement( 'invertmatrix', inverse, [ 'in' ] ),
	createMXElement( 'creatematrix', mat3, [ 'in1', 'in2', 'in3' ] ),
	createMXElement( 'remap', remap, [ 'in', 'inlow', 'inhigh', 'outlow', 'outhigh' ] ),
	createMXElement( 'range', mx_range, [ 'in', 'inlow', 'inhigh', 'outlow', 'outhigh', 'gamma' ] ),
	createMXElement( 'open_pbr_anisotropy', mx_open_pbr_anisotropy, [ 'roughness', 'anisotropy' ] ),
	createMXElement( 'smoothstep', mx_smoothstep, [ 'in', 'low', 'high' ] ),
	createMXElement( 'luminance', luminance, [ 'in', 'lumacoeffs' ] ),
	createMXElement( 'rgbtohsv', mx_rgbtohsv, [ 'in' ] ),
	createMXElement( 'hsvtorgb', mx_hsvtorgb, [ 'in' ] ),
	createMXElement( 'mix', mix, [ 'bg', 'fg', 'mix' ] ),
	createMXElement( 'minus', mx_minus, [ 'fg', 'bg', 'mix' ] ),
	createMXElement( 'difference', mx_difference, [ 'fg', 'bg', 'mix' ] ),
	createMXElement( 'screen', mx_screen, [ 'fg', 'bg', 'mix' ] ),
	createMXElement( 'overlay', mx_overlay, [ 'fg', 'bg', 'mix' ] ),
	createMXElement( 'burn', mx_burn, [ 'fg', 'bg', 'mix' ] ),
	createMXElement( 'dodge', mx_dodge, [ 'fg', 'bg', 'mix' ] ),
	createMXElement(
		'colorcorrect',
		mx_colorcorrect,
		[ 'in', 'hue', 'saturation', 'gamma', 'lift', 'gain', 'contrast', 'contrastpivot', 'exposure' ],
	),
	createMXElement( 'unpremult', mx_unpremult, [ 'in' ] ),
	createMXElement( 'combine2', vec2, [ 'in1', 'in2' ] ),
	createMXElement( 'combine3', vec3, [ 'in1', 'in2', 'in3' ] ),
	createMXElement( 'combine4', vec4, [ 'in1', 'in2', 'in3', 'in4' ] ),
	createMXElement( 'ramplr', mx_ramplr, [ 'valuel', 'valuer', 'texcoord' ] ),
	createMXElement( 'ramptb', mx_ramptb, [ 'valueb', 'valuet', 'texcoord' ] ),
	createMXElement( 'ramp4', mx_ramp4, [ 'valuetl', 'valuetr', 'valuebl', 'valuebr', 'texcoord' ] ),
	createMXElement(
		'ramp_gradient',
		mx_ramp_gradient,
		[ 'x', 'interval1', 'interval2', 'color1', 'color2', 'interpolation', 'prev_color', 'interval_num', 'num_intervals' ],
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
	),
	createMXElement( 'splitlr', mx_splitlr, [ 'valuel', 'valuer', 'center', 'texcoord' ] ),
	createMXElement( 'splittb', mx_splittb, [ 'valueb', 'valuet', 'center', 'texcoord' ] ),
	createMXElement( 'noise2d', mx_noise_materialx, [ 'texcoord', 'amplitude', 'pivot' ], true ),
	createMXElement( 'noise3d', mx_noise_materialx, [ 'position', 'amplitude', 'pivot' ], true ),
	createMXElement( 'fractal2d', mx_fractal_noise_materialx_2d, [ 'texcoord', 'octaves', 'lacunarity', 'diminish', 'amplitude' ], true ),
	createMXElement( 'fractal3d', mx_fractal_noise_materialx_3d, [ 'position', 'octaves', 'lacunarity', 'diminish', 'amplitude' ], true ),
	createMXElement( 'cellnoise2d', mx_cell_noise_materialx, [ 'texcoord' ], true ),
	createMXElement( 'cellnoise3d', mx_cell_noise_materialx, [ 'position' ], true ),
	createMXElement( 'worleynoise2d', mx_worley_noise_materialx_2d, [ 'texcoord', 'jitter', 'style' ], true ),
	createMXElement( 'worleynoise3d', mx_worley_noise_materialx_3d, [ 'position', 'jitter', 'style' ], true ),
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
	),
	createMXElement( 'place2d', mx_place2d, [ 'texcoord', 'pivot', 'scale', 'rotate', 'offset', 'operationorder' ] ),
	createMXElement( 'safepower', mx_safepower, [ 'in1', 'in2' ] ),
	createMXElement( 'contrast', mx_contrast, [ 'in', 'amount', 'pivot' ] ),
	createMXElement( 'saturate', mx_saturation, [ 'in', 'amount' ] ),
	createMXElement( 'extract', element, [ 'in', 'index' ] ),
	createMXElement( 'separate2', element, [ 'in' ] ),
	createMXElement( 'separate3', element, [ 'in' ] ),
	createMXElement( 'separate4', element, [ 'in' ] ),
	createMXElement( 'reflect', reflect, [ 'in', 'normal' ] ),
	createMXElement( 'refract', refract, [ 'in', 'normal', 'ior' ] ),
	createMXElement( 'time', mx_timer ),
	createMXElement( 'frame', mx_frame ),
	createMXElement( 'ifgreater', mx_ifgreater, [ 'value1', 'value2', 'in1', 'in2' ] ),
	createMXElement( 'ifgreatereq', mx_ifgreatereq, [ 'value1', 'value2', 'in1', 'in2' ] ),
	createMXElement( 'ifequal', mx_ifequal, [ 'value1', 'value2', 'in1', 'in2' ] ),
	createMXElement( 'rotate2d', mx_rotate2d, [ 'in', 'amount' ] ),
	createMXElement( 'rotate3d', mx_rotate3d, [ 'in', 'amount', 'axis' ] ),
	createMXElement( 'heighttonormal', mx_heighttonormal, [ 'in', 'scale', 'texcoord' ] ),
	createMXElement( 'and', mx_and, [ 'in1', 'in2' ] ),
	createMXElement( 'or', mx_or, [ 'in1', 'in2' ] ),
	createMXElement( 'xor', mx_xor, [ 'in1', 'in2' ] ),
	createMXElement( 'not', mx_not, [ 'in' ] ),
	createMXElement( 'checkerboard', mx_checkerboard, [ 'color1', 'color2', 'uvtiling', 'uvoffset', 'texcoord' ] ),
	createMXElement( 'circle', mx_circle, [ 'texcoord', 'center', 'radius' ] ),
	createMXElement( 'bump', mx_bump, [ 'height', 'scale', 'normal', 'tangent', 'bitangent' ] ),
	createMXElement( 'blackbody', mx_blackbody, [ 'temperature' ] ),
];

const MtlXLibrary = Object.fromEntries( MXElements.map( ( entry ) => [ entry.name, entry ] ) );

export { MtlXLibrary };
