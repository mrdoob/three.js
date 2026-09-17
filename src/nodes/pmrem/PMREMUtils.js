import { Fn, int, uint, float, vec2, vec3, vec4, If } from '../tsl/TSLBase.js';
import { cos, sin, abs, min, max, exp, log, log2, normalize, cross, dot, sqrt, inverseSqrt } from '../math/MathNode.js';
import { select } from '../math/ConditionalNode.js';
import { Loop } from '../utils/LoopNode.js';
import D_GGX from '../functions/BSDF/D_GGX.js';

const GOLDEN_ANGLE = 2.399963229728653;

/**
 * Returns the mip level of a PMREM that has been prefiltered for the given roughness.
 * Must match `PMREMGenerator.lodToRoughness()`.
 *
 * @tsl
 * @function
 * @param {Node<float>} roughness - The roughness.
 * @param {Node<float>} maxLod - The last mip level of the PMREM.
 * @return {Node<float>} The mip level.
 */
export const roughnessToMip = ( roughness, maxLod ) => {

	roughness = float( roughness );

	return float( maxLod ).mul( roughness ).mul( float( 2.0 ).sub( roughness ) );

};

// Gaussian blur along a golden-angle spiral, importance-sampled by stratified
// inverse-CDF so every sample carries equal Gaussian weight.
export const sphericalGaussianBlur = /*@__PURE__*/ Fn( ( { SAMPLES, sigma, direction, envMap } ) => {

	const outputDirection = vec3( direction ).toVar();

	const up = select( abs( outputDirection.z ).lessThan( 0.999 ), vec3( 0.0, 0.0, 1.0 ), vec3( 1.0, 0.0, 0.0 ) );
	const tangent = normalize( cross( up, outputDirection ) ).toVar();
	const bitangent = cross( outputDirection, tangent ).toVar();

	// Truncate the kernel at three standard deviations or at the antipode.
	const thetaMax = min( sigma.mul( 3.0 ), Math.PI );
	const truncation = exp( thetaMax.mul( thetaMax ).mul( - 0.5 ).div( sigma.mul( sigma ) ) ).oneMinus().toVar();

	const color = vec3( 0.0 ).toVar();
	const accumWeight = float( 0.0 ).toVar();

	Loop( { start: int( 0 ), end: SAMPLES }, ( { i } ) => {

		// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
		const stratum = float( i ).add( 0.5 ).div( float( SAMPLES ) );
		const theta = sigma.mul( sqrt( log( stratum.mul( truncation ).oneMinus() ).mul( - 2.0 ) ) ).toVar();
		const phi = float( i ).mul( GOLDEN_ANGLE ).toVar();

		const offset = tangent.mul( cos( phi ) ).add( bitangent.mul( sin( phi ) ) );
		const sampleDirection = outputDirection.mul( cos( theta ) ).add( offset.mul( sin( theta ) ) );

		// Correct the planar sample density to solid angle.
		const weight = sin( theta ).div( theta ).toVar();

		color.addAssign( envMap.sample( sampleDirection ).level( 0 ).rgb.mul( weight ) );
		accumWeight.addAssign( weight );

	} );

	return vec4( color.div( accumWeight ), 1.0 );

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

// GGX VNDF importance sampling (Eric Heitz 2018), "Sampling the GGX Distribution
// of Visible Normals", https://jcgt.org/published/0007/04/01/. With V = N the
// visible normals are a cosine distributed hemisphere stretched by alpha.
const importanceSampleGGX_VNDF = /*@__PURE__*/ Fn( ( [ Xi, alpha ] ) => {

	const r = sqrt( Xi.x ).toConst();
	const phi = float( 2.0 * Math.PI ).mul( Xi.y ).toConst();

	return normalize( vec3( alpha.mul( r ).mul( cos( phi ) ), alpha.mul( r ).mul( sin( phi ) ), sqrt( Xi.x.oneMinus() ) ) );

} );

// GGX convolution using VNDF importance sampling. Each sample reads the mip level of the
// source cube map that matches its solid angle (filtered importance sampling), which keeps
// the estimate smooth even for tiny, very bright light sources.
export const ggxConvolution = /*@__PURE__*/ Fn( ( { roughness, lodBias, envMap, direction, GGX_SAMPLES } ) => {

	const N = vec3( direction ).toVar();

	const prefilteredColor = vec3( 0.0 ).toVar();

	// For very low roughness, just sample the environment directly
	If( roughness.lessThan( 0.001 ), () => {

		prefilteredColor.assign( envMap.sample( N ).level( 0 ).rgb );

	} ).Else( () => {

		const alpha = roughness.mul( roughness ).toConst();
		const alpha2 = alpha.mul( alpha ).toConst();

		// Tangent space basis for VNDF sampling
		const up = select( abs( N.z ).lessThan( 0.999 ), vec3( 0.0, 0.0, 1.0 ), vec3( 1.0, 0.0, 0.0 ) );
		const tangent = normalize( cross( up, N ) ).toVar();
		const bitangent = cross( N, tangent ).toVar();

		const totalWeight = float( 0.0 ).toVar();

		Loop( { start: uint( 0 ), end: GGX_SAMPLES }, ( { i } ) => {

			const Xi = hammersley( i, GGX_SAMPLES );

			const H_tangent = importanceSampleGGX_VNDF( Xi, alpha ).toConst();

			// Transform H back to world space
			const H = tangent.mul( H_tangent.x ).add( bitangent.mul( H_tangent.y ) ).add( N.mul( H_tangent.z ) );
			const L = H.mul( dot( N, H ).mul( 2.0 ) ).sub( N ).toConst();

			const NdotL = dot( N, L ).toConst();

			If( NdotL.greaterThan( 0.0 ), () => {

				// the source mip whose texel matches the sample's solid angle, see lodBias
				const NdotH = H_tangent.z;
				const d = NdotH.mul( NdotH ).mul( alpha2.sub( 1.0 ) ).add( 1.0 );
				const lod = max( log2( d ).add( lodBias ), 0.0 );

				// Weight by NdotL for the split-sum approximation
				prefilteredColor.addAssign( envMap.sample( L ).level( lod ).rgb.mul( NdotL ) );
				totalWeight.addAssign( NdotL );

			} );

		} );

		prefilteredColor.divAssign( totalWeight );

	} );

	return vec4( prefilteredColor, 1.0 );

} );

// GGX convolution that weights every texel of a small source mip. Noise free and,
// for the wide lobes of the rough mip levels, cheaper than importance sampling.
export const ggxIntegration = /*@__PURE__*/ Fn( ( { roughness, sourceLod, sourceSize, envMap, direction } ) => {

	const N = vec3( direction ).toVar();

	const alpha = roughness.mul( roughness ).toConst();

	const texelSize = float( 2.0 ).div( float( sourceSize ) ).toConst();

	const prefilteredColor = vec3( 0.0 ).toVar();
	const totalWeight = float( 0.0 ).toVar();

	// the texel centers of any cube map are the same set of directions,
	// so the face orientation doesn't matter here
	Loop( { start: int( 0 ), end: int( 6 ), name: 'face' }, ( { face } ) => {

		const s = select( face.bitAnd( int( 1 ) ).equal( int( 0 ) ), 1.0, - 1.0 ).toConst();

		Loop( { start: int( 0 ), end: sourceSize, name: 'y' }, ( { y } ) => {

			Loop( { start: int( 0 ), end: sourceSize, name: 'x' }, ( { x } ) => {

				const uv = vec2( x, y ).add( 0.5 ).mul( texelSize ).sub( 1.0 ).toConst();
				const texelDirection = select( face.lessThan( 2 ), vec3( s, uv ), select( face.lessThan( 4 ), vec3( uv.x, s, uv.y ), vec3( uv, s ) ) ).toConst();

				const invDistance = inverseSqrt( dot( uv, uv ).add( 1.0 ) ).toConst();
				const L = texelDirection.mul( invDistance ).toConst();
				const NdotL = dot( N, L ).toConst();

				If( NdotL.greaterThan( 0.0 ), () => {

					const D = D_GGX( { alpha, dotNH: dot( N, normalize( N.add( L ) ) ) } );

					// solid angle of the texel: its area over the cubed distance
					const solidAngle = texelSize.mul( texelSize ).mul( invDistance.mul( invDistance ).mul( invDistance ) );

					const weight = D.mul( NdotL ).mul( solidAngle ).toConst();

					prefilteredColor.addAssign( envMap.sample( texelDirection ).level( sourceLod ).rgb.mul( weight ) );
					totalWeight.addAssign( weight );

				} );

			} );

		} );

	} );

	return vec4( prefilteredColor.div( totalWeight ), 1.0 );

} );
