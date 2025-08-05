/**
 * A simple pool for managing Web Workers.
 *
 * @three_import import { WorkerPool } from 'three/addons/utils/WorkerPool.js';
 */
export class WorkerPool {

	/**
	 * Constructs a new Worker pool.
	 *
	 * @param {number} [pool=4] - The size of the pool.
	 */
	constructor( pool = 4 ) {

		/**
		 * The size of the pool.
		 *
		 * @type {number}
		 * @default 4
		 */
		this.pool = pool;

		/**
		 * A message queue.
		 *
		 * @type {Array<Object>}
		 */
		this.queue = [];

		/**
		 * An array of Workers.
		 *
		 * @type {Array<Worker>}
		 */
		this.workers = [];

		/**
		 * An array with resolve functions for messages.
		 *
		 * @type {Array<Function>}
		 */
		this.workersResolve = [];

		/**
		 * The current worker status.
		 *
		 * @type {number}
		 */
		this.workerStatus = 0;

		/**
		 * A factory function for creating workers.
		 *
		 * @type {?Function}
		 */
		this.workerCreator = null;

	}

	_initWorker( workerId ) {

		if ( ! this.workers[ workerId ] ) {

			const worker = this.workerCreator();
			worker.addEventListener( 'message', this._onMessage.bind( this, workerId ) );
			this.workers[ workerId ] = worker;

		}

	}

	_getIdleWorker() {

		for ( let i = 0; i < this.pool; i ++ )
			if ( ! ( this.workerStatus & ( 1 << i ) ) ) return i;

		return - 1;

	}

	_onMessage( workerId, msg ) {

		const resolve = this.workersResolve[ workerId ];
		resolve && resolve( msg );

		if ( this.queue.length ) {

			const { resolve, msg, transfer } = this.queue.shift();
			this.workersResolve[ workerId ] = resolve;
			this.workers[ workerId ].postMessage( msg, transfer );

		} else {

			this.workerStatus ^= 1 << workerId;

		}

	}

	/**
	 * Sets a function that is responsible for creating Workers.
	 *
	 * @param {Function} workerCreator - The worker creator function.
	 */
	setWorkerCreator( workerCreator ) {

		this.workerCreator = workerCreator;

	}

	/**
	 * Sets the Worker limit
	 *
	 * @param {number} pool - The size of the pool.
	 */
	setWorkerLimit( pool ) {

		this.pool = pool;

	}

	/**
	 * Post a message to an idle Worker. If no Worker is available,
	 * the message is pushed into a message queue for later processing.
	 *
	 * @param {Object} msg - The message.
	 * @param {Array<ArrayBuffer>} transfer - An array with array buffers for data transfer.
	 * @return {Promise} A Promise that resolves when the message has been processed.
	 */
	postMessage( msg, transfer ) {

		return new Promise( ( resolve ) => {

			const workerId = this._getIdleWorker();

			if ( workerId !== - 1 ) {

				this._initWorker( workerId );
				this.workerStatus |= 1 << workerId;
				this.workersResolve[ workerId ] = resolve;
				this.workers[ workerId ].postMessage( msg, transfer );

			} else {

				this.queue.push( { resolve, msg, transfer } );

			}

		} );

	}

	/**
	 * Terminates all Workers of this pool. Call this  method whenever this
	 * Worker pool is no longer used in your app.
	 */
	dispose() {

		this.workers.forEach( ( worker ) => worker.terminate() );
		this.workersResolve.length = 0;
		this.workers.length = 0;
		this.queue.length = 0;
		this.workerStatus = 0;

	}

}
