import { EventDispatcher, MathUtils } from 'three';
import { NodeUpdateType, defaultBuildStages } from './constants.js';
import { getNodeChildren, getCacheKey } from './NodeUtils.js';

const NodeClasses = new Map();

let _nodeId = 0;

class Node extends EventDispatcher {

	constructor( nodeType = null ) {

		super();

		this.nodeType = nodeType;

		this.updateType = NodeUpdateType.NONE;
		this.updateBeforeType = NodeUpdateType.NONE;

		this.uuid = MathUtils.generateUUID();

		this.isNode = true;

		Object.defineProperty( this, 'id', { value: _nodeId ++ } );

	}

	get type() {

		return this.constructor.type;

	}

	getSelf() {

		// Returns non-node object.

		return this.self || this;

	}

	updateReference() {

		return this;

	}

	isGlobal( /*builder*/ ) {

		return false;

	}

	* getChildren() {

		const self = this;

		for ( const { childNode } of getNodeChildren( this ) ) {

			yield childNode;

		}

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

	traverse( callback ) {

		callback( this );

		for ( const childNode of this.getChildren() ) {

			childNode.traverse( callback );

		}

	}

	getCacheKey() {

		return getCacheKey( this );

	}

	getHash( /*builder*/ ) {

		// @TODO: rework getHash in such a way that it wouldn't use this.uuid (and would be more like getCacheKey()). ideally they should be unified together
		return this.uuid;

	}

	getUpdateType() {

		return this.updateType;

	}

	getUpdateBeforeType() {

		return this.updateBeforeType;

	}

	getNodeType( builder ) {

		if ( this.nodeType !== null ) return this.nodeType;

		const nodeProperties = builder.getNodeProperties( this );

		if ( nodeProperties.outputNode ) {

			return nodeProperties.outputNode.getNodeType( builder );

		}

		return null;

	}

	getShared( builder ) {

		const nodeData = builder.getNodeData( this, 'any' );

		if ( nodeData.uniqueNode === undefined ) nodeData.uniqueNode = this;

		return nodeData.uniqueNode;

	}

	setup( builder ) {

		const nodeProperties = builder.getNodeProperties( this );

		for ( const childNode of this.getChildren() ) {

			nodeProperties[ '_node' + childNode.id ] = childNode;

		}

		// return an outputNode if exists

	}

	construct( builder ) { // @deprecated, r157

		console.warn( 'THREE.Node: construct() is deprecated. Use setup() instead.' );

		return this.setup( builder );

	}

	analyze( builder ) {

		const nodeData = builder.getNodeData( this );

		if ( nodeData.dependenciesCount === undefined ) nodeData.dependenciesCount = 0;

		if ( ++ nodeData.dependenciesCount === 1 ) {

			// node flow children

			const nodeProperties = builder.getNodeProperties( this );

			const children = new Set( Object.values( nodeProperties ) );

			if ( nodeProperties.outputNode ) {

				nodeProperties.outputNode.traverse( node => {

					if ( node !== nodeProperties.outputNode && children.has( node ) ) {

						children.delete( node ); // don't iterate over that child nodes that are already included in the output one

					}

				} );

			}

			for ( const childNode of children ) {

				if ( childNode && childNode.isNode === true ) {

					childNode.build( builder );

				}

			}

		}

	}

	generate( builder, output ) {

		const { outputNode } = builder.getNodeProperties( this );

		if ( outputNode && outputNode.isNode === true ) {

			return outputNode.build( builder, output );

		}

	}

	updateBefore( /*frame*/ ) {

		console.warn( 'Abstract function.' );

	}

	update( /*frame*/ ) {

		console.warn( 'Abstract function.' );

	}

	build( builder, output = null ) {

		const refNode = this.getShared( builder );

		if ( this !== refNode ) {

			return refNode.build( builder, output );

		}

		builder.addNode( this );

		/* Build stages expected results:
			- "setup"		-> Node
			- "analyze"		-> null
			- "generate"	-> String
		*/
		let result = null;

		const buildStage = builder.getBuildStage();

		if ( buildStage === 'setup' ) {

			const properties = builder.getNodeProperties( this );
			const cacheKey = this.getCacheKey();

			if ( properties.cacheKey !== cacheKey ) {

				builder.addStack();

				properties.cacheKey = cacheKey;
				properties.outputNode = this.setup( builder ) || null;

				if ( properties.outputNode === null && builder.stack.nodes.length > 0 ) {

					properties.outputNode = builder.stack;

				}

				result = properties.outputNode;

				builder.removeStack();

				for ( const childNode of Object.values( properties ) ) {

					if ( childNode && childNode.isNode === true ) {

						childNode.build( builder );

					}

				}

			}

		} else if ( buildStage === 'analyze' ) {

			this.analyze( builder );

		} else if ( buildStage === 'generate' ) {

			const isGenerateOnce = this.generate.length === 1;

			if ( isGenerateOnce ) {

				const type = this.getNodeType( builder );
				const nodeData = builder.getNodeData( this );

				if ( nodeData.snippet === undefined ) {

					nodeData.snippet = this.generate( builder ) || '';

				}

				result = builder.format( nodeData.snippet, type, output );

			} else {

				result = this.generate( builder, output ) || '';

			}

		}

		return result;

	}

	fullBuild( builder, output ) {

		const previousBuildStage = builder.getBuildStage();

		let result = null;

		for ( const buildStage of defaultBuildStages ) {

			builder.setBuildStage( buildStage );

			result = this.build( builder, output );

		}

		builder.setBuildStage( previousBuildStage );

		return result;

	}

	serialize( json ) {

		const nodeChildren = getNodeChildren( this );

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
					version: 4.6,
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

export default Node;

export function addNodeClass( type, nodeClass ) {

	if ( typeof nodeClass !== 'function' || ! type ) throw new Error( `Node class ${ type } is not a class` );
	if ( NodeClasses.has( type ) ) throw new Error( `Redefinition of node class ${ type }` );

	NodeClasses.set( type, nodeClass );
	nodeClass.type = type;

}

export function createNodeFromType( type ) {

	const Class = NodeClasses.get( type );

	if ( Class !== undefined ) {

		return new Class();

	}

}
