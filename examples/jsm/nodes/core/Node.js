import { NodeUpdateType } from './constants.js';
import { getNodesKeys } from './NodeUtils.js';
import { MathUtils } from 'three';

let _nodeId = 0;

class Node {

	constructor( nodeType = null ) {

		this.nodeType = nodeType;

		this.updateType = NodeUpdateType.None;

		this.uuid = MathUtils.generateUUID();

		Object.defineProperty( this, 'id', { value: _nodeId ++ } );

	}

	get type() {

		return this.constructor.name;

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

	update( /*frame*/ ) {

		console.warn( 'Abstract function.' );

	}

	generate( /*builder, output*/ ) {

		console.warn( 'Abstract function.' );

	}

	analyze( builder ) {

		const hash = this.getHash( builder );
		const sharedNode = builder.getNodeFromHash( hash );

		if ( sharedNode !== undefined && this !== sharedNode ) {

			return sharedNode.analyze( builder );

		}

		const nodeData = builder.getDataFromNode( this );
		nodeData.dependenciesCount = nodeData.dependenciesCount === undefined ? 1 : nodeData.dependenciesCount + 1;

		const nodeKeys = getNodesKeys( this );

		for ( const property of nodeKeys ) {

			this[ property ].analyze( builder );

		}

	}

	build( builder, output = null ) {

		const hash = this.getHash( builder );
		const sharedNode = builder.getNodeFromHash( hash );

		if ( sharedNode !== undefined && this !== sharedNode ) {

			return sharedNode.build( builder, output );

		}

		builder.addNode( this );
		builder.addStack( this );

		const nodeData = builder.getDataFromNode( this );
		const isGenerateOnce = this.generate.length === 1;

		let snippet = null;

		if ( isGenerateOnce ) {

			const type = this.getNodeType( builder );

			snippet = nodeData.snippet;

			if ( snippet === undefined ) {

				snippet = this.generate( builder ) || '';

				nodeData.snippet = snippet;

			}

			snippet = builder.format( snippet, type, output );

		} else {

			snippet = this.generate( builder, output ) || '';

		}

		builder.removeStack( this );

		return snippet;

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

Node.prototype.isNode = true;

export default Node;
