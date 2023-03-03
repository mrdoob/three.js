import Node, { addNodeClass } from './Node.js';
import { nodeImmutable, nodeObject, getConstNodeType } from '../shadernode/ShaderNode.js';

class PropertyNode extends Node {

	constructor( nodeType, name = null ) {

		super( nodeType );

		this.name = name;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	isGlobal( /*builder*/ ) {

		return true;

	}

	generate( builder ) {

		const nodeVary = builder.getVarFromNode( this, this.getNodeType( builder ) );
		const name = this.name;

		if ( name !== null ) {

			nodeVary.name = name;

		}

		return builder.getPropertyName( nodeVary );

	}

}

export default PropertyNode;

export const property = ( name, nodeOrType ) => nodeObject( new PropertyNode( name, getConstNodeType( nodeOrType ) ) );

export const diffuseColor = nodeImmutable( PropertyNode, 'vec4', 'DiffuseColor' );
export const roughness = nodeImmutable( PropertyNode, 'float', 'Roughness' );
export const metalness = nodeImmutable( PropertyNode, 'float', 'Metalness' );
export const specularColor = nodeImmutable( PropertyNode, 'color', 'SpecularColor' );
export const shininess = nodeImmutable( PropertyNode, 'float', 'Shininess' );

addNodeClass( PropertyNode );
