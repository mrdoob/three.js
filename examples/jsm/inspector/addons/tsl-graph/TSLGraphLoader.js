import { FileLoader, error } from 'three';

import * as THREE from 'three';
import * as TSL from 'three/tsl';

const _library = {
	'three/tsl': { ...TSL }
};

const STORAGE_PREFIX = 'tsl-graph';
const STORAGE_CODE = 'tsl-graph-code';

function _storageKey( graphId ) {

	return `${STORAGE_PREFIX}:${graphId}`;

}

class TSLGraphLoaderApplier {

	constructor( tslGraphFns ) {

		this.tslGraphFns = tslGraphFns;

	}

	apply( scene ) {

		const tslGraphFns = this.tslGraphFns;

		scene.traverse( ( object ) => {

			if ( object.material && object.material.userData.graphId ) {

				if ( tslGraphFns[ object.material.userData.graphId ] ) {

					tslGraphFns[ object.material.userData.graphId ]( object.material );

					object.material.needsUpdate = true;

				}

			}

		} );

	}

}

export class TSLGraphLoader extends FileLoader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		super.load( url, ( text ) => {

			let json;

			try {

				json = JSON.parse( text );

			} catch ( e ) {

				if ( onError ) onError( e );

				return;

			}

			const applier = this.parse( json );

			if ( onLoad ) onLoad( applier );

		}, onProgress, onError );

	}

	parseMaterial( json ) {

		const baseFn = 'tslGraph';

		const imports = {};
		const materials = [ this._generateMaterialCode( json, baseFn, imports ) ];
		const code = this._generateCode( materials, imports );

		const tslFunction = new Function( code )()( THREE, imports );

		return tslFunction;

	}

	parseMaterials( json ) {

		const imports = {};
		const materials = [];

		for ( const [ name, material ] of Object.entries( json ) ) {

			materials.push( this._generateMaterialCode( material, name, imports ) );

		}

		const code = this._generateCode( materials, imports );

		const tslFunction = new Function( code )()( THREE, imports );

		return tslFunction;

	}

	parse( json ) {

		let result;

		if ( json.material && json.material.code ) {

			result = this.parseMaterial( json.material );

		} else if ( json.materials ) {

			result = this.parseMaterials( json.materials );

		} else if ( json.codes && json.graphs ) {

			result = this.parseMaterials( json.codes.materials );

			TSLGraphLoader.setGraphs( json );

		}

		return new TSLGraphLoaderApplier( result );

	}

	_generateMaterialCode( json, name = 'tslGraph', imports = {} ) {

		const code = json.code.replace( 'function tslGraph', `materials[ '${ name }' ] = function` ).replace( /\n|^/g, '\n\t' );

		for ( const importData of json.imports ) {

			if ( _library[ importData.from ] ) {

				for ( const importName of importData.imports ) {

					if ( _library[ importData.from ][ importName ] ) {

						imports[ importName ] = _library[ importData.from ][ importName ];

					} else {

						error( `TSLGraph: Import ${ importName } not found in ${ importData.from }.` );

					}

				}

			} else {

				error( `TSLGraph: Library ${ importData.from } not found.` );

			}

		}

		return code;

	}

	_generateCode( materials, imports ) {

		const fnCode = `return ( THREE, { ${ Object.keys( imports ).join( ', ' ) } } ) => {\n\n\tconst materials = {};\n${ materials.join( '\n' ) }\n\n\treturn materials;\n\n}`;

		return fnCode;

	}

	static get hasGraphs() {

		return Object.keys( TSLGraphLoader.getCodes().materials ).length > 0;

	}

	static getCodes() {

		const code = window.localStorage.getItem( STORAGE_CODE );

		return code ? JSON.parse( code ) : { materials: {} };

	}

	static setCodes( codes ) {

		window.localStorage.setItem( STORAGE_CODE, JSON.stringify( codes ) );

	}

	static setGraph( graphId, graphData ) {

		window.localStorage.setItem( _storageKey( graphId ), JSON.stringify( graphData ) );

	}

	static getGraph( graphId ) {

		const raw = window.localStorage.getItem( _storageKey( graphId ) );

		if ( ! raw ) return null;

		try {

			return JSON.parse( raw );

		} catch ( e ) {

			error( 'TSLGraph: Invalid graph JSON in localStorage, ignoring.', e );
			return null;

		}

	}

	static deleteGraph( graphId ) {

		window.localStorage.removeItem( _storageKey( graphId ) );

	}

	static setGraphs( json ) {

		if ( ! json.codes || ! json.graphs ) {

			throw new Error( 'TSLGraph: Invalid import file structure.' );

		}

		TSLGraphLoader.clearGraphs();

		// Save imported graph visualizations
		for ( const [ id, graphData ] of Object.entries( json.graphs ) ) {

			TSLGraphLoader.setGraph( id, graphData );

		}

		// Fully overwrite codes
		TSLGraphLoader.setCodes( json.codes );

		return json;

	}

	static clearGraphs() {

		const keysToRemove = [];
		for ( let i = 0; i < window.localStorage.length; i ++ ) {

			const key = window.localStorage.key( i );
			if ( key.startsWith( STORAGE_PREFIX ) ) {

				keysToRemove.push( key );

			}

		}

		for ( const key of keysToRemove ) {

			window.localStorage.removeItem( key );

		}

	}

}
