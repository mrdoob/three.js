/**
 * @author Deepkolos / https://github.com/deepkolos
 */

export class WorkerPool {

  constructor (pool = 4 ) {

    this.pool = pool;
    this.quene = [];
    this.workers = [];
    this.workersResolve = [];
    this.workerStatus = 0;

  }

  setWorkerLimit ( pool ) {

    this.pool = pool;

  }

  initWorkers ( creator ) {

    for ( let i = 0; i < this.pool; i++ ) {

      const worker = creator();
      worker.addEventListener( 'message', this.onMessage.bind( this, i ) );
      this.workers.push( worker );

    }

  }

  createWorkerSourceUrl ( fn ) {

    const fnStr = fn.toString();
    const fnBody = fnStr.substring( fnStr.indexOf( '{' ) + 1, fnStr.lastIndexOf( '}' ) )
    const blob = new Blob( [ fnBody] );

    return URL.createObjectURL( blob );

  }

  getIdleWorker () {

    for ( let i = 0; i < this.pool; i++ ) 
      if ( !( this.workerStatus & ( 1 << i ) ) ) return i;

    return -1;

  }

  onMessage( workerId, msg ) {

    const resolve = this.workersResolve[ workerId ];
    resolve && resolve( msg );

    if ( this.quene.length ) {

      const { resolve, msg, transfer } = this.quene.shift();
      this.workersResolve[ workerId ] = resolve;
      this.workers[ workerId ].postMessage( msg, transfer );

    } else {

      this.workerStatus ^= 1 << workerId;

    }

  }

  postMessage ( msg, transfer ) {

    return new Promise( ( resolve ) => {

      const workerId = this.getIdleWorker();

      if ( workerId !== -1 ) {

        this.workerStatus |= 1 << workerId;
        this.workersResolve[ workerId ] = resolve;
        this.workers[ workerId ].postMessage( msg, transfer );

      } else {

        this.quene.push( { resolve, msg, transfer } );

      }

    } );

  }

  dispose () {

    this.workers.forEach( ( worker ) => worker.terminate() );
    this.workersResolve.length = 0;
    this.workers.length = 0;
    this.quene.length = 0;
    this.workerStatus = 0;

  }

}
