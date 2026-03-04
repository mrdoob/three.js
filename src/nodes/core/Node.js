import { NodeUpdateType } from './constants.js';
import { hash, hashArray, hashString } from './NodeUtils.js';

import { EventDispatcher } from '../../core/EventDispatcher.js';
import { MathUtils } from '../../math/MathUtils.js';
import { warn, error } from '../../utils.js';

import StackTrace from './StackTrace.js';

const _parentBuildStage = {
	analyze: 'setup',
	generate: 'analyze'
};

let _nodeId = 0;

/**
 * Base class for all nodes.
 *
 * @augments EventDispatcher
 */
class Node extends EventDispatcher {

	static get type() {

		return 'Node';

	}

	/**
	 * Constructs a new node.
	 *
	 * @param {?string} nodeType - The node type.
	 */
	constructor( nodeType = null ) {

		super();

		/**
		 * The node type. This represents the result type of the node (e.g. `float` or `vec3`).
		 *
		 * @type {?string}
		 * @default null
		 */
		this.nodeType = nodeType;

		/**
		 * The update type of the node's {@link Node#update} method. Possible values are listed in {@link NodeUpdateType}.
		 *
		 * @type {string}
		 * @default 'none'
		 */
		this.updateType = NodeUpdateType.NONE;

		/**
		 * The update type of the node's {@link Node#updateBefore} method. Possible values are listed in {@link NodeUpdateType}.
		 *
		 * @type {string}
		 * @default 'none'
		 */
		this.updateBeforeType = NodeUpdateType.NONE;

		/**
		 * The update type of the node's {@link Node#updateAfter} method. Possible values are listed in {@link NodeUpdateType}.
		 *
		 * @type {string}
		 * @default 'none'
		 */
		this.updateAfterType = NodeUpdateType.NONE;

		/**
		 * The UUID of the node.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.uuid = MathUtils.generateUUID();

		/**
		 * The version of the node. The version automatically is increased when {@link Node#needsUpdate} is set to `true`.
		 *
		 * @type {number}
		 * @readonly
		 * @default 0
		 */
		this.version = 0;

		/**
		 * The name of the node.
		 *
		 * @type {string}
		 * @default ''
		 */
		this.name = '';

		/**
		 * Whether this node is global or not. This property is relevant for the internal
		 * node caching system. All nodes which should be declared just once should
		 * set this flag to `true` (a typical example is {@link AttributeNode}).
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.global = false;

		/**
		 * Create a list of parents for this node during the build process.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.parents = false;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isNode = true;

		// private

		this._beforeNodes = null;

		/**
		 * The cache key of this node.
		 *
		 * @private
		 * @type {?number}
		 * @default null
		 */
		this._cacheKey = null;

		/**
		 * The cache key's version.
		 *
		 * @private
		 * @type {number}
		 * @default 0
		 */
		this._cacheKeyVersion = 0;

		Object.defineProperty( this, 'id', { value: _nodeId ++ } );

		/**
		 * The stack trace of the node for debugging purposes.
		 *
		 * @type {?string}
		 * @default null
		 */
		this.stackTrace = null;

		if ( Node.captureStackTrace === true ) {

			this.stackTrace = new StackTrace();

		}

	}

	/**
	 * Set this property to `true` when the node should be regenerated.
	 *
	 * @type {boolean}
	 * @default false
	 * @param {boolean} value
	 */
	set needsUpdate( value ) {

		if ( value === true ) {

			this.version ++;

		}

	}

	/**
	 * The type of the class. The value is usually the constructor name.
	 *
	 * @type {string}
 	 * @readonly
	 */
	get type() {

		return this.constructor.type;

	}

	/**
	 * Convenient method for defining {@link Node#update}.
	 *
	 * @param {Function} callback - The update method.
	 * @param {string} updateType - The update type.
	 * @return {Node} A reference to this node.
	 */
	onUpdate( callback, updateType ) {

		this.updateType = updateType;
		this.update = callback.bind( this );

		return this;

	}

	/**
	 * Convenient method for defining {@link Node#update}. Similar to {@link Node#onUpdate}, but
	 * this method automatically sets the update type to `FRAME`.
	 *
	 * @param {Function} callback - The update method.
	 * @return {Node} A reference to this node.
	 */
	onFrameUpdate( callback ) {

		return this.onUpdate( callback, NodeUpdateType.FRAME );

	}

	/**
	 * Convenient method for defining {@link Node#update}. Similar to {@link Node#onUpdate}, but
	 * this method automatically sets the update type to `RENDER`.
	 *
	 * @param {Function} callback - The update method.
	 * @return {Node} A reference to this node.
	 */
	onRenderUpdate( callback ) {

		return this.onUpdate( callback, NodeUpdateType.RENDER );

	}

	/**
	 * Convenient method for defining {@link Node#update}. Similar to {@link Node#onUpdate}, but
	 * this method automatically sets the update type to `OBJECT`.
	 *
	 * @param {Function} callback - The update method.
	 * @return {Node} A reference to this node.
	 */
	onObjectUpdate( callback ) {

		return this.onUpdate( callback, NodeUpdateType.OBJECT );

	}

	/**
	 * Convenient method for defining {@link Node#updateReference}.
	 *
	 * @param {Function} callback - The update method.
	 * @return {Node} A reference to this node.
	 */
	onReference( callback ) {

		this.updateReference = callback.bind( this );

		return this;

	}

	/**
	 * Nodes might refer to other objects like materials. This method allows to dynamically update the reference
	 * to such objects based on a given state (e.g. the current node frame or builder).
	 *
	 * @param {any} state - This method can be invocated in different contexts so `state` can refer to any object type.
	 * @return {any} The updated reference.
	 */
	updateReference( /*state*/ ) {

		return this;

	}

	/**
	 * By default this method returns the value of the {@link Node#global} flag. This method
	 * can be overwritten in derived classes if an analytical way is required to determine the
	 * global cache referring to the current shader-stage.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {boolean} Whether this node is global or not.
	 */
	isGlobal( /*builder*/ ) {

		return this.global;

	}

	/**
	 * Generator function that can be used to iterate over the child nodes.
	 *
	 * @generator
	 * @yields {Node} A child node.
	 */
	* getChildren() {

		for ( const { childNode } of this._getChildren() ) {

			yield childNode;

		}

	}

	/**
	 * Calling this method dispatches the `dispose` event. This event can be used
	 * to register event listeners for clean up tasks.
	 */
	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

	/**
	 * Callback for {@link Node#traverse}.
	 *
	 * @callback traverseCallback
	 * @param {Node} node - The current node.
	 */

	/**
	 * Can be used to traverse through the node's hierarchy.
	 *
	 * @param {traverseCallback} callback - A callback that is executed per node.
	 */
	traverse( callback ) {

		callback( this );

		for ( const childNode of this.getChildren() ) {

			childNode.traverse( callback );

		}

	}

	/**
	 * Returns the child nodes of this node.
	 *
	 * @private
	 * @param {Set<Node>} [ignores=new Set()] - A set of nodes to ignore during the search to avoid circular references.
	 * @returns {Array<Object>} An array of objects describing the child nodes.
	 */
	_getChildren( ignores = new Set() ) {

		const children = [];

		// avoid circular references
		ignores.add( this );

		for ( const property of Object.getOwnPropertyNames( this ) ) {

			const object = this[ property ];

			// Ignore private properties and ignored nodes.
			if ( property.startsWith( '_' ) === true || ignores.has( object ) ) continue;

			if ( Array.isArray( object ) === true ) {

				for ( let i = 0; i < object.length; i ++ ) {

					const child = object[ i ];

					if ( child && child.isNode === true ) {

						children.push( { property, index: i, childNode: child } );

					}

				}

			} else if ( object && object.isNode === true ) {

				children.push( { property, childNode: object } );

			} else if ( object && Object.getPrototypeOf( object ) === Object.prototype ) {

				for ( const subProperty in object ) {

					// Ignore private sub-properties.
					if ( subProperty.startsWith( '_' ) === true ) continue;

					const child = object[ subProperty ];

					if ( child && child.isNode === true ) {

						children.push( { property, index: subProperty, childNode: child } );

					}

				}

			}

		}

		//

		return children;

	}

	/**
	 * Returns the cache key for this node.
	 *
	 * @param {boolean} [force=false] - When set to `true`, a recomputation of the cache key is forced.
	 * @param {Set<Node>} [ignores=null] - A set of nodes to ignore during the computation of the cache key.
	 * @return {number} The cache key of the node.
	 */
	getCacheKey( force = false, ignores = null ) {

		force = force || this.version !== this._cacheKeyVersion;

		if ( force === true || this._cacheKey === null ) {

			if ( ignores === null ) ignores = new Set();

			//

			const values = [];

			for ( const { property, childNode } of this._getChildren( ignores ) ) {

				values.push( hashString( property.slice( 0, - 4 ) ), childNode.getCacheKey( force, ignores ) );

			}

			//

			this._cacheKey = hash( hashArray( values ), this.customCacheKey() );
			this._cacheKeyVersion = this.version;

		}

		return this._cacheKey;

	}

	/**
	 * Generate a custom cache key for this node.
	 *
	 * @return {number} The cache key of the node.
	 */
	customCacheKey() {

		return this.id;

	}

	/**
	 * Returns the references to this node which is by default `this`.
	 *
	 * @return {Node} A reference to this node.
	 */
	getScope() {

		return this;

	}

	/**
	 * Returns the hash of the node which is used to identify the node. By default it's
	 * the {@link Node#uuid} however derived node classes might have to overwrite this method
	 * depending on their implementation.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The hash.
	 */
	getHash( /*builder*/ ) {

		return this.uuid;

	}

	/**
	 * Returns the update type of {@link Node#update}.
	 *
	 * @return {NodeUpdateType} The update type.
	 */
	getUpdateType() {

		return this.updateType;

	}

	/**
	 * Returns the update type of {@link Node#updateBefore}.
	 *
	 * @return {NodeUpdateType} The update type.
	 */
	getUpdateBeforeType() {

		return this.updateBeforeType;

	}

	/**
	 * Returns the update type of {@link Node#updateAfter}.
	 *
	 * @return {NodeUpdateType} The update type.
	 */
	getUpdateAfterType() {

		return this.updateAfterType;

	}

	/**
	 * Certain types are composed of multiple elements. For example a `vec3`
	 * is composed of three `float` values. This method returns the type of
	 * these elements.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The type of the node.
	 */
	getElementType( builder ) {

		const type = this.getNodeType( builder );
		const elementType = builder.getElementType( type );

		return elementType;

	}

	/**
	 * Returns the node member type for the given name.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {string} name - The name of the member.
	 * @return {string} The type of the node.
	 */
	getMemberType( /*builder, name*/ ) {

		return 'void';

	}

	/**
	 * Returns the node's type.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The type of the node.
	 */
	getNodeType( builder ) {

		const nodeProperties = builder.getNodeProperties( this );

		if ( nodeProperties.outputNode ) {

			return nodeProperties.outputNode.getNodeType( builder );

		}

		return this.nodeType;

	}

	/**
	 * This method is used during the build process of a node and ensures
	 * equal nodes are not built multiple times but just once. For example if
	 * `attribute( 'uv' )` is used multiple times by the user, the build
	 * process makes sure to process just the first node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node} The shared node if possible. Otherwise `this` is returned.
	 */
	getShared( builder ) {

		const hash = this.getHash( builder );
		const nodeFromHash = builder.getNodeFromHash( hash );

		return nodeFromHash || this;

	}

	/**
	 * Returns the number of elements in the node array.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {?number} The number of elements in the node array.
	 */
	getArrayCount( /*builder*/ ) {

		return null;

	}

	/**
	 * Represents the setup stage which is the first step of the build process, see {@link Node#build} method.
	 * This method is often overwritten in derived modules to prepare the node which is used as a node's output/result.
	 * If an output node is prepared, then it must be returned in the `return` statement of the derived module's setup function.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {?Node} The output node.
	 */
	setup( builder ) {

		const nodeProperties = builder.getNodeProperties( this );

		let index = 0;

		for ( const childNode of this.getChildren() ) {

			nodeProperties[ 'node' + index ++ ] = childNode;

		}

		// return a outputNode if exists or null

		return nodeProperties.outputNode || null;

	}

	/**
	 * Represents the analyze stage which is the second step of the build process, see {@link Node#build} method.
	 * This stage analyzes the node hierarchy and ensures descendent nodes are built.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {?Node} output - The target output node.
	 */
	analyze( builder, output = null ) {

		const usageCount = builder.increaseUsage( this );

		if ( this.parents === true ) {

			const nodeData = builder.getDataFromNode( this, 'any' );
			nodeData.stages = nodeData.stages || {};
			nodeData.stages[ builder.shaderStage ] = nodeData.stages[ builder.shaderStage ] || [];
			nodeData.stages[ builder.shaderStage ].push( output );

		}

		if ( usageCount === 1 ) {

			// node flow children

			const nodeProperties = builder.getNodeProperties( this );

			for ( const childNode of Object.values( nodeProperties ) ) {

				if ( childNode && childNode.isNode === true ) {

					childNode.build( builder, this );

				}

			}

		}

	}

	/**
	 * Represents the generate stage which is the third step of the build process, see {@link Node#build} method.
	 * This state builds the output node and returns the resulting shader string.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {?string} [output] - Can be used to define the output type.
	 * @return {?string} The generated shader string.
	 */
	generate( builder, output ) {

		const { outputNode } = builder.getNodeProperties( this );

		if ( outputNode && outputNode.isNode === true ) {

			return outputNode.build( builder, output );

		}

	}

	/**
	 * The method can be implemented to update the node's internal state before it is used to render an object.
	 * The {@link Node#updateBeforeType} property defines how often the update is executed.
	 *
	 * @abstract
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 * @return {?boolean} An optional bool that indicates whether the implementation actually performed an update or not (e.g. due to caching).
	 */
	updateBefore( /*frame*/ ) {

		warn( 'Abstract function.' );

	}

	/**
	 * The method can be implemented to update the node's internal state after it was used to render an object.
	 * The {@link Node#updateAfterType} property defines how often the update is executed.
	 *
	 * @abstract
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 * @return {?boolean} An optional bool that indicates whether the implementation actually performed an update or not (e.g. due to caching).
	 */
	updateAfter( /*frame*/ ) {

		warn( 'Abstract function.' );

	}

	/**
	 * The method can be implemented to update the node's internal state when it is used to render an object.
	 * The {@link Node#updateType} property defines how often the update is executed.
	 *
	 * @abstract
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 * @return {?boolean} An optional bool that indicates whether the implementation actually performed an update or not (e.g. due to caching).
	 */
	update( /*frame*/ ) {

		warn( 'Abstract function.' );

	}

	before( node ) {

		if ( this._beforeNodes === null ) this._beforeNodes = [];

		this._beforeNodes.push( node );

		return this;

	}

	/**
	 * This method performs the build of a node. The behavior and return value depend on the current build stage:
	 * - **setup**: Prepares the node and its children for the build process. This process can also create new nodes. Returns the node itself or a variant.
	 * - **analyze**: Analyzes the node hierarchy for optimizations in the code generation stage. Returns `null`.
	 * - **generate**: Generates the shader code for the node. Returns the generated shader string.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {?(string|Node)} [output=null] - Can be used to define the output type.
	 * @return {?(Node|string)} The result of the build process, depending on the build stage.
	 */
	build( builder, output = null ) {

		const refNode = this.getShared( builder );

		if ( this !== refNode ) {

			return refNode.build( builder, output );

		}

		//

		if ( this._beforeNodes !== null ) {

			const currentBeforeNodes = this._beforeNodes;

			this._beforeNodes = null;

			for ( const beforeNode of currentBeforeNodes ) {

				beforeNode.build( builder, output );

			}

			this._beforeNodes = currentBeforeNodes;

		}

		//

		const nodeData = builder.getDataFromNode( this );
		nodeData.buildStages = nodeData.buildStages || {};
		nodeData.buildStages[ builder.buildStage ] = true;

		const parentBuildStage = _parentBuildStage[ builder.buildStage ];

		if ( parentBuildStage && nodeData.buildStages[ parentBuildStage ] !== true ) {

			// force parent build stage (setup or analyze)

			const previousBuildStage = builder.getBuildStage();

			builder.setBuildStage( parentBuildStage );

			this.build( builder );

			builder.setBuildStage( previousBuildStage );

		}

		//

		builder.addChain( this );

		/* Build stages expected results:
			- "setup"		-> Node
			- "analyze"		-> null
			- "generate"	-> String
		*/
		let result = null;

		const buildStage = builder.getBuildStage();

		if ( buildStage === 'setup' ) {

			builder.addNode( this );

			this.updateReference( builder );

			const properties = builder.getNodeProperties( this );

			if ( properties.initialized !== true ) {

				//const stackNodesBeforeSetup = builder.stack.nodes.length;

				properties.initialized = true;
				properties.outputNode = this.setup( builder ) || properties.outputNode || null;

				/*if ( isNodeOutput && builder.stack.nodes.length !== stackNodesBeforeSetup ) {

					// !! no outputNode !!
					//outputNode = builder.stack;

				}*/

				for ( const childNode of Object.values( properties ) ) {

					if ( childNode && childNode.isNode === true ) {

						if ( childNode.parents === true ) {

							const childProperties = builder.getNodeProperties( childNode );
							childProperties.parents = childProperties.parents || [];
							childProperties.parents.push( this );

						}

						childNode.build( builder );

					}

				}

				builder.addSequentialNode( this );

			}

			result = properties.outputNode;

		} else if ( buildStage === 'analyze' ) {

			this.analyze( builder, output );

		} else if ( buildStage === 'generate' ) {

			// If generate has just one argument, it means the output type is not required.
			// This means that the node does not handle output conversions internally,
			// so the value is stored in a cache and the builder handles the conversion
			// for all requested output types.

			const isGenerateOnce = this.generate.length < 2;

			if ( isGenerateOnce ) {

				const type = this.getNodeType( builder );
				const nodeData = builder.getDataFromNode( this );

				result = nodeData.snippet;

				if ( result === undefined ) {

					if ( nodeData.generated === undefined ) {

						nodeData.generated = true;

						result = this.generate( builder ) || '';

						nodeData.snippet = result;

					} else {

						warn( 'Node: Recursion detected.', this );

						result = '/* Recursion detected. */';

					}

				} else if ( nodeData.flowCodes !== undefined && builder.context.nodeBlock !== undefined ) {

					builder.addFlowCodeHierarchy( this, builder.context.nodeBlock );

				}

				result = builder.format( result, type, output );

			} else {

				result = this.generate( builder, output ) || '';

			}

			if ( result === '' && output !== null && output !== 'void' && output !== 'OutputType' ) {

				// if no snippet is generated, return a default value

				error( `TSL: Invalid generated code, expected a "${ output }".` );

				result = builder.generateConst( output );

			}

		}

		builder.removeChain( this );

		return result;

	}

	/**
	 * Returns the child nodes as a JSON object.
	 *
	 * @return {Generator<Object>} An iterable list of serialized child objects as JSON.
	 */
	getSerializeChildren() {

		return this._getChildren();

	}

	/**
	 * Serializes the node to JSON.
	 *
	 * @param {Object} json - The output JSON object.
	 */
	serialize( json ) {

		const nodeChildren = this.getSerializeChildren();

		const inputNodes = {};

		for ( const { property, index, childNode } of nodeChildren ) {

			if ( index !== undefined ) {

				if ( inputNodes[ property ] === undefined ) {

					inputNodes[ property ] = Number.isInteger( index ) ? [] : {};

				}

				inputNodes[ property ][ index ] = childNode.toJSON( json.meta ).uuid;

			} else {

				inputNodes[ property ] = childNode.toJSON( json.meta ).uuid;

			}

		}

		if ( Object.keys( inputNodes ).length > 0 ) {

			json.inputNodes = inputNodes;

		}

	}

	/**
	 * Deserializes the node from the given JSON.
	 *
	 * @param {Object} json - The JSON object.
	 */
	deserialize( json ) {

		if ( json.inputNodes !== undefined ) {

			const nodes = json.meta.nodes;

			for ( const property in json.inputNodes ) {

				if ( Array.isArray( json.inputNodes[ property ] ) ) {

					const inputArray = [];

					for ( const uuid of json.inputNodes[ property ] ) {

						inputArray.push( nodes[ uuid ] );

					}

					this[ property ] = inputArray;

				} else if ( typeof json.inputNodes[ property ] === 'object' ) {

					const inputObject = {};

					for ( const subProperty in json.inputNodes[ property ] ) {

						const uuid = json.inputNodes[ property ][ subProperty ];

						inputObject[ subProperty ] = nodes[ uuid ];

					}

					this[ property ] = inputObject;

				} else {

					const uuid = json.inputNodes[ property ];

					this[ property ] = nodes[ uuid ];

				}

			}

		}

	}

	/**
	 * Serializes the node into the three.js JSON Object/Scene format.
	 *
	 * @param {?Object} meta - An optional JSON object that already holds serialized data from other scene objects.
	 * @return {Object} The serialized node.
	 */
	toJSON( meta ) {

		const { uuid, type } = this;
		const isRoot = ( meta === undefined || typeof meta === 'string' );

		if ( isRoot ) {

			meta = {
				textures: {},
				images: {},
				nodes: {}
			};

		}

		// serialize

		let data = meta.nodes[ uuid ];

		if ( data === undefined ) {

			data = {
				uuid,
				type,
				meta,
				metadata: {
					version: 4.7,
					type: 'Node',
					generator: 'Node.toJSON'
				}
			};

			if ( isRoot !== true ) meta.nodes[ data.uuid ] = data;

			this.serialize( data );

			delete data.meta;

		}

		// TODO: Copied from Object3D.toJSON

		function extractFromCache( cache ) {

			const values = [];

			for ( const key in cache ) {

				const data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}

			return values;

		}

		if ( isRoot ) {

			const textures = extractFromCache( meta.textures );
			const images = extractFromCache( meta.images );
			const nodes = extractFromCache( meta.nodes );

			if ( textures.length > 0 ) data.textures = textures;
			if ( images.length > 0 ) data.images = images;
			if ( nodes.length > 0 ) data.nodes = nodes;

		}

		return data;

	}

}

/**
 * Enables or disables the automatic capturing of stack traces for nodes.
 *
 * @type {boolean}
 * @default false
 */
Node.captureStackTrace = false;

export default Node;
