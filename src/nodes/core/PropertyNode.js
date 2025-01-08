import Node from './Node.js';
import { nodeImmutable, nodeObject } from '../tsl/TSLCore.js';

/** @module PropertyNode **/

/**
 * This class represents a shader property. It can be used
 * to explicitly define a property and assign a value to it.
 *
 * ```js
 * const threshold = property( 'float', 'threshold' ).assign( THRESHOLD );
 *```
 * `PropertyNode` is used by the engine to predefined common material properties
 * for TSL code.
 *
 * @augments Node
 */
class PropertyNode extends Node {

	static get type() {

		return 'PropertyNode';

	}

	/**
	 * Constructs a new property node.
	 *
	 * @param {String} nodeType - The type of the node.
	 * @param {String?} [name=null] - The name of the property in the shader.
	 * @param {Boolean} [varying=false] - Whether this property is a varying or not.
	 */
	constructor( nodeType, name = null, varying = false ) {

		super( nodeType );

		/**
		 * The name of the property in the shader. If no name is defined,
		 * the node system auto-generates one.
		 *
		 * @type {String?}
		 * @default null
		 */
		this.name = name;

		/**
		 * Whether this property is a varying or not.
		 *
		 * @type {Boolean}
		 * @default false
		 */
		this.varying = varying;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isPropertyNode = true;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	/**
	 * The method is overwritten so it always returns `true`.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Boolean} Whether this node is global or not.
	 */
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

/**
 * TSL function for creating a property node.
 *
 * @function
 * @param {String} type - The type of the node.
 * @param {String?} [name=null] - The name of the property in the shader.
 * @returns {PropertyNode}
 */
export const property = ( type, name ) => nodeObject( new PropertyNode( type, name ) );

/**
 * TSL function for creating a varying property node.
 *
 * @function
 * @param {String} type - The type of the node.
 * @param {String?} [name=null] - The name of the varying in the shader.
 * @returns {PropertyNode}
 */
export const varyingProperty = ( type, name ) => nodeObject( new PropertyNode( type, name, true ) );

/**
 * TSL object that represents the shader variable `DiffuseColor`.
 *
 * @type {PropertyNode<vec4>}
 */
export const diffuseColor = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec4', 'DiffuseColor' );

/**
 * TSL object that represents the shader variable `EmissiveColor`.
 *
 * @type {PropertyNode<vec3>}
 */
export const emissive = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'EmissiveColor' );

/**
 * TSL object that represents the shader variable `Roughness`.
 *
 * @type {PropertyNode<float>}
 */
export const roughness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Roughness' );

/**
 * TSL object that represents the shader variable `Metalness`.
 *
 * @type {PropertyNode<float>}
 */
export const metalness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Metalness' );

/**
 * TSL object that represents the shader variable `Clearcoat`.
 *
 * @type {PropertyNode<float>}
 */
export const clearcoat = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Clearcoat' );

/**
 * TSL object that represents the shader variable `ClearcoatRoughness`.
 *
 * @type {PropertyNode<float>}
 */
export const clearcoatRoughness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'ClearcoatRoughness' );

/**
 * TSL object that represents the shader variable `Sheen`.
 *
 * @type {PropertyNode<vec3>}
 */
export const sheen = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'Sheen' );

/**
 * TSL object that represents the shader variable `SheenRoughness`.
 *
 * @type {PropertyNode<float>}
 */
export const sheenRoughness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'SheenRoughness' );

/**
 * TSL object that represents the shader variable `Iridescence`.
 *
 * @type {PropertyNode<float>}
 */
export const iridescence = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Iridescence' );

/**
 * TSL object that represents the shader variable `IridescenceIOR`.
 *
 * @type {PropertyNode<float>}
 */
export const iridescenceIOR = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'IridescenceIOR' );

/**
 * TSL object that represents the shader variable `IridescenceThickness`.
 *
 * @type {PropertyNode<float>}
 */
export const iridescenceThickness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'IridescenceThickness' );

/**
 * TSL object that represents the shader variable `AlphaT`.
 *
 * @type {PropertyNode<float>}
 */
export const alphaT = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'AlphaT' );

/**
 * TSL object that represents the shader variable `Anisotropy`.
 *
 * @type {PropertyNode<float>}
 */
export const anisotropy = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Anisotropy' );

/**
 * TSL object that represents the shader variable `AnisotropyT`.
 *
 * @type {PropertyNode<vec3>}
 */
export const anisotropyT = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'AnisotropyT' );

/**
 * TSL object that represents the shader variable `AnisotropyB`.
 *
 * @type {PropertyNode<vec3>}
 */
export const anisotropyB = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec3', 'AnisotropyB' );

/**
 * TSL object that represents the shader variable `SpecularColor`.
 *
 * @type {PropertyNode<color>}
 */
export const specularColor = /*@__PURE__*/ nodeImmutable( PropertyNode, 'color', 'SpecularColor' );

/**
 * TSL object that represents the shader variable `SpecularF90`.
 *
 * @type {PropertyNode<float>}
 */
export const specularF90 = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'SpecularF90' );

/**
 * TSL object that represents the shader variable `Shininess`.
 *
 * @type {PropertyNode<float>}
 */
export const shininess = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Shininess' );

/**
 * TSL object that represents the shader variable `Output`.
 *
 * @type {PropertyNode<vec4>}
 */
export const output = /*@__PURE__*/ nodeImmutable( PropertyNode, 'vec4', 'Output' );

/**
 * TSL object that represents the shader variable `dashSize`.
 *
 * @type {PropertyNode<float>}
 */
export const dashSize = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'dashSize' );

/**
 * TSL object that represents the shader variable `gapSize`.
 *
 * @type {PropertyNode<float>}
 */
export const gapSize = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'gapSize' );

/**
 * TSL object that represents the shader variable `pointWidth`.
 *
 * @type {PropertyNode<float>}
 */
export const pointWidth = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'pointWidth' );

/**
 * TSL object that represents the shader variable `IOR`.
 *
 * @type {PropertyNode<float>}
 */
export const ior = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'IOR' );

/**
 * TSL object that represents the shader variable `Transmission`.
 *
 * @type {PropertyNode<float>}
 */
export const transmission = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Transmission' );

/**
 * TSL object that represents the shader variable `Thickness`.
 *
 * @type {PropertyNode<float>}
 */
export const thickness = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Thickness' );

/**
 * TSL object that represents the shader variable `AttenuationDistance`.
 *
 * @type {PropertyNode<float>}
 */
export const attenuationDistance = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'AttenuationDistance' );

/**
 * TSL object that represents the shader variable `AttenuationColor`.
 *
 * @type {PropertyNode<color>}
 */
export const attenuationColor = /*@__PURE__*/ nodeImmutable( PropertyNode, 'color', 'AttenuationColor' );

/**
 * TSL object that represents the shader variable `Dispersion`.
 *
 * @type {PropertyNode<float>}
 */
export const dispersion = /*@__PURE__*/ nodeImmutable( PropertyNode, 'float', 'Dispersion' );
