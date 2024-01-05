import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { nodeProxy, addNodeElement, float, vec2 } from '../shadernode/ShaderNode.js';

// Mipped Bicubic Texture Filtering by N8
// https://www.shadertoy.com/view/Dl2SDW

const bC = 1.0 / 6.0;

const w0 = ( a ) => a.negate().add( 3.0 ).mul( a ).sub( 3.0 ).mul( a ).add( 1.0 ).mul( bC );

const w1 = ( a ) => a.mul( 3.0 ).sub( 6.0 ).mul( a ).mul( a ).add( 4.0 ).mul( bC );

const w2 = ( a ) => a.mul( - 3.0 ).add( 3.0 ).mul( a ).add( 3.0 ).mul( a ).add( 1.0 ).mul( bC );

const w3 = ( a ) => a.mul( a ).mul( a ).mul( bC );

const g0 = ( a ) => w0( a ).add( w1( a ) );

const g1 = ( a ) => w2( a ).add( w3( a ) );

// h0 and h1 are the two offset functions
const h0 = ( a ) => {
	const zero = w0( a );
	return zero.negate().div( zero.add( w1( a ) ) );
};

const h1 = ( a ) => {
	const three = w3( a );
	return three.div( three.add( w2( a ) ) ).add( 1.0 );
};

const bicubic = ( textureNode, texelSize, lod ) => {

	const uv = textureNode.uvNode;
	const uvScaled = uv.mul( texelSize ).add( 0.5 );

	const iuv = uvScaled.floor();
	const fuv = uvScaled.fract();

	const h0x = h0( fuv.x );
	const h1x = h1( fuv.x );
	const h0y = h0( fuv.y );
	const h1y = h1( fuv.y );

	const rec = texelSize.vec2().reciprocal();

	const p0 = iuv.add( vec2( h0x, h0y ) ).sub( 0.5 ).mul( rec );
	const p1 = iuv.add( vec2( h1x, h0y ) ).sub( 0.5 ).mul( rec );
	const p2 = iuv.add( vec2( h0x, h1y ) ).sub( 0.5 ).mul( rec );
	const p3 = iuv.add( vec2( h1x, h1y ) ).sub( 0.5 ).mul( rec );

	const g0x = g0( fuv.x );
	const g1x = g1( fuv.x );

	const a = g0( fuv.y ).mul( g0x.mul( textureNode.uv( p0 ).level( lod ) ).add( g1x.mul( textureNode.uv( p1 ).level( lod ) ) ) );
	const b = g1( fuv.y ).mul( g0x.mul( textureNode.uv( p2 ).level( lod ) ).add( g1x.mul( textureNode.uv( p3 ).level( lod ) ) ) );

	return a.add( b );

};

const textureBicubicMethod = ( textureNode, lodNode ) => {

	const fLodSize = textureNode.size( lodNode );
	const cLodSize = textureNode.size( lodNode.add( 1 ) );

	const fSample = bicubic( textureNode, fLodSize, lodNode.floor() );
	const cSample = bicubic( textureNode, cLodSize, lodNode.ceil() );

	return lodNode.fract().mix( fSample, cSample );

};

class TextureBicubicNode extends TempNode {

	constructor( textureNode, blurNode = float( 3 ) ) {

		super( 'vec4' );

		this.textureNode = textureNode;
		this.blurNode = blurNode;

	}

	setup() {

		return textureBicubicMethod( this.textureNode, this.blurNode );

	}

}

export default TextureBicubicNode;

export const textureBicubic = nodeProxy( TextureBicubicNode );

addNodeElement( 'bicubic', textureBicubic );

addNodeClass( 'TextureBicubicNode', TextureBicubicNode );
