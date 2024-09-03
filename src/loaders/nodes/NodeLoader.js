import { nodeObject, float } from '../../nodes/tsl/TSLBase.js';

import { Loader } from '../Loader.js';
import { FileLoader } from '../../loaders/FileLoader.js';

class NodeLoader extends Loader {

	constructor( manager ) {

		super( manager );

		this.textures = {};
		this.nodes = {};

	}

	load( url, onLoad, onProgress, onError ) {

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, ( text ) => {

			try {

				onLoad( this.parse( JSON.parse( text ) ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				this.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parseNodes( json ) {

		const nodes = {};

		if ( json !== undefined ) {

			for ( const nodeJSON of json ) {

				const { uuid, type } = nodeJSON;

				nodes[ uuid ] = this.createNodeFromType( type );
				nodes[ uuid ].uuid = uuid;

			}

			const meta = { nodes, textures: this.textures };

			for ( const nodeJSON of json ) {

				nodeJSON.meta = meta;

				const node = nodes[ nodeJSON.uuid ];
				node.deserialize( nodeJSON );

				delete nodeJSON.meta;

			}

		}

		return nodes;

	}

	parse( json ) {

		const node = this.createNodeFromType( json.type );
		node.uuid = json.uuid;

		const nodes = this.parseNodes( json.nodes );
		const meta = { nodes, textures: this.textures };

		json.meta = meta;

		node.deserialize( json );

		delete json.meta;

		return node;

	}

	setTextures( value ) {

		this.textures = value;
		return this;

	}

	setNodes( value ) {

		this.nodes = value;
		return this;

	}

	createNodeFromType( type ) {

		if ( this.nodes[ type ] === undefined ) {

			console.error( 'THREE.NodeLoader: Node type not found:', type );
			return float();

		}

		return nodeObject( new this.nodes[ type ]() );

	}

}

export default NodeLoader;
