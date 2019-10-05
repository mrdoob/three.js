/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

import {
	FileLoader,
	Object3D,
	Loader
} from "../../../build/three.module.js";

import { OBJLoader2Parser } from "./obj2/worker/parallel/OBJLoader2Parser.js";
import { MeshReceiver } from "./obj2/shared/MeshReceiver.js";
import { MaterialHandler } from "./obj2/shared/MaterialHandler.js";

/**
 * Creates a new OBJLoader2. Use it to load OBJ data from files or to parse OBJ data from arraybuffer or text.
 *
 * @param {LoadingManager} [manager] The loadingManager for the loader to use. Default is {@link LoadingManager}
 * @constructor
 */
const OBJLoader2 = function ( manager ) {

	Loader.call( this, manager );

	this.parser = new OBJLoader2Parser();

	this.modelName = '';
	this.instanceNo = 0;
	this.baseObject3d = new Object3D();

	this.materialHandler = new MaterialHandler();
	this.meshReceiver = new MeshReceiver( this.materialHandler );

	// as OBJLoader2 is no longer derived from OBJLoader2Parser, we need to override the default onAssetAvailable callback
	let scope = this;
	let defaultOnAssetAvailable = function ( payload ) {

		scope._onAssetAvailable( payload );

	};
	this.parser.setCallbackOnAssetAvailable( defaultOnAssetAvailable );

};

OBJLoader2.OBJLOADER2_VERSION = '3.1.0';
console.info( 'Using OBJLoader2 version: ' + OBJLoader2.OBJLOADER2_VERSION );


OBJLoader2.prototype = Object.assign( Object.create( Loader.prototype ), {

	constructor: OBJLoader2,

	/**
	 * See {@link OBJLoader2Parser.setLogging}
	 * @return {OBJLoader2}
	 */
	setLogging: function ( enabled, debug ) {

		this.parser.setLogging( enabled, debug );
		return this;

	},

	/**
	 * See {@link OBJLoader2Parser.setMaterialPerSmoothingGroup}
	 * @return {OBJLoader2}
	 */
	setMaterialPerSmoothingGroup: function ( materialPerSmoothingGroup ) {

		this.parser.setMaterialPerSmoothingGroup( materialPerSmoothingGroup );
		return this;

	},

	/**
	 * See {@link OBJLoader2Parser.setUseOAsMesh}
	 * @return {OBJLoader2}
	 */
	setUseOAsMesh: function ( useOAsMesh ) {

		this.parser.setUseOAsMesh( useOAsMesh );
		return this;

	},

	/**
	 * See {@link OBJLoader2Parser.setUseIndices}
	 * @return {OBJLoader2}
	 */
	setUseIndices: function ( useIndices ) {

		this.parser.setUseIndices( useIndices );
		return this;

	},

	/**
	 * See {@link OBJLoader2Parser.setDisregardNormals}
	 * @return {OBJLoader2}
	 */
	setDisregardNormals: function ( disregardNormals ) {

		this.parser.setDisregardNormals( disregardNormals );
		return this;

	},

	/**
	 * Set the name of the model.
	 *
	 * @param {string} modelName
	 * @return {OBJLoader2}
	 */
	setModelName: function ( modelName ) {

		this.modelName = modelName ? modelName : this.modelName;
		return this;

	},

	/**
	 * Set the node where the loaded objects will be attached directly.
	 *
	 * @param {Object3D} baseObject3d Object already attached to scenegraph where new meshes will be attached to
	 * @return {OBJLoader2}
	 */
	setBaseObject3d: function ( baseObject3d ) {

		this.baseObject3d = ( baseObject3d === undefined || baseObject3d === null ) ? this.baseObject3d : baseObject3d;
		return this;

	},

	/**
	 * Add materials as associated array.
	 *
	 * @param {Object} materials Object with named {@link Material}
	 * @return {OBJLoader2}
	 */
	addMaterials: function ( materials ) {

		this.materialHandler.addMaterials( materials );
		return this;

	},

	/**
	 * See {@link OBJLoader2Parser.setCallbackOnAssetAvailable}
	 * @return {OBJLoader2}
	 */
	setCallbackOnAssetAvailable: function ( onAssetAvailable ) {

		this.parser.setCallbackOnAssetAvailable( onAssetAvailable );
		return this;

	},

	/**
	 * See {@link OBJLoader2Parser.setCallbackOnProgress}
	 * @return {OBJLoader2}
	 */
	setCallbackOnProgress: function ( onProgress ) {

		this.parser.setCallbackOnProgress( onProgress );
		return this;

	},

	/**
	 * See {@link OBJLoader2Parser.setCallbackOnError}
	 * @return {OBJLoader2}
	 */
	setCallbackOnError: function ( onError ) {

		this.parser.setCallbackOnError( onError );
		return this;

	},

	/**
	 * See {@link OBJLoader2Parser.setCallbackOnLoad}
	 * @return {OBJLoader2}
	 */
	setCallbackOnLoad: function ( onLoad ) {

		this.parser.setCallbackOnLoad( onLoad );
		return this;

	},

	/**
	 * Register a function that is called once a single mesh is available and it could be altered by the supplied function.
	 *
	 * @param {Function} [onMeshAlter]
	 * @return {OBJLoader2}
	 */
	setCallbackOnMeshAlter: function ( onMeshAlter ) {

		this.meshReceiver._setCallbacks( this.parser.callbacks.onProgress, onMeshAlter );
		return this;

	},

	/**
	 * Register a function that is called once all materials have been loaded and they could be altered by the supplied function.
	 *
	 * @param {Function} [onLoadMaterials]
	 * @return {OBJLoader2}
	 */
	setCallbackOnLoadMaterials: function ( onLoadMaterials ) {

		this.materialHandler._setCallbacks( onLoadMaterials );
		return this;

	},

	/**
	 * Use this convenient method to load a file at the given URL. By default the fileLoader uses an ArrayBuffer.
	 *
	 * @param {string}  url A string containing the path/URL of the file to be loaded.
	 * @param {function} onLoad A function to be called after loading is successfully completed. The function receives loaded Object3D as an argument.
	 * @param {function} [onFileLoadProgress] A function to be called while the loading is in progress. The argument will be the XMLHttpRequest instance, which contains total and Integer bytes.
	 * @param {function} [onError] A function to be called if an error occurs during loading. The function receives the error as an argument.
	 * @param {function} [onMeshAlter] Called after every single mesh is made available by the parser
	 */
	load: function ( url, onLoad, onFileLoadProgress, onError, onMeshAlter ) {

		let scope = this;
		if ( onLoad === null || onLoad === undefined || ! ( onLoad instanceof Function ) ) {

			let errorMessage = 'onLoad is not a function! Aborting...';
			scope.parser.callbacks.onError( errorMessage );
			throw errorMessage;

		} else {

			this.parser.setCallbackOnLoad( onLoad );

		}
		if ( onError === null || onError === undefined || ! ( onError instanceof Function ) ) {

			onError = function ( event ) {

				let errorMessage = event;
				if ( event.currentTarget && event.currentTarget.statusText !== null ) {

					errorMessage = 'Error occurred while downloading!\nurl: ' + event.currentTarget.responseURL + '\nstatus: ' + event.currentTarget.statusText;

				}
				scope.parser.callbacks.onError( errorMessage );

			};

		}
		if ( ! url ) {

			onError( 'An invalid url was provided. Unable to continue!' );

		}
		let urlFull = new URL( url, window.location.href ).href;
		let filename = urlFull;
		let urlParts = urlFull.split( '/' );
		if ( urlParts.length > 2 ) {

			filename = urlParts[ urlParts.length - 1 ];
			let urlPartsPath = urlParts.slice( 0, urlParts.length - 1 ).join( '/' ) + '/';
			if ( urlPartsPath !== undefined && urlPartsPath !== null ) this.path = urlPartsPath;

		}
		if ( onFileLoadProgress === null || onFileLoadProgress === undefined || ! ( onFileLoadProgress instanceof Function ) ) {

			let numericalValueRef = 0;
			let numericalValue = 0;
			onFileLoadProgress = function ( event ) {

				if ( ! event.lengthComputable ) return;

				numericalValue = event.loaded / event.total;
				if ( numericalValue > numericalValueRef ) {

					numericalValueRef = numericalValue;
					let output = 'Download of "' + url + '": ' + ( numericalValue * 100 ).toFixed( 2 ) + '%';
					scope.parser.callbacks.onProgress( 'progressLoad', output, numericalValue );

				}

			};

		}

		this.setCallbackOnMeshAlter( onMeshAlter );
		let fileLoaderOnLoad = function ( content ) {

			scope.parser.callbacks.onLoad( scope.parse( content ), "OBJLoader2#load: Parsing completed" );

		};
		let fileLoader = new FileLoader( this.manager );
		fileLoader.setPath( this.path || this.resourcePath );
		fileLoader.setResponseType( 'arraybuffer' );
		fileLoader.load( filename, fileLoaderOnLoad, onFileLoadProgress, onError );

	},

	/**
	 * Parses OBJ data synchronously from arraybuffer or string and returns the {@link Object3D}.
	 *
	 * @param {arraybuffer|string} content OBJ data as Uint8Array or String
	 * @return {Object3D}
	 */
	parse: function ( content ) {

		// fast-fail in case of illegal data
		if ( content === null || content === undefined ) {

			throw 'Provided content is not a valid ArrayBuffer or String. Unable to continue parsing';

		}
		if ( this.parser.logging.enabled ) {

			console.time( 'OBJLoader parse: ' + this.modelName );

		}

		// Create default materials beforehand, but do not override previously set materials (e.g. during init)
		this.materialHandler.createDefaultMaterials( false );

		// code works directly on the material references, parser clear its materials before updating
		this.parser.setMaterials( this.materialHandler.getMaterials() );

		if ( content instanceof ArrayBuffer || content instanceof Uint8Array ) {

			if ( this.parser.logging.enabled ) console.info( 'Parsing arrayBuffer...' );
			this.parser.execute( content );

		} else if ( typeof ( content ) === 'string' || content instanceof String ) {

			if ( this.parser.logging.enabled ) console.info( 'Parsing text...' );
			this.parser.executeLegacy( content );

		} else {

			this.parser.callbacks.onError( 'Provided content was neither of type String nor Uint8Array! Aborting...' );

		}
		if ( this.parser.logging.enabled ) {

			console.timeEnd( 'OBJLoader parse: ' + this.modelName );

		}
		return this.baseObject3d;

	},

	_onAssetAvailable: function ( payload ) {

		if ( payload.cmd !== 'assetAvailable' ) return;

		if ( payload.type === 'mesh' ) {

			let meshes = this.meshReceiver.buildMeshes( payload );
			for ( let mesh of meshes ) {

				this.baseObject3d.add( mesh );

			}

		} else if ( payload.type === 'material' ) {

			this.materialHandler.addPayloadMaterials( payload );

		}

	}

} );

export { OBJLoader2 };
