import OutputStructNode from './OutputStructNode.js';
import { nodeProxy } from '../tsl/TSLBase.js';
import { MaterialBlending, NoBlending } from '../../constants.js';
import BlendMode from '../../renderers/common/BlendMode.js';
import Color4 from '../../renderers/common/Color4.js';

// Predefined blend modes for MRT nodes.
const _noBlending = /**@__PURE__*/ new BlendMode( NoBlending );
const _materialBlending = /**@__PURE__*/ new BlendMode( MaterialBlending );

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
 * } ) ;
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
		 * A dictionary storing the blend modes for each output.
		 *
		 * @type {Object<string, BlendMode>}
		 */
		this.blendModes = {
			output: _materialBlending
		};

		/**
		 * A dictionary storing the clear colors for each output.
		 *
		 * @type {Object<string, Color4>}
		 */
		this.clearColors = {};

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
	 * Sets the blend mode for the given output name.
	 *
	 * @param {string} name - The name of the output.
	 * @param {BlendMode} blend - The blending mode.
	 * @return {MRTNode} The current MRT node.
	 */
	setBlendMode( name, blend ) {

		this.blendModes[ name ] = blend;

		return this;

	}

	/**
	 * Returns the blend mode for the given output name.
	 *
	 * @param {string} name - The name of the output.
	 * @return {BlendMode} The blend mode.
	 */
	getBlendMode( name ) {

		return this.blendModes[ name ] || _noBlending;

	}

	/**
	 * Sets the clear color for the given output name.
	 *
	 * @param {string} name - The name of the output.
	 * @param {number|string|Color} color - The clear color.
	 * @param {number} [alpha=1] - The clear alpha.
	 * @return {MRTNode} The current MRT node.
	 */
	setClearColor( name, color, alpha = 1 ) {

		const clearColor = this.clearColors[ name ] || ( this.clearColors[ name ] = new Color4() );

		clearColor.set( color );
		clearColor.a = alpha;

		return this;

	}

	/**
	 * Returns the clear color for the given output name.
	 *
	 * @param {string} name - The name of the output.
	 * @return {?Color4} The clear color. Returns `null` if no clear color is defined
	 * which means the renderer's default clear policy is applied.
	 */
	getClearColor( name ) {

		return this.clearColors[ name ] || null;

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
		const blendModes = { ...this.blendModes, ...mrtNode.blendModes };
		const clearColors = { ...this.clearColors, ...mrtNode.clearColors };

		const mrtTarget = mrt( outputs );
		mrtTarget.blendModes = blendModes;
		mrtTarget.clearColors = clearColors;

		return mrtTarget;

	}

	setup( builder ) {

		const outputNodes = this.outputNodes;
		const mrt = builder.renderer.getRenderTarget();

		const members = [];

		const textures = mrt.textures;

		for ( const name in outputNodes ) {

			const index = getTextureIndex( textures, name );

			// Ignore if the output exists in the MRT but has never been used.
			if ( index === - 1 ) continue;

			const type = builder.getOutputType( index );

			members[ index ] = outputNodes[ name ].convert( type );

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
