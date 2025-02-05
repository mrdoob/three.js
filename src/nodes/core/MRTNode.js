import OutputStructNode from './OutputStructNode.js';
import { nodeProxy, vec4 } from '../tsl/TSLBase.js';

/**
 * Returns the MRT texture index for the given name.
 *
 * @param {Array<Texture>} textures - The textures of a MRT-configured render target.
 * @param {string} name - The name of the MRT texture which index is requested.
 * @return {number} The texture index.
 */
export function getTextureIndex( textures, name ) {

	for ( let i = 0; i < textures.length; i ++ ) {

		if ( textures[ i ].name === name ) {

			return i;

		}

	}

	return - 1;

}

/**
 * This node can be used setup a MRT context for rendering. A typical MRT setup for
 * post-processing is shown below:
 * ```js
 * const mrtNode = mrt( {
 *   output: output,
 *   normal: normalView
 * } ) );
 * ```
 * The MRT output is defined as a dictionary.
 *
 * @augments OutputStructNode
 */
class MRTNode extends OutputStructNode {

	static get type() {

		return 'MRTNode';

	}

	/**
	 * Constructs a new output struct node.
	 *
	 * @param {Object<string, Node>} outputNodes - The MRT outputs.
	 */
	constructor( outputNodes ) {

		super();

		/**
		 * A dictionary representing the MRT outputs. The key
		 * is the name of the output, the value the node which produces
		 * the output result.
		 *
		 * @type {Object<string, Node>}
		 */
		this.outputNodes = outputNodes;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isMRTNode = true;

	}

	/**
	 * Returns `true` if the MRT node has an output with the given name.
	 *
	 * @param {string} name - The name of the output.
	 * @return {NodeBuilder} Whether the MRT node has an output for the given name or not.
	 */
	has( name ) {

		return this.outputNodes[ name ] !== undefined;

	}

	/**
	 * Returns the output node for the given name.
	 *
	 * @param {string} name - The name of the output.
	 * @return {Node} The output node.
	 */
	get( name ) {

		return this.outputNodes[ name ];

	}

	/**
	 * Merges the outputs of the given MRT node with the outputs of this node.
	 *
	 * @param {MRTNode} mrtNode - The MRT to merge.
	 * @return {MRTNode} A new MRT node with merged outputs..
	 */
	merge( mrtNode ) {

		const outputs = { ...this.outputNodes, ...mrtNode.outputNodes };

		return mrt( outputs );

	}

	setup( builder ) {

		const outputNodes = this.outputNodes;
		const mrt = builder.renderer.getRenderTarget();

		const members = [];

		const textures = mrt.textures;

		for ( const name in outputNodes ) {

			const index = getTextureIndex( textures, name );

			members[ index ] = vec4( outputNodes[ name ] );

		}

		this.members = members;

		return super.setup( builder );

	}

}

export default MRTNode;

/**
 * TSL function for creating a MRT node.
 *
 * @tsl
 * @function
 * @param {Object<string, Node>} outputNodes - The MRT outputs.
 * @returns {MRTNode}
 */
export const mrt = /*@__PURE__*/ nodeProxy( MRTNode );
