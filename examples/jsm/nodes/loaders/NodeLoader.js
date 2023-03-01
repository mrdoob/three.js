import * as Nodes from '../Nodes.js';
import { FileLoader, Loader } from 'three';

class NodeLoader extends Loader {

	constructor( manager ) {

		super( manager );

		this.textures = {};

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

				nodes[ uuid ] = Nodes.fromType( type );
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

		const node = Nodes.fromType( json.type );
		node.uuid = json.uuid;

		const nodes = this.parseNodes( json.inputNodes );
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

}

export default NodeLoader;
