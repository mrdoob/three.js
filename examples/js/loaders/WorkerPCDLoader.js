/**
 * Description: An extension to THREE.PCDLoader that allows parsingto be performed in a worker.
 *
 * @author Kai Salmen / https://github.com/kaisalmen
 */

if ( THREE.PCDLoader === undefined ) console.error( '"THREE.PCDLoader" is not available. "THREE.WorkerPCDLoader" requires it. Please include "PCDLoader.js" in your HTML.' );
if ( THREE.LoaderSupport === undefined ) console.error( '"THREE.LoaderSupport" is not available. "THREE.OBJLoader2" requires it. Please include "LoaderSupport.js" in your HTML.' );

THREE.WorkerPCDLoader = function ( manager ) {

	THREE.PCDLoader.call( this, manager );
	this.builder = new THREE.LoaderSupport.Builder();
	this.loaderRootNode = new THREE.Group();
	this.workerSupport = null;
	this.logger = new THREE.LoaderSupport.ConsoleLogger();

	// required for load
	this.fileLoader = new THREE.FileLoader( this.manager );
	this.fileLoader.setResponseType( 'arraybuffer' );
	this.callbacks = new THREE.LoaderSupport.Callbacks();
};

THREE.WorkerPCDLoader.prototype = Object.create( THREE.PCDLoader.prototype );
THREE.WorkerPCDLoader.prototype.constructor = THREE.WorkerPCDLoader;

THREE.WorkerPCDLoader.prototype[ 'onProgress' ] = THREE.LoaderSupport.LoaderBase.prototype[ 'onProgress' ];

/**
 * Use this convenient method to load a file at the given URL. By default the fileLoader uses an ArrayBuffer.
 * @memberOf THREE.LoaderSupport.LoaderBase
 *
 * @param {string}  url A string containing the path/URL of the file to be loaded.
 * @param {callback} onLoad A function to be called after loading is successfully completed. The function receives loaded Object3D as an argument.
 * @param {callback} [onProgress] A function to be called while the loading is in progress. The argument will be the XMLHttpRequest instance, which contains total and Integer bytes.
 * @param {callback} [onError] A function to be called if an error occurs during loading. The function receives the error as an argument.
 * @param {callback} [onMeshAlter] A function to be called after a new mesh raw data becomes available for alteration.
 * @param {boolean} [useAsync] If true, uses async loading with worker, if false loads data synchronously.
 */
THREE.WorkerPCDLoader.prototype.load = function ( url, onLoad, onProgress, onError, onMeshAlter, useAsync ) {
	var scope = this;
	if ( ! THREE.LoaderSupport.Validator.isValid( onProgress ) ) {
		var numericalValueRef = 0;
		var numericalValue = 0;
		onProgress = function ( event ) {
			if ( ! event.lengthComputable ) return;

			numericalValue = event.loaded / event.total;
			if ( numericalValue > numericalValueRef ) {

				numericalValueRef = numericalValue;
				var output = 'Download of "' + url + '": ' + ( numericalValue * 100 ).toFixed( 2 ) + '%';
				scope.onProgress( 'progressLoad', output, numericalValue );

			}
		};
	}

	if ( ! THREE.LoaderSupport.Validator.isValid( onError ) ) {
		onError = function ( event ) {
			var output = 'Error occurred while downloading "' + url + '"';
			scope.logger.logError( output + ': ' + event );
			scope.onProgress( 'error', output, -1 );
		};
	}

	this.fileLoader.setPath( this.path );
	this.fileLoader.load( url, function ( content ) {
		if ( useAsync ) {

			scope.parseAsync( content, onLoad );

		} else {

			onLoad( scope.parse( content ) );

		}

	}, onProgress, onError );

};

THREE.WorkerPCDLoader.prototype.parse = function ( data, url ) {
	var scope = this;
	var parser = new THREE.WorkerPCDLoader.Parser();
	parser.setLittleEndian( this.littleEndian );

	var onMeshLoaded = function ( payload ) {
		var meshes = scope.builder.processPayload( payload );
		// no mesh alteration, therefore short-cut
		var mesh;
		for ( var i in meshes ) {
			mesh = meshes[ i ];
			scope.loaderRootNode.add( mesh );
		}

		return scope.loaderRootNode;
	};
	parser.setCallbackBuilder( onMeshLoaded );
	parser.parse( data, url );

	return scope.loaderRootNode;
};

/**
 * Parses a PCD binary structure asynchronously from given ArrayBuffer. Calls onLoad once loading is complete.
 * A new Group containing the object is passed to onLoad. The object is converted to Points with a BufferGeometry
 * and a PointsMaterial.
 * @memberOf THREE.PCDLoader
 *
 * @param {arraybuffer} data PCD data as Uint8Array
 * @param {callback} onLoad Called after worker successfully completed loading
 */
THREE.WorkerPCDLoader.prototype.parseAsync = function ( data, onLoad ) {
	var scope = this;
	var scopedOnLoad = function () {
		onLoad( scope.loaderRootNode );
	};
	var scopedOnMeshLoaded = function ( payload ) {
		var meshes = scope.builder.processPayload( payload );
		var mesh;
		for ( var i in meshes ) {
			mesh = meshes[ i ];
			scope.loaderRootNode.add( mesh );
		}
	};

	this.workerSupport = THREE.LoaderSupport.Validator.verifyInput( this.workerSupport, new THREE.LoaderSupport.WorkerSupport() );
	var buildCode = function ( funcBuildObject, funcBuildSingleton ) {
		var workerCode = '';
		workerCode += '/**\n';
		workerCode += '  * This code was constructed by WorkerPCDLoader.buildCode.\n';
		workerCode += '  */\n\n';
		workerCode += 'THREE = {\n\tLoaderSupport: {},\n\tPCDLoader: {},\n\tWorkerPCDLoader: {}\n};\n\n';
		workerCode += funcBuildObject( 'THREE.LoaderUtils', THREE.LoaderUtils );
		workerCode += funcBuildSingleton( 'THREE.PCDLoader.Parser', THREE.PCDLoader.Parser, 'Parser', null,[ 'buildMesh' ] );
		workerCode += funcBuildSingleton( 'THREE.WorkerPCDLoader.Parser', THREE.WorkerPCDLoader.Parser, 'Parser', 'THREE.PCDLoader.Parser', [ 'parseData', 'parseHeader', 'setLittleEndian' ] );
		return workerCode;
	};
	this.workerSupport.validate( buildCode, 'THREE.WorkerPCDLoader.Parser' );
	this.workerSupport.setCallbacks( scopedOnMeshLoaded, scopedOnLoad );
	if ( scope.terminateWorkerOnLoad ) this.workerSupport.setTerminateRequested( true );

	this.workerSupport.run(
		{
			params: {
				littleEndian: this.littleEndian
			},
			// there is currently no need to send any material properties or logging config to the Parser
			data: {
				input: data,
				options: null
			}
		}
	);
};


THREE.WorkerPCDLoader.Parser = function ( manager ) {

	THREE.PCDLoader.Parser.call( this );
	this.callbackBuilder = null;

};

THREE.WorkerPCDLoader.Parser.prototype = Object.create( THREE.PCDLoader.Parser.prototype );
THREE.WorkerPCDLoader.Parser.prototype.constructor = THREE.WorkerPCDLoader.Parser;


THREE.WorkerPCDLoader.Parser.prototype.setCallbackBuilder = function ( callbackBuilder ) {
	if ( callbackBuilder === null || callbackBuilder === undefined ) throw 'Unable to run as no "builder" callback is set.';
	this.callbackBuilder = callbackBuilder;
};

THREE.WorkerPCDLoader.Parser.prototype.buildMesh = function ( position, normal, color ) {
	var vertexFA = new Float32Array( position );
	var normalFA = normal.length > 0 ? new Float32Array( normal ) : null;
	var colorFA = color.length > 0 ? new Float32Array( color ) : null;

	var mesh = this.callbackBuilder( {
			cmd: 'meshData',
			progress: {
				numericalValue: 100
			},
			params: {},
			materials: {
				multiMaterial: false,
				materialNames: [ color.length > 0 ? 'defaultVertexColorMaterial' : 'defaultPointMaterial' ],
				materialGroups: null
			},
			buffers: {
				vertices: vertexFA,
				indices: null,
				colors: colorFA,
				normals: normalFA,
				uvs: null
			},
			// 0: mesh, 1: line, 2: point
			geometryType: 2
		},
		[ vertexFA.buffer ],
		null,
		colorFA !== null ? [ colorFA.buffer ] : null,
		normalFA !== null ? [ normalFA.buffer ] : null,
		null
	);

	return mesh;
}
