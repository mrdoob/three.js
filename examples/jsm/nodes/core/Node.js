import { NodeUpdateType } from './constants.js';
import { getNodeChildren, getCacheKey } from './NodeUtils.js';
import { MathUtils } from 'three';

const NodeClasses = new Map();

let _nodeId = 0;

class Node {

	constructor( nodeType = null ) {

		this.isNode = true;

		this.nodeType = nodeType;

		this.updateType = NodeUpdateType.NONE;
		this.updateBeforeType = NodeUpdateType.NONE;

		this.uuid = MathUtils.generateUUID();

		Object.defineProperty( this, 'id', { value: _nodeId ++ } );

	}

	get type() {

		return this.constructor.name;

	}

	isGlobal( /*builder*/ ) {

		return false;

	}

	* getChildren() {

		const self = this;

		for ( const { property, index, childNode } of getNodeChildren( this ) ) {

			if ( index !== undefined ) {

				yield { childNode, replaceNode( node ) {

					self[ property ][ index ] = node;

				} };

			} else {

				yield { childNode, replaceNode( node ) {

					self[ property ] = node;

				} };

			}

		}

	}

	traverse( callback, replaceNode = null ) {

		callback( this, replaceNode );

		for ( const { childNode, replaceNode } of this.getChildren() ) {

			childNode.traverse( callback, replaceNode );

		}

	}

	getCacheKey() {

		return getCacheKey( this );

	}

	getHash( /*builder*/ ) {

		return this.uuid;

	}

	getUpdateType() {

		return this.updateType;

	}

	getUpdateBeforeType() {

		return this.updateBeforeType;

	}

	getNodeType( /*builder*/ ) {

		return this.nodeType;

	}

	getReference( builder ) {

		const hash = this.getHash( builder );
		const nodeFromHash = builder.getNodeFromHash( hash );

		return nodeFromHash || this;

	}

	construct( builder ) {

		const nodeProperties = builder.getNodeProperties( this );

		for ( const { childNode } of this.getChildren() ) {

			nodeProperties[ '_node' + childNode.id ] = childNode;

		}

		// return a outputNode if exists
		return null;

	}

	analyze( builder ) {

		const nodeData = builder.getDataFromNode( this );
		nodeData.dependenciesCount = nodeData.dependenciesCount === undefined ? 1 : nodeData.dependenciesCount + 1;

		if ( nodeData.dependenciesCount === 1 ) {

			// node flow children

			const nodeProperties = builder.getNodeProperties( this );

			for ( const childNode of Object.values( nodeProperties ) ) {

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

		const refNode = this.getReference( builder );

		if ( this !== refNode ) {

			return refNode.build( builder, output );

		}

		builder.addNode( this );
		builder.addChain( this );

		/* Build stages expected results:
			- "construct"	-> Node
			- "analyze"		-> null
			- "generate"	-> String
		*/
		let result = null;

		const buildStage = builder.getBuildStage();

		if ( buildStage === 'construct' ) {

			const properties = builder.getNodeProperties( this );

			if ( properties.initialized !== true || builder.context.tempRead === false ) {

				properties.initialized = true;
				properties.outputNode = this.construct( builder );

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
				const nodeData = builder.getDataFromNode( this );

				result = nodeData.snippet;

				if ( result === undefined /*|| builder.context.tempRead === false*/ ) {

					result = this.generate( builder ) || '';

					nodeData.snippet = result;

				}

				result = builder.format( result, type, output );

			} else {

				result = this.generate( builder, output ) || '';

			}

		}

		builder.removeChain( this );

		return result;

	}

	getSerializeChildren() {

		return getNodeChildren( this );

	}

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

export function addNodeClass( nodeClass ) {

	if ( typeof nodeClass !== 'function' || ! nodeClass.name ) throw new Error( `Node class ${ nodeClass.name } is not a class` );
	if ( NodeClasses.has( nodeClass.name ) ) throw new Error( `Redefinition of node class ${ nodeClass.name }` );

	NodeClasses.set( nodeClass.name, nodeClass );

}

export function createNodeFromType( type ) {

	const Class = NodeClasses.get( type );

	if ( Class !== undefined ) {

		return new Class();

	}

}
