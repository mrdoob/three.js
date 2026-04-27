import {
	abs,
	add,
	clamp,
	cos,
	dFdx,
	dFdy,
	div,
	dot,
	element,
	floor,
	fract,
	max,
	mix,
	mul,
	pow,
	sin,
	step,
	sub,
	vec2,
	vec3,
} from 'three/tsl';

const HEXTILE_SQRT3_2 = Math.sqrt( 3 ) * 2;
const HEXTILE_EPSILON = 1e-6;
const HEXTILE_PI_OVER_180 = Math.PI / 180;

function toRadians( degrees ) {

	return mul( degrees, HEXTILE_PI_OVER_180 );

}

function mxHextileHash( point ) {

	const x = element( point, 0 );
	const y = element( point, 1 );
	const p3Base = vec3( x, y, x );
	const p3Scaled = mul( p3Base, vec3( 0.1031, 0.103, 0.0973 ) );
	const p3Fract = fract( p3Scaled );
	const p3YZX = vec3( element( p3Fract, 1 ), element( p3Fract, 2 ), element( p3Fract, 0 ) );
	const p3Offset = add( p3YZX, 33.33 );
	const p3 = add( p3Fract, dot( p3Fract, p3Offset ) );
	const lhs = add( vec2( element( p3, 0 ), element( p3, 0 ) ), vec2( element( p3, 1 ), element( p3, 2 ) ) );
	const rhs = vec2( element( p3, 2 ), element( p3, 1 ) );
	return fract( mul( lhs, rhs ) );

}

function mxSchlickGain( x, r ) {

	const rr = clamp( r, 0.001, 0.999 );
	const a = mul( sub( div( 1, rr ), 2 ), sub( 1, mul( 2, x ) ) );
	const low = div( x, add( a, 1 ) );
	const high = div( sub( a, x ), sub( a, 1 ) );
	return mix( low, high, step( 0.5, x ) );

}

function normalizeBlendWeights( weights ) {

	const wx = element( weights, 0 );
	const wy = element( weights, 1 );
	const wz = element( weights, 2 );
	const sum = max( add( add( wx, wy ), wz ), HEXTILE_EPSILON );
	return div( weights, sum );

}

function mxRotate2d( point, sine, cosine ) {

	return vec2( sub( mul( cosine, element( point, 0 ) ), mul( sine, element( point, 1 ) ) ), add( mul( sine, element( point, 0 ) ), mul( cosine, element( point, 1 ) ) ) );

}

function toTileCenter( tileId ) {

	const scaled = div( tileId, HEXTILE_SQRT3_2 );
	const sx = element( scaled, 0 );
	const sy = element( scaled, 1 );
	return vec2( add( sx, mul( 0.5, sy ) ), mul( 0.8660254, sy ) );

}

export function mxHextileComputeBlendWeights( luminanceWeights, tileWeights, falloff ) {

	const weighted = mul( luminanceWeights, pow( max( tileWeights, vec3( HEXTILE_EPSILON, HEXTILE_EPSILON, HEXTILE_EPSILON ) ), vec3( 7, 7, 7 ) ) );
	const normalized = normalizeBlendWeights( weighted );
	const gained = vec3(
		mxSchlickGain( element( normalized, 0 ), falloff ),
		mxSchlickGain( element( normalized, 1 ), falloff ),
		mxSchlickGain( element( normalized, 2 ), falloff ),
	);
	const gainedNormalized = normalizeBlendWeights( gained );
	const applyFalloff = step( HEXTILE_EPSILON, abs( sub( falloff, 0.5 ) ) );
	return mix( normalized, gainedNormalized, applyFalloff );

}

export function mxHextileCoord( coord, rotation, rotationRange, scale, scaleRange, offset, offsetRange ) {

	const st = mul( coord, HEXTILE_SQRT3_2 );
	const stSkewed = vec2( add( element( st, 0 ), mul( - 0.57735027, element( st, 1 ) ) ), mul( 1.15470054, element( st, 1 ) ) );
	const stFrac = fract( stSkewed );
	const tx = element( stFrac, 0 );
	const ty = element( stFrac, 1 );
	const tz = sub( sub( 1, tx ), ty );
	const s = step( 0, sub( 0, tz ) );
	const s2 = sub( mul( 2, s ), 1 );
	const w1 = mul( sub( 0, tz ), s2 );
	const w2 = sub( s, mul( ty, s2 ) );
	const w3 = sub( s, mul( tx, s2 ) );
	const baseId = floor( stSkewed );
	const oneMinusS = sub( 1, s );
	const id1 = add( baseId, vec2( s, s ) );
	const id2 = add( baseId, vec2( s, oneMinusS ) );
	const id3 = add( baseId, vec2( oneMinusS, s ) );

	const ctr1 = toTileCenter( id1 );
	const ctr2 = toTileCenter( id2 );
	const ctr3 = toTileCenter( id3 );

	const seedOffset = vec2( 0.12345, 0.12345 );
	const rand1 = mxHextileHash( add( id1, seedOffset ) );
	const rand2 = mxHextileHash( add( id2, seedOffset ) );
	const rand3 = mxHextileHash( add( id3, seedOffset ) );

	const rr = vec2( toRadians( element( rotationRange, 0 ) ), toRadians( element( rotationRange, 1 ) ) );
	const rrMin = element( rr, 0 );
	const rrMax = element( rr, 1 );
	const randX = vec3( element( rand1, 0 ), element( rand2, 0 ), element( rand3, 0 ) );
	const rotations = mix( vec3( rrMin, rrMin, rrMin ), vec3( rrMax, rrMax, rrMax ), mul( randX, rotation ) );
	const randY = vec3( element( rand1, 1 ), element( rand2, 1 ), element( rand3, 1 ) );
	const scaleMin = element( scaleRange, 0 );
	const scaleMax = element( scaleRange, 1 );
	const randomScale = mix( vec3( scaleMin, scaleMin, scaleMin ), vec3( scaleMax, scaleMax, scaleMax ), randY );
	const scales = mix( vec3( 1, 1, 1 ), randomScale, scale );
	const offsetMin = element( offsetRange, 0 );
	const offsetMax = element( offsetRange, 1 );
	const offset1 = mix( vec2( offsetMin, offsetMin ), vec2( offsetMax, offsetMax ), mul( rand1, offset ) );
	const offset2 = mix( vec2( offsetMin, offsetMin ), vec2( offsetMax, offsetMax ), mul( rand2, offset ) );
	const offset3 = mix( vec2( offsetMin, offsetMin ), vec2( offsetMax, offsetMax ), mul( rand3, offset ) );

	const sampleCoord = ( center, randomOffset, rotationValue, sampleScale ) => {

		const delta = sub( coord, center );
		const rotated = mxRotate2d( delta, sin( rotationValue ), cos( rotationValue ) );
		const safeScale = max( sampleScale, HEXTILE_EPSILON );
		return add( add( div( rotated, vec2( safeScale, safeScale ) ), center ), randomOffset );

	};

	const sampleDerivative = ( derivative, rotationValue, sampleScale ) => {

		const rotated = mxRotate2d( derivative, sin( rotationValue ), cos( rotationValue ) );
		const safeScale = max( sampleScale, HEXTILE_EPSILON );
		return div( rotated, vec2( safeScale, safeScale ) );

	};

	const ddx = dFdx( coord );
	const ddy = dFdy( coord );

	return {
		coords: [
			sampleCoord( ctr1, offset1, element( rotations, 0 ), element( scales, 0 ) ),
			sampleCoord( ctr2, offset2, element( rotations, 1 ), element( scales, 1 ) ),
			sampleCoord( ctr3, offset3, element( rotations, 2 ), element( scales, 2 ) ),
		],
		ddx: [
			sampleDerivative( ddx, element( rotations, 0 ), element( scales, 0 ) ),
			sampleDerivative( ddx, element( rotations, 1 ), element( scales, 1 ) ),
			sampleDerivative( ddx, element( rotations, 2 ), element( scales, 2 ) ),
		],
		ddy: [
			sampleDerivative( ddy, element( rotations, 0 ), element( scales, 0 ) ),
			sampleDerivative( ddy, element( rotations, 1 ), element( scales, 1 ) ),
			sampleDerivative( ddy, element( rotations, 2 ), element( scales, 2 ) ),
		],
		weights: vec3( w1, w2, w3 ),
	};

}
