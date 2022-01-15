import { NodeUpdateType } from './constants.js';
import { getNodesKeys } from './NodeUtils.js';
import { MathUtils } from 'three';

class Node {

	constructor( nodeType = null ) {

		this.nodeType = nodeType;

		this.updateType = NodeUpdateType.None;

		this.uuid = MathUtils.generateUUID();

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

	build( builder, output = null ) {

		const hash = this.getHash( builder );
		const sharedNode = builder.getNodeFromHash( hash );

		if ( sharedNode !== undefined && this !== sharedNode ) {

			return sharedNode.build( builder, output );

		}

		builder.addNode( this );
		builder.addStack( this );

		const isGenerateOnce = this.generate.length === 1;

		let snippet = null;

		if ( isGenerateOnce ) {

			const type = this.getNodeType( builder );
			const nodeData = builder.getDataFromNode( this );

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

	serialize( meta ) {

		const { uuid } = this;

		if ( meta.nodes[ uuid ] === undefined ) {

			const nodeKeys = getNodesKeys( this );

			const data = {
				uuid,
				metadata: {
					version: 4.5,
					type: 'Node',
					generator: 'Node.toJSON'
				},
				inputNodes: {}
			};

			for ( const name of nodeKeys ) {

				data.inputNodes[ name ] = this[ name ].toJSON( meta ).uuid;

			}

			meta.nodes[ data.uuid ] = data;

		}

		return meta.nodes[ uuid ];

	}

	toJSON( meta ) {

		const isRoot = ( meta === undefined || typeof meta === 'string' );

		if ( isRoot ) {

			meta = {
				textures: {},
				images: {},
				nodes: {}
			};

		}

		const data = this.serialize( meta );

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
