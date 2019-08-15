/**
 * @author Kai Salmen / https://kaisalmen.de
 * Development repository: https://github.com/kaisalmen/WWOBJLoader
 */

/**
 * These instructions are used by {WorkerExecutionSupport} to build code for the web worker or to assign code
 *
 * @param {boolean} supportsStandardWorker
 * @param {boolean} supportsJsmWorker
 * @constructor
 */
const CodeBuilderInstructions = function ( supportsStandardWorker, supportsJsmWorker, preferJsmWorker ) {
	this.supportsStandardWorker = supportsStandardWorker;
	this.supportsJsmWorker = supportsJsmWorker;
	this.preferJsmWorker = preferJsmWorker;
	this.startCode = '';
	this.codeFragments = [];
	this.importStatements = [];

	this.jsmWorkerFile = null;
	this.defaultGeometryType = 0;
};

CodeBuilderInstructions.prototype = {

	constructor: CodeBuilderInstructions,

	isSupportsStandardWorker: function () {
		return this.supportsStandardWorker;
	},

	isSupportsJsmWorker: function () {
		return this.supportsJsmWorker;
	},

	isPreferJsmWorker: function () {
		return this.preferJsmWorker;
	},

	/**
	 * Set the full path to the module that contains the worker code.
	 *
	 * @param {String} jsmWorkerFile
	 */
	setJsmWorkerFile: function ( jsmWorkerFile ) {
		if ( jsmWorkerFile !== undefined && jsmWorkerFile !== null ) {
			this.jsmWorkerFile = jsmWorkerFile;
		}
	},

	/**
	 * Add code that is contained in addition to fragments and libraries
	 * @param {String} startCode
	 */
	addStartCode: function ( startCode ) {
		this.startCode = startCode;
	},

	/**
	 * Add code fragment that is included in the provided order
	 * @param {String} code
	 */
	addCodeFragment: function ( code ) {
		this.codeFragments.push( code );
	},

	/**
	 * Add full path to a library that is contained at the start of the worker via "importScripts"
	 * @param {String} libraryPath
	 */
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
WorkerExecutionSupport.WORKER_SUPPORT_VERSION = '3.0.0-beta2';
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
			terminateWorkerOnLoad: true,
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

	/**
	 * Builds the worker code according the provided Instructions.
	 * If jsm worker code shall be built, then function may fall back to standard if lag is set
	 *
 	 * @param {CodeBuilderInstructions} codeBuilderInstructions
	 */
	buildWorker: function ( codeBuilderInstructions ) {
		let jsmSuccess = false;

		if ( codeBuilderInstructions.isSupportsJsmWorker() && codeBuilderInstructions.isPreferJsmWorker() ) {
			jsmSuccess = this._buildWorkerJsm( codeBuilderInstructions );
		}

		if ( ! jsmSuccess && codeBuilderInstructions.isSupportsStandardWorker() ) {

			this._buildWorkerStandard( codeBuilderInstructions );

		}
	},

	/**
	 *
	 * @param {CodeBuilderInstructions} codeBuilderInstructions
	 * @return {boolean} Whether loading of jsm worker was successful
	 * @private
	 */
	_buildWorkerJsm: function ( codeBuilderInstructions ) {
		let jsmSuccess = true;
		let timeLabel = 'buildWorkerJsm';
		let workerAvailable = this._buildWorkerCheckPreconditions( true, timeLabel );
		if ( ! workerAvailable ) {

			let workerFileUrl = new URL( codeBuilderInstructions.jsmWorkerFile, window.location.href ).href;
			try {

				let worker = new Worker( workerFileUrl, { type: "module" } );
				this._configureWorkerCommunication( worker, true, codeBuilderInstructions.defaultGeometryType, timeLabel );

			}
			catch ( e ) {

				jsmSuccess = false;
				// Chrome throws this exception, but Firefox currently does not complain, but can't execute the worker afterwards
				if ( e instanceof TypeError || e instanceof SyntaxError ) {

					console.error( "Modules are not supported in workers." );

				}
			}

		}

		return jsmSuccess;
	},

	/**
	 * Validate the status of worker code and the derived worker and specify functions that should be build when new raw mesh data becomes available and when the parser is finished.
	 *
	 * @param {CodeBuilderIns} buildWorkerCode The function that is invoked to create the worker code of the parser.
	 */

	/**
	 *
	 * @param {CodeBuilderInstructions} codeBuilderInstructions
	 * @private
	 */
	_buildWorkerStandard: function ( codeBuilderInstructions ) {
		let timeLabel = 'buildWorkerStandard';
		let workerAvailable = this._buildWorkerCheckPreconditions( false, timeLabel );
		if ( ! workerAvailable ) {

			let concatenateCode = '';
			codeBuilderInstructions.getImportStatements().forEach( function ( element ) {
				concatenateCode += element + '\n';
			} );
			concatenateCode += '\n';
			codeBuilderInstructions.getCodeFragments().forEach( function ( element ) {
				concatenateCode += element + '\n';
			} );
			concatenateCode += '\n';
			concatenateCode += codeBuilderInstructions.getStartCode();

			let blob = new Blob( [ concatenateCode ], { type: 'application/javascript' } );
			let worker = new Worker( window.URL.createObjectURL( blob ) );

			this._configureWorkerCommunication( worker, false, codeBuilderInstructions.defaultGeometryType, timeLabel );

		}
	},

	_buildWorkerCheckPreconditions: function ( requireJsmWorker, timeLabel ) {
		let workerAvailable = false;
		if ( this.isWorkerLoaded( requireJsmWorker ) ) {

			workerAvailable = true;

		} else {
			if ( this.logging.enabled ) {

				console.info( 'WorkerExecutionSupport: Building ' + ( requireJsmWorker ? 'jsm' : 'standard' ) + ' worker code...' );
				console.time( timeLabel );

			}

		}
		return workerAvailable;
	},

	_configureWorkerCommunication: function ( worker, haveJsmWorker, defaultGeometryType, timeLabel ) {
		this.worker.native = worker;
		this.worker.jsmWorker = haveJsmWorker;

		let scope = this;
		let scopedReceiveWorkerMessage = function ( event ) {
			scope._receiveWorkerMessage( event );
		};
		this.worker.native.onmessage = scopedReceiveWorkerMessage;
		if ( defaultGeometryType !== undefined && defaultGeometryType !== null ) {

			this.worker.workerRunner.defaultGeometryType = defaultGeometryType;
		}

		if ( this.logging.enabled ) {

			console.timeEnd( timeLabel );

		}
	},

	/**
	 * Returns if Worker code is available and complies with expectation.
	 * @param {boolean} requireJsmWorker
	 * @return {boolean|*}
	 */
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
		if ( this.worker.queuedMessage !== null ) {

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
