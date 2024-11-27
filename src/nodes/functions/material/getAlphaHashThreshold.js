import { abs, add, ceil, clamp, dFdx, dFdy, exp2, float, floor, Fn, fract, length, log2, max, min, mul, sin, sub, vec2, vec3 } from '../../tsl/TSLBase.js';

/**
 * See: https://casual-effects.com/research/Wyman2017Hashed/index.html
 */

const ALPHA_HASH_SCALE = 0.05; // Derived from trials only, and may be changed.

const hash2D = /*@__PURE__*/ Fn( ( [ value ] ) => {

	return fract( mul( 1.0e4, sin( mul( 17.0, value.x ).add( mul( 0.1, value.y ) ) ) ).mul( add( 0.1, abs( sin( mul( 13.0, value.y ).add( value.x ) ) ) ) ) );

} );

const hash3D = /*@__PURE__*/ Fn( ( [ value ] ) => {

	return hash2D( vec2( hash2D( value.xy ), value.z ) );

} );

const getAlphaHashThreshold = /*@__PURE__*/ Fn( ( [ position ] ) => {

	// Find the discretized derivatives of our coordinates
	const maxDeriv = max(
		length( dFdx( position.xyz ) ),
		length( dFdy( position.xyz ) )
	);

	const pixScale = float( 1 ).div( float( ALPHA_HASH_SCALE ).mul( maxDeriv ) ).toVar( 'pixScale' );

	// Find two nearest log-discretized noise scales
	const pixScales = vec2(
		exp2( floor( log2( pixScale ) ) ),
		exp2( ceil( log2( pixScale ) ) )
	);

	// Compute alpha thresholds at our two noise scales
	const alpha = vec2(
		hash3D( floor( pixScales.x.mul( position.xyz ) ) ),
		hash3D( floor( pixScales.y.mul( position.xyz ) ) ),
	);

	// Factor to interpolate lerp with
	const lerpFactor = fract( log2( pixScale ) );

	// Interpolate alpha threshold from noise at two scales
	const x = add( mul( lerpFactor.oneMinus(), alpha.x ), mul( lerpFactor, alpha.y ) );

	// Pass into CDF to compute uniformly distrib threshold
	const a = min( lerpFactor, lerpFactor.oneMinus() );
	const cases = vec3(
		x.mul( x ).div( mul( 2.0, a ).mul( sub( 1.0, a ) ) ),
		x.sub( mul( 0.5, a ) ).div( sub( 1.0, a ) ),
		sub( 1.0, sub( 1.0, x ).mul( sub( 1.0, x ) ).div( mul( 2.0, a ).mul( sub( 1.0, a ) ) ) ) );

	// Find our final, uniformly distributed alpha threshold (ατ)
	const threshold = x.lessThan( a.oneMinus() ).select( x.lessThan( a ).select( cases.x, cases.y ), cases.z );

	// Avoids ατ == 0. Could also do ατ =1-ατ
	return clamp( threshold, 1.0e-6, 1.0 );

} ).setLayout( {
	name: 'getAlphaHashThreshold',
	type: 'float',
	inputs: [
		{ name: 'position', type: 'vec3' }
	]
} );

export default getAlphaHashThreshold;
