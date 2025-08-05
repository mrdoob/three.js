import { nodeObject, float } from '../../nodes/tsl/TSLBase.js';

import { Loader } from '../Loader.js';
import { FileLoader } from '../../loaders/FileLoader.js';

/**
 * A loader for loading node objects in the three.js JSON Object/Scene format.
 *
 * @augments Loader
 */
class NodeLoader extends Loader {

	/**
	 * Constructs a new node loader.
	 *
	 * @param {LoadingManager} [manager] - A reference to a loading manager.
	 */
	constructor( manager ) {

		super( manager );

		/**
		 * Represents a dictionary of textures.
		 *
		 * @type {Object<string,Texture>}
		 */
		this.textures = {};

		/**
		 * Represents a dictionary of node types.
		 *
		 * @type {Object<string,Node.constructor>}
		 */
		this.nodes = {};

	}

	/**
	 * Loads the node definitions from the given URL.
	 *
	 * @param {string} url - The path/URL of the file to be loaded.
	 * @param {Function} onLoad - Will be called when load completes.
	 * @param {Function} onProgress - Will be called while load progresses.
	 * @param {Function} onError - Will be called when errors are thrown during the loading process.
	 */
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

	/**
	 * Parse the node dependencies for the loaded node.
	 *
	 * @param {Array<Object>} [json] - The JSON definition
	 * @return {Object<string,Node>} A dictionary with node dependencies.
	 */
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

	/**
	 * Parses the node from the given JSON.
	 *
	 * @param {Object} json - The JSON definition
	 * @param {string} json.type - The node type.
	 * @param {string} json.uuid - The node UUID.
	 * @param {Array<Object>} [json.nodes] - The node dependencies.
	 * @param {Object} [json.meta] - The meta data.
	 * @return {Node} The parsed node.
	 */
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

	/**
	 * Defines the dictionary of textures.
	 *
	 * @param {Object<string,Texture>} value - The texture library defines as `<uuid,texture>`.
	 * @return {NodeLoader} A reference to this loader.
	 */
	setTextures( value ) {

		this.textures = value;
		return this;

	}

	/**
	 * Defines the dictionary of node types.
	 *
	 * @param {Object<string,Node.constructor>} value - The node library defined as `<classname,class>`.
	 * @return {NodeLoader} A reference to this loader.
	 */
	setNodes( value ) {

		this.nodes = value;
		return this;

	}

	/**
	 * Creates a node object from the given type.
	 *
	 * @param {string} type - The node type.
	 * @return {Node} The created node instance.
	 */
	createNodeFromType( type ) {

		if ( this.nodes[ type ] === undefined ) {

			console.error( 'THREE.NodeLoader: Node type not found:', type );
			return float();

		}

		return nodeObject( new this.nodes[ type ]() );

	}

}

export default NodeLoader;
