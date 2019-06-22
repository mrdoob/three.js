/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

const CodeBuilderInstructions = function () {
	this.startCode = '';
	this.codeFragments = [];
	this.importStatements = [];
	this.jsmWorkerFile;
	this.jsmWorker = false;
	this.defaultGeometryType = 0;
};

CodeBuilderInstructions.prototype = {

	constructor: CodeBuilderInstructions,

	setJsmWorkerFile: function ( jsmWorkerFile ) {
		this.jsmWorkerFile = jsmWorkerFile;
	},

	setJsmWorker: function ( jsmWorker ) {
		this.jsmWorker = jsmWorker;
	},

	isJsmWorker: function () {
		return this.jsmWorker;
	},

	addStartCode: function ( startCode ) {
		this.startCode = startCode;
	},

	addCodeFragment: function ( code ) {
		this.codeFragments.push( code );
	},

	addLibraryImport: function ( libraryPath ) {
		let libraryUrl = new URL( libraryPath, window.location.href ).href;
		let code = 'importScripts( "' + libraryUrl + '" );';
		this.importStatements.push(	code );
	},

	getImportStatements: function () {
		return this.importStatements;
	},

	getCodeFragments: function () {
		return this.codeFragments;
	},

	getStartCode: function () {
		return this.startCode;
	}

};
/**
 * This class provides means to transform existing parser code into a web worker. It defines a simple communication protocol
 * which allows to configure the worker and receive raw mesh data during execution.
 * @class
 */
const WorkerExecutionSupport = function () {
	// check worker support first
	if ( window.Worker === undefined ) throw "This browser does not support web workers!";
	if ( window.Blob === undefined ) throw "This browser does not support Blob!";
	if ( typeof window.URL.createObjectURL !== 'function' ) throw "This browser does not support Object creation from URL!";

	this._reset();
};
WorkerExecutionSupport.WORKER_SUPPORT_VERSION = '3.0.0-preview';
console.info( 'Using WorkerSupport version: ' + WorkerExecutionSupport.WORKER_SUPPORT_VERSION );


WorkerExecutionSupport.prototype = {

	constructor: WorkerExecutionSupport,

	_reset: function () {
		this.logging = {
			enabled: true,
			debug: false
		};

		let scope = this;
		let scopeTerminate = function (  ) {
			scope._terminate();
		};
		this.worker = {
			native: null,
			jsmWorker: false,
			logging: true,
			workerRunner: {
				name: 'WorkerRunner',
				usesMeshDisassembler: false,
				defaultGeometryType: 0
			},
			terminateWorkerOnLoad: false,
			forceWorkerDataCopy: false,
			started: false,
			queuedMessage: null,
			callbacks: {
				onAssetAvailable: null,
				onLoad: null,
				terminate: scopeTerminate
			}
		};
	},

	/**
	 * Enable or disable logging in general (except warn and error), plus enable or disable debug logging.
	 *
	 * @param {boolean} enabled True or false.
	 * @param {boolean} debug True or false.
	 */
	setLogging: function ( enabled, debug ) {
		this.logging.enabled = enabled === true;
		this.logging.debug = debug === true;
		this.worker.logging = enabled === true;
		return this;
	},

	/**
	 * Forces all ArrayBuffers to be transferred to worker to be copied.
	 *
	 * @param {boolean} forceWorkerDataCopy True or false.
	 */
	setForceWorkerDataCopy: function ( forceWorkerDataCopy ) {
		this.worker.forceWorkerDataCopy = forceWorkerDataCopy === true;
		return this;
	},

	/**
	 * Request termination of worker once parser is finished.
	 *
	 * @param {boolean} terminateWorkerOnLoad True or false.
	 */
	setTerminateWorkerOnLoad: function ( terminateWorkerOnLoad ) {
		this.worker.terminateWorkerOnLoad = terminateWorkerOnLoad === true;
		if ( this.worker.terminateWorkerOnLoad && this.isWorkerLoaded( this.worker.jsmWorker ) &&
				this.worker.queuedMessage === null && this.worker.started ) {

			if ( this.logging.enabled ) {

				console.info( 'Worker is terminated immediately as it is not running!' );

			}
			this._terminate();

		}
		return this;
	},

	/**
	 * Update all callbacks.
	 *
	 * @param {Function} onAssetAvailable The function for processing the data, e.g. {@link MeshReceiver}.
	 * @param {Function} [onLoad] The function that is called when parsing is complete.
	 */
	updateCallbacks: function ( onAssetAvailable, onLoad ) {
		if ( onAssetAvailable !== undefined && onAssetAvailable !== null ) {

			this.worker.callbacks.onAssetAvailable = onAssetAvailable;

		}
		if ( onLoad !== undefined && onLoad !== null ) {

			this.worker.callbacks.onLoad = onLoad;

		}
		this._verifyCallbacks();
	},

	_verifyCallbacks: function () {
		if ( this.worker.callbacks.onAssetAvailable === undefined || this.worker.callbacks.onAssetAvailable === null ) {

			throw 'Unable to run as no "onAssetAvailable" callback is set.';

		}
	},

	buildWorkerJsm: function ( codeBuilderInstructions ) {
		let jsmSuccess = true;
		this._buildWorkerCheckPreconditions( true, 'buildWorkerJsm' );

		let workerFileUrl = new URL( codeBuilderInstructions.jsmWorkerFile, window.location.href ).href;
		try {

			let worker = new Worker( workerFileUrl, { type: "module" } );
			codeBuilderInstructions.setJsmWorker( true );

			this._configureWorkerCommunication( worker, codeBuilderInstructions, 'buildWorkerJsm' );

		}
		catch ( e ) {

			jsmSuccess = false;
			if ( e instanceof TypeError || e instanceof  SyntaxError ) {

				console.error( "Modules are not supported in workers." );

			}
		}

		return jsmSuccess;
	},

	/**
	 * Validate the status of worker code and the derived worker and specify functions that should be build when new raw mesh data becomes available and when the parser is finished.
	 *
	 * @param {CodeBuilderIns} buildWorkerCode The function that is invoked to create the worker code of the parser.
	 */
	buildWorkerStandard: function ( codeBuilderInstructions ) {
		this._buildWorkerCheckPreconditions( false,'buildWorkerStandard' );

		let concatenateCode = '';
		codeBuilderInstructions.getImportStatements().forEach( function ( element ) {
			concatenateCode += element + '\n';
		} );
		concatenateCode += '\n';
		codeBuilderInstructions.getCodeFragments().forEach( function ( element ) {
			concatenateCode += element+ '\n';
		} );
		concatenateCode += '\n';
		concatenateCode += codeBuilderInstructions.getStartCode();

		let blob = new Blob( [ concatenateCode ], { type: 'application/javascript' } );
		let worker = new Worker( window.URL.createObjectURL( blob ) );
		codeBuilderInstructions.setJsmWorker( false );

		this._configureWorkerCommunication( worker, codeBuilderInstructions, 'buildWorkerStandard' );
	},

	_buildWorkerCheckPreconditions: function ( requireJsmWorker, timeLabel ) {
		if ( this.isWorkerLoaded( requireJsmWorker ) ) return;

		if ( this.logging.enabled ) {

			console.info( 'WorkerExecutionSupport: Building ' + ( requireJsmWorker ? 'jsm' : 'standard' ) + ' worker code...' );
			console.time( timeLabel );

		}
	},

	_configureWorkerCommunication: function ( worker, codeBuilderInstructions, timeLabel ) {
		this.worker.native = worker;
		this.worker.jsmWorker = codeBuilderInstructions.isJsmWorker();

		let scope = this;
		let scopedReceiveWorkerMessage = function ( event ) {
			scope._receiveWorkerMessage( event );
		};
		this.worker.native.onmessage = scopedReceiveWorkerMessage;
		if ( codeBuilderInstructions.defaultGeometryType !== undefined && codeBuilderInstructions.defaultGeometryType !== null ) {

			this.worker.workerRunner.defaultGeometryType = codeBuilderInstructions.defaultGeometryType;
		}

		if ( this.logging.enabled ) {

			console.timeEnd( timeLabel );

		}
	},

	isWorkerLoaded: function ( requireJsmWorker ) {
		return this.worker.native !== null &&
			( ( requireJsmWorker && this.worker.jsmWorker ) || ( ! requireJsmWorker && ! this.worker.jsmWorker ) );
	},

	/**
	 * Executed in worker scope
	 */
	_receiveWorkerMessage: function ( event ) {
		let payload = event.data;
		let workerRunnerName = this.worker.workerRunner.name;

		switch ( payload.cmd ) {
			case 'assetAvailable':
				this.worker.callbacks.onAssetAvailable( payload );
				break;

			case 'completeOverall':
				this.worker.queuedMessage = null;
				this.worker.started = false;
				if ( this.worker.callbacks.onLoad !== null ) {

					this.worker.callbacks.onLoad( payload.msg );

				}
				if ( this.worker.terminateWorkerOnLoad ) {

					if ( this.worker.logging.enabled ) console.info( 'WorkerSupport [' + workerRunnerName + ']: Run is complete. Terminating application on request!' );
					this.worker.callbacks.terminate();

				}
				break;

			case 'error':
				console.error( 'WorkerSupport [' + workerRunnerName + ']: Reported error: ' + payload.msg );
				this.worker.queuedMessage = null;
				this.worker.started = false;
				if ( this.worker.callbacks.onLoad !== null ) {

					this.worker.callbacks.onLoad( payload.msg );

				}
				if ( this.worker.terminateWorkerOnLoad ) {

					if ( this.worker.logging.enabled ) console.info( 'WorkerSupport [' + workerRunnerName + ']: Run reported error. Terminating application on request!' );
					this.worker.callbacks.terminate();

				}
				break;

			default:
				console.error( 'WorkerSupport [' + workerRunnerName + ']: Received unknown command: ' + payload.cmd );
				break;

		}
	},

	/**
	 * Runs the parser with the provided configuration.
	 *
	 * @param {Object} payload Raw mesh description (buffers, params, materials) used to build one to many meshes.
	 */
	executeParallel: function( payload, transferables ) {
		payload.cmd = 'parse';
		payload.usesMeshDisassembler = this.worker.workerRunner.usesMeshDisassembler;
		payload.defaultGeometryType = this.worker.workerRunner.defaultGeometryType;
		if ( ! this._verifyWorkerIsAvailable( payload, transferables ) ) return;

		this._postMessage();
	},

	_verifyWorkerIsAvailable: function ( payload, transferables ) {
		this._verifyCallbacks();
		let ready = true;
		if ( this.worker.queuedMessage !== null ) {

			console.warn( 'Already processing message. Rejecting new run instruction' );
			ready = false;

		} else {

			this.worker.queuedMessage = {
				payload: payload,
				transferables: ( transferables === undefined || transferables === null ) ? [] : transferables
			};
			this.worker.started = true;

		}
		return ready;
	},

	_postMessage: function () {
		if ( this.worker.queuedMessage !== null && this.isWorkerLoaded( this.worker.jsmWorker ) ) {

			if ( this.worker.queuedMessage.payload.data.input instanceof ArrayBuffer ) {

				let transferables = [];
				if ( this.worker.forceWorkerDataCopy ) {

					transferables.push( this.worker.queuedMessage.payload.data.input.slice( 0 ) );

				} else {

					transferables.push( this.worker.queuedMessage.payload.data.input );

				}
				if ( this.worker.queuedMessage.transferables.length > 0 ) {

					transferables = transferables.concat( this.worker.queuedMessage.transferables );

				}
				this.worker.native.postMessage( this.worker.queuedMessage.payload, transferables );

			} else {

				this.worker.native.postMessage( this.worker.queuedMessage.payload );

			}

		}
	},

	_terminate: function () {
		this.worker.native.terminate();
		this._reset();
	}
};

export {
	CodeBuilderInstructions,
	WorkerExecutionSupport
}
