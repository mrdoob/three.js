import { add, mul, div } from '../math/OperatorNode.js';
import { floor, ceil, fract, pow } from '../math/MathNode.js';
import { Fn, vec2, vec4, int } from '../tsl/TSLBase.js';
import { maxMipLevel } from '../utils/MaxMipLevelNode.js';

// Mipped Bicubic Texture Filtering by N8
// https://www.shadertoy.com/view/Dl2SDW

const bC = 1.0 / 6.0;

const w0 = ( a ) => mul( bC, mul( a, mul( a, a.negate().add( 3.0 ) ).sub( 3.0 ) ).add( 1.0 ) );

const w1 = ( a ) => mul( bC, mul( a, mul( a, mul( 3.0, a ).sub( 6.0 ) ) ).add( 4.0 ) );

const w2 = ( a ) => mul( bC, mul( a, mul( a, mul( - 3.0, a ).add( 3.0 ) ).add( 3.0 ) ).add( 1.0 ) );

const w3 = ( a ) => mul( bC, pow( a, 3 ) );

const bicubicWeights = ( a ) => {

	const w0a = w0( a );
	const w1a = w1( a );
	const w2a = w2( a );
	const w3a = w3( a );

	const g0a = w0a.add( w1a );
	const g1a = w2a.add( w3a );

	// h0 and h1 are the two offset functions.
	const h0a = add( - 1.0, w1a.div( g0a ) );
	const h1a = add( 1.0, w3a.div( g1a ) );

	return { g0: g0a, g1: g1a, h0: h0a, h1: h1a };

};

const bicubic = ( textureNode, p0, p3, g0, g1, lod ) => {

	const p1 = vec2( p3.x, p0.y );
	const p2 = vec2( p0.x, p3.y );

	const a = g0.y.mul( add( g0.x.mul( textureNode.sample( p0 ).level( lod ) ), g1.x.mul( textureNode.sample( p1 ).level( lod ) ) ) );
	const b = g1.y.mul( add( g0.x.mul( textureNode.sample( p2 ).level( lod ) ), g1.x.mul( textureNode.sample( p3 ).level( lod ) ) ) );

	return a.add( b );

};

/**
 * Applies mipped bicubic texture filtering to the given texture node.
 *
 * @tsl
 * @function
 * @param {TextureNode} textureNode - The texture node that should be filtered.
 * @param {Node<float>} lodNode - Defines the LOD to sample from.
 * @return {Node} The filtered texture sample.
 */
export const textureBicubicLevel = /*@__PURE__*/ Fn( ( [ textureNode, lodNode ] ) => {

	const fLodSize = vec2( textureNode.size( int( lodNode ) ) );
	const cLodSize = vec2( textureNode.size( int( lodNode.add( 1.0 ) ) ) );
	const lodSize = vec4( fLodSize, cLodSize );
	const lodSizeInv = div( 1.0, lodSize );
	const uvScaled = textureNode.uvNode.xyxy.mul( lodSize ).add( 0.5 );
	const iuv = floor( uvScaled );
	const fuv = fract( uvScaled );

	const { g0, g1, h0, h1 } = bicubicWeights( fuv );

	const p0 = iuv.add( h0 ).sub( 0.5 ).mul( lodSizeInv );
	const p3 = iuv.add( h1 ).sub( 0.5 ).mul( lodSizeInv );

	const fSample = bicubic( textureNode, p0.xy, p3.xy, g0.xy, g1.xy, floor( lodNode ) );
	const cSample = bicubic( textureNode, p0.zw, p3.zw, g0.zw, g1.zw, ceil( lodNode ) );

	return fract( lodNode ).mix( fSample, cSample );

} );

/**
 * Applies mipped bicubic texture filtering to the given texture node.
 *
 * @tsl
 * @function
 * @param {TextureNode} textureNode - The texture node that should be filtered.
 * @param {Node<float>} [strength] - Defines the strength of the bicubic filtering.
 * @return {Node} The filtered texture sample.
 */
export const textureBicubic = /*@__PURE__*/ Fn( ( [ textureNode, strength ] ) => {

	const lod = strength.mul( maxMipLevel( textureNode ) );

	return textureBicubicLevel( textureNode, lod );

} );
