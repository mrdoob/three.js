import { add, mul, div } from '../math/OperatorNode.js';
import { floor, ceil, fract, pow } from '../math/MathNode.js';
import { Fn, float, vec2, vec4, int } from '../tsl/TSLBase.js';

// Mipped Bicubic Texture Filtering by N8
// https://www.shadertoy.com/view/Dl2SDW

const bC = 1.0 / 6.0;

const w0 = ( a ) => mul( bC, mul( a, mul( a, a.negate().add( 3.0 ) ).sub( 3.0 ) ).add( 1.0 ) );

const w1 = ( a ) => mul( bC, mul( a, mul( a, mul( 3.0, a ).sub( 6.0 ) ) ).add( 4.0 ) );

const w2 = ( a ) => mul( bC, mul( a, mul( a, mul( - 3.0, a ).add( 3.0 ) ).add( 3.0 ) ).add( 1.0 ) );

const w3 = ( a ) => mul( bC, pow( a, 3 ) );

const g0 = ( a ) => w0( a ).add( w1( a ) );

const g1 = ( a ) => w2( a ).add( w3( a ) );

// h0 and h1 are the two offset functions
const h0 = ( a ) => add( - 1.0, w1( a ).div( w0( a ).add( w1( a ) ) ) );

const h1 = ( a ) => add( 1.0, w3( a ).div( w2( a ).add( w3( a ) ) ) );

const bicubic = ( textureNode, texelSize, lod ) => {

	const uv = textureNode.uvNode;
	const uvScaled = mul( uv, texelSize.zw ).add( 0.5 );

	const iuv = floor( uvScaled );
	const fuv = fract( uvScaled );

	const g0x = g0( fuv.x );
	const g1x = g1( fuv.x );
	const h0x = h0( fuv.x );
	const h1x = h1( fuv.x );
	const h0y = h0( fuv.y );
	const h1y = h1( fuv.y );

	const p0 = vec2( iuv.x.add( h0x ), iuv.y.add( h0y ) ).sub( 0.5 ).mul( texelSize.xy );
	const p1 = vec2( iuv.x.add( h1x ), iuv.y.add( h0y ) ).sub( 0.5 ).mul( texelSize.xy );
	const p2 = vec2( iuv.x.add( h0x ), iuv.y.add( h1y ) ).sub( 0.5 ).mul( texelSize.xy );
	const p3 = vec2( iuv.x.add( h1x ), iuv.y.add( h1y ) ).sub( 0.5 ).mul( texelSize.xy );

	const a = g0( fuv.y ).mul( add( g0x.mul( textureNode.sample( p0 ).level( lod ) ), g1x.mul( textureNode.sample( p1 ).level( lod ) ) ) );
	const b = g1( fuv.y ).mul( add( g0x.mul( textureNode.sample( p2 ).level( lod ) ), g1x.mul( textureNode.sample( p3 ).level( lod ) ) ) );

	return a.add( b );

};

/**
 * Applies mipped bicubic texture filtering to the given texture node.
 *
 * @tsl
 * @function
 * @param {TextureNode} textureNode - The texture node that should be filtered.
 * @param {Node<float>} [lodNode=float(3)] - Defines the LOD to sample from.
 * @return {Node} The filtered texture sample.
 */
export const textureBicubic = /*@__PURE__*/ Fn( ( [ textureNode, lodNode = float( 3 ) ] ) => {

	const fLodSize = vec2( textureNode.size( int( lodNode ) ) );
	const cLodSize = vec2( textureNode.size( int( lodNode.add( 1.0 ) ) ) );
	const fLodSizeInv = div( 1.0, fLodSize );
	const cLodSizeInv = div( 1.0, cLodSize );
	const fSample = bicubic( textureNode, vec4( fLodSizeInv, fLodSize ), floor( lodNode ) );
	const cSample = bicubic( textureNode, vec4( cLodSizeInv, cLodSize ), ceil( lodNode ) );

	return fract( lodNode ).mix( fSample, cSample );

} );
