import Node from './Node.js';
import StructTypeNode from './StructTypeNode.js';

/**
 * StructNode allows to create custom structures with multiple members.
 * This can also be used to define structures in attribute and uniform data.
 *
 * ```js
 * // Define a custom struct
 * const BoundingBox = struct( { min: 'vec3', max: 'vec3' } );
 *
 * // Create a new instance of the struct
 * const bb = BoundingBox( vec3( 0 ), vec3( 1 ) ); // style 1
 * const bb = BoundingBox( { min: vec3( 0 ), max: vec3( 1 ) } ); // style 2
 *
 * // Access the struct members
 * const min = bb.get( 'min' );
 *
 * // Assign a new value to a member
 * min.assign( vec3() );
 * ```
 * @augments Node
 */
class StructNode extends Node {

	static get type() {

		return 'StructNode';

	}

	constructor( structTypeNode, values ) {

		super( 'vec3' );

		this.structTypeNode = structTypeNode;
		this.values = values;

		this.isStructNode = true;

	}

	getNodeType( builder ) {

		return this.structTypeNode.getNodeType( builder );

	}

	getMemberType( builder, name ) {

		return this.structTypeNode.getMemberType( builder, name );

	}

	_getChildren() {

		// Ensure struct type is the last child for correct code generation order

		const children = super._getChildren();

		const structTypeProperty = children.find( child => child.childNode === this.structTypeNode );

		children.splice( children.indexOf( structTypeProperty ), 1 );
		children.push( structTypeProperty );

		return children;

	}

	generate( builder ) {

		const nodeVar = builder.getVarFromNode( this );
		const structType = nodeVar.type;
		const propertyName = builder.getPropertyName( nodeVar );

		builder.addLineFlowCode( `${ propertyName } = ${ builder.generateStruct( structType, this.structTypeNode.membersLayout, this.values ) }`, this );

		return nodeVar.name;

	}

}

export default StructNode;

/**
 * TSL function for creating a struct node.
 *
 * @tsl
 * @function
 * @param {Object} membersLayout - The layout of the struct members.
 * @param {?string} [name=null] - The name of the struct.
 * @returns {Function} The struct function.
 */
export const struct = ( membersLayout, name = null ) => {

	const structLayout = new StructTypeNode( membersLayout, name );

	const struct = ( ...params ) => {

		let values = null;

		if ( params.length > 0 ) {

			if ( params[ 0 ].isNode ) {

				values = {};

				const names = Object.keys( membersLayout );

				for ( let i = 0; i < params.length; i ++ ) {

					values[ names[ i ] ] = params[ i ];

				}

			} else {

				values = params[ 0 ];

			}

		}

		return new StructNode( structLayout, values );

	};

	struct.layout = structLayout;
	struct.isStruct = true;

	return struct;

};
