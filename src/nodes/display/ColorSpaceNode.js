import TempNode from '../core/TempNode.js';
import { addMethodChaining, mat3, nodeObject, vec4 } from '../tsl/TSLCore.js';

import { SRGBTransfer } from '../../constants.js';
import { ColorManagement } from '../../math/ColorManagement.js';
import { sRGBTransferEOTF, sRGBTransferOETF } from './ColorSpaceFunctions.js';
import { Matrix3 } from '../../math/Matrix3.js';

const WORKING_COLOR_SPACE = 'WorkingColorSpace';
const OUTPUT_COLOR_SPACE = 'OutputColorSpace';

/**
 * This node represents a color space conversion. Meaning it converts
 * a color value from a source to a target color space.
 *
 * @augments TempNode
 */
class ColorSpaceNode extends TempNode {

	static get type() {

		return 'ColorSpaceNode';

	}

	/**
	 * Constructs a new color space node.
	 *
	 * @param {Node} colorNode - Represents the color to convert.
	 * @param {string} source - The source color space.
	 * @param {string} target - The target color space.
	 */
	constructor( colorNode, source, target ) {

		super( 'vec4' );

		/**
		 * Represents the color to convert.
		 *
		 * @type {Node}
		 */
		this.colorNode = colorNode;

		/**
		 * The source color space.
		 *
		 * @type {string}
		 */
		this.source = source;

		/**
		 * The target color space.
		 *
		 * @type {string}
		 */
		this.target = target;

	}

	/**
	 * This method resolves the constants `WORKING_COLOR_SPACE` and
	 * `OUTPUT_COLOR_SPACE` based on the current configuration of the
	 * color management and renderer.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {string} colorSpace - The color space to resolve.
	 * @return {string} The resolved color space.
	 */
	resolveColorSpace( builder, colorSpace ) {

		if ( colorSpace === WORKING_COLOR_SPACE ) {

			return ColorManagement.workingColorSpace;

		} else if ( colorSpace === OUTPUT_COLOR_SPACE ) {

			return builder.context.outputColorSpace || builder.renderer.outputColorSpace;

		}

		return colorSpace;

	}

	setup( builder ) {

		const { colorNode } = this;

		const source = this.resolveColorSpace( builder, this.source );
		const target = this.resolveColorSpace( builder, this.target );

		let outputNode = colorNode;

		if ( ColorManagement.enabled === false || source === target || ! source || ! target ) {

			return outputNode;

		}

		if ( ColorManagement.getTransfer( source ) === SRGBTransfer ) {

			outputNode = vec4( sRGBTransferEOTF( outputNode.rgb ), outputNode.a );

		}

		if ( ColorManagement.getPrimaries( source ) !== ColorManagement.getPrimaries( target ) ) {

			outputNode = vec4(
				mat3( ColorManagement._getMatrix( new Matrix3(), source, target ) ).mul( outputNode.rgb ),
				outputNode.a
			);

		}

		if ( ColorManagement.getTransfer( target ) === SRGBTransfer ) {

			outputNode = vec4( sRGBTransferOETF( outputNode.rgb ), outputNode.a );

		}

		return outputNode;

	}

}

export default ColorSpaceNode;

/**
 * TSL function for converting a given color node to the current output color space.
 *
 * @tsl
 * @function
 * @param {Node} node - Represents the node to convert.
 * @returns {ColorSpaceNode}
 */
export const toOutputColorSpace = ( node ) => nodeObject( new ColorSpaceNode( nodeObject( node ), WORKING_COLOR_SPACE, OUTPUT_COLOR_SPACE ) );

/**
 * TSL function for converting a given color node to the current working color space.
 *
 * @tsl
 * @function
 * @param {Node} node - Represents the node to convert.
 * @returns {ColorSpaceNode}
 */
export const toWorkingColorSpace = ( node ) => nodeObject( new ColorSpaceNode( nodeObject( node ), OUTPUT_COLOR_SPACE, WORKING_COLOR_SPACE ) );

/**
 * TSL function for converting a given color node from the current working color space to the given color space.
 *
 * @tsl
 * @function
 * @param {Node} node - Represents the node to convert.
 * @param {string} colorSpace - The target color space.
 * @returns {ColorSpaceNode}
 */
export const workingToColorSpace = ( node, colorSpace ) => nodeObject( new ColorSpaceNode( nodeObject( node ), WORKING_COLOR_SPACE, colorSpace ) );

/**
 * TSL function for converting a given color node from the given color space to the current working color space.
 *
 * @tsl
 * @function
 * @param {Node} node - Represents the node to convert.
 * @param {string} colorSpace - The source color space.
 * @returns {ColorSpaceNode}
 */
export const colorSpaceToWorking = ( node, colorSpace ) => nodeObject( new ColorSpaceNode( nodeObject( node ), colorSpace, WORKING_COLOR_SPACE ) );

/**
 * TSL function for converting a given color node from one color space to another one.
 *
 * @tsl
 * @function
 * @param {Node} node - Represents the node to convert.
 * @param {string} sourceColorSpace - The source color space.
 * @param {string} targetColorSpace - The target color space.
 * @returns {ColorSpaceNode}
 */
export const convertColorSpace = ( node, sourceColorSpace, targetColorSpace ) => nodeObject( new ColorSpaceNode( nodeObject( node ), sourceColorSpace, targetColorSpace ) );

addMethodChaining( 'toOutputColorSpace', toOutputColorSpace );
addMethodChaining( 'toWorkingColorSpace', toWorkingColorSpace );

addMethodChaining( 'workingToColorSpace', workingToColorSpace );
addMethodChaining( 'colorSpaceToWorking', colorSpaceToWorking );
