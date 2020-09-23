/**
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

// Imports only related to wrapper
import {
	Object3D
} from "../../../build/three.module.js";
import {
	CodeBuilderInstructions,
	WorkerExecutionSupport
} from "./obj2/worker/main/WorkerExecutionSupport.js";
import { CodeSerializer } from "./obj2/utils/CodeSerializer.js";
import { OBJLoader2 } from "./OBJLoader2.js";

// Imports only related to worker (when standard workers (modules aren't supported) are used)
import { OBJLoader2Parser } from "./obj2/OBJLoader2Parser.js";
import {
	WorkerRunner,
	DefaultWorkerPayloadHandler,
	ObjectManipulator
} from "./obj2/worker/parallel/WorkerRunner.js";


/**
 * Creates a new OBJLoader2Parallel. Use it to load OBJ data from files or to parse OBJ data from arraybuffer.
 * It extends {@link OBJLoader2} with the capability to run the parser in a web worker.
 *
 * @param [LoadingManager] manager The loadingManager for the loader to use. Default is {@link LoadingManager}
 * @constructor
 */
const OBJLoader2Parallel = function ( manager ) {

	OBJLoader2.call( this, manager );
	this.preferJsmWorker = false;
	this.jsmWorkerUrl = null;

	this.executeParallel = true;
	this.workerExecutionSupport = new WorkerExecutionSupport();

};

OBJLoader2Parallel.OBJLOADER2_PARALLEL_VERSION = '3.2.0';
console.info( 'Using OBJLoader2Parallel version: ' + OBJLoader2Parallel.OBJLOADER2_PARALLEL_VERSION );
OBJLoader2Parallel.DEFAULT_JSM_WORKER_PATH = './jsm/loaders/obj2/worker/parallel/OBJLoader2JsmWorker.js';

OBJLoader2Parallel.prototype = Object.assign( Object.create( OBJLoader2.prototype ), {

	constructor: OBJLoader2Parallel,

	/**
	 * Execution of parse in parallel via Worker is default, but normal {OBJLoader2} parsing can be enforced via false here.
	 *
	 * @param {boolean} executeParallel True or False
	 * @return {OBJLoader2Parallel}
	 */
	setExecuteParallel: function ( executeParallel ) {

		this.executeParallel = executeParallel === true;
		return this;

	},

	/**
	 * Set whether jsm modules in workers should be used. This requires browser support which is currently only experimental.
	 * @param {boolean} preferJsmWorker True or False
	 * @param {URL} jsmWorkerUrl Provide complete jsm worker URL otherwise relative path to this module may not be correct
	 * @return {OBJLoader2Parallel}
	 */
	setJsmWorker: function ( preferJsmWorker, jsmWorkerUrl ) {

		this.preferJsmWorker = preferJsmWorker === true;

		if ( jsmWorkerUrl === undefined || jsmWorkerUrl === null ) {

			throw "The url to the jsm worker is not valid. Aborting...";

		}

		this.jsmWorkerUrl = jsmWorkerUrl;

		return this;

	},

	/**
	 * Allow to get hold of {@link WorkerExecutionSupport} for configuration purposes.
	 * @return {WorkerExecutionSupport}
	 */
	getWorkerExecutionSupport: function () {

		return this.workerExecutionSupport;

	},

	/**
	 * Provide instructions on what is to be contained in the worker.
	 * @return {CodeBuilderInstructions}
	 */
	buildWorkerCode: function () {

		let codeBuilderInstructions = new CodeBuilderInstructions( true, true, this.preferJsmWorker );

		if ( codeBuilderInstructions.isSupportsJsmWorker() ) {

			codeBuilderInstructions.setJsmWorkerUrl( this.jsmWorkerUrl );

		}

		if ( codeBuilderInstructions.isSupportsStandardWorker() ) {

			let objectManipulator = new ObjectManipulator();
			let defaultWorkerPayloadHandler = new DefaultWorkerPayloadHandler( this.parser );
			let workerRunner = new WorkerRunner( {} );
			codeBuilderInstructions.addCodeFragment( CodeSerializer.serializeClass( OBJLoader2Parser, this.parser ) );
			codeBuilderInstructions.addCodeFragment( CodeSerializer.serializeClass( ObjectManipulator, objectManipulator ) );
			codeBuilderInstructions.addCodeFragment( CodeSerializer.serializeClass( DefaultWorkerPayloadHandler, defaultWorkerPayloadHandler ) );
			codeBuilderInstructions.addCodeFragment( CodeSerializer.serializeClass( WorkerRunner, workerRunner ) );

			let startCode = 'new ' + workerRunner.constructor.name + '( new ' + defaultWorkerPayloadHandler.constructor.name + '( new ' + this.parser.constructor.name + '() ) );';
			codeBuilderInstructions.addStartCode( startCode );

		}

		return codeBuilderInstructions;

	},

	/**
	 * See {@link OBJLoader2.load}
	 */
	load: function ( content, onLoad, onFileLoadProgress, onError, onMeshAlter ) {

 		let scope = this;
		function interceptOnLoad( object3d, message ) {

			if ( object3d.name === 'OBJLoader2ParallelDummy' ) {

				if ( scope.parser.logging.enabled && scope.parser.logging.debug ) {

					console.debug( 'Received dummy answer from OBJLoader2Parallel#parse' );

				}

			} else {

				onLoad( object3d, message );

			}

		}

		OBJLoader2.prototype.load.call( this, content, interceptOnLoad, onFileLoadProgress, onError, onMeshAlter );

	},

	/**
	 * See {@link OBJLoader2.parse}
	 * The callback onLoad needs to be set to be able to receive the content if used in parallel mode.
	 * Fallback is possible via {@link OBJLoader2Parallel#setExecuteParallel}.
	 */
	parse: function ( content ) {

		if ( this.executeParallel ) {

			if ( this.parser.callbacks.onLoad === this.parser._onLoad ) {

				throw "No callback other than the default callback was provided! Aborting!";

			}

			// check if worker has been initialize before. If yes, skip init
			if ( ! this.workerExecutionSupport.isWorkerLoaded( this.preferJsmWorker ) ) {

				this.workerExecutionSupport.buildWorker( this.buildWorkerCode() );

				let scope = this;
				let scopedOnAssetAvailable = function ( payload ) {

					scope._onAssetAvailable( payload );

				};

				function scopedOnLoad( message ) {

					scope.parser.callbacks.onLoad( scope.baseObject3d, message );

				}

				this.workerExecutionSupport.updateCallbacks( scopedOnAssetAvailable, scopedOnLoad );

			}

			// Create default materials beforehand, but do not override previously set materials (e.g. during init)
			this.materialHandler.createDefaultMaterials( false );

			this.workerExecutionSupport.executeParallel(
				{
					params: {
						modelName: this.modelName,
						instanceNo: this.instanceNo,
						useIndices: this.parser.useIndices,
						disregardNormals: this.parser.disregardNormals,
						materialPerSmoothingGroup: this.parser.materialPerSmoothingGroup,
						useOAsMesh: this.parser.useOAsMesh,
						materials: this.materialHandler.getMaterialsJSON()
					},
					data: {
						input: content,
						options: null
					},
					logging: {
						enabled: this.parser.logging.enabled,
						debug: this.parser.logging.debug
					}
				} );

			let dummy = new Object3D();
			dummy.name = 'OBJLoader2ParallelDummy';
			return dummy;

		} else {

			return OBJLoader2.prototype.parse.call( this, content );

		}

	},

} );

export { OBJLoader2Parallel };
