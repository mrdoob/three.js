import Node from './Node.js';
import { error, warn } from '../../utils.js';

/**
 * Calls a method of the node that the given node resolves to during the build.
 * This makes it possible to call methods of a node that is only known in the build,
 * e.g. `getMap().sample( uv() )` for a TSL function that returns a texture node.
 *
 * @augments Node
 */
class DeferredNode extends Node {

	static get type() {

		return 'DeferredNode';

	}

	/**
	 * Constructs a new deferred node.
	 *
	 * @param {Node} node - The node whose resolved node receives the call.
	 * @param {string} name - The method name.
	 * @param {Array<any>} params - The method parameters.
	 */
	constructor( node, name, params ) {

		super();

		/**
		 * The node whose resolved node receives the call.
		 *
		 * @type {Node}
		 */
		this.node = node;

		/**
		 * The method name.
		 *
		 * @type {string}
		 */
		this.name = name;

		/**
		 * The method parameters.
		 *
		 * @type {Array<any>}
		 */
		this.params = params;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isDeferredNode = true;

	}

	isCacheable( /*builder*/ ) {

		// the output node, e.g. a texture node, caches its own result

		return false;

	}

	generateNodeType( builder, output = null ) {

		return this.getOutputNode( builder ).getNodeType( builder, output );

	}

	getElementType( builder ) {

		return this.getOutputNode( builder ).getElementType( builder );

	}

	getMemberType( builder, name ) {

		return this.getOutputNode( builder ).getMemberType( builder, name );

	}

	/**
	 * Returns the result of the call. It can be requested before the setup of this node,
	 * e.g. by a varying that needs the type.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node} The result of the call.
	 */
	getOutputNode( builder ) {

		const properties = builder.getNodeProperties( this );

		if ( properties.outputNode === null ) {

			const { name, params } = this;

			// the first node of the setup output that implements the method, e.g. the texture returned by a function

			const implementsMethod = ( node ) => typeof node[ name ] === 'function' && node[ name ] !== Node.prototype[ name ];
			const callMethod = ( node ) => node[ name ]( ...params );

			properties.outputNode = builder.resolveNode( this.node, implementsMethod, callMethod );

			if ( properties.outputNode === null ) {

				error( `TSL: Method "${ name }()" is not available in the resolved node.`, this.stackTrace );

				properties.outputNode = this.node;

			}

		}

		return properties.outputNode;

	}

	setup( builder ) {

		return this.getOutputNode( builder );

	}

}

export default DeferredNode;

/**
 * Adds a method to all nodes that is deferred to the node they resolve to during the build.
 * Nodes that implement the method are not affected.
 *
 * @param {string} name - The method name.
 */
export function addDeferredMethod( name ) {

	if ( Node.prototype[ name ] !== undefined ) {

		warn( `TSL: Redefinition of method '${ name }'.` );
		return;

	}

	Node.prototype[ name ] = function ( ...params ) {

		return new DeferredNode( this, name, params );

	};

}
