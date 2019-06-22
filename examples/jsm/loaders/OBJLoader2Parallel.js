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
 *
 * @param [LoadingManager] manager

 * @constructor
 */
const OBJLoader2Parallel = function ( manager ) {
	OBJLoader2.call( this, manager );
	this.useJsmWorker = false;

	this.callbackOnLoad = null;
	this.executeParallel = true;
	this.workerExecutionSupport = new WorkerExecutionSupport();
};
OBJLoader2.OBJLOADER2_PARALLEL_VERSION = '3.0.0-beta2';
console.info( 'Using OBJLoader2Parallel version: ' + OBJLoader2.OBJLOADER2PARALLEL_VERSION );

OBJLoader2Parallel.prototype = Object.create( OBJLoader2.prototype );
OBJLoader2Parallel.prototype.constructor = OBJLoader2Parallel;

OBJLoader2Parallel.prototype.setUseJsmWorker = function ( useJsmWorker ) {
	this.useJsmWorker = useJsmWorker === true;
	return this;
};

OBJLoader2Parallel.prototype.setCallbackOnLoad = function ( callbackOnLoad ) {
	if ( callbackOnLoad !== undefined && callbackOnLoad !== null ) {
		this.callbackOnLoad = callbackOnLoad;
	}
	else {

		throw "No callbackOnLoad was provided! Aborting!"

	}
	return this;
};

OBJLoader2Parallel.prototype.setExecuteParallel = function ( executeParallel ) {
	this.executeParallel = executeParallel === true;
	return this;
};

OBJLoader2Parallel.prototype.getWorkerExecutionSupport = function () {
	return this.workerExecutionSupport;
};

OBJLoader2Parallel.prototype._configure = function () {
	if ( this.callbackOnLoad === null ) {
		"No callbackOnLoad was provided! Aborting!"
	}

	// check if worker is already available and if so, then fast-fail
	if ( this.workerExecutionSupport.isWorkerLoaded( this.useJsmWorker ) ) return;

	let codeBuilderInstructions = new CodeBuilderInstructions();

	let jsmSuccess = false;
	if ( this.useJsmWorker ) {

		codeBuilderInstructions.setJsmWorkerFile( '../../src/loaders/worker/parallel/jsm/OBJLoader2Worker.js' );
		jsmSuccess = this.workerExecutionSupport.buildWorkerJsm( codeBuilderInstructions );
	}

	if ( ! jsmSuccess ) {

		let codeOBJLoader2Parser = CodeSerializer.serializeClass( 'OBJLoader2Parser', OBJLoader2Parser );
		let codeObjectManipulator = CodeSerializer.serializeObject( 'ObjectManipulator', ObjectManipulator );
		let codeParserPayloadHandler = CodeSerializer.serializeClass( 'DefaultWorkerPayloadHandler', DefaultWorkerPayloadHandler );
		let codeWorkerRunner = CodeSerializer.serializeClass( 'WorkerRunner', WorkerRunner );

		codeBuilderInstructions.addCodeFragment( codeOBJLoader2Parser );
		codeBuilderInstructions.addCodeFragment( codeObjectManipulator );
		codeBuilderInstructions.addCodeFragment( codeParserPayloadHandler );
		codeBuilderInstructions.addCodeFragment( codeWorkerRunner );

//		codeBuilderInstructions.addLibraryImport( '../../node_modules/three/build/three.js' );
		codeBuilderInstructions.addStartCode( 'new WorkerRunner( new DefaultWorkerPayloadHandler( new OBJLoader2Parser() ) );' );

		this.workerExecutionSupport.buildWorkerStandard( codeBuilderInstructions );

	}
	let scope = this;
	let scopedOnAssetAvailable = function ( payload ) {
		scope._onAssetAvailable( payload );
	};

	this.workerExecutionSupport.updateCallbacks( scopedOnAssetAvailable, this.callbackOnLoad );
};

/**
 * Load is intercepted from OBJLoader2.
 * @inheritDoc
 */
OBJLoader2Parallel.prototype.load = function( content, onLoad, onFileLoadProgress, onError, onMeshAlter ) {
	this.setCallbackOnLoad( onLoad );

	OBJLoader2.prototype.load.call( this, content, function () {}, onFileLoadProgress, onError, onMeshAlter );

};

/**
 * @inheritDoc
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

		this.callbackOnLoad( OBJLoader2.prototype.parse.call( this, content ) );

	}
};

export { OBJLoader2Parallel }
