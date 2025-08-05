import Node from '../core/Node.js';
import { vectorComponents } from '../core/constants.js';

const _stringVectorComponents = vectorComponents.join( '' );

/**
 * This module is part of the TSL core and usually not used in app level code.
 * `SplitNode` represents a property access operation which means it is
 * used to implement any `.xyzw`, `.rgba` and `stpq` usage on node objects.
 * For example:
 * ```js
 * const redValue = color.r;
 * ```
 *
 * @augments Node
 */
class SplitNode extends Node {

	static get type() {

		return 'SplitNode';

	}

	/**
	 * Constructs a new split node.
	 *
	 * @param {Node} node - The node that should be accessed.
	 * @param {string} [components='x'] - The components that should be accessed.
	 */
	constructor( node, components = 'x' ) {

		super();

		/**
		 * The node that should be accessed.
		 *
		 * @type {Node}
		 */
		this.node = node;

		/**
		 * The components that should be accessed.
		 *
		 * @type {string}
		 */
		this.components = components;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSplitNode = true;

	}

	/**
	 * Returns the vector length which is computed based on the requested components.
	 *
	 * @return {number} The vector length.
	 */
	getVectorLength() {

		let vectorLength = this.components.length;

		for ( const c of this.components ) {

			vectorLength = Math.max( vectorComponents.indexOf( c ) + 1, vectorLength );

		}

		return vectorLength;

	}

	/**
	 * Returns the component type of the node's type.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The component type.
	 */
	getComponentType( builder ) {

		return builder.getComponentType( this.node.getNodeType( builder ) );

	}

	/**
	 * This method is overwritten since the node type is inferred from requested components.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
	getNodeType( builder ) {

		return builder.getTypeFromLength( this.components.length, this.getComponentType( builder ) );

	}

	generate( builder, output ) {

		const node = this.node;
		const nodeTypeLength = builder.getTypeLength( node.getNodeType( builder ) );

		let snippet = null;

		if ( nodeTypeLength > 1 ) {

			let type = null;

			const componentsLength = this.getVectorLength();

			if ( componentsLength >= nodeTypeLength ) {

				// needed expand the input node

				type = builder.getTypeFromLength( this.getVectorLength(), this.getComponentType( builder ) );

			}

			const nodeSnippet = node.build( builder, type );

			if ( this.components.length === nodeTypeLength && this.components === _stringVectorComponents.slice( 0, this.components.length ) ) {

				// unnecessary swizzle

				snippet = builder.format( nodeSnippet, type, output );

			} else {

				snippet = builder.format( `${nodeSnippet}.${this.components}`, this.getNodeType( builder ), output );

			}

		} else {

			// ignore .components if .node returns float/integer

			snippet = node.build( builder, output );

		}

		return snippet;

	}

	serialize( data ) {

		super.serialize( data );

		data.components = this.components;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.components = data.components;

	}

}

export default SplitNode;
