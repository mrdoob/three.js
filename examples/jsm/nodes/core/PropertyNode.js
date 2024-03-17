import Node, { addNodeClass } from './Node.js';
import { nodeImmutable, nodeObject } from '../shadernode/ShaderNode.js';

class PropertyNode extends Node {

	constructor( nodeType, name = null, varying = false ) {

		super( nodeType );

		this.name = name;
		this.varying = varying;

		this.isPropertyNode = true;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	isGlobal( /*builder*/ ) {

		return true;

	}

	generate( builder ) {

		let nodeVar;

		if ( this.varying === true ) {

			nodeVar = builder.getVaryingFromNode( this, this.name );
			nodeVar.needsInterpolation = true;

		} else {

			nodeVar = builder.getVarFromNode( this, this.name );

		}

		return builder.getPropertyName( nodeVar );

	}

}

export default PropertyNode;

export const property = ( type, name ) => nodeObject( new PropertyNode( type, name ) );
export const varyingProperty = ( type, name ) => nodeObject( new PropertyNode( type, name, true ) );

export const diffuseColor = nodeImmutable( PropertyNode, 'vec4', 'DiffuseColor' );
export const roughness = nodeImmutable( PropertyNode, 'float', 'Roughness' );
export const metalness = nodeImmutable( PropertyNode, 'float', 'Metalness' );
export const clearcoat = nodeImmutable( PropertyNode, 'float', 'Clearcoat' );
export const clearcoatRoughness = nodeImmutable( PropertyNode, 'float', 'ClearcoatRoughness' );
export const sheen = nodeImmutable( PropertyNode, 'vec3', 'Sheen' );
export const sheenRoughness = nodeImmutable( PropertyNode, 'float', 'SheenRoughness' );
export const iridescence = nodeImmutable( PropertyNode, 'float', 'Iridescence' );
export const iridescenceIOR = nodeImmutable( PropertyNode, 'float', 'IridescenceIOR' );
export const iridescenceThickness = nodeImmutable( PropertyNode, 'float', 'IridescenceThickness' );
export const specularColor = nodeImmutable( PropertyNode, 'color', 'SpecularColor' );
export const shininess = nodeImmutable( PropertyNode, 'float', 'Shininess' );
export const output = nodeImmutable( PropertyNode, 'vec4', 'Output' );
export const dashSize = nodeImmutable( PropertyNode, 'float', 'dashSize' );
export const gapSize = nodeImmutable( PropertyNode, 'float', 'gapSize' );
export const pointWidth = nodeImmutable( PropertyNode, 'float', 'pointWidth' );

addNodeClass( 'PropertyNode', PropertyNode );
