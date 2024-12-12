import TempNode from '../core/TempNode.js';
import { addMethodChaining, nodeObject, vec4 } from '../tsl/TSLCore.js';
import { rendererReference } from '../accessors/RendererReferenceNode.js';

import { NoToneMapping } from '../../constants.js';
import { hash } from '../core/NodeUtils.js';

/** @module ToneMappingNode **/

/**
 * This node represents a tone mapping operation.
 *
 * @augments TempNode
 */
class ToneMappingNode extends TempNode {

	static get type() {

		return 'ToneMappingNode';

	}

	/**
	 * Constructs a new tone mapping node.
	 *
	 * @param {Number} toneMapping - The tone mapping type.
	 * @param {Node} exposureNode - The tone mapping exposure.
	 * @param {Node} [colorNode=null] - The color node to process.
	 */
	constructor( toneMapping, exposureNode = toneMappingExposure, colorNode = null ) {

		super( 'vec3' );

		/**
		 * The tone mapping type.
		 *
		 * @type {Number}
		 */
		this.toneMapping = toneMapping;

		/**
		 * The tone mapping exposure.
		 *
		 * @type {Node}
		 * @default null
		 */
		this.exposureNode = exposureNode;

		/**
		 * Represents the color to process.
		 *
		 * @type {Node?}
		 * @default null
		 */
		this.colorNode = colorNode;

	}

	/**
	 * Overwrites the default `customCacheKey()` implementation by including the tone
	 * mapping type into the cache key.
	 *
	 * @return {Number} The hash.
	 */
	customCacheKey() {

		return hash( this.toneMapping );

	}

	setup( builder ) {

		const colorNode = this.colorNode || builder.context.color;
		const toneMapping = this.toneMapping;

		if ( toneMapping === NoToneMapping ) return colorNode;

		let outputNode = null;

		const toneMappingFn = builder.renderer.library.getToneMappingFunction( toneMapping );

		if ( toneMappingFn !== null ) {

			outputNode = vec4( toneMappingFn( colorNode.rgb, this.exposureNode ), colorNode.a );

		} else {

			console.error( 'ToneMappingNode: Unsupported Tone Mapping configuration.', toneMapping );

			outputNode = colorNode;

		}

		return outputNode;

	}

}

export default ToneMappingNode;

/**
 * TSL function for creating a tone mapping node.
 *
 * @function
 * @param {Number} mapping - The tone mapping type.
 * @param {Node<float> | Number} exposure - The tone mapping exposure.
 * @param {Node<vec3> | Color} color - The color node to process.
 * @returns {ToneMappingNode<vec3>}
 */
export const toneMapping = ( mapping, exposure, color ) => nodeObject( new ToneMappingNode( mapping, nodeObject( exposure ), nodeObject( color ) ) );

/**
 * TSL object that represents the global tone mapping exposure of the renderer.
 *
 * @type {RendererReferenceNode<vec3>}
 */
export const toneMappingExposure = /*@__PURE__*/ rendererReference( 'toneMappingExposure', 'float' );

addMethodChaining( 'toneMapping', ( color, mapping, exposure ) => toneMapping( mapping, exposure, color ) );
