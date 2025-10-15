import { Fn, float, uvec2, vec2, vec4 } from '../../tsl/TSLBase.js';
import { instanceIndex } from '../../core/IndexNode.js';
import { textureStore } from '../../accessors/StorageTextureNode.js';

// Analytical approximation of the DFG LUT, one half of the
// split-sum approximation used in indirect specular lighting.
// via 'environmentBRDF' from "Physically Based Shading on Mobile"
// https://www.unrealengine.com/blog/physically-based-shading-on-mobile
const DFGApprox = /*@__PURE__*/ Fn( ( { roughness, dotNV } ) => {

	const c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );

	const c1 = vec4( 1, 0.0425, 1.04, - 0.04 );

	const r = roughness.mul( c0 ).add( c1 );

	const a004 = r.x.mul( r.x ).min( dotNV.mul( - 9.28 ).exp2() ).mul( r.x ).add( r.y );

	const fab = vec2( - 1.04, 1.04 ).mul( a004 ).add( r.zw );

	return fab;

} ).setLayout( {
	name: 'DFGApprox',
	type: 'vec2',
	inputs: [
		{ name: 'roughness', type: 'float' },
		{ name: 'dotNV', type: 'vec3' }
	]
} );

export default DFGApprox;

// Compute shader implementation for generating DFG LUT

// Van der Corput radical inverse
const radicalInverse_VdC = /*@__PURE__*/ Fn( ( [ bits ] ) => {

	bits = bits.shiftLeft( 16 ).or( bits.shiftRight( 16 ) );
	bits = bits.and( 0x55555555 ).shiftLeft( 1 ).or( bits.and( 0xAAAAAAAA ).shiftRight( 1 ) );
	bits = bits.and( 0x33333333 ).shiftLeft( 2 ).or( bits.and( 0xCCCCCCCC ).shiftRight( 2 ) );
	bits = bits.and( 0x0F0F0F0F ).shiftLeft( 4 ).or( bits.and( 0xF0F0F0F0 ).shiftRight( 4 ) );
	bits = bits.and( 0x00FF00FF ).shiftLeft( 8 ).or( bits.and( 0xFF00FF00 ).shiftRight( 8 ) );

	return bits.toFloat().mul( 2.3283064365386963e-10 );

} );

// Hammersley sequence
const hammersley = /*@__PURE__*/ Fn( ( [ i, N ] ) => {

	return vec2( i.toFloat().div( N.toFloat() ), radicalInverse_VdC( i ) );

} );

// Importance sampling GGX
const importanceSampleGGX = /*@__PURE__*/ Fn( ( [ xi, roughness ] ) => {

	const a = roughness.mul( roughness );
	const phi = xi.x.mul( 2.0 * Math.PI );
	const cosTheta = xi.y.oneMinus().div( xi.y.mul( a.mul( a ).sub( 1.0 ) ).add( 1.0 ) ).sqrt();
	const sinTheta = cosTheta.mul( cosTheta ).oneMinus().sqrt();

	return vec4(
		phi.cos().mul( sinTheta ),
		phi.sin().mul( sinTheta ),
		cosTheta,
		0.0
	).xyz;

} );

// Smith GGX Correlated visibility function
const V_SmithGGXCorrelated = /*@__PURE__*/ Fn( ( [ NdotV, NdotL, roughness ] ) => {

	const a2 = roughness.pow( 4.0 );
	const GGXV = NdotL.mul( NdotV.mul( NdotV ).mul( a2.oneMinus() ).add( a2 ).sqrt() );
	const GGXL = NdotV.mul( NdotL.mul( NdotL ).mul( a2.oneMinus() ).add( a2 ).sqrt() );

	return float( 0.5 ).div( GGXV.add( GGXL ) );

} );

// Integrate BRDF for a single roughness/NdotV pair
const integrateBRDF = /*@__PURE__*/ Fn( ( [ NdotV, roughness, sampleCount ] ) => {

	const V = vec4(
		NdotV.mul( NdotV ).oneMinus().sqrt(),
		0.0,
		NdotV,
		0.0
	).xyz;

	const A = float( 0.0 ).toVar();
	const B = float( 0.0 ).toVar();

	for ( let i = 0; i < sampleCount; i ++ ) {

		const xi = hammersley( i, sampleCount );
		const H = importanceSampleGGX( xi, roughness );

		const VdotH = V.dot( H ).max( 0.0 );
		const L = H.mul( 2.0 ).mul( VdotH ).sub( V ).normalize();

		const NdotL = L.z.max( 0.0 );
		const NdotH = H.z.max( 0.0 );

		NdotL.greaterThan( 0.0 ).if( () => {

			const V_pdf = V_SmithGGXCorrelated( NdotV, NdotL, roughness ).mul( VdotH ).mul( NdotL ).div( NdotH );
			const Fc = VdotH.oneMinus().pow( 5.0 );

			A.assign( A.add( Fc.oneMinus().mul( V_pdf ) ) );
			B.assign( B.add( Fc.mul( V_pdf ) ) );

		} );

	}

	return vec2( A, B ).mul( 4.0 ).div( sampleCount.toFloat() );

} );

/**
 * Generates a DFG LUT (Directional-Fresnel-Geometry Look-Up Table) using a compute shader.
 * This is used for Image-Based Lighting in PBR materials.
 *
 * @tsl
 * @function
 * @param {StorageTexture} storageTexture - The storage texture to write the LUT to.
 * @param {number} lutSize - The size of the LUT (e.g., 32 for a 32x32 texture).
 * @param {number} [sampleCount=1024] - The number of samples per texel.
 * @returns {ComputeNode} The compute node that generates the LUT.
 */
export const generateDFGLUT = /*@__PURE__*/ Fn( ( { storageTexture, lutSize, sampleCount } ) => {

	const posX = instanceIndex.mod( lutSize );
	const posY = instanceIndex.div( lutSize );
	const indexUV = uvec2( posX, posY );

	const roughness = posX.add( 0.5 ).div( lutSize.toFloat() );
	const NdotV = posY.add( 0.5 ).div( lutSize.toFloat() );

	const result = integrateBRDF( NdotV, roughness, sampleCount );

	textureStore( storageTexture, indexUV, vec4( result, 0.0, 0.0 ) ).toWriteOnly();

} );
