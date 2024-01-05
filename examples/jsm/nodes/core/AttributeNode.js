import TempNode from './TempNode.js';
import { addNodeClass } from './Node.js';
import { nodeObject } from '../shadernode/ShaderNode.js';

class AttributeNode extends TempNode {

	constructor( attributeName, nodeType = null ) {

		super( nodeType );

		this._attributeName = attributeName;

	}

	isGlobal() {

		return true;

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

	setAttributeName( attributeName ) {

		this._attributeName = attributeName;

		return this;

	}

	getAttributeName( /*builder*/ ) {

		return this._attributeName;

	}

	setup( builder ) {

		if ( builder.hasGeometryAttribute( this.getAttributeName( builder ) ) && builder.getShaderStage() !== 'vertex' ) {

			return this.varying();

		}

	}

	generate( builder ) {

		const attributeName = this.getAttributeName( builder );
		const nodeType = this.getNodeType( builder );
		const geometryAttribute = builder.hasGeometryAttribute( attributeName );

		if ( geometryAttribute === true ) {

			const attribute = builder.geometry.getAttribute( attributeName );
			const attributeType = builder.getTypeFromAttribute( attribute );

			const nodeAttribute = builder.getAttribute( attributeName, attributeType );

			if ( builder.getShaderStage() === 'vertex' ) {

				return builder.format( nodeAttribute.name, attributeType, nodeType );

			} else {

				return super.generate( builder );

			}

		} else {

			console.warn( `AttributeNode: Attribute "${ attributeName }" not found.` );

			return builder.getConst( nodeType );

		}

	}

}

export default AttributeNode;

export const attribute = ( name, nodeType ) => nodeObject( new AttributeNode( name, nodeType ) );

addNodeClass( 'AttributeNode', AttributeNode );
