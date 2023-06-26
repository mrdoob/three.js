import Node, { addNodeClass } from './Node.js';
import { nodeImmutable, nodeObject } from '../shadernode/ShaderNode.js';

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

export const property = ( type, name ) => nodeObject( new PropertyNode( type, name ) );

export const diffuseColor = nodeImmutable( PropertyNode, 'vec4', 'DiffuseColor' );
export const roughness = nodeImmutable( PropertyNode, 'float', 'Roughness' );
export const metalness = nodeImmutable( PropertyNode, 'float', 'Metalness' );
export const clearcoat = nodeImmutable( PropertyNode, 'float', 'Clearcoat' );
export const clearcoatRoughness = nodeImmutable( PropertyNode, 'float', 'ClearcoatRoughness' );
export const sheen = nodeImmutable( PropertyNode, 'vec3', 'Sheen' );
export const sheenRoughness = nodeImmutable( PropertyNode, 'float', 'SheenRoughness' );
export const specularColor = nodeImmutable( PropertyNode, 'color', 'SpecularColor' );
export const shininess = nodeImmutable( PropertyNode, 'float', 'Shininess' );

addNodeClass( PropertyNode );
