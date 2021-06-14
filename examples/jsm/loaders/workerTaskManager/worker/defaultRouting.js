/**
 * Development repository: https://github.com/kaisalmen/three-wtm
 */

class WorkerTaskManagerDefaultRouting {

	static comRouting ( context, message, object, initFunction, executeFunction ) {

		let payload = message.data;
		if ( payload.cmd === 'init' ) {

			if ( object !== undefined && object !== null ) {

				object[ initFunction ]( context, payload.workerId, payload.config );

			} else {

				initFunction( context, payload.workerId, payload.config );

			}

		} else if ( payload.cmd === 'execute' ) {

			if ( object !== undefined && object !== null ) {

				object[ executeFunction ]( context, payload.workerId, payload.config );

			} else {

				executeFunction( context, payload.workerId, payload.config );

			}

		}

	}

}

export { WorkerTaskManagerDefaultRouting }
