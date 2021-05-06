import {
	Loader,
	FileLoader
} from '../../../build/three.module.js';

import * as Nodes from '../nodes/Nodes.js';

class NodeMaterialLoader extends Loader {

	constructor( manager, library = {} ) {

		super( manager );

		this.nodes = {};
		this.materials = {};
		this.passes = {};
		this.names = {};
		this.library = library;

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( JSON.parse( text ) ) );

		}, onProgress, onError );

		return this;

	}

	getObjectByName( uuid ) {

		return this.names[ uuid ];

	}

	getObjectById( uuid ) {

		return this.library[ uuid ] ||
			this.nodes[ uuid ] ||
			this.materials[ uuid ] ||
			this.passes[ uuid ] ||
			this.names[ uuid ];

	}

	getNode( uuid ) {

		const object = this.getObjectById( uuid );

		if ( ! object ) {

			console.warn( 'Node "' + uuid + '" not found.' );

		}

		return object;

	}

	resolve( json ) {

		switch ( typeof json ) {

			case 'boolean':
			case 'number':

				return json;

			case 'string':

				if ( /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/i.test( json ) || this.library[ json ] ) {

					return this.getNode( json );

				}

				return json;

			default:

				if ( Array.isArray( json ) ) {

					for ( let i = 0; i < json.length; i ++ ) {

						json[ i ] = this.resolve( json[ i ] );

					}

				} else {

					for ( const prop in json ) {

						if ( prop === 'uuid' ) continue;

						json[ prop ] = this.resolve( json[ prop ] );

					}

				}

		}

		return json;

	}

	declare( json ) {

		let uuid, node, object;

		for ( uuid in json.nodes ) {

			node = json.nodes[ uuid ];

			object = new Nodes[ node.nodeType + 'Node' ]();

			if ( node.name ) {

				object.name = node.name;

				this.names[ object.name ] = object;

			}

			this.nodes[ uuid ] = object;

		}

		for ( uuid in json.materials ) {

			node = json.materials[ uuid ];

			object = new Nodes[ node.type ]();

			if ( node.name ) {

				object.name = node.name;

				this.names[ object.name ] = object;

			}

			this.materials[ uuid ] = object;

		}

		for ( uuid in json.passes ) {

			node = json.passes[ uuid ];

			object = new Nodes[ node.type ]();

			if ( node.name ) {

				object.name = node.name;

				this.names[ object.name ] = object;

			}

			this.passes[ uuid ] = object;

		}

		if ( json.material ) this.material = this.materials[ json.material ];

		if ( json.pass ) this.pass = this.passes[ json.pass ];

		return json;

	}

	parse( json ) {

		let uuid;

		json = this.resolve( this.declare( json ) );

		for ( uuid in json.nodes ) {

			this.nodes[ uuid ].copy( json.nodes[ uuid ] );

		}

		for ( uuid in json.materials ) {

			this.materials[ uuid ].copy( json.materials[ uuid ] );

		}

		for ( uuid in json.passes ) {

			this.passes[ uuid ].copy( json.passes[ uuid ] );

		}

		return this.material || this.pass || this;

	}

}

class NodeMaterialLoaderUtils {

	static replaceUUIDObject( object, uuid, value, recursive ) {

		recursive = recursive !== undefined ? recursive : true;

		if ( typeof uuid === 'object' ) uuid = uuid.uuid;

		if ( typeof object === 'object' ) {

			const keys = Object.keys( object );

			for ( let i = 0; i < keys.length; i ++ ) {

				const key = keys[ i ];

				if ( recursive ) {

					object[ key ] = this.replaceUUIDObject( object[ key ], uuid, value );

				}

				if ( key === uuid ) {

					object[ uuid ] = object[ key ];

					delete object[ key ];

				}

			}

		}

		return object === uuid ? value : object;

	}

	static replaceUUID( json, uuid, value ) {

		this.replaceUUIDObject( json, uuid, value, false );
		this.replaceUUIDObject( json.nodes, uuid, value );
		this.replaceUUIDObject( json.materials, uuid, value );
		this.replaceUUIDObject( json.passes, uuid, value );
		this.replaceUUIDObject( json.library, uuid, value, false );

		return json;

	}

}

export { NodeMaterialLoader, NodeMaterialLoaderUtils };
