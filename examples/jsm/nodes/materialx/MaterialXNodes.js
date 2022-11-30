import {
	mx_perlin_noise_float, mx_perlin_noise_vec2, mx_perlin_noise_vec3,
	mx_worley_noise_float as worley_noise_float, mx_worley_noise_vec2 as worley_noise_vec2, mx_worley_noise_vec3 as worley_noise_vec3,
	mx_cell_noise_float as cell_noise_float,
	mx_fractal_noise_float as fractal_noise_float, mx_fractal_noise_vec2 as fractal_noise_vec2, mx_fractal_noise_vec3 as fractal_noise_vec3, mx_fractal_noise_vec4 as fractal_noise_vec4
} from './lib/mx_noise.js';
import { mx_hsvtorgb, mx_rgbtohsv } from './lib/mx_hsv.js';
import { mx_srgb_texture_to_lin_rec709 } from './lib/mx_transform_color.js';
import { nodeObject, float, vec2, vec4, add, sub, mul, mix, clamp, uv, length, smoothstep, dFdx, dFdy, sign, pow, abs, convert } from '../shadernode/ShaderNodeElements.js';

export const mx_aastep = ( threshold, value ) => {

	threshold = float( threshold );
	value = float( value );

	const afwidth = mul( length( vec2( dFdx( value ), dFdy( value ) ) ), 0.70710678118654757 );

	return smoothstep( sub( threshold, afwidth ), add( threshold, afwidth ), value );

};

const _ramp = ( a, b, uv, p ) => mix( a, b, clamp( nodeObject( uv )[ p ] ) );
export const mx_ramplr = ( valuel, valuer, texcoord = uv() ) => _ramp( valuel, valuer, texcoord, 'x' );
export const mx_ramptb = ( valuet, valueb, texcoord = uv() ) => _ramp( valuet, valueb, texcoord, 'y' );

const _split = ( a, b, center, uv, p ) => mix( a, b, mx_aastep( center, nodeObject( uv )[ p ] ) );
export const mx_splitlr = ( valuel, valuer, center, texcoord = uv() ) => _split( valuel, valuer, center, texcoord, 'x' );
export const mx_splittb = ( valuet, valueb, center, texcoord = uv() ) => _split( valuet, valueb, center, texcoord, 'y' );

export const mx_transform_uv = ( uv_scale = 1, uv_offset = 0, uv_geo = uv() ) => add( mul( uv_geo, uv_scale ), uv_offset );

export const mx_safepower = ( in1, in2 = 1 ) => mul( sign( in1 ), pow( abs( in1 ), in2 ) );
export const mx_contrast = ( input, amount = 1, pivot = .5 ) => add( mul( sub( input, pivot ), amount ), pivot );

export const mx_noise_float = ( texcoord = uv(), amplitude = 1, pivot = 0 ) => add( mul( amplitude, mx_perlin_noise_float( convert( texcoord, 'vec2|vec3' ) ) ), pivot );
export const mx_noise_vec2 = ( texcoord = uv(), amplitude = 1, pivot = 0 ) => add( mul( amplitude, mx_perlin_noise_vec2( convert( texcoord, 'vec2|vec3' ) ) ), pivot );
export const mx_noise_vec3 = ( texcoord = uv(), amplitude = 1, pivot = 0 ) => add( mul( amplitude, mx_perlin_noise_vec3( convert( texcoord, 'vec2|vec3' ) ) ), pivot );
export const mx_noise_vec4 = ( texcoord = uv(), amplitude = 1, pivot = 0 ) => {

	texcoord = convert( texcoord, 'vec2|vec3' ); // overloading type

	const noise_vec4 = vec4( mx_perlin_noise_vec3( texcoord ), mx_perlin_noise_float( add( texcoord, vec2( 19, 73 ) ) ) );

	return add( mul( amplitude, noise_vec4 ), pivot );

};

export const mx_worley_noise_float = ( texcoord = uv(), jitter = 1 ) => worley_noise_float( convert( texcoord, 'vec2|vec3' ), jitter, 1 );
export const mx_worley_noise_vec2 = ( texcoord = uv(), jitter = 1 ) => worley_noise_vec2( convert( texcoord, 'vec2|vec3' ), jitter, 1 );
export const mx_worley_noise_vec3 = ( texcoord = uv(), jitter = 1 ) => worley_noise_vec3( convert( texcoord, 'vec2|vec3' ), jitter, 1 );

export const mx_cell_noise_float = ( texcoord = uv() ) => cell_noise_float( convert( texcoord, 'vec2|vec3' ) );

export const mx_fractal_noise_float = ( position = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => mul( fractal_noise_float( position, octaves, lacunarity, diminish ), amplitude );
export const mx_fractal_noise_vec2 = ( position = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => mul( fractal_noise_vec2( position, octaves, lacunarity, diminish ), amplitude );
export const mx_fractal_noise_vec3 = ( position = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => mul( fractal_noise_vec3( position, octaves, lacunarity, diminish ), amplitude );
export const mx_fractal_noise_vec4 = ( position = uv(), octaves = 3, lacunarity = 2, diminish = .5, amplitude = 1 ) => mul( fractal_noise_vec4( position, octaves, lacunarity, diminish ), amplitude );

export { mx_hsvtorgb, mx_rgbtohsv, mx_srgb_texture_to_lin_rec709 };
