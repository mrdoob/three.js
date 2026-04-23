import { Vector2, TempNode, NodeUpdateType } from 'three/webgpu';
import { Fn, uv, uniform, convertToTexture, vec2, vec3, vec4, mat3, luminance, add } from 'three/tsl';

/**
 * Post processing node for detecting edges with a sobel filter.
 * A sobel filter should be applied after tone mapping and output color
 * space conversion.
 *
 * @augments TempNode
 * @three_import import { sobel } from 'three/addons/tsl/display/SobelOperatorNode.js';
 */
class SobelOperatorNode extends TempNode {

	static get type() {

		return 'SobelOperatorNode';

	}

	/**
	 * Constructs a new sobel operator node.
	 *
	 * @param {TextureNode} textureNode - The texture node that represents the input of the effect.
	 */
	constructor( textureNode ) {

		super( 'vec4' );

		/**
		 * The texture node that represents the input of the effect.
		 *
		 * @type {TextureNode}
		 */
		this.textureNode = textureNode;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node updates
		 * its internal uniforms once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * A uniform node holding the inverse resolution value.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._invSize = uniform( new Vector2() );

	}

	/**
	 * This method is used to update the effect's uniforms once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( /* frame */ ) {

		const map = this.textureNode.value;

		this._invSize.value.set( 1 / map.image.width, 1 / map.image.height );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {ShaderCallNodeInternal}
	 */
	setup( /* builder */ ) {

		const { textureNode } = this;

		const uvNode = textureNode.uvNode || uv();

		const sampleTexture = ( uv ) => textureNode.sample( uv );

		const sobel = Fn( () => {

			// Sobel Edge Detection (see https://youtu.be/uihBwtPIBxM)

			const texel = this._invSize;

			// kernel definition (in glsl matrices are filled in column-major order)

			const Gx = mat3( - 1, - 2, - 1, 0, 0, 0, 1, 2, 1 ); // x direction kernel
			const Gy = mat3( - 1, 0, 1, - 2, 0, 2, - 1, 0, 1 ); // y direction kernel

			// fetch the 3x3 neighbourhood of a fragment

			// first column

			const tx0y0 = luminance( sampleTexture( uvNode.add( texel.mul( vec2( - 1, - 1 ) ) ) ).xyz );
			const tx0y1 = luminance( sampleTexture( uvNode.add( texel.mul( vec2( - 1, 0 ) ) ) ).xyz );
			const tx0y2 = luminance( sampleTexture( uvNode.add( texel.mul( vec2( - 1, 1 ) ) ) ).xyz );

			// second column

			const tx1y0 = luminance( sampleTexture( uvNode.add( texel.mul( vec2( 0, - 1 ) ) ) ).xyz );
			const tx1y1 = luminance( sampleTexture( uvNode.add( texel.mul( vec2( 0, 0 ) ) ) ).xyz );
			const tx1y2 = luminance( sampleTexture( uvNode.add( texel.mul( vec2( 0, 1 ) ) ) ).xyz );

			// third column

			const tx2y0 = luminance( sampleTexture( uvNode.add( texel.mul( vec2( 1, - 1 ) ) ) ).xyz );
			const tx2y1 = luminance( sampleTexture( uvNode.add( texel.mul( vec2( 1, 0 ) ) ) ).xyz );
			const tx2y2 = luminance( sampleTexture( uvNode.add( texel.mul( vec2( 1, 1 ) ) ) ).xyz );

			// gradient value in x direction

			const valueGx = add(
				Gx[ 0 ][ 0 ].mul( tx0y0 ),
				Gx[ 1 ][ 0 ].mul( tx1y0 ),
				Gx[ 2 ][ 0 ].mul( tx2y0 ),
				Gx[ 0 ][ 1 ].mul( tx0y1 ),
				Gx[ 1 ][ 1 ].mul( tx1y1 ),
				Gx[ 2 ][ 1 ].mul( tx2y1 ),
				Gx[ 0 ][ 2 ].mul( tx0y2 ),
				Gx[ 1 ][ 2 ].mul( tx1y2 ),
				Gx[ 2 ][ 2 ].mul( tx2y2 )
			);


			// gradient value in y direction

			const valueGy = add(
				Gy[ 0 ][ 0 ].mul( tx0y0 ),
				Gy[ 1 ][ 0 ].mul( tx1y0 ),
				Gy[ 2 ][ 0 ].mul( tx2y0 ),
				Gy[ 0 ][ 1 ].mul( tx0y1 ),
				Gy[ 1 ][ 1 ].mul( tx1y1 ),
				Gy[ 2 ][ 1 ].mul( tx2y1 ),
				Gy[ 0 ][ 2 ].mul( tx0y2 ),
				Gy[ 1 ][ 2 ].mul( tx1y2 ),
				Gy[ 2 ][ 2 ].mul( tx2y2 )
			);

			// magnitude of the total gradient

			const G = valueGx.mul( valueGx ).add( valueGy.mul( valueGy ) ).sqrt();

			return vec4( vec3( G ), 1 );

		} );

		const outputNode = sobel();

		return outputNode;

	}

}

export default SobelOperatorNode;

/**
 * TSL function for creating a sobel operator node which performs edge detection with a sobel filter.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @returns {SobelOperatorNode}
 */
export const sobel = ( node ) => new SobelOperatorNode( convertToTexture( node ) );
