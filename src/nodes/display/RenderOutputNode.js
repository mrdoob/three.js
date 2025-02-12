import TempNode from '../core/TempNode.js';
import { addMethodChaining, nodeObject } from '../tsl/TSLCore.js';

import { NoColorSpace, NoToneMapping } from '../../constants.js';
import { ColorManagement } from '../../math/ColorManagement.js';

/**
 * Normally, tone mapping and color conversion happens automatically
 * before outputting pixel too the default (screen) framebuffer. In certain
 * post processing setups this happens to late because certain effects
 * require e.g. sRGB input. For such scenarios, `RenderOutputNode` can be used
 * to apply tone mapping and color space conversion at an arbitrary point
 * in the effect chain.
 *
 * When applying tone mapping and color space conversion manually with this node,
 * you have to set {@link PostProcessing#outputColorTransform} to `false`.
 *
 * ```js
 * const postProcessing = new PostProcessing( renderer );
 * postProcessing.outputColorTransform = false;
 *
 * const scenePass = pass( scene, camera );
 * const outputPass = renderOutput( scenePass );
 *
 * postProcessing.outputNode = outputPass;
 * ```
 *
 * @augments TempNode
 */
class RenderOutputNode extends TempNode {

	static get type() {

		return 'RenderOutputNode';

	}

	/**
	 * Constructs a new render output node.
	 *
	 * @param {Node} colorNode - The color node to process.
	 * @param {?number} toneMapping - The tone mapping type.
	 * @param {?string} outputColorSpace - The output color space.
	 */
	constructor( colorNode, toneMapping, outputColorSpace ) {

		super( 'vec4' );

		/**
		 * The color node to process.
		 *
		 * @type {Node}
		 */
		this.colorNode = colorNode;

		/**
		 * The tone mapping type.
		 *
		 * @type {?number}
		 */
		this.toneMapping = toneMapping;

		/**
		 * The output color space.
		 *
		 * @type {?string}
		 */
		this.outputColorSpace = outputColorSpace;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isRenderOutputNode = true;

	}

	setup( { context } ) {

		let outputNode = this.colorNode || context.color;

		// tone mapping

		const toneMapping = ( this.toneMapping !== null ? this.toneMapping : context.toneMapping ) || NoToneMapping;
		const outputColorSpace = ( this.outputColorSpace !== null ? this.outputColorSpace : context.outputColorSpace ) || NoColorSpace;

		if ( toneMapping !== NoToneMapping ) {

			outputNode = outputNode.toneMapping( toneMapping );

		}

		// working to output color space

		if ( outputColorSpace !== NoColorSpace && outputColorSpace !== ColorManagement.workingColorSpace ) {

			outputNode = outputNode.workingToColorSpace( outputColorSpace );

		}

		return outputNode;

	}

}

export default RenderOutputNode;

/**
 * TSL function for creating a posterize node.
 *
 * @tsl
 * @function
 * @param {Node} color - The color node to process.
 * @param {?number} [toneMapping=null] - The tone mapping type.
 * @param {?string} [outputColorSpace=null] - The output color space.
 * @returns {RenderOutputNode}
 */
export const renderOutput = ( color, toneMapping = null, outputColorSpace = null ) => nodeObject( new RenderOutputNode( nodeObject( color ), toneMapping, outputColorSpace ) );

addMethodChaining( 'renderOutput', renderOutput );
