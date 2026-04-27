import {
	mx_perlin_noise_float, mx_perlin_noise_vec3,
	mx_worley_noise_vec2 as worley_noise_vec2, mx_worley_noise_vec3 as worley_noise_vec3,
	mx_cell_noise_float as cell_noise_float,
	mx_fractal_noise_float as fractal_noise_float, mx_fractal_noise_vec2 as fractal_noise_vec2, mx_fractal_noise_vec3 as fractal_noise_vec3, mx_fractal_noise_vec4 as fractal_noise_vec4
} from './lib/mx_noise.js';
import { mx_hsvtorgb, mx_rgbtohsv } from './lib/mx_hsv.js';
import { mx_srgb_texture_to_lin_rec709 } from './lib/mx_transform_color.js';

import {
	float, vec2, vec3, vec4, int, uint, add, sub, mul, div, atan, mix, pow, smoothstep,
	floor, abs, max, clamp, step, fract, sin, cos, dot, sqrt, normalize, If, Fn
} from '../tsl/TSLBase.js';
import { uv } from '../accessors/UV.js';
import { bumpMap } from '../display/BumpMapNode.js';
import { frameId, time } from '../utils/Timer.js';
import { Loop } from '../utils/LoopNode.js';

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
	return mix( top, bottom, v );

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

const mx_rotl32 = ( x, k ) => x.shiftLeft( uint( k ) ).bitOr( x.shiftRight( uint( 32 - k ) ) );

const mx_bjmix = ( aInput, bInput, cInput ) => {

	const a = uint( aInput ).toVar();
	const b = uint( bInput ).toVar();
	const c = uint( cInput ).toVar();

	a.subAssign( c );
	a.assign( a.bitXor( mx_rotl32( c, 4 ) ) );
	c.addAssign( b );
	b.subAssign( a );
	b.assign( b.bitXor( mx_rotl32( a, 6 ) ) );
	a.addAssign( c );
	c.subAssign( b );
	c.assign( c.bitXor( mx_rotl32( b, 8 ) ) );
	b.addAssign( a );
	a.subAssign( c );
	a.assign( a.bitXor( mx_rotl32( c, 16 ) ) );
	c.addAssign( b );
	b.subAssign( a );
	b.assign( b.bitXor( mx_rotl32( a, 19 ) ) );
	a.addAssign( c );
	c.subAssign( b );
	c.assign( c.bitXor( mx_rotl32( b, 4 ) ) );
	b.addAssign( a );

	return [ a, b, c ];

};

const mx_bjfinal = ( aInput, bInput, cInput ) => {

	const a = uint( aInput ).toVar();
	const b = uint( bInput ).toVar();
	const c = uint( cInput ).toVar();

	c.assign( c.bitXor( b ) );
	c.subAssign( mx_rotl32( b, 14 ) );
	a.assign( a.bitXor( c ) );
	a.subAssign( mx_rotl32( c, 11 ) );
	b.assign( b.bitXor( a ) );
	b.subAssign( mx_rotl32( a, 25 ) );
	c.assign( c.bitXor( b ) );
	c.subAssign( mx_rotl32( b, 16 ) );
	a.assign( a.bitXor( c ) );
	a.subAssign( mx_rotl32( c, 4 ) );
	b.assign( b.bitXor( a ) );
	b.subAssign( mx_rotl32( a, 14 ) );
	c.assign( c.bitXor( b ) );
	c.subAssign( mx_rotl32( b, 24 ) );

	return c;

};

const mx_bits_to_01 = ( bits ) => div( float( bits ), float( uint( 0xffffffff ) ) );

export const mx_cell_noise_vec3 = Fn( ( [ positionInput ] ) => {

	const position = vec3( positionInput ).toVar();
	const ix = int( floor( position.x ) ).toVar();
	const iy = int( floor( position.y ) ).toVar();
	const iz = int( floor( position.z ) ).toVar();
	const seed = uint( 0xdeadbeef + ( 4 << 2 ) + 13 ).toVar();
	const a = seed.toVar();
	const b = seed.toVar();
	const c = seed.toVar();
	a.addAssign( uint( ix ) );
	b.addAssign( uint( iy ) );
	c.addAssign( uint( iz ) );

	const [ mixedA, mixedB, mixedC ] = mx_bjmix( a, b, c );
	const hash0 = mx_bjfinal( mixedA, mixedB, mixedC );
	const hash1 = mx_bjfinal( add( mixedA, uint( 1 ) ), mixedB, mixedC );
	const hash2 = mx_bjfinal( add( mixedA, uint( 2 ) ), mixedB, mixedC );

	return vec3(
		mx_bits_to_01( hash0 ),
		mx_bits_to_01( hash1 ),
		mx_bits_to_01( hash2 )
	);

} );

export const mx_smoothstep = ( inNode, low = 0, high = 1 ) => {

	const range = sub( high, low );
	const safeRange = max( abs( range ), float( 1e-6 ) );
	const t = clamp( div( sub( inNode, low ), safeRange ), float( 0 ), float( 1 ) );
	const hermite = mul( mul( t, t ), sub( float( 3 ), mul( float( 2 ), t ) ) );
	const fallback = step( high, inNode );
	const useFallback = step( high, low );
	return mix( hermite, fallback, useFallback );

};

export const mx_worley_noise_float_3d = Fn( ( [ positionInput, jitterInput, styleInput ] ) => {

	const position = vec3( positionInput ).toVar();
	const jitter = float( jitterInput ).toVar();
	const style = int( styleInput ).toVar();
	const baseCell = vec3( floor( position.x ), floor( position.y ), floor( position.z ) ).toVar();
	const localpos = fract( position ).toVar();
	const sqdist = float( 1e6 ).toVar();
	const minpos = vec3( 0, 0, 0 ).toVar();

	Loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		Loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			Loop( { start: - 1, end: int( 1 ), name: 'z', condition: '<=' }, ( { z } ) => {

				const cellCoords = vec3( baseCell.x.add( float( x ) ), baseCell.y.add( float( y ) ), baseCell.z.add( float( z ) ) ).toVar();
				const off = vec3( mx_cell_noise_vec3( cellCoords ) ).toVar();
				off.subAssign( 0.5 );
				off.mulAssign( jitter );
				off.addAssign( 0.5 );
				const cellpos = vec3( vec3( float( x ), float( y ), float( z ) ).add( off ).sub( localpos ) ).toVar();
				const dist = dot( cellpos, cellpos ).toVar();

				If( dist.lessThan( sqdist ), () => {

					sqdist.assign( dist );
					minpos.assign( cellpos );

				} );

			} );

		} );

	} );

	If( style.equal( int( 1 ) ), () => {

		sqdist.assign( mx_cell_noise_float( minpos.add( position ) ) );

	} ).Else( () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} );

export const mx_worley_noise_float_2d = Fn( ( [ texcoordInput, jitterInput, styleInput ] ) => {

	const texcoord = vec2( texcoordInput ).toVar();
	const jitter = float( jitterInput ).toVar();
	const style = int( styleInput ).toVar();
	const floorPos = floor( texcoord ).toVar();
	const localpos = vec2( fract( texcoord.x ), fract( texcoord.y ) ).toVar();
	const sqdist = float( 1e6 ).toVar();
	const minpos = vec2( 0, 0 ).toVar();

	Loop( { start: - 1, end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

		Loop( { start: - 1, end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

			const cell = vec2( float( x ), float( y ) ).toVar();
			const seed = vec2( cell.x.add( floorPos.x ), cell.y.add( floorPos.y ) ).toVar();
			const off = vec2( mx_cell_noise_float( vec3( seed.x, seed.y, 0 ) ), mx_cell_noise_float( vec3( seed.x, seed.y, 1 ) ) ).toVar();
			off.subAssign( 0.5 );
			off.mulAssign( jitter );
			off.addAssign( 0.5 );
			const cellpos = vec2( cell.add( off ).sub( localpos ) ).toVar();
			const dist = dot( cellpos, cellpos ).toVar();

			If( dist.lessThan( sqdist ), () => {

				sqdist.assign( dist );
				minpos.assign( cellpos );

			} );

		} );

	} );

	If( style.equal( int( 1 ) ), () => {

		sqdist.assign( mx_cell_noise_float( minpos.add( texcoord ) ) );

	} ).Else( () => {

		sqdist.assign( sqrt( sqdist ) );

	} );

	return sqdist;

} );

export const mx_unifiednoise2d = Fn( ( [
	noiseTypeInput,
	texcoordInput,
	freqInput,
	offsetInput,
	jitterInput,
	outminInput,
	outmaxInput,
	clampoutputInput,
	octavesInput,
	lacunarityInput,
	diminishInput,
	styleInput
] ) => {

	const noiseType = int( noiseTypeInput ).toVar();
	const texcoord = vec2( texcoordInput ).toVar();
	const freq = vec2( freqInput ).toVar();
	const offset = vec2( offsetInput ).toVar();
	const jitter = float( jitterInput ).toVar();
	const outmin = float( outminInput ).toVar();
	const outmax = float( outmaxInput ).toVar();
	const clampoutput = float( clampoutputInput ).toVar();
	const octaves = int( octavesInput ).toVar();
	const lacunarity = float( lacunarityInput ).toVar();
	const diminish = float( diminishInput ).toVar();
	const style = int( styleInput ).toVar();

	const applyFreq = mul( texcoord, freq ).toVar();
	const applyOffset = add( applyFreq, offset ).toVar();
	const cellJitterMult = mul( sub( jitter, 1 ), 90000 ).toVar();
	const applyCellJitter = mx_rotate2d( applyOffset, cellJitterMult ).toVar();
	const fractalInput = vec3( applyOffset.x, applyOffset.y, cellJitterMult ).toVar();
	const result = float( 0 ).toVar();

	If( noiseType.equal( int( 0 ) ), () => {

		result.assign( mx_noise_float( applyCellJitter, 0.5, 0.5 ) );

	} );
	If( noiseType.equal( int( 1 ) ), () => {

		result.assign( mx_cell_noise_float( applyCellJitter ) );

	} );
	If( noiseType.equal( int( 2 ) ), () => {

		result.assign( mx_worley_noise_float_2d( applyOffset, jitter, style ) );

	} );
	If( noiseType.equal( int( 3 ) ), () => {

		result.assign( mx_fractal_noise_float( fractalInput, octaves, lacunarity, diminish, 1 ) );

	} );

	const ranged = add( outmin, mul( result, sub( outmax, outmin ) ) ).toVar();
	const clamped = clamp( ranged, outmin, outmax ).toVar();
	return mx_ifequal( clampoutput, float( 1 ), clamped, ranged );

} );

export const mx_unifiednoise3d = (
	noiseType = 0,
	position = vec3( 0, 0, 0 ),
	freq = vec3( 1, 1, 1 ),
	offset = vec3( 0, 0, 0 ),
	jitter = 1,
	outmin = 0,
	outmax = 1,
	clampoutput = true,
	octaves = 3,
	lacunarity = 2,
	diminish = 0.5,
	style = 0
) => {

	const applyFreq = mul( position, freq );
	const applyOffset = add( applyFreq, offset );
	const cellJitterMult = mul( sub( jitter, 1 ), 90000 );
	const applyCellJitter = mx_rotate3d( applyOffset, cellJitterMult, vec3( 0.1, 1, 0 ) );
	const perlin = mx_noise_float( applyCellJitter, 0.5, 0.5 );
	const cell = mx_cell_noise_float( applyCellJitter );
	const worley = mx_worley_noise_float_3d( applyOffset, jitter, style );
	const fractal = mx_fractal_noise_float( applyCellJitter, octaves, lacunarity, diminish, 1 );

	const typeFloat = float( noiseType );
	const switched = mx_ifequal(
		typeFloat,
		float( 3 ),
		fractal,
		mx_ifequal(
			typeFloat,
			float( 2 ),
			worley,
			mx_ifequal( typeFloat, float( 1 ), cell, perlin )
		)
	);
	const ranged = add( outmin, mul( switched, sub( outmax, outmin ) ) );
	const clamped = clamp( ranged, outmin, outmax );
	return mx_ifequal( clampoutput, float( 1 ), clamped, ranged );

};

export const mx_worley_noise_float = ( texcoord = uv(), jitter = 1, style = 0 ) => mx_worley_noise_float_3d( texcoord.convert( 'vec2|vec3' ), jitter, style );
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

export const mx_rotate2d = ( input, amount = 0 ) => {

	input = vec2( input );
	amount = float( amount );

	const rotationRadians = mul( amount, Math.PI / 180.0 );
	const sa = sin( rotationRadians );
	const ca = cos( rotationRadians );
	const x = input.x;
	const y = input.y;

	return vec2( add( mul( ca, x ), mul( sa, y ) ), sub( mul( ca, y ), mul( sa, x ) ) );

};

export const mx_rotate3d = ( input, amount = 0, axis = vec3( 0, 1, 0 ) ) => {

	input = vec3( input );
	amount = float( amount );
	axis = vec3( axis );

	const normalizedAxis = normalize( axis );
	const rotationRadians = mul( amount, Math.PI / 180.0 );
	const s = sin( rotationRadians );
	const c = cos( rotationRadians );
	const oc = sub( 1, c );

	const x = input.x;
	const y = input.y;
	const z = input.z;
	const ax = normalizedAxis.x;
	const ay = normalizedAxis.y;
	const az = normalizedAxis.z;

	const m00 = add( mul( mul( oc, ax ), ax ), c );
	const m01 = sub( mul( mul( oc, ax ), ay ), mul( az, s ) );
	const m02 = add( mul( mul( oc, az ), ax ), mul( ay, s ) );

	const m10 = add( mul( mul( oc, ax ), ay ), mul( az, s ) );
	const m11 = add( mul( mul( oc, ay ), ay ), c );
	const m12 = sub( mul( mul( oc, ay ), az ), mul( ax, s ) );

	const m20 = sub( mul( mul( oc, az ), ax ), mul( ay, s ) );
	const m21 = add( mul( mul( oc, ay ), az ), mul( ax, s ) );
	const m22 = add( mul( mul( oc, az ), az ), c );

	return vec3(
		add( add( mul( m00, x ), mul( m10, y ) ), mul( m20, z ) ),
		add( add( mul( m01, x ), mul( m11, y ) ), mul( m21, z ) ),
		add( add( mul( m02, x ), mul( m12, y ) ), mul( m22, z ) )
	);

};

export const mx_heighttonormal = ( input, scale/*, texcoord*/ ) => {

	input = vec3( input );
	scale = float( scale );

	return bumpMap( input, scale );

};
