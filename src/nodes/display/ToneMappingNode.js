import TempNode from '../core/TempNode.js';
import { addMethodChaining, nodeObject, vec4 } from '../tsl/TSLCore.js';
import { rendererReference } from '../accessors/RendererReferenceNode.js';

import { NoToneMapping } from '../../constants.js';
import { hash } from '../core/NodeUtils.js';
import { error } from '../../utils.js';

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
	 * @param {number} toneMapping - The tone mapping type.
	 * @param {Node} exposureNode - The tone mapping exposure.
	 * @param {Node} [colorNode=null] - The color node to process.
	 */
	constructor( toneMapping, exposureNode = toneMappingExposure, colorNode = null ) {

		super( 'vec3' );

		/**
		 * The tone mapping type.
		 *
		 * @private
		 * @type {number}
		 */
		this._toneMapping = toneMapping;

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
		 * @type {?Node}
		 * @default null
		 */
		this.colorNode = colorNode;

	}

	/**
	 * Overwrites the default `customCacheKey()` implementation by including the tone
	 * mapping type into the cache key.
	 *
	 * @return {number} The hash.
	 */
	customCacheKey() {

		return hash( this._toneMapping );

	}

	/**
	 * Sets the tone mapping type.
	 *
	 * @param {number} value - The tone mapping type.
	 * @return {ToneMappingNode} A reference to this node.
	 */
	setToneMapping( value ) {

		this._toneMapping = value;

		return this;

	}

	/**
	 * Gets the tone mapping type.
	 *
	 * @returns {number} The tone mapping type.
	 */
	getToneMapping() {

		return this._toneMapping;

	}

	setup( builder ) {

		const colorNode = this.colorNode || builder.context.color;
		const toneMapping = this._toneMapping;

		if ( toneMapping === NoToneMapping ) return colorNode;

		let outputNode = null;

		const toneMappingFn = builder.renderer.library.getToneMappingFunction( toneMapping );

		if ( toneMappingFn !== null ) {

			outputNode = vec4( toneMappingFn( colorNode.rgb, this.exposureNode ), colorNode.a );

		} else {

			error( 'ToneMappingNode: Unsupported Tone Mapping configuration.', toneMapping );

			outputNode = colorNode;

		}

		return outputNode;

	}

}

export default ToneMappingNode;

/**
 * TSL function for creating a tone mapping node.
 *
 * @tsl
 * @function
 * @param {number} mapping - The tone mapping type.
 * @param {Node<float> | number} exposure - The tone mapping exposure.
 * @param {Node<vec3> | Color} color - The color node to process.
 * @returns {ToneMappingNode<vec3>}
 */
export const toneMapping = ( mapping, exposure, color ) => new ToneMappingNode( mapping, nodeObject( exposure ), nodeObject( color ) );

/**
 * TSL object that represents the global tone mapping exposure of the renderer.
 *
 * @tsl
 * @type {RendererReferenceNode<vec3>}
 */
export const toneMappingExposure = /*@__PURE__*/ rendererReference( 'toneMappingExposure', 'float' );

addMethodChaining( 'toneMapping', ( color, mapping, exposure ) => toneMapping( mapping, exposure, color ) );
