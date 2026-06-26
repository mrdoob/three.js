import AttributeNode from '../core/AttributeNode.js';
import { Vector4 } from '../../math/Vector4.js';

/**
 * An attribute node for representing vertex colors.
 *
 * @augments AttributeNode
 */
class VertexColorNode extends AttributeNode {

	static get type() {

		return 'VertexColorNode';

	}

	/**
	 * Constructs a new vertex color node.
	 *
	 * @param {number} index - The attribute index.
	 */
	constructor( index ) {

		super( null, 'vec4' );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isVertexColorNode = true;

		/**
		 * The attribute index to enable more than one sets of vertex colors.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.index = index;

	}

	/**
	 * Overwrites the default implementation by honoring the attribute index.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The attribute name.
	 */
	getAttributeName( /*builder*/ ) {

		const index = this.index;

		return 'color' + ( index > 0 ? index : '' );

	}

	generate( builder ) {

		const attributeName = this.getAttributeName( builder );
		const geometryAttribute = builder.hasGeometryAttribute( attributeName );

		let result;

		if ( geometryAttribute === true ) {

			result = super.generate( builder );

		} else {

			// Vertex color fallback should be white
			result = builder.generateConst( this.nodeType, new Vector4( 1, 1, 1, 1 ) );

		}

		return result;

	}

	serialize( data ) {

		super.serialize( data );

		data.index = this.index;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.index = data.index;

	}

}

export default VertexColorNode;

/**
 * TSL function for creating a reference node.
 *
 * @tsl
 * @function
 * @param {number} [index=0] - The attribute index.
 * @returns {VertexColorNode}
 */
export const vertexColor = ( index = 0 ) => new VertexColorNode( index );
