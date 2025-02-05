import Node from './Node.js';
import { NodeShaderStage } from './constants.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

/**
 * Class for representing shader varyings as nodes. Varyings are create from
 * existing nodes like the following:
 *
 * ```js
 * const positionLocal = positionGeometry.toVarying( 'vPositionLocal' );
 * ```
 *
 * @augments Node
 */
class VaryingNode extends Node {

	static get type() {

		return 'VaryingNode';

	}

	/**
	 * Constructs a new varying node.
	 *
	 * @param {Node} node - The node for which a varying should be created.
	 * @param {?string} name - The name of the varying in the shader.
	 */
	constructor( node, name = null ) {

		super();

		/**
		 * The node for which a varying should be created.
		 *
		 * @type {Node}
		 */
		this.node = node;

		/**
		 * The name of the varying in the shader. If no name is defined,
		 * the node system auto-generates one.
		 *
		 * @type {?string}
		 * @default null
		 */
		this.name = name;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isVaryingNode = true;

	}

	/**
	 * The method is overwritten so it always returns `true`.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {boolean} Whether this node is global or not.
	 */
	isGlobal( /*builder*/ ) {

		return true;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	getNodeType( builder ) {

		// VaryingNode is auto type

		return this.node.getNodeType( builder );

	}

	/**
	 * This method performs the setup of a varying node with the current node builder.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {NodeVarying} The node varying from the node builder.
	 */
	setupVarying( builder ) {

		const properties = builder.getNodeProperties( this );

		let varying = properties.varying;

		if ( varying === undefined ) {

			const name = this.name;
			const type = this.getNodeType( builder );

			properties.varying = varying = builder.getVaryingFromNode( this, name, type );
			properties.node = this.node;

		}

		// this property can be used to check if the varying can be optimized for a variable
		varying.needsInterpolation || ( varying.needsInterpolation = ( builder.shaderStage === 'fragment' ) );

		return varying;

	}

	setup( builder ) {

		this.setupVarying( builder );

	}

	analyze( builder ) {

		this.setupVarying( builder );

		return this.node.analyze( builder );

	}

	generate( builder ) {

		const properties = builder.getNodeProperties( this );
		const varying = this.setupVarying( builder );

		const needsReassign = builder.shaderStage === 'fragment' && properties.reassignPosition === true && builder.context.needsPositionReassign;

		if ( properties.propertyName === undefined || needsReassign ) {

			const type = this.getNodeType( builder );
			const propertyName = builder.getPropertyName( varying, NodeShaderStage.VERTEX );

			// force node run in vertex stage
			builder.flowNodeFromShaderStage( NodeShaderStage.VERTEX, this.node, type, propertyName );

			properties.propertyName = propertyName;

			if ( needsReassign ) {

				// once reassign varying in fragment stage
				properties.reassignPosition = false;

			} else if ( properties.reassignPosition === undefined && builder.context.isPositionNodeInput ) {

				properties.reassignPosition = true;

			}

		}

		return builder.getPropertyName( varying );

	}

}

export default VaryingNode;

/**
 * TSL function for creating a varying node.
 *
 * @tsl
 * @function
 * @param {Node} node - The node for which a varying should be created.
 * @param {?string} name - The name of the varying in the shader.
 * @returns {VaryingNode}
 */
export const varying = /*@__PURE__*/ nodeProxy( VaryingNode );

/**
 * Computes a node in the vertex stage.
 *
 * @tsl
 * @function
 * @param {Node} node - The node which should be executed in the vertex stage.
 * @returns {VaryingNode}
 */
export const vertexStage = ( node ) => varying( node );

addMethodChaining( 'toVarying', varying );
addMethodChaining( 'toVertexStage', vertexStage );

// Deprecated

addMethodChaining( 'varying', ( ...params ) => { // @deprecated, r173

	console.warn( 'TSL.VaryingNode: .varying() has been renamed to .toVarying().' );
	return varying( ...params );

} );

addMethodChaining( 'vertexStage', ( ...params ) => { // @deprecated, r173

	console.warn( 'TSL.VaryingNode: .vertexStage() has been renamed to .toVertexStage().' );
	return varying( ...params );

} );
