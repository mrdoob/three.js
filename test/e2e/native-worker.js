import { parentPort, workerData } from 'node:worker_threads';

globalThis.self = globalThis;
globalThis.onmessage = null;
globalThis.postMessage = ( message, transfer ) => parentPort.postMessage( message, transfer );
globalThis.addEventListener = ( type, callback ) => {

	if ( type === 'message' ) parentPort.on( 'message', data => callback( { data } ) );

};

globalThis.location = { href: workerData.url };
await import( './deterministic-injection.js' );
// Decode with the same Web Worker branch of Emscripten as the browser.
globalThis.process = undefined;
( 0, eval )( workerData.source );
parentPort.on( 'message', data => globalThis.onmessage?.( { data } ) );
