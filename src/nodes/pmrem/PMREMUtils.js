import { Fn, int, uint, float, vec2, vec3, vec4, If } from '../tsl/TSLBase.js';
import { cos, sin, abs, max, exp2, log2, clamp, fract, mix, floor, normalize, cross, dot, sqrt } from '../math/MathNode.js';
import { mul } from '../math/OperatorNode.js';
import { select } from '../math/ConditionalNode.js';
import { Loop, Break } from '../utils/LoopNode.js';

// These defines must match with PMREMGenerator

const cubeUV_r0 = /*@__PURE__*/ float( 1.0 );
const cubeUV_m0 = /*@__PURE__*/ float( - 2.0 );
const cubeUV_r1 = /*@__PURE__*/ float( 0.8 );
const cubeUV_m1 = /*@__PURE__*/ float( - 1.0 );
const cubeUV_r4 = /*@__PURE__*/ float( 0.4 );
const cubeUV_m4 = /*@__PURE__*/ float( 2.0 );
const cubeUV_r5 = /*@__PURE__*/ float( 0.305 );
const cubeUV_m5 = /*@__PURE__*/ float( 3.0 );
const cubeUV_r6 = /*@__PURE__*/ float( 0.21 );
const cubeUV_m6 = /*@__PURE__*/ float( 4.0 );

const cubeUV_minMipLevel = /*@__PURE__*/ float( 4.0 );
const cubeUV_minTileSize = /*@__PURE__*/ float( 16.0 );

// These shader functions convert between the UV coordinates of a single face of
// a cubemap, the 0-5 integer index of a cube face, and the direction vector for
// sampling a textureCube (not generally normalized ).

const getFace = /*@__PURE__*/ Fn( ( [ direction ] ) => {

	const absDirection = vec3( abs( direction ) ).toVar();
	const face = float( - 1.0 ).toVar();

	If( absDirection.x.greaterThan( absDirection.z ), () => {

		If( absDirection.x.greaterThan( absDirection.y ), () => {

			face.assign( select( direction.x.greaterThan( 0.0 ), 0.0, 3.0 ) );

		} ).Else( () => {

			face.assign( select( direction.y.greaterThan( 0.0 ), 1.0, 4.0 ) );

		} );

	} ).Else( () => {

		If( absDirection.z.greaterThan( absDirection.y ), () => {

			face.assign( select( direction.z.greaterThan( 0.0 ), 2.0, 5.0 ) );

		} ).Else( () => {

			face.assign( select( direction.y.greaterThan( 0.0 ), 1.0, 4.0 ) );

		} );

	} );

	return face;

} ).setLayout( {
	name: 'getFace',
	type: 'float',
	inputs: [
		{ name: 'direction', type: 'vec3' }
	]
} );

// RH coordinate system; PMREM face-indexing convention
const getUV = /*@__PURE__*/ Fn( ( [ direction, face ] ) => {

	const uv = vec2().toVar();

	If( face.equal( 0.0 ), () => {

		uv.assign( vec2( direction.z, direction.y ).div( abs( direction.x ) ) ); // pos x

	} ).ElseIf( face.equal( 1.0 ), () => {

		uv.assign( vec2( direction.x.negate(), direction.z.negate() ).div( abs( direction.y ) ) ); // pos y

	} ).ElseIf( face.equal( 2.0 ), () => {

		uv.assign( vec2( direction.x.negate(), direction.y ).div( abs( direction.z ) ) ); // pos z

	} ).ElseIf( face.equal( 3.0 ), () => {

		uv.assign( vec2( direction.z.negate(), direction.y ).div( abs( direction.x ) ) ); // neg x

	} ).ElseIf( face.equal( 4.0 ), () => {

		uv.assign( vec2( direction.x.negate(), direction.z ).div( abs( direction.y ) ) ); // neg y

	} ).Else( () => {

		uv.assign( vec2( direction.x, direction.y ).div( abs( direction.z ) ) ); // neg z

	} );

	return mul( 0.5, uv.add( 1.0 ) );

} ).setLayout( {
	name: 'getUV',
	type: 'vec2',
	inputs: [
		{ name: 'direction', type: 'vec3' },
		{ name: 'face', type: 'float' }
	]
} );

const roughnessToMip = /*@__PURE__*/ Fn( ( [ roughness ] ) => {

	const mip = float( 0.0 ).toVar();

	If( roughness.greaterThanEqual( cubeUV_r1 ), () => {

		mip.assign( cubeUV_r0.sub( roughness ).mul( cubeUV_m1.sub( cubeUV_m0 ) ).div( cubeUV_r0.sub( cubeUV_r1 ) ).add( cubeUV_m0 ) );

	} ).ElseIf( roughness.greaterThanEqual( cubeUV_r4 ), () => {

		mip.assign( cubeUV_r1.sub( roughness ).mul( cubeUV_m4.sub( cubeUV_m1 ) ).div( cubeUV_r1.sub( cubeUV_r4 ) ).add( cubeUV_m1 ) );

	} ).ElseIf( roughness.greaterThanEqual( cubeUV_r5 ), () => {

		mip.assign( cubeUV_r4.sub( roughness ).mul( cubeUV_m5.sub( cubeUV_m4 ) ).div( cubeUV_r4.sub( cubeUV_r5 ) ).add( cubeUV_m4 ) );

	} ).ElseIf( roughness.greaterThanEqual( cubeUV_r6 ), () => {

		mip.assign( cubeUV_r5.sub( roughness ).mul( cubeUV_m6.sub( cubeUV_m5 ) ).div( cubeUV_r5.sub( cubeUV_r6 ) ).add( cubeUV_m5 ) );

	} ).Else( () => {

		mip.assign( float( - 2.0 ).mul( log2( mul( 1.16, roughness ) ) ) ); // 1.16 = 1.79^0.25

	} );

	return mip;

} ).setLayout( {
	name: 'roughnessToMip',
	type: 'float',
	inputs: [
		{ name: 'roughness', type: 'float' }
	]
} );

// RH coordinate system; PMREM face-indexing convention
export const getDirection = /*@__PURE__*/ Fn( ( [ uv_immutable, face ] ) => {

	const uv = uv_immutable.toVar();
	uv.assign( mul( 2.0, uv ).sub( 1.0 ) );
	const direction = vec3( uv, 1.0 ).toVar();

	If( face.equal( 0.0 ), () => {

		direction.assign( direction.zyx ); // ( 1, v, u ) pos x

	} ).ElseIf( face.equal( 1.0 ), () => {

		direction.assign( direction.xzy );
		direction.xz.mulAssign( - 1.0 ); // ( -u, 1, -v ) pos y

	} ).ElseIf( face.equal( 2.0 ), () => {

		direction.x.mulAssign( - 1.0 ); // ( -u, v, 1 ) pos z

	} ).ElseIf( face.equal( 3.0 ), () => {

		direction.assign( direction.zyx );
		direction.xz.mulAssign( - 1.0 ); // ( -1, v, -u ) neg x

	} ).ElseIf( face.equal( 4.0 ), () => {

		direction.assign( direction.xzy );
		direction.xy.mulAssign( - 1.0 ); // ( -u, -1, v ) neg y

	} ).ElseIf( face.equal( 5.0 ), () => {

		direction.z.mulAssign( - 1.0 ); // ( u, v, -1 ) neg zS

	} );

	return direction;

} ).setLayout( {
	name: 'getDirection',
	type: 'vec3',
	inputs: [
		{ name: 'uv', type: 'vec2' },
		{ name: 'face', type: 'float' }
	]
} );

//

export const textureCubeUV = /*@__PURE__*/ Fn( ( [ envMap, sampleDir_immutable, roughness_immutable, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP ] ) => {

	const roughness = float( roughness_immutable );
	const sampleDir = vec3( sampleDir_immutable );

	const mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
	const mipF = fract( mip );
	const mipInt = floor( mip );
	const color0 = vec3( bilinearCubeUV( envMap, sampleDir, mipInt, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP ) ).toVar();

	If( mipF.notEqual( 0.0 ), () => {

		const color1 = vec3( bilinearCubeUV( envMap, sampleDir, mipInt.add( 1.0 ), CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP ) ).toVar();

		color0.assign( mix( color0, color1, mipF ) );

	} );

	return color0;

} );

const bilinearCubeUV = /*@__PURE__*/ Fn( ( [ envMap, direction_immutable, mipInt_immutable, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP ] ) => {

	const mipInt = float( mipInt_immutable ).toVar();
	const direction = vec3( direction_immutable );
	const face = float( getFace( direction ) ).toVar();
	const filterInt = float( max( cubeUV_minMipLevel.sub( mipInt ), 0.0 ) ).toVar();
	mipInt.assign( max( mipInt, cubeUV_minMipLevel ) );
	const faceSize = float( exp2( mipInt ) ).toVar();
	const uv = vec2( getUV( direction, face ).mul( faceSize.sub( 2.0 ) ).add( 1.0 ) ).toVar();

	If( face.greaterThan( 2.0 ), () => {

		uv.y.addAssign( faceSize );
		face.subAssign( 3.0 );

	} );

	uv.x.addAssign( face.mul( faceSize ) );
	uv.x.addAssign( filterInt.mul( mul( 3.0, cubeUV_minTileSize ) ) );
	uv.y.addAssign( mul( 4.0, exp2( CUBEUV_MAX_MIP ).sub( faceSize ) ) );
	uv.x.mulAssign( CUBEUV_TEXEL_WIDTH );
	uv.y.mulAssign( CUBEUV_TEXEL_HEIGHT );

	return envMap.sample( uv ).grad( vec2(), vec2() ); // disable anisotropic filtering

} );

const getSample = /*@__PURE__*/ Fn( ( { envMap, mipInt, outputDirection, theta, axis, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP } ) => {

	const cosTheta = cos( theta );

	// Rodrigues' axis-angle rotation
	const sampleDirection = outputDirection.mul( cosTheta )
		.add( axis.cross( outputDirection ).mul( sin( theta ) ) )
		.add( axis.mul( axis.dot( outputDirection ).mul( cosTheta.oneMinus() ) ) );

	return bilinearCubeUV( envMap, sampleDirection, mipInt, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP );

} );

export const blur = /*@__PURE__*/ Fn( ( { n, latitudinal, poleAxis, outputDirection, weights, samples, dTheta, mipInt, envMap, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP } ) => {

	const axis = vec3( select( latitudinal, poleAxis, cross( poleAxis, outputDirection ) ) ).toVar();

	If( axis.equal( vec3( 0.0 ) ), () => {

		axis.assign( vec3( outputDirection.z, 0.0, outputDirection.x.negate() ) );

	} );

	axis.assign( normalize( axis ) );

	const gl_FragColor = vec3().toVar();
	gl_FragColor.addAssign( weights.element( 0 ).mul( getSample( { theta: 0.0, axis, outputDirection, mipInt, envMap, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP } ) ) );

	Loop( { start: int( 1 ), end: n }, ( { i } ) => {

		If( i.greaterThanEqual( samples ), () => {

			Break();

		} );

		const theta = float( dTheta.mul( float( i ) ) ).toVar();
		gl_FragColor.addAssign( weights.element( i ).mul( getSample( { theta: theta.mul( - 1.0 ), axis, outputDirection, mipInt, envMap, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP } ) ) );
		gl_FragColor.addAssign( weights.element( i ).mul( getSample( { theta, axis, outputDirection, mipInt, envMap, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP } ) ) );

	} );

	return vec4( gl_FragColor, 1 );

} );

// GGX VNDF importance sampling functions

// Van der Corput radical inverse for generating quasi-random sequences
const radicalInverse_VdC = /*@__PURE__*/ Fn( ( [ bits_immutable ] ) => {

	const bits = uint( bits_immutable ).toVar();
	bits.assign( bits.shiftLeft( uint( 16 ) ).bitOr( bits.shiftRight( uint( 16 ) ) ) );
	bits.assign( bits.bitAnd( uint( 0x55555555 ) ).shiftLeft( uint( 1 ) ).bitOr( bits.bitAnd( uint( 0xAAAAAAAA ) ).shiftRight( uint( 1 ) ) ) );
	bits.assign( bits.bitAnd( uint( 0x33333333 ) ).shiftLeft( uint( 2 ) ).bitOr( bits.bitAnd( uint( 0xCCCCCCCC ) ).shiftRight( uint( 2 ) ) ) );
	bits.assign( bits.bitAnd( uint( 0x0F0F0F0F ) ).shiftLeft( uint( 4 ) ).bitOr( bits.bitAnd( uint( 0xF0F0F0F0 ) ).shiftRight( uint( 4 ) ) ) );
	bits.assign( bits.bitAnd( uint( 0x00FF00FF ) ).shiftLeft( uint( 8 ) ).bitOr( bits.bitAnd( uint( 0xFF00FF00 ) ).shiftRight( uint( 8 ) ) ) );
	return float( bits ).mul( 2.3283064365386963e-10 ); // / 0x100000000

} );

// Hammersley sequence for quasi-Monte Carlo sampling
const hammersley = /*@__PURE__*/ Fn( ( [ i, N ] ) => {

	return vec2( float( i ).div( float( N ) ), radicalInverse_VdC( i ) );

} );

// GGX VNDF importance sampling (Eric Heitz 2018)
// "Sampling the GGX Distribution of Visible Normals"
// https://jcgt.org/published/0007/04/01/
const importanceSampleGGX_VNDF = /*@__PURE__*/ Fn( ( [ Xi, V, roughness ] ) => {

	const alpha = roughness.mul( roughness ).toConst();

	// Section 4.1: Orthonormal basis
	const T1 = vec3( 1.0, 0.0, 0.0 ).toConst();
	const T2 = cross( V, T1 ).toConst();

	// Section 4.2: Parameterization of projected area
	const r = sqrt( Xi.x ).toConst();
	const phi = mul( 2.0, 3.14159265359 ).mul( Xi.y ).toConst();
	const t1 = r.mul( cos( phi ) ).toConst();
	const t2 = r.mul( sin( phi ) ).toVar();
	const s = mul( 0.5, V.z.add( 1.0 ) ).toConst();
	t2.assign( s.oneMinus().mul( sqrt( t1.mul( t1 ).oneMinus() ) ).add( s.mul( t2 ) ) );

	// Section 4.3: Reprojection onto hemisphere
	const Nh = T1.mul( t1 ).add( T2.mul( t2 ) ).add( V.mul( sqrt( max( 0.0, t1.mul( t1 ).add( t2.mul( t2 ) ).oneMinus() ) ) ) );

	// Section 3.4: Transform back to ellipsoid configuration
	return normalize( vec3( alpha.mul( Nh.x ), alpha.mul( Nh.y ), max( 0.0, Nh.z ) ) );

} );

// GGX convolution using VNDF importance sampling
export const ggxConvolution = /*@__PURE__*/ Fn( ( { roughness, mipInt, envMap, N_immutable, GGX_SAMPLES, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP } ) => {

	const N = vec3( N_immutable ).toVar();

	const prefilteredColor = vec3( 0.0 ).toVar();
	const totalWeight = float( 0.0 ).toVar();

	// For very low roughness, just sample the environment directly
	If( roughness.lessThan( 0.001 ), () => {

		prefilteredColor.assign( bilinearCubeUV( envMap, N, mipInt, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP ) );

	} ).Else( () => {

		// Tangent space basis for VNDF sampling
		const up = select( abs( N.z ).lessThan( 0.999 ), vec3( 0.0, 0.0, 1.0 ), vec3( 1.0, 0.0, 0.0 ) );
		const tangent = normalize( cross( up, N ) ).toVar();
		const bitangent = cross( N, tangent ).toVar();

		Loop( { start: uint( 0 ), end: GGX_SAMPLES }, ( { i } ) => {

			const Xi = hammersley( i, GGX_SAMPLES );

			// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
			const H_tangent = importanceSampleGGX_VNDF( Xi, vec3( 0.0, 0.0, 1.0 ), roughness );

			// Transform H back to world space
			const H = normalize( tangent.mul( H_tangent.x ).add( bitangent.mul( H_tangent.y ) ).add( N.mul( H_tangent.z ) ) );
			const L = normalize( H.mul( dot( N, H ).mul( 2.0 ) ).sub( N ) );

			const NdotL = max( dot( N, L ), 0.0 );

			If( NdotL.greaterThan( 0.0 ), () => {

				// Sample environment at fixed mip level
				// VNDF importance sampling handles the distribution filtering
				const sampleColor = bilinearCubeUV( envMap, L, mipInt, CUBEUV_TEXEL_WIDTH, CUBEUV_TEXEL_HEIGHT, CUBEUV_MAX_MIP );

				// Weight by NdotL for the split-sum approximation
				// VNDF PDF naturally accounts for the visible microfacet distribution
				prefilteredColor.addAssign( sampleColor.mul( NdotL ) );
				totalWeight.addAssign( NdotL );

			} );

		} );

		If( totalWeight.greaterThan( 0.0 ), () => {

			prefilteredColor.assign( prefilteredColor.div( totalWeight ) );

		} );

	} );

	return vec4( prefilteredColor, 1.0 );

} );
