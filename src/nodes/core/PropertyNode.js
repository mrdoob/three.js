import Node, { registerNode } from './Node.js';
import { nodeImmutable, nodeObject } from '../tsl/TSLCore.js';

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

PropertyNode.type = /*@__PURE__*/ registerNode( 'Property', PropertyNode );

export const property = ( type, name ) => nodeObject( new PropertyNode( type, name ) );
export const varyingProperty = ( type, name ) => nodeObject( new PropertyNode( type, name, true ) );

export const diffuseColor = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec4', 'DiffuseColor' );
export const emissive = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'EmissiveColor' );
export const roughness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Roughness' );
export const metalness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Metalness' );
export const clearcoat = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Clearcoat' );
export const clearcoatRoughness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'ClearcoatRoughness' );
export const sheen = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'Sheen' );
export const sheenRoughness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'SheenRoughness' );
export const iridescence = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Iridescence' );
export const iridescenceIOR = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'IridescenceIOR' );
export const iridescenceThickness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'IridescenceThickness' );
export const alphaT = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'AlphaT' );
export const anisotropy = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Anisotropy' );
export const anisotropyT = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'AnisotropyT' );
export const anisotropyB = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'AnisotropyB' );
export const specularColor = /*@__PURE__*/ nodeImmutable( PropertyNode, 'color', 'SpecularColor' );
export const specularF90 = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'SpecularF90' );
export const shininess = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Shininess' );
export const output = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec4', 'Output' );
export const dashSize = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'dashSize' );
export const gapSize = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'gapSize' );
export const pointWidth = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'pointWidth' );
export const ior = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'IOR' );
export const transmission = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Transmission' );
export const thickness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Thickness' );
export const attenuationDistance = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'AttenuationDistance' );
export const attenuationColor = /*@__PURE__*/ nodeImmutable( PropertyNode, 'color', 'AttenuationColor' );
export const dispersion = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Dispersion' );
