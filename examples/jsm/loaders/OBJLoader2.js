/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

import {
	DefaultLoadingManager,
	FileLoader,
	Group
} from "../../../build/three.module.js";

import { OBJLoader2Parser } from "./obj2/worker/parallel/OBJLoader2Parser.js";
import { MeshReceiver } from "./obj2/shared/MeshReceiver.js";
import { MaterialHandler } from "./obj2/shared/MaterialHandler.js";

/**
 * Use this class to load OBJ data from files or to parse OBJ data from an arraybuffer
 * @class
 *
 * @param {DefaultLoadingManager} [manager] The loadingManager for the loader to use. Default is {@link DefaultLoadingManager}
 */
const OBJLoader2 = function ( manager ) {

	OBJLoader2Parser.call( this );
	this.manager = ( manager !== undefined && manager !== null ) ? manager : DefaultLoadingManager;

	this.modelName = '';
	this.instanceNo = 0;
	this.path = undefined;
	this.resourcePath = undefined;
	this.baseObject3d = new Group();

	this.materialHandler = new MaterialHandler();
	this.meshReceiver = new MeshReceiver( this.materialHandler );

};
OBJLoader2.OBJLOADER2_VERSION = '3.0.0';
console.info( 'Using OBJLoader2 version: ' + OBJLoader2.OBJLOADER2_VERSION );

OBJLoader2.prototype = Object.create( OBJLoader2Parser.prototype );
OBJLoader2.prototype.constructor = OBJLoader2;


/**
 * Set the name of the model.
 *
 * @param {string} modelName
 * @return {OBJLoader2}
 */
OBJLoader2.prototype.setModelName = function ( modelName ) {

	this.modelName = modelName ? modelName : this.modelName;
	return this;

};

/**
 * The URL of the base path.
 *
 * @param {string} path URL
 * @return {OBJLoader2}
 */
OBJLoader2.prototype.setPath = function ( path ) {

	this.path = path ? path : this.path;
	return this;

};

/**
 * Allow to specify resourcePath for dependencies of specified resource.
 *
 * @param {string} resourcePath
 * @return {OBJLoader2}
 */
OBJLoader2.prototype.setResourcePath = function ( resourcePath ) {

	this.resourcePath = resourcePath ? resourcePath : this.resourcePath;
	return this;

};

/**
 * Set the node where the loaded objects will be attached directly.
 *
 * @param {Object3D} baseObject3d Object already attached to scenegraph where new meshes will be attached to
 * @return {OBJLoader2}
 */
OBJLoader2.prototype.setBaseObject3d = function ( baseObject3d ) {

	this.baseObject3d = ( baseObject3d === undefined || baseObject3d === null ) ? this.baseObject3d : baseObject3d;
	return this;

};

/**
 * Add materials as associated array.
 *
 * @param {Object} materials Object with named {@link Material}
 * @return {OBJLoader2}
 */
OBJLoader2.prototype.addMaterials = function ( materials ) {

	this.materialHandler.addMaterials( materials );
	return this;

};

/**
 * Register a function that is called once a single mesh is available and it could be altered by the supplied function.
 *
 * @param {Function} [onMeshAlter]
 * @return {OBJLoader2}
 */
OBJLoader2.prototype.setCallbackOnMeshAlter = function ( onMeshAlter ) {

	this.meshReceiver._setCallbacks( this.callbacks.onProgress, onMeshAlter );
	return this;

};

/**
 * Register a function that is called once all materials have been loaded and they could be altered by the supplied function.
 *
 * @param {Function} [onLoadMaterials]
 * @return {OBJLoader2}
 */
OBJLoader2.prototype.setCallbackOnLoadMaterials = function ( onLoadMaterials ) {

	this.materialHandler._setCallbacks( onLoadMaterials );
	return this;

};

/**
 * Use this convenient method to load a file at the given URL. By default the fileLoader uses an ArrayBuffer.
 *
 * @param {string}  url A string containing the path/URL of the file to be loaded.
 * @param {function} onLoad A function to be called after loading is successfully completed. The function receives loaded Object3D as an argument.
 * @param {function} [onFileLoadProgress] A function to be called while the loading is in progress. The argument will be the XMLHttpRequest instance, which contains total and Integer bytes.
 * @param {function} [onError] A function to be called if an error occurs during loading. The function receives the error as an argument.
 * @param {function} [onMeshAlter] Called after every single mesh is made available by the parser
 */
OBJLoader2.prototype.load = function ( url, onLoad, onFileLoadProgress, onError, onMeshAlter ) {

	let scope = this;
	if ( onLoad === null || onLoad === undefined || ! ( onLoad instanceof Function ) ) {

		let errorMessage = 'onLoad is not a function! Aborting...';
		scope.callbacks.onError( errorMessage );
		throw errorMessage

	}
	if ( onError === null || onError === undefined || ! ( onError instanceof Function ) ) {

		onError = function ( event ) {

			let errorMessage = event;
			if ( event.currentTarget && event.currentTarget.statusText !== null ) {

				 errorMessage = 'Error occurred while downloading!\nurl: ' + event.currentTarget.responseURL + '\nstatus: ' + event.currentTarget.statusText;

			}
			scope.callbacks.onError( errorMessage );

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
				scope.callbacks.onProgress( 'progressLoad', output, numericalValue );

			}

		};

	}

	this.setCallbackOnMeshAlter( onMeshAlter );
	let fileLoaderOnLoad = function ( content ) {

		onLoad( scope.parse( content ) );

	};
	let fileLoader = new FileLoader( this.manager );
	fileLoader.setPath( this.path || this.resourcePath );
	fileLoader.setResponseType( 'arraybuffer' );
	fileLoader.load( filename, fileLoaderOnLoad, onFileLoadProgress, onError );

};

/**
 * Parses OBJ data synchronously from arraybuffer or string.
 *
 * @param {arraybuffer|string} content OBJ data as Uint8Array or String
 */
OBJLoader2.prototype.parse = function ( content ) {

	// fast-fail in case of illegal data
	if ( content === null || content === undefined ) {

		throw 'Provided content is not a valid ArrayBuffer or String. Unable to continue parsing';

	}
	if ( this.logging.enabled ) {

		console.time( 'OBJLoader parse: ' + this.modelName );

	}

	// sync code works directly on the material references
	this._setMaterials( this.materialHandler.getMaterials() );

	if ( content instanceof ArrayBuffer || content instanceof Uint8Array ) {

		if ( this.logging.enabled ) console.info( 'Parsing arrayBuffer...' );
		this.execute( content );

	} else if ( typeof ( content ) === 'string' || content instanceof String ) {

		if ( this.logging.enabled ) console.info( 'Parsing text...' );
		this.executeLegacy( content );

	} else {

		this.callbacks.onError( 'Provided content was neither of type String nor Uint8Array! Aborting...' );

	}
	if ( this.logging.enabled ) {

		console.timeEnd( 'OBJLoader parse: ' + this.modelName );

	}
	return this.baseObject3d;

};

OBJLoader2.prototype._onAssetAvailable = function ( payload ) {

	if ( payload.cmd !== 'assetAvailable' ) return;

	if ( payload.type === 'mesh' ) {

		let meshes = this.meshReceiver.buildMeshes( payload );
		for ( let mesh of meshes ) {

			this.baseObject3d.add( mesh );

		}

	} else if ( payload.type === 'material' ) {

		this.materialHandler.addPayloadMaterials( payload );

	}

};

export { OBJLoader2 };
