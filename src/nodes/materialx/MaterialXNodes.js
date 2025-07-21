import {
	mx_perlin_noise_float, mx_perlin_noise_vec3,
	mx_worley_noise_float as worley_noise_float, mx_worley_noise_vec2 as worley_noise_vec2, mx_worley_noise_vec3 as worley_noise_vec3,
	mx_cell_noise_float as cell_noise_float,
	mx_fractal_noise_float as fractal_noise_float, mx_fractal_noise_vec2 as fractal_noise_vec2, mx_fractal_noise_vec3 as fractal_noise_vec3, mx_fractal_noise_vec4 as fractal_noise_vec4
} from './lib/mx_noise.js';
import { mx_hsvtorgb, mx_rgbtohsv } from './lib/mx_hsv.js';
import { mx_srgb_texture_to_lin_rec709 } from './lib/mx_transform_color.js';
import { mix, smoothstep } from '../math/MathNode.js';
import { uv } from '../accessors/UV.js';
import { float, vec2, vec4, int, add, sub, mul, div, mod, pow, atan2, mat3 } from '../tsl/TSLBase.js';
import { bumpMap } from '../display/BumpMapNode.js';
import { rotate } from '../utils/RotateNode.js';

export const mx_aastep = ( threshold, value ) => {

	threshold = float( threshold );
	value = float( value );

	const afwidth = vec2( value.dFdx(), value.dFdy() ).length().mul( 0.70710678118654757 );

	return smoothstep( threshold.sub( afwidth ), threshold.add( afwidth ), value );

};

const _ramp = ( a, b, uv, p ) => mix( a, b, uv[ p ].clamp() );
export const mx_ramplr = ( valuel, valuer, texcoord = uv() ) => _ramp( valuel, valuer, texcoord, 'x' );
export const mx_ramptb = ( valuet, valueb, texcoord = uv() ) => _ramp( valuet, valueb, texcoord, 'y' );

const _split = ( a, b, center, uv, p ) => mix( a, b, mx_aastep( center, uv[ p ] ) );
export const mx_splitlr = ( valuel, valuer, center, texcoord = uv() ) => _split( valuel, valuer, center, texcoord, 'x' );
export const mx_splittb = ( valuet, valueb, center, texcoord = uv() ) => _split( valuet, valueb, center, texcoord, 'y' );

export const mx_transform_uv = ( uv_scale = 1, uv_offset = 0, uv_geo = uv() ) => uv_geo.mul( uv_scale ).add( uv_offset );

export const mx_safepower = ( in1, in2 = 1 ) => {

	in1 = float( in1 );

	return in1.abs().pow( in2 ).mul( in1.sign() );

};

export const mx_contrast = ( input, amount = 1, pivot = .5 ) => float( input ).sub( pivot ).mul( amount ).add( pivot );

export const mx_noise_float = ( texcoord = uv(), amplitude = 1, pivot = 0 ) => mx_perlin_noise_float( texcoord.convert( 'vec2|vec3' ) ).mul( amplitude ).add( pivot );
//export const mx_noise_vec2 = ( texcoord = uv(), amplitude = 1, pivot = 0 ) => mx_perlin_noise_vec3( texcoord.convert( 'vec2|vec3' ) ).mul( amplitude ).add( pivot );
export const mx_noise_vec3 = ( texcoord = uv(), amplitude = 1, pivot = 0 ) => mx_perlin_noise_vec3( texcoord.convert( 'vec2|vec3' ) ).mul( amplitude ).add( pivot );
export const mx_noise_vec4 = ( texcoord = uv(), amplitude = 1, pivot = 0 ) => {

	texcoord = texcoord.convert( 'vec2|vec3' ); // overloading type

	const noise_vec4 = vec4( mx_perlin_noise_vec3( texcoord ), mx_perlin_noise_float( texcoord.add( vec2( 19, 73 ) ) ) );

	return noise_vec4.mul( amplitude ).add( pivot );

};

export const mx_worley_noise_float = ( texcoord = uv(), jitter = 1 ) => worley_noise_float( texcoord.convert( 'vec2|vec3' ), jitter, int( 1 ) );
export const mx_worley_noise_vec2 = ( texcoord = uv(), jitter = 1 ) => worley_noise_vec2( texcoord.convert( 'vec2|vec3' ), jitter, int( 1 ) );
export const mx_worley_noise_vec3 = ( texcoord = uv(), jitter = 1 ) => worley_noise_vec3( texcoord.convert( 'vec2|vec3' ), jitter, int( 1 ) );

export const mx_cell_noise_float = ( texcoord = uv() ) => cell_noise_float( texcoord.convert( 'vec2|vec3' ) );

export const mx_fractal_noise_float = ( position = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => fractal_noise_float( position, int( octaves ), lacunarity, diminish ).mul( amplitude );
export const mx_fractal_noise_vec2 = ( position = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => fractal_noise_vec2( position, int( octaves ), lacunarity, diminish ).mul( amplitude );
export const mx_fractal_noise_vec3 = ( position = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => fractal_noise_vec3( position, int( octaves ), lacunarity, diminish ).mul( amplitude );
export const mx_fractal_noise_vec4 = ( position = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => fractal_noise_vec4( position, int( octaves ), lacunarity, diminish ).mul( amplitude );

export { mx_hsvtorgb, mx_rgbtohsv, mx_srgb_texture_to_lin_rec709 };

// === Moved from MaterialXLoader.js ===

// Math ops
export const mx_add = ( in1, in2 = float( 0 ) ) => add( in1, in2 );
export const mx_subtract = ( in1, in2 = float( 0 ) ) => sub( in1, in2 );
export const mx_multiply = ( in1, in2 = float( 1 ) ) => mul( in1, in2 );
export const mx_divide = ( in1, in2 = float( 1 ) ) => div( in1, in2 );
export const mx_modulo = ( in1, in2 = float( 1 ) ) => mod( in1, in2 );
export const mx_power = ( in1, in2 = float( 1 ) ) => pow( in1, in2 );
export const mx_atan2 = ( in1 = float( 0 ), in2 = float( 1 ) ) => atan2( in1, in2 );
export const mx_timer = () => timerLocal();
export const mx_frame = () => frameId;
export const mx_invert = ( in1, amount = float( 1 ) ) => sub( amount, in1 );

export const mx_ln = ( input ) => input.log();
export const mx_distance = ( in1, in2 ) => in1.sub( in2 ).length();
export const mx_reflect = ( input, normal ) => input.reflect( normal );
export const mx_refract = ( input, normal, ior ) => input.refract( normal, ior );
export const mx_ifgreater = ( value1, value2, in1, in2 ) => value1.greaterThan( value2 ).mix( in1, in2 );
export const mx_ifgreatereq = ( value1, value2, in1, in2 ) => value1.greaterThanEqual( value2 ).mix( in1, in2 );
export const mx_ifequal = ( value1, value2, in1, in2 ) => value1.equal( value2 ).mix( in1, in2 );

export const mx_creatematrix = ( in1, in2, in3 ) => mat3( in1, in2, in3 );

// Enhanced separate node to support multi-output referencing (outx, outy, outz, outw)
export const separate = ( in1, channelOrOut = null ) => {

	if ( typeof channelOrOut === 'string' ) {

		const map = { x: 0, r: 0, y: 1, g: 1, z: 2, b: 2, w: 3, a: 3 };
		const c = channelOrOut.replace( /^out/, '' ).toLowerCase();
		if ( map[ c ] !== undefined ) return in1.element( map[ c ] );

	}

	if ( typeof channelOrOut === 'number' ) {

		return in1.element( channelOrOut );

	}

	if ( typeof channelOrOut === 'string' && channelOrOut.length === 1 ) {

		const map = { x: 0, r: 0, y: 1, g: 1, z: 2, b: 2, w: 3, a: 3 };
		if ( map[ channelOrOut ] !== undefined ) return in1.element( map[ channelOrOut ] );

	}

	return in1;

};

export const mx_extract = ( in1, index ) => in1.element( index );

export const mx_place2d = (
	texcoord, pivot = vec2( 0.5, 0.5 ), scale = vec2( 1, 1 ), rotate = float( 0 ), offset = vec2( 0, 0 ), operationorder = int( 0 )
) => {

	let uv = texcoord;
	if ( pivot ) uv = uv.sub( pivot );
	if ( scale ) uv = uv.mul( scale );
	if ( rotate ) {

		const rad = rotate.mul( Math.PI / 180.0 );
		const cosR = rad.cos();
		const sinR = rad.sin();
		uv = vec2(
			uv.x.mul( cosR ).sub( uv.y.mul( sinR ) ),
			uv.x.mul( sinR ).add( uv.y.mul( cosR ) )
		);

	}

	if ( pivot ) uv = uv.add( pivot );
	if ( offset ) uv = uv.add( offset );
	return uv;

};

export const mx_length = ( input ) => {

	if ( input === undefined ) {

		console.warn( 'MaterialXNodes: mx_length called with undefined input.' );
		return float( 0 );

	}

	if ( input && ( input.nodeType === 'vec2' || input.nodeType === 'vec3' || input.nodeType === 'vec4' ) ) {

		return input.length();

	} else if ( input && input.nodeType === 'float' ) {

		return input.abs();

	} else {

		console.warn( 'MaterialXNodes: length() called with unsupported type.', input );
		return float( 0 );

	}

};

export const mx_cross = ( a, b ) => {

	if ( a && b && a.nodeType === 'vec3' && b.nodeType === 'vec3' ) {

		return a.cross( b );

	} else if ( a && b && a.nodeType === 'vec2' && b.nodeType === 'vec2' ) {

		return a.x.mul( b.y ).sub( a.y.mul( b.x ) );

	} else if ( a && b && a.nodeType === 'float' && b.nodeType === 'float' ) {

		return float( 0 );

	} else {

		console.warn( 'MaterialXNodes: cross() called with unsupported types.', a, b );
		return float( 0 );

	}

};

export const mx_floor = ( input ) => {

	if ( input && ( input.nodeType === 'vec2' || input.nodeType === 'vec3' || input.nodeType === 'vec4' || input.nodeType === 'float' ) ) {

		return input.floor();

	} else {

		console.warn( 'MaterialXNodes: floor() called with unsupported type.', input );
		return float( 0 );

	}

};

export const mx_rotate2d = ( input, amount ) => {

	if ( ! input || input.nodeType !== 'vec2' ) {

		console.warn( 'MaterialXNodes: rotate2d expects a vec2 input. Returning input unchanged.', input );
		return input;

	}

	const radians = amount.mul( Math.PI / 180.0 );
	return rotate( input, radians );

};

export const mx_rotate3d = ( input, amount, axis ) => {

	if ( ! input || input.nodeType !== 'vec3' || ! axis || axis.nodeType !== 'vec3' ) {

		console.warn( 'MaterialXNodes: rotate3d expects vec3 input and axis. Returning input unchanged.', input, axis, amount );
		return input;

	}

	const radians = amount.mul( Math.PI / 180.0 );
	const nAxis = axis.normalize();
	const cosA = radians.cos();
	const sinA = radians.sin();
	const oneMinusCosA = float( 1 ).sub( cosA );
	const rot =
		input.mul( cosA )
			.add( nAxis.cross( input ).mul( sinA ) )
			.add( nAxis.mul( nAxis.dot( input ) ).mul( oneMinusCosA ) );
	return rot;

};

export const mx_heighttonormal = ( input, scale, texcoord ) => {

	if ( ! input ) {

		console.warn( 'MaterialXNodes: heighttonormal expects a height input. Returning default normal.' );
		return vec3( 0, 0, 1 );

	}

	return bumpMap( input, scale );

};
