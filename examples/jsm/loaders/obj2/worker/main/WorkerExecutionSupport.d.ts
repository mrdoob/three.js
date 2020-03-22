export class CodeBuilderInstructions {

	constructor( supportsStandardWorker: boolean, supportsJsmWorker: boolean, preferJsmWorker: boolean );
	supportsStandardWorker: boolean;
	supportsJsmWorker: boolean;
	preferJsmWorker: boolean;
	startCode: string;
	codeFragments: string[];
	importStatements: string[];
	jsmWorkerFile: string;
	defaultGeometryType: number;

	isSupportsStandardWorker(): boolean;
	isSupportsJsmWorker(): boolean;
	isPreferJsmWorker(): boolean;
	setJsmWorkerUrl( jsmWorkerUrl: string ): void;
	addStartCode( startCode: string ): void;
	addCodeFragment( code: string ): void;
	addLibraryImport( libraryPath: string ): void;
	getImportStatements(): string[];
	getCodeFragments(): string[];
	getStartCode(): string;

}

export class WorkerExecutionSupport {

	constructor();

	logging: {
		enabled: boolean;
		debug: boolean;
	};

	worker: {
		native: Worker;
		jsmWorker: boolean;
		logging: boolean;
		workerRunner: {
			name: string;
			usesMeshDisassembler: boolean;
			defaultGeometryType: number;
		};
		terminateWorkerOnLoad: boolean;
		forceWorkerDataCopy: boolean;
		started: boolean;
		queuedMessage: object;
		callbacks: {
			onAssetAvailable: Function;
			onLoad: Function;
			terminate: Function;
		};
	};

	setLogging( enabled: boolean, debug: boolean ): this;
	setForceWorkerDataCopy( forceWorkerDataCopy: boolean ): this;
	setTerminateWorkerOnLoad( terminateWorkerOnLoad: boolean ): this;
	updateCallbacks( onAssetAvailable: Function, onLoad: Function ): void;
	buildWorker( codeBuilderInstructions: CodeBuilderInstructions ): void;
	isWorkerLoaded( requireJsmWorker: boolean ): boolean;
	executeParallel( payload:object, transferables?: object[] );

}
