import { Fn, If, mat3, vec2, vec3 } from '../../tsl/TSLBase.js';
import { max } from '../../math/MathNode.js';

// Rect Area Light

// Real-Time Polygonal-Light Shading with Linearly Transformed Cosines
// by Eric Heitz, Jonathan Dupuy, Stephen Hill and David Neubelt
// code: https://github.com/selfshadow/ltc_code/

const LTC_Uv = /*@__PURE__*/ Fn( ( { N, V, roughness } ) => {

	const LUT_SIZE = 64.0;
	const LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const LUT_BIAS = 0.5 / LUT_SIZE;

	const dotNV = N.dot( V ).saturate();

	// texture parameterized by sqrt( GGX alpha ) and sqrt( 1 - cos( theta ) )
	const uv = vec2( roughness, dotNV.oneMinus().sqrt() );

	uv.assign( uv.mul( LUT_SCALE ).add( LUT_BIAS ) );

	return uv;

}, { N: 'vec3', V: 'vec3', roughness: 'float', return: 'vec2' } );

const LTC_ClippedSphereFormFactor = /*@__PURE__*/ Fn( ( { f } ) => {

	// Real-Time Area Lighting: a Journey from Research to Production (p.102)
	// An approximation of the form factor of a horizon-clipped rectangle.

	const l = f.length();

	return max( l.mul( l ).add( f.z ).div( l.add( 1.0 ) ), 0 );

}, { f: 'vec3', return: 'float' } );

const LTC_EdgeVectorFormFactor = /*@__PURE__*/ Fn( ( { v1, v2 } ) => {

	const x = v1.dot( v2 );
	const y = x.abs().toVar();

	// rational polynomial approximation to theta / sin( theta ) / 2PI
	const a = y.mul( 0.0145206 ).add( 0.4965155 ).mul( y ).add( 0.8543985 ).toVar();
	const b = y.add( 4.1616724 ).mul( y ).add( 3.4175940 ).toVar();
	const v = a.div( b );

	const theta_sintheta = x.greaterThan( 0.0 ).select( v, max( x.mul( x ).oneMinus(), 1e-7 ).inverseSqrt().mul( 0.5 ).sub( v ) );

	return v1.cross( v2 ).mul( theta_sintheta );

}, { v1: 'vec3', v2: 'vec3', return: 'vec3' } );

const LTC_Evaluate = /*@__PURE__*/ Fn( ( { N, V, P, mInv, p0, p1, p2, p3 } ) => {

	// bail if point is on back side of plane of light
	// assumes ccw winding order of light vertices
	const v1 = p1.sub( p0 ).toVar();
	const v2 = p3.sub( p0 ).toVar();

	const lightNormal = v1.cross( v2 );
	const result = vec3().toVar();

	If( lightNormal.dot( P.sub( p0 ) ).greaterThanEqual( 0.0 ), () => {

		// construct orthonormal basis around N
		const T1 = V.sub( N.mul( V.dot( N ) ) ).normalize();
		const T2 = N.cross( T1 ).negate(); // negated from paper; possibly due to a different handedness of world coordinate system

		// compute transform
		const mat = mInv.mul( mat3( T1, T2, N ).transpose() ).toVar();

		// transform rect
		// & project rect onto sphere
		const coords0 = mat.mul( p0.sub( P ) ).normalize().toVar();
		const coords1 = mat.mul( p1.sub( P ) ).normalize().toVar();
		const coords2 = mat.mul( p2.sub( P ) ).normalize().toVar();
		const coords3 = mat.mul( p3.sub( P ) ).normalize().toVar();

		// calculate vector form factor
		const vectorFormFactor = vec3( 0 ).toVar();
		vectorFormFactor.addAssign( LTC_EdgeVectorFormFactor( { v1: coords0, v2: coords1 } ) );
		vectorFormFactor.addAssign( LTC_EdgeVectorFormFactor( { v1: coords1, v2: coords2 } ) );
		vectorFormFactor.addAssign( LTC_EdgeVectorFormFactor( { v1: coords2, v2: coords3 } ) );
		vectorFormFactor.addAssign( LTC_EdgeVectorFormFactor( { v1: coords3, v2: coords0 } ) );

		// adjust for horizon clipping
		result.assign( vec3( LTC_ClippedSphereFormFactor( { f: vectorFormFactor } ) ) );

	} );

	return result;

}, {
	N: 'vec3',
	V: 'vec3',
	P: 'vec3',
	mInv: 'mat3',
	p0: 'vec3',
	p1: 'vec3',
	p2: 'vec3',
	p3: 'vec3',
	return: 'vec3'
} );

const LTC_Evaluate_Volume = /*@__PURE__*/ Fn( ( { P, p0, p1, p2, p3 } ) => {

	// bail if point is on back side of plane of light
	// assumes ccw winding order of light vertices
	const v1 = p1.sub( p0 ).toVar();
	const v2 = p3.sub( p0 ).toVar();

	const lightNormal = v1.cross( v2 );
	const result = vec3().toVar();

	If( lightNormal.dot( P.sub( p0 ) ).greaterThanEqual( 0.0 ), () => {

		// transform rect
		// & project rect onto sphere
		const coords0 = p0.sub( P ).normalize().toVar();
		const coords1 = p1.sub( P ).normalize().toVar();
		const coords2 = p2.sub( P ).normalize().toVar();
		const coords3 = p3.sub( P ).normalize().toVar();

		// calculate vector form factor
		const vectorFormFactor = vec3( 0 ).toVar();
		vectorFormFactor.addAssign( LTC_EdgeVectorFormFactor( { v1: coords0, v2: coords1 } ) );
		vectorFormFactor.addAssign( LTC_EdgeVectorFormFactor( { v1: coords1, v2: coords2 } ) );
		vectorFormFactor.addAssign( LTC_EdgeVectorFormFactor( { v1: coords2, v2: coords3 } ) );
		vectorFormFactor.addAssign( LTC_EdgeVectorFormFactor( { v1: coords3, v2: coords0 } ) );

		// adjust for horizon clipping
		result.assign( vec3( LTC_ClippedSphereFormFactor( { f: vectorFormFactor.abs() } ) ) );

	} );

	return result;

}, {
	P: 'vec3',
	p0: 'vec3',
	p1: 'vec3',
	p2: 'vec3',
	p3: 'vec3',
	return: 'vec3'
} );

export { LTC_Evaluate, LTC_Evaluate_Volume, LTC_Uv };
