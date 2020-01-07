export namespace ObjectManipulator {

	export function applyProperties( objToAlter: object, params: object, forceCreation: boolean ): void;

}

export class DefaultWorkerPayloadHandler {

	constructor( parser: object );
	logging: {
		enabled: boolean;
		debug: boolean;
	};
	parser: object;

	handlePayload( payload: object ): void;

}

export class WorkerRunner {

	constructor( payloadHandler: object );
	payloadHandler: object;

	processMessage( payload: object ): void;

}
