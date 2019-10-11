import { OBJLoader2Parser } from './OBJLoader2Parser';

export class DefaultWorkerPayloadHandler {

	constructor( parser: OBJLoader2Parser );
	logging: {
		enabled: boolean;
		debug: boolean;
	};
	parser: OBJLoader2Parser;

	handlePayload( payload: object ): void;

}

export class WorkerRunner {

	constructor( payloadHandler: object );
	logging: {
		enabled: boolean;
		debug: boolean;
	};
	resourceDescriptors: OBJLoader2Parser;
	payloadHandler: object;

	processMessage( payload: object ): void;

}
