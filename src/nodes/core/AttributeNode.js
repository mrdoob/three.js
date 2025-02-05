import Node from './Node.js';
import { nodeObject, varying } from '../tsl/TSLBase.js';

/**
 * Base class for representing shader attributes as nodes.
 *
 * @augments Node
 */
class AttributeNode extends Node {

	static get type() {

		return 'AttributeNode';

	}

	/**
	 * Constructs a new attribute node.
	 *
	 * @param {string} attributeName - The name of the attribute.
	 * @param {?string} nodeType - The node type.
	 */
	constructor( attributeName, nodeType = null ) {

		super( nodeType );

		/**
		 * `AttributeNode` sets this property to `true` by default.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.global = true;

		this._attributeName = attributeName;

	}

	getHash( builder ) {

		return this.getAttributeName( builder );

	}

	getNodeType( builder ) {

		let nodeType = this.nodeType;

		if ( nodeType === null ) {

			const attributeName = this.getAttributeName( builder );

			if ( builder.hasGeometryAttribute( attributeName ) ) {

				const attribute = builder.geometry.getAttribute( attributeName );

				nodeType = builder.getTypeFromAttribute( attribute );

			} else {

				nodeType = 'float';

			}

		}

		return nodeType;

	}

	/**
	 * Sets the attribute name to the given value. The method can be
	 * overwritten in derived classes if the final name must be computed
	 * analytically.
	 *
	 * @param {string} attributeName - The name of the attribute.
	 * @return {AttributeNode} A reference to this node.
	 */
	setAttributeName( attributeName ) {

		this._attributeName = attributeName;

		return this;

	}

	/**
	 * Returns the attribute name of this node. The method can be
	 * overwritten in derived classes if the final name must be computed
	 * analytically.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The attribute name.
	 */
	getAttributeName( /*builder*/ ) {

		return this._attributeName;

	}

	generate( builder ) {

		const attributeName = this.getAttributeName( builder );
		const nodeType = this.getNodeType( builder );
		const geometryAttribute = builder.hasGeometryAttribute( attributeName );

		if ( geometryAttribute === true ) {

			const attribute = builder.geometry.getAttribute( attributeName );
			const attributeType = builder.getTypeFromAttribute( attribute );

			const nodeAttribute = builder.getAttribute( attributeName, attributeType );

			if ( builder.shaderStage === 'vertex' ) {

				return builder.format( nodeAttribute.name, attributeType, nodeType );

			} else {

				const nodeVarying = varying( this );

				return nodeVarying.build( builder, nodeType );

			}

		} else {

			console.warn( `AttributeNode: Vertex attribute "${ attributeName }" not found on geometry.` );

			return builder.generateConst( nodeType );

		}

	}

	serialize( data ) {

		super.serialize( data );

		data.global = this.global;
		data._attributeName = this._attributeName;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.global = data.global;
		this._attributeName = data._attributeName;

	}

}

export default AttributeNode;

/**
 * TSL function for creating an attribute node.
 *
 * @tsl
 * @function
 * @param {string} name - The name of the attribute.
 * @param {?string} nodeType - The node type.
 * @returns {AttributeNode}
 */
export const attribute = ( name, nodeType ) => nodeObject( new AttributeNode( name, nodeType ) );
