/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

// Imports only related to wrapper
import {
	CodeBuilderInstructions,
	WorkerExecutionSupport
} from "./obj2/worker/main/WorkerExecutionSupport.js";
import { CodeSerializer } from "./obj2/utils/CodeSerializer.js";
import { OBJLoader2 } from "./OBJLoader2.js";

// Imports only related to worker (when standard workers (modules aren't supported) are used)
import { OBJLoader2Parser } from "./obj2/worker/parallel/OBJLoader2Parser.js";
import { ObjectManipulator } from "./obj2/utils/ObjectManipulator.js";
import {
	WorkerRunner,
	DefaultWorkerPayloadHandler
} from "./obj2/worker/parallel/WorkerRunner.js";

/**
 * Extends {OBJLoader2} with the capability to run the parser {OBJLoader2Parser} in web worker
 * with help of {WorkerExecutionSupport}.
 *
 * @param [LoadingManager] manager
 * @constructor
 */
const OBJLoader2Parallel = function ( manager ) {
	OBJLoader2.call( this, manager );
	this.preferJsmWorker = false;

	this.callbacks.onParseComplete = null;
	this.executeParallel = true;
	this.workerExecutionSupport = new WorkerExecutionSupport();
};
OBJLoader2Parallel.prototype = Object.create( OBJLoader2.prototype );
OBJLoader2Parallel.prototype.constructor = OBJLoader2Parallel;

OBJLoader2.OBJLOADER2_PARALLEL_VERSION = '3.0.0-beta2';
console.info( 'Using OBJLoader2Parallel version: ' + OBJLoader2.OBJLOADER2_PARALLEL_VERSION );


OBJLoader2Parallel.prototype.setPreferJsmWorker = function ( preferJsmWorker ) {
	this.preferJsmWorker = preferJsmWorker === true;
	return this;
};

/**
 * If this call back is not set, then the completion message from worker will not be received.
 *
 * @param {function} onParseComplete
 * @return {OBJLoader2Parallel}
 */
OBJLoader2Parallel.prototype.setCallbackOnParseComplete = function ( onParseComplete ) {
	if ( onParseComplete !== undefined && onParseComplete !== null ) {
		this.callbacks.onParseComplete = onParseComplete;
	}
	return this;
};

/**
 * Execution of parse in parallel via Worker is default, but normal {OBJLoader2} parsing can be enforced via false here.
 *
 * @param executeParallel
 * @return {OBJLoader2Parallel}
 */
OBJLoader2Parallel.prototype.setExecuteParallel = function ( executeParallel ) {
	this.executeParallel = executeParallel === true;
	return this;
};

/**
 * Allow to get hold of {WorkerExecutionSupport} for configuratin purposes
 *
 * @return {WorkerExecutionSupport|WorkerExecutionSupport}
 */
OBJLoader2Parallel.prototype.getWorkerExecutionSupport = function () {
	return this.workerExecutionSupport;
};

/**
 * Provides instructions on what is to be contained in the worker
 *
 * @return {CodeBuilderInstructions}
 */
OBJLoader2Parallel.prototype.buildWorkerCode = function () {
	let codeBuilderInstructions = new CodeBuilderInstructions( true, true, this.preferJsmWorker );
	if ( codeBuilderInstructions.isSupportsJsmWorker() ) {

		codeBuilderInstructions.setJsmWorkerFile( '../../src/loaders/worker/parallel/jsm/OBJLoader2Worker.js' );

	}
	if ( codeBuilderInstructions.isSupportsStandardWorker() ) {

		let codeOBJLoader2Parser = CodeSerializer.serializeClass( 'OBJLoader2Parser', OBJLoader2Parser );
		let codeObjectManipulator = CodeSerializer.serializeObject( 'ObjectManipulator', ObjectManipulator );
		let codeParserPayloadHandler = CodeSerializer.serializeClass( 'DefaultWorkerPayloadHandler', DefaultWorkerPayloadHandler );
		let codeWorkerRunner = CodeSerializer.serializeClass( 'WorkerRunner', WorkerRunner );

		codeBuilderInstructions.addCodeFragment( codeOBJLoader2Parser );
		codeBuilderInstructions.addCodeFragment( codeObjectManipulator );
		codeBuilderInstructions.addCodeFragment( codeParserPayloadHandler );
		codeBuilderInstructions.addCodeFragment( codeWorkerRunner );

		// allows to include full libraries as importScripts
//		codeBuilderInstructions.addLibraryImport( '../../node_modules/three/build/three.js' );
		codeBuilderInstructions.addStartCode( 'new WorkerRunner( new DefaultWorkerPayloadHandler( new OBJLoader2Parser() ) );' );

	}
	return codeBuilderInstructions;
};

/**
 * @private
 */
OBJLoader2Parallel.prototype._configure = function () {
	if ( this.callbacks.onParseComplete === null ) {
		throw "No callbackOnLoad was provided! Aborting!";
	}
	// check if worker is already available and if so, then fast-fail
	if ( this.workerExecutionSupport.isWorkerLoaded( this.preferJsmWorker ) ) return;

	this.workerExecutionSupport.buildWorker( this.buildWorkerCode() );

	let scope = this;
	let scopedOnAssetAvailable = function ( payload ) {
		scope._onAssetAvailable( payload );
	};

	this.workerExecutionSupport.updateCallbacks( scopedOnAssetAvailable, this.callbacks.onParseComplete );
};

/**
 * Load is intercepted from {OBJLoader2}. It replaces the regular onLoad callback as the final worker result will be
 * returned later by its own callbackOnLoad.
 *
 * @param {string}  url A string containing the path/URL of the file to be loaded.
 * @param {function} onLoad A function to be called after loading is successfully completed. The function receives loaded Object3D as an argument.
 * @param {function} [onFileLoadProgress] A function to be called while the loading is in progress. The argument will be the XMLHttpRequest instance, which contains total and Integer bytes.
 * @param {function} [onError] A function to be called if an error occurs during loading. The function receives the error as an argument.
 * @param {function} [onMeshAlter] Called after worker successfully delivered a single mesh
 */
OBJLoader2Parallel.prototype.load = function( content, onLoad, onFileLoadProgress, onError, onMeshAlter ) {
	this.setCallbackOnParseComplete( onLoad );

	OBJLoader2.prototype.load.call( this, content, function () {}, onFileLoadProgress, onError, onMeshAlter );
};

/**
 * Parses OBJ data in parallel with web worker.
 *
 * @param {arraybuffer} content OBJ data as Uint8Array or String
 */
OBJLoader2Parallel.prototype.parse = function( content ) {
	if ( this.executeParallel ) {

		this._configure();

		this.workerExecutionSupport.executeParallel(
			{
				params: {
					modelName: this.modelName,
					instanceNo: this.instanceNo,
					useIndices: this.useIndices,
					disregardNormals: this.disregardNormals,
					materialPerSmoothingGroup: this.materialPerSmoothingGroup,
					useOAsMesh: this.useOAsMesh,
				},
				materials: this.materialHandler.getMaterialsJSON(),
				data: {
					input: content,
					options: null
				},
				logging: {
					enabled: this.logging.enabled,
					debug: this.logging.debug
				}
			} );

	} else {

		this.callbacks.onParseComplete( OBJLoader2.prototype.parse.call( this, content ) );

	}
};

export { OBJLoader2Parallel }
