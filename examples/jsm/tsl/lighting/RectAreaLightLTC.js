import { Fn, If, array, float, int, mat3, vec2, vec3, mix, Break, Loop, LTC_Uv } from 'three/tsl';

const LTC_DecodeMatrix = /*@__PURE__*/ Fn( ( { value, roughness, dotNV } ) => {

	const c = dotNV.clamp( 1e-8, 1.0 ).toVar();
	const s = c.pow2().oneMinus().max( 0.0 ).sqrt().toVar();
	const alpha = roughness.pow2().max( 1e-5 ).toVar();
	const base = c.pow2().add( alpha.pow2() ).sqrt().toVar();
	const width = base.div( alpha.pow2().add( 1.0 ).sqrt() ).mul( c.oneMinus().mul( value.x ).exp() ).toVar();
	const correction = alpha.mul( s ).mul( value.y ).toVar();
	const cs = correction.cos().toVar();
	const sn = correction.sin().toVar();
	const angleCos = c.mul( cs ).sub( s.mul( sn ) ).toVar();
	const angleSin = s.mul( cs ).add( c.mul( sn ) ).toVar();
	const shear = alpha.mul( 2.0 ).mul( s ).mul( value.z ).toVar();
	const height = alpha.mul( 2.0 ).mul( base ).mul( value.w.exp() ).toVar();

	return mat3(
		vec3( width.mul( angleCos ), 0, shear.mul( angleCos ).sub( height.mul( angleSin ) ) ),
		vec3( 0, 1, 0 ),
		vec3( width.mul( angleSin ), 0, shear.mul( angleSin ).add( height.mul( angleCos ) ) )
	);

} ).setLayout( {
	name: 'LTC_DecodeMatrix',
	type: 'mat3',
	inputs: [
		{ name: 'value', type: 'vec4' },
		{ name: 'roughness', type: 'float' },
		{ name: 'dotNV', type: 'float' }
	]
} );

const LTC_AmplitudeUv = /*@__PURE__*/ Fn( ( { roughness, dotNV } ) => {

	const c = dotNV.saturate().toVar();
	const alpha = roughness.pow2().max( 1e-5 ).toVar();
	const v = alpha.mul( c.oneMinus() ).div( c.add( alpha ) );

	return vec2( roughness, v ).mul( 31 / 32 ).add( 0.5 / 32 );

} ).setLayout( {
	name: 'LTC_AmplitudeUv',
	type: 'vec2',
	inputs: [
		{ name: 'roughness', type: 'float' },
		{ name: 'dotNV', type: 'float' }
	]
} );

const LTC_DecodeAmplitude = /*@__PURE__*/ Fn( ( { value, dotNV } ) => {

	const f = dotNV.saturate().oneMinus().toVar();
	const f2 = f.pow2().toVar();

	return vec2( value.x, value.y.add( value.x.mul( f2 ).mul( f2 ).mul( f ) ).clamp( 0.0, value.x ) );

} ).setLayout( {
	name: 'LTC_DecodeAmplitude',
	type: 'vec2',
	inputs: [
		{ name: 'value', type: 'vec2' },
		{ name: 'dotNV', type: 'float' }
	]
} );

const LTC_PhysicalMass = /*@__PURE__*/ Fn( ( { mInv } ) => {

	const a = mInv.element( 0 ).x;
	const b = mInv.element( 0 ).z;

	return a.div( a.pow2().add( b.pow2() ).max( 1e-30 ).sqrt() ).add( 1.0 ).mul( 0.5 );

} ).setLayout( {
	name: 'LTC_PhysicalMass',
	type: 'float',
	inputs: [ { name: 'mInv', type: 'mat3' } ]
} );

const LTC_SafeNormalize = /*@__PURE__*/ Fn( ( { v } ) => {

	const scale = v.x.abs().max( v.y.abs() ).max( v.z.abs() ).toVar();
	const result = vec3().toVar();

	If( scale.greaterThan( 0.0 ), () => {

		const scaled = v.div( scale ).toVar();
		result.assign( scaled.mul( scaled.dot( scaled ).inverseSqrt() ) );

	} );

	return result;

} ).setLayout( {
	name: 'LTC_SafeNormalize',
	type: 'vec3',
	inputs: [ { name: 'v', type: 'vec3' } ]
} );

const LTC_StableEdgeVector = /*@__PURE__*/ Fn( ( { a, b } ) => {

	const cosine = a.dot( b ).toVar();
	const x = cosine.abs().toVar();
	const v = x.mul( 0.0145206 ).add( 0.4965155 ).mul( x ).add( 0.8543985 ).div( x.add( 4.1616724 ).mul( x ).add( 3.4175940 ) ).toVar();
	const c = a.cross( cosine.lessThan( 0.0 ).select( b.add( a ), b.sub( a ) ) ).toVar();

	// Normalize cross directly to avoid cancellation in 1 - dot(a,b)^2.
	return cosine.greaterThan( 0.0 ).select( c.mul( v ), LTC_SafeNormalize( { v: c } ).mul( 0.5 ).sub( c.mul( v ) ) );

} ).setLayout( {
	name: 'LTC_StableEdgeVector',
	type: 'vec3',
	inputs: [
		{ name: 'a', type: 'vec3' },
		{ name: 'b', type: 'vec3' }
	]
} );

// These construction helpers keep mutable arrays local to the calling function,
// avoiding array pointer parameters in WGSL.
function addEdge( term, sum, correction ) {

	const corrected = term.sub( correction ).toVar();
	const nextSum = sum.add( corrected ).toVar();
	correction.assign( nextSum.sub( sum ).sub( corrected ) );
	sum.assign( nextSum );

}

const LTC_IntegrateQuad = /*@__PURE__*/ Fn( ( { q0, q1, q2, q3 } ) => {

	const a = LTC_SafeNormalize( { v: q0 } ).toVar();
	const b = LTC_SafeNormalize( { v: q1 } ).toVar();
	const c = LTC_SafeNormalize( { v: q2 } ).toVar();
	const d = LTC_SafeNormalize( { v: q3 } ).toVar();
	const sum = float( 0 ).toVar();
	const correction = float( 0 ).toVar();

	addEdge( LTC_StableEdgeVector( { a: d, b: a } ).z, sum, correction );
	addEdge( LTC_StableEdgeVector( { a, b } ).z, sum, correction );
	addEdge( LTC_StableEdgeVector( { a: b, b: c } ).z, sum, correction );
	addEdge( LTC_StableEdgeVector( { a: c, b: d } ).z, sum, correction );

	return sum.max( 0.0 );

} ).setLayout( {
	name: 'LTC_IntegrateQuad',
	type: 'float',
	inputs: [
		{ name: 'q0', type: 'vec3' },
		{ name: 'q1', type: 'vec3' },
		{ name: 'q2', type: 'vec3' },
		{ name: 'q3', type: 'vec3' }
	]
} );

function clipToHorizon( vertices, count ) {

	const clipped = array( 'vec3', 6 ).toVar();
	const outputCount = int( 0 ).toVar();

	If( count.greaterThanEqual( int( 3 ) ), () => {

		const previous = vertices.element( count.sub( 1 ) ).toVar();
		const previousInside = previous.z.greaterThan( 0.0 ).toVar();

		Loop( 6, ( { i } ) => {

			If( i.greaterThanEqual( count ), () => {

				Break();

			} );

			const current = vertices.element( i ).toVar();
			const inside = current.z.greaterThan( 0.0 ).toVar();

			If( inside.notEqual( previousInside ), () => {

				const t = previous.z.div( previous.z.sub( current.z ) ).toVar();
				const intersection = mix( previous, current, t ).toVar();
				intersection.z.assign( 0.0 );
				clipped.element( outputCount ).assign( intersection );
				outputCount.addAssign( 1 );

			} );

			If( inside, () => {

				clipped.element( outputCount ).assign( current );
				outputCount.addAssign( 1 );

			} );

			previous.assign( current );
			previousInside.assign( inside );

		} );

		Loop( 6, ( { i } ) => {

			If( i.greaterThanEqual( outputCount ), () => {

				Break();

			} );
			vertices.element( i ).assign( clipped.element( i ) );

		} );

	} );

	return outputCount;

}

function integrateClipped( vertices, count ) {

	const clippedCount = clipToHorizon( vertices, count );
	const result = float( 0 ).toVar();

	If( clippedCount.equal( int( 4 ) ), () => {

		result.assign( LTC_IntegrateQuad( {
			q0: vertices.element( 0 ), q1: vertices.element( 1 ),
			q2: vertices.element( 2 ), q3: vertices.element( 3 )
		} ) );

	} ).ElseIf( clippedCount.greaterThanEqual( int( 3 ) ), () => {

		const previous = LTC_SafeNormalize( { v: vertices.element( clippedCount.sub( 1 ) ) } ).toVar();
		const sum = float( 0 ).toVar();
		const correction = float( 0 ).toVar();

		Loop( 6, ( { i } ) => {

			If( i.greaterThanEqual( clippedCount ), () => {

				Break();

			} );
			const current = LTC_SafeNormalize( { v: vertices.element( i ) } ).toVar();
			addEdge( LTC_StableEdgeVector( { a: previous, b: current } ).z, sum, correction );
			previous.assign( current );

		} );

		result.assign( sum.max( 0.0 ) );

	} );

	return result;

}

const LTC_EvaluateSpecular = /*@__PURE__*/ Fn( ( { N, V, P, mInv, p0, p1, p2, p3 } ) => {

	const lightNormal = p1.sub( p0 ).cross( p3.sub( p0 ) );
	const result = vec3().toVar();

	If( lightNormal.dot( P.sub( p0 ) ).greaterThanEqual( 0.0 ), () => {

		// Handle normal incidence even when floating-point roundoff leaves a tiny tangent.
		const tangent = N.cross( V ).cross( N ).toVar();

		If( tangent.dot( tangent ).lessThan( 1e-12 ), () => {

			tangent.assign( N.cross( N.z.abs().lessThan( 0.999 ).select( vec3( 0, 0, 1 ), vec3( 0, 1, 0 ) ) ) );

		} );

		const T1 = LTC_SafeNormalize( { v: tangent } ).toVar();
		const T2 = N.cross( T1 ).negate();
		const basis = mat3( T1, T2, N ).transpose().toVar();
		const q0 = basis.mul( p0.sub( P ) ).toVar();
		const q1 = basis.mul( p1.sub( P ) ).toVar();
		const q2 = basis.mul( p2.sub( P ) ).toVar();
		const q3 = basis.mul( p3.sub( P ) ).toVar();
		const minimumZ = q0.z.min( q1.z ).min( q2.z.min( q3.z ) ).toVar();
		const maximumZ = q0.z.max( q1.z ).max( q2.z.max( q3.z ) ).toVar();

		If( maximumZ.greaterThan( 0.0 ), () => {

			const vertices = array( [ q0, q1, q2, q3, vec3(), vec3() ] ).toVar();

			If( minimumZ.lessThan( 0.0 ), () => {

				// A convex quad gains at most one vertex for each horizon clip.
				const count = clipToHorizon( vertices, int( 4 ) );

				Loop( 6, ( { i } ) => {

					If( i.greaterThanEqual( count ), () => {

						Break();

					} );
					vertices.element( i ).assign( mInv.mul( vertices.element( i ) ) );

				} );

				result.assign( vec3( integrateClipped( vertices, count ) ) );

			} ).Else( () => {

				q0.assign( mInv.mul( q0 ) );
				q1.assign( mInv.mul( q1 ) );
				q2.assign( mInv.mul( q2 ) );
				q3.assign( mInv.mul( q3 ) );
				minimumZ.assign( q0.z.min( q1.z ).min( q2.z.min( q3.z ) ) );
				maximumZ.assign( q0.z.max( q1.z ).max( q2.z.max( q3.z ) ) );

				If( maximumZ.greaterThan( 0.0 ), () => {

					If( minimumZ.greaterThanEqual( 0.0 ), () => {

						result.assign( vec3( LTC_IntegrateQuad( { q0, q1, q2, q3 } ) ) );

					} ).Else( () => {

						vertices.element( 0 ).assign( q0 );
						vertices.element( 1 ).assign( q1 );
						vertices.element( 2 ).assign( q2 );
						vertices.element( 3 ).assign( q3 );
						result.assign( vec3( integrateClipped( vertices, int( 4 ) ) ) );

					} );

				} );

			} );

		} );

	} );

	return result;

} ).setLayout( {
	name: 'LTC_EvaluateSpecular',
	type: 'vec3',
	inputs: [
		{ name: 'N', type: 'vec3' },
		{ name: 'V', type: 'vec3' },
		{ name: 'P', type: 'vec3' },
		{ name: 'mInv', type: 'mat3' },
		{ name: 'p0', type: 'vec3' },
		{ name: 'p1', type: 'vec3' },
		{ name: 'p2', type: 'vec3' },
		{ name: 'p3', type: 'vec3' }
	]
} );

function LTC_Sample( ltc1, ltc2, N, V, roughness ) {

	const uv = LTC_Uv( { N, V, roughness } );
	const dotNV = N.dot( V ).saturate().toVar();

	const value = ltc1.sample( uv ).toVar();
	const mInv = LTC_DecodeMatrix( { value, roughness, dotNV } ).toVar();
	const amplitudeUv = LTC_AmplitudeUv( { roughness, dotNV } );
	const amplitude = LTC_DecodeAmplitude( { value: ltc2.sample( amplitudeUv ).rg, dotNV } ).div( LTC_PhysicalMass( { mInv } ) ).toVar();

	return { mInv, amplitude };

}

export { LTC_Sample, LTC_EvaluateSpecular };
