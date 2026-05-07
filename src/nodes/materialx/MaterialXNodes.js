import {
	mx_perlin_noise_float, mx_perlin_noise_vec3,
	mx_worley_noise_float_2d as worley_noise_float_2d, mx_worley_noise_float_3d as worley_noise_float_3d,
	mx_worley_noise_vec2 as worley_noise_vec2, mx_worley_noise_vec3 as worley_noise_vec3,
	mx_worley_noise_vec3_style as worley_noise_vec3_style,
	mx_cell_noise_float as cell_noise_float, mx_cell_noise_vec3 as cell_noise_vec3,
	mx_unifiednoise2d as unifiednoise2d, mx_unifiednoise3d as unifiednoise3d,
	mx_fractal_noise_float_2d as fractal_noise_float_2d,
	mx_fractal_noise_float as fractal_noise_float, mx_fractal_noise_vec2 as fractal_noise_vec2, mx_fractal_noise_vec3 as fractal_noise_vec3, mx_fractal_noise_vec4 as fractal_noise_vec4
} from './MaterialXNoise.js';
import { mx_rotate2d, mx_rotate3d } from './MaterialXCore.js';
import { mx_hsvtorgb, mx_rgbtohsv } from './MaterialXColor.js';
import { mx_srgb_texture_to_lin_rec709 } from './MaterialXColorTransform.js';

import {
	float, vec2, vec3, vec4, int, add, sub, mul, div, atan, mix, pow, smoothstep,
	floor, abs, max, clamp, step
} from '../tsl/TSLBase.js';
import { uv } from '../accessors/UV.js';
import { bumpMap } from '../display/BumpMapNode.js';
import { frameId, time } from '../utils/Timer.js';

export const mx_aastep = ( threshold, value ) => {

	threshold = float( threshold );
	value = float( value );

	const afwidth = vec2( value.dFdx(), value.dFdy() ).length().mul( 0.70710678118654757 );

	return smoothstep( threshold.sub( afwidth ), threshold.add( afwidth ), value );

};

const _ramp = ( a, b, uv, p ) => mix( a, b, uv[ p ].clamp() );
export const mx_ramplr = ( valuel, valuer, texcoord = uv() ) => _ramp( valuel, valuer, texcoord, 'x' );
export const mx_ramptb = ( valuet, valueb, texcoord = uv() ) => _ramp( valuet, valueb, texcoord, 'y' );

// Bilinear ramp: interpolate between four corners (tl, tr, bl, br) using texcoord.x and texcoord.y
export const mx_ramp4 = (
	valuetl, valuetr, valuebl, valuebr, texcoord = uv()
) => {

	const u = texcoord.x.clamp();
	const v = texcoord.y.clamp();
	const top = mix( valuetl, valuetr, u );
	const bottom = mix( valuebl, valuebr, u );
	return mix( bottom, top, v );

};

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

export const mx_smoothstep = ( inNode, low = 0, high = 1 ) => {

	const range = sub( high, low );
	const safeRange = max( abs( range ), float( 1e-6 ) );
	const t = clamp( div( sub( inNode, low ), safeRange ), float( 0 ), float( 1 ) );
	const hermite = mul( mul( t, t ), sub( float( 3 ), mul( float( 2 ), t ) ) );
	const fallback = step( high, inNode );
	const useFallback = step( high, low );
	return mix( hermite, fallback, useFallback );

};

export const mx_cell_noise_vec3 = ( texcoord = uv() ) => cell_noise_vec3( texcoord.convert( 'vec2|vec3' ) );
export const mx_worley_noise_float_2d = ( texcoord = uv(), jitter = 1, style = 0 ) => worley_noise_float_2d( texcoord, jitter, style );
export const mx_worley_noise_float_3d = ( texcoord = uv(), jitter = 1, style = 0 ) => worley_noise_float_3d( texcoord, jitter, style );
export const mx_unifiednoise2d = ( noiseType, texcoord = uv(), freq = vec2( 1, 1 ), offset = vec2( 0, 0 ), jitter = 1, outmin = 0, outmax = 1, clampoutput = false, octaves = 1, lacunarity = 2, diminish = .5, style = 0 ) => unifiednoise2d( noiseType, texcoord, freq, offset, jitter, outmin, outmax, clampoutput, octaves, lacunarity, diminish, style );
export const mx_unifiednoise3d = ( noiseType, texcoord = uv(), freq = vec3( 1, 1, 1 ), offset = vec3( 0, 0, 0 ), jitter = 1, outmin = 0, outmax = 1, clampoutput = false, octaves = 1, lacunarity = 2, diminish = .5, style = 0 ) => unifiednoise3d( noiseType, texcoord, freq, offset, jitter, outmin, outmax, clampoutput, octaves, lacunarity, diminish, style );

export const mx_worley_noise_float = ( texcoord = uv(), jitter = 1, style = 0 ) => mx_worley_noise_float_3d( texcoord.convert( 'vec2|vec3' ), jitter, style );
export const mx_worley_noise_vec2 = ( texcoord = uv(), jitter = 1 ) => worley_noise_vec2( texcoord.convert( 'vec2|vec3' ), jitter, int( 1 ) );
export const mx_worley_noise_vec3 = ( texcoord = uv(), jitter = 1, metric = 1 ) => worley_noise_vec3( texcoord.convert( 'vec2|vec3' ), jitter, int( metric ) );
export const mx_worley_noise_vec3_style = ( texcoord = uv(), jitter = 1, style = 0, metric = 0 ) => worley_noise_vec3_style( texcoord.convert( 'vec2|vec3' ), jitter, int( style ), int( metric ) );

export const mx_cell_noise_float = ( texcoord = uv() ) => cell_noise_float( texcoord.convert( 'vec2|vec3' ) );

export const mx_fractal_noise_float_2d = ( texcoord = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => fractal_noise_float_2d( texcoord, int( octaves ), lacunarity, diminish ).mul( amplitude );
export const mx_fractal_noise_float = ( position = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => fractal_noise_float( position, int( octaves ), lacunarity, diminish ).mul( amplitude );
export const mx_fractal_noise_vec2 = ( position = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => fractal_noise_vec2( position, int( octaves ), lacunarity, diminish ).mul( amplitude );
export const mx_fractal_noise_vec3 = ( position = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => fractal_noise_vec3( position, int( octaves ), lacunarity, diminish ).mul( amplitude );
export const mx_fractal_noise_vec4 = ( position = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => fractal_noise_vec4( position, int( octaves ), lacunarity, diminish ).mul( amplitude );

export { mx_rotate2d, mx_rotate3d };
export { mx_hsvtorgb, mx_rgbtohsv, mx_srgb_texture_to_lin_rec709 };

// === Moved from MaterialXLoader.js ===

// Math ops
export const mx_add = ( in1, in2 = float( 0 ) ) => add( in1, in2 );
export const mx_subtract = ( in1, in2 = float( 0 ) ) => sub( in1, in2 );
export const mx_multiply = ( in1, in2 = float( 1 ) ) => mul( in1, in2 );
export const mx_divide = ( in1, in2 = float( 1 ) ) => div( in1, in2 );
export const mx_modulo = ( in1, in2 = float( 1 ) ) => sub( in1, mul( in2, floor( div( in1, in2 ) ) ) );
export const mx_power = ( in1, in2 = float( 1 ) ) => pow( in1, in2 );
export const mx_atan2 = ( in1 = float( 0 ), in2 = float( 1 ) ) => atan( in1, in2 );
export const mx_timer = () => time;
export const mx_frame = () => frameId;
export const mx_invert = ( in1, amount = float( 1 ) ) => sub( amount, in1 );
export const mx_ifgreater = ( value1, value2, in1, in2 ) => value1.greaterThan( value2 ).mix( in2, in1 );
export const mx_ifgreatereq = ( value1, value2, in1, in2 ) => value1.greaterThanEqual( value2 ).mix( in2, in1 );
export const mx_ifequal = ( value1, value2, in1, in2 ) => value1.equal( value2 ).mix( in2, in1 );

// Enhanced separate node to support multi-output referencing (outx, outy, outz, outw)
export const mx_separate = ( in1, channelOrOut = null ) => {

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

export const mx_place2d = (
	texcoord, pivot = vec2( 0, 0 ), scale = vec2( 1, 1 ), rotate = float( 0 ), offset = vec2( 0, 0 ), operationorder = int( 0 )
) => {

	const centered = sub( texcoord, pivot );
	const srt = add( sub( mx_rotate2d( div( centered, scale ), rotate ), offset ), pivot );
	const trs = add( div( mx_rotate2d( sub( centered, offset ), rotate ), scale ), pivot );

	if ( typeof operationorder === 'number' ) return Math.abs( operationorder ) > Number.EPSILON ? trs : srt;

	return mix( srt, trs, step( 0.5, float( operationorder ) ) );

};

export const mx_heighttonormal = ( input, scale/*, texcoord*/ ) => {

	input = vec3( input );
	scale = float( scale );

	return bumpMap( input, scale );

};
