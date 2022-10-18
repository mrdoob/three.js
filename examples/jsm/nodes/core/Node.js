import { NodeUpdateType } from './constants.js';
import { getNodesKeys, getCacheKey } from './NodeUtils.js';
import { MathUtils } from 'three';

let _nodeId = 0;

class Node {

	constructor( nodeType = null ) {

		this.isNode = true;

		this.nodeType = nodeType;

		this.updateType = NodeUpdateType.None;

		this.uuid = MathUtils.generateUUID();

		Object.defineProperty( this, 'id', { value: _nodeId ++ } );

	}

	get type() {

		return this.constructor.name;

	}

	getChildren() {

		const children = [];

		for ( const property in this ) {

			const object = this[ property ];

			if ( Array.isArray( object ) === true ) {

				for ( const child of object ) {

					if ( child?.isNode === true ) {

						children.push( child );

					}

				}

			} else if ( object?.isNode === true ) {

				children.push( object );

			}

		}

		return children;

	}

	getCacheKey() {

		return getCacheKey( this );

	}

	getHash( /*builder*/ ) {

		return this.uuid;

	}

	getUpdateType( /*builder*/ ) {

		return this.updateType;

	}

	getNodeType( /*builder*/ ) {

		return this.nodeType;

	}

	getConstructHash( /*builder*/ ) {

		return this.uuid;

	}

	getReference( builder ) {

		const hash = this.getHash( builder );
		const nodeFromHash = builder.getNodeFromHash( hash );

		return nodeFromHash || this;

	}

	construct( builder ) {

		const nodeProperties = builder.getNodeProperties( this );

		for ( const childNode of this.getChildren() ) {

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

				if ( childNode?.isNode === true ) {

					childNode.build( builder );

				}

			}

		}

	}

	generate( builder, output ) {

		const { outputNode } = builder.getNodeProperties( this );

		if ( outputNode?.isNode === true ) {

			return outputNode.build( builder, output );

		}

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
		builder.addStack( this );

		/* expected return:
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

					if ( childNode?.isNode === true ) {

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

		builder.removeStack( this );

		return result;

	}

	serialize( json ) {

		const nodeKeys = getNodesKeys( this );

		if ( nodeKeys.length > 0 ) {

			const inputNodes = {};

			for ( const property of nodeKeys ) {

				inputNodes[ property ] = this[ property ].toJSON( json.meta ).uuid;

			}

			json.inputNodes = inputNodes;

		}

	}

	deserialize( json ) {

		if ( json.inputNodes !== undefined ) {

			const nodes = json.meta.nodes;

			for ( const property in json.inputNodes ) {

				const uuid = json.inputNodes[ property ];

				this[ property ] = nodes[ uuid ];

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
					version: 4.5,
					type: 'Node',
					generator: 'Node.toJSON'
				}
			};

			meta.nodes[ data.uuid ] = data;

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
