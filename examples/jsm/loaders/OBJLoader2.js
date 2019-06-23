/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

import {
	DefaultLoadingManager,
	FileLoader,
	Group
} from "../../../build/three.module.js";

import { Parser } from "./obj2/worker/parallel/OBJLoader2Parser.js";
import { MeshReceiver } from "./obj2/shared/MeshReceiver.js";
import { MaterialHandler } from "./obj2/shared/MaterialHandler.js";

/**
 * Use this class to load OBJ data from files or to parse OBJ data from an arraybuffer
 * @class
 *
 * @param {DefaultLoadingManager} [manager] The loadingManager for the loader to use. Default is {@link DefaultLoadingManager}
 */
const OBJLoader2 = function ( manager ) {
	this.manager = ( manager !== undefined && manager !== null ) ? manager : DefaultLoadingManager;
	this.logging = {
		enabled: true,
		debug: false
	};

	this.modelName = '';
	this.instanceNo = 0;
	this.path = undefined;
	this.resourcePath = undefined;
	this.useIndices = false;
	this.disregardNormals = false;
	this.materialPerSmoothingGroup = false;
	this.useOAsMesh = false;
	this.baseObject3d = new Group();

	this.callbacks = {
		onParseProgress: undefined,
		genericErrorHandler: undefined
	};

	this.materialHandler = new MaterialHandler();
	this.meshReceiver = new MeshReceiver( this.materialHandler );
};
OBJLoader2.OBJLOADER2_VERSION = '3.0.0-beta';
console.info( 'Using OBJLoader2 version: ' + OBJLoader2.OBJLOADER2_VERSION );


OBJLoader2.prototype = {

	constructor: OBJLoader2,

	/**
	 * Enable or disable logging in general (except warn and error), plus enable or disable debug logging.
	 *
	 * @param {boolean} enabled True or false.
	 * @param {boolean} debug True or false.
	 */
	setLogging: function ( enabled, debug ) {
		this.logging.enabled = enabled === true;
		this.logging.debug = debug === true;
		return this;
	},

	/**
	 * Set the name of the model.
	 *
	 * @param {string} modelName
	 */
	setModelName: function ( modelName ) {
		this.modelName = modelName ? modelName : this.modelName;
		return this;
	},

	/**
	 * The URL of the base path.
	 *
	 * @param {string} path URL
	 */
	setPath: function ( path ) {
		this.path = path ? path : this.path;
		return this;
	},


	/**
	 * Allow to specify resourcePath for dependencies of specified resource.
	 * @param {string} resourcePath
	 */
	setResourcePath: function ( resourcePath ) {
		this.resourcePath = resourcePath ? resourcePath : this.resourcePath;
	},

	/**
	 * Set the node where the loaded objects will be attached directly.
	 *
	 * @param {Object3D} baseObject3d Object already attached to scenegraph where new meshes will be attached to
	 */
	setBaseObject3d: function ( baseObject3d ) {
		this.baseObject3d = ( baseObject3d === undefined || baseObject3d === null ) ? this.baseObject3d : baseObject3d;
		return this;
	},

	/**
	 * Add materials as associated array.
	 *
	 * @param materials Object with named {@link Material}
	 */
	addMaterials: function ( materials ) {
		this.materialHandler.addMaterials( materials );
	},

	/**
	 * Instructs loaders to create indexed {@link BufferGeometry}.
	 *
	 * @param {boolean} useIndices=false
	 */
	setUseIndices: function ( useIndices ) {
		this.useIndices = useIndices === true;
		return this;
	},

	/**
	 * Tells whether normals should be completely disregarded and regenerated.
	 *
	 * @param {boolean} disregardNormals=false
	 */
	setDisregardNormals: function ( disregardNormals ) {
		this.disregardNormals = disregardNormals === true;
		return this;
	},

	/**
	 * Tells whether a material shall be created per smoothing group.
	 *
	 * @param {boolean} materialPerSmoothingGroup=false
	 */
	setMaterialPerSmoothingGroup: function ( materialPerSmoothingGroup ) {
		this.materialPerSmoothingGroup = materialPerSmoothingGroup === true;
		return this;
	},

	/**
	 * Usually 'o' is meta-information and does not result in creation of new meshes, but mesh creation on occurrence of "o" can be enforced.
	 *
	 * @param {boolean} useOAsMesh=false
	 */
	setUseOAsMesh: function ( useOAsMesh ) {
		this.useOAsMesh = useOAsMesh === true;
		return this;
	},

	/**
	 * Register an generic error handler that is called if available instead of throwing an exception
	 * @param {Function} genericErrorHandler
	 */
	setGenericErrorHandler: function ( genericErrorHandler ) {
		if ( genericErrorHandler !== undefined && genericErrorHandler !== null ) {

			this.callbacks.genericErrorHandler = genericErrorHandler;

		}
	},

	/**
	 *
	 * @private
	 *
	 * @param {Function} [onParseProgress]
	 * @param {Function} [onMeshAlter]
	 * @param {Function} [onLoadMaterials]
	 * @private
	 */
	_setCallbacks: function ( onParseProgress, onMeshAlter, onLoadMaterials ) {
		if ( onParseProgress !== undefined && onParseProgress !== null ) {

			this.callbacks.onParseProgress = onParseProgress;

		}
		this.meshReceiver._setCallbacks( onParseProgress, onMeshAlter );
		this.materialHandler._setCallbacks( onLoadMaterials );
	},

	/**
	 * Announce feedback which is give to the registered callbacks.
	 * @private
	 *
	 * @param {string} type The type of event
	 * @param {string} text Textual description of the event
	 * @param {number} numericalValue Numerical value describing the progress
	 */
	_onProgress: function ( type, text, numericalValue ) {
		let message = text ? text : '';
		let event = {
			detail: {
				type: type,
				modelName: this.modelName,
				instanceNo: this.instanceNo,
				text: message,
				numericalValue: numericalValue
			}
		};
		if ( this.callbacks.onParseProgress ) {

			this.callbacks.onParseProgress( event );

		}
		if ( this.logging.enabled && this.logging.debug ) {

			console.log( message );

		}
	},

	/**
	 * Announce error feedback which is given to the generic error handler to the registered callbacks.
	 * @private
	 *
	 * @param {String} errorMessage The event containing the error
	 */
	_onError: function ( errorMessage ) {
		if ( this.callbacks.genericErrorHandler ) {

			this.callbacks.genericErrorHandler( errorMessage );

		}
		if ( this.logging.enabled && this.logging.debug ) {

			console.log( errorMessage );

		}

	},

	/**
	 * Use this convenient method to load a file at the given URL. By default the fileLoader uses an ArrayBuffer.
	 *
	 * @param {string}  url A string containing the path/URL of the file to be loaded.
	 * @param {function} onLoad A function to be called after loading is successfully completed. The function receives loaded Object3D as an argument.
	 * @param {function} [onFileLoadProgress] A function to be called while the loading is in progress. The argument will be the XMLHttpRequest instance, which contains total and Integer bytes.
	 * @param {function} [onError] A function to be called if an error occurs during loading. The function receives the error as an argument.
	 * @param {function} [onMeshAlter] Called after worker successfully delivered a single mesh
	 */
	load: function ( url, onLoad, onFileLoadProgress, onError, onMeshAlter ) {
		let scope = this;
		if ( onError === null || onError === undefined ) {

			onError = function ( event ) {

				let errorMessage = event;
				if ( event.currentTarget && event.currentTarget.statusText !== null ) {

					 errorMessage = 'Error occurred while downloading!\nurl: ' + event.currentTarget.responseURL + '\nstatus: ' + event.currentTarget.statusText;

				}
				scope._onError( errorMessage );

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
		if ( onFileLoadProgress === null || onFileLoadProgress === undefined ) {

			let numericalValueRef = 0;
			let numericalValue = 0;
			onFileLoadProgress = function ( event ) {
				if ( ! event.lengthComputable ) return;

				numericalValue = event.loaded / event.total;
				if ( numericalValue > numericalValueRef ) {

					numericalValueRef = numericalValue;
					let output = 'Download of "' + url + '": ' + (numericalValue * 100).toFixed( 2 ) + '%';
					scope._onProgress( 'progressLoad', output, numericalValue );

				}
			};

		}
		this._setCallbacks( null, onMeshAlter, null );
		let fileLoaderOnLoad = function ( content ) {
			onLoad( scope.parse( content ) );
		};
		let fileLoader = new FileLoader( this.manager );
		fileLoader.setPath( this.path || this.resourcePath );
		fileLoader.setResponseType( 'arraybuffer' );
		fileLoader.load( filename, fileLoaderOnLoad, onFileLoadProgress, onError );
	},

	/**
	 * Parses OBJ data synchronously from arraybuffer or string.
	 *
	 * @param {arraybuffer|string} content OBJ data as Uint8Array or String
	 */
	parse: function ( content ) {
		// fast-fail in case of illegal data
		if ( content === null || content === undefined ) {

			throw 'Provided content is not a valid ArrayBuffer or String. Unable to continue parsing';

		}
		if ( this.logging.enabled ) {

			console.time( 'OBJLoader parse: ' + this.modelName );

		}
		let parser = new Parser();
		parser.setLogging( this.logging.enabled, this.logging.debug );
		parser.setMaterialPerSmoothingGroup( this.materialPerSmoothingGroup );
		parser.setUseOAsMesh( this.useOAsMesh );
		parser.setUseIndices( this.useIndices );
		parser.setDisregardNormals( this.disregardNormals );
		// sync code works directly on the material references
		parser.setMaterials( this.materialHandler.getMaterials() );

		let scope = this;
		let onMeshLoaded = function ( payload ) {

			if ( payload.cmd !== 'data' ) return;

			if ( payload.type === 'mesh' ) {

				let meshes = scope.meshReceiver.buildMeshes( payload );
				for ( let mesh of meshes ) {
					scope.baseObject3d.add( mesh );
				}

			} else if ( payload.type === 'material' ) {

				scope.materialHandler.addPayloadMaterials( payload );

			}
		};
		let onProgressScoped = function ( text, numericalValue ) {
			scope._onProgress( 'progressParse', text, numericalValue );
		};
		let onErrorScoped = function ( message ) {
			scope._onError( message );
		};
		parser.setCallbackOnAssetAvailable( onMeshLoaded );
		parser.setCallbackOnProgress( onProgressScoped );
		parser.setCallbackOnError( onErrorScoped );
		if ( content instanceof ArrayBuffer || content instanceof Uint8Array ) {

			if ( this.logging.enabled ) console.info( 'Parsing arrayBuffer...' );
			parser.parse( content );

		} else if ( typeof( content ) === 'string' || content instanceof String ) {

			if ( this.logging.enabled ) console.info( 'Parsing text...' );
			parser.parseText( content );

		} else {

			scope._onError( 'Provided content was neither of type String nor Uint8Array! Aborting...' );

		}
		if ( this.logging.enabled ) {

			console.timeEnd( 'OBJLoader parse: ' + this.modelName );

		}
		return this.baseObject3d;
	}
};

export { OBJLoader2 };
